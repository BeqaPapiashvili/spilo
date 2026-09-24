import { createHash } from "crypto";

const DEFAULT_BASE_URL = "https://service.unitedpayment.ge";

export type UnitedPaymentResult<T> = {
  Data: T | null;
  ResultCode: string;
  ResultMessage: string | null;
  Exception: string | null;
};

export type DirectPaymentData = {
  Url: string;
  CodeForHash: string;
};

export type RefundData = {
  IsSuccessful: boolean;
  ResultCode: string;
  ResultMessage: string;
  RefundRequestId?: string;
};

export type VoidData = {
  IsSuccessful: boolean;
  ResultCode: string;
  ResultMessage: string;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} არ არის მითითებული`);
  }
  return value;
}

export const UNITED_DEALER_CODE = "2";

export function isUnitedPaymentConfigured(): boolean {
  return Boolean(process.env.UNITED_PAYMENT_USERNAME && process.env.UNITED_PAYMENT_PASSWORD);
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function buildCheckKey(dealerCode: string, username: string, password: string): string {
  return sha256Hex(`${dealerCode}MK${username}PD${password}`);
}

function authPayload() {
  const username = requireEnv("UNITED_PAYMENT_USERNAME");
  const password = requireEnv("UNITED_PAYMENT_PASSWORD");
  const dealerCode = UNITED_DEALER_CODE;
  const providedKey = process.env["UNITED_PAYMENT_CHECK_KEY"]?.trim();
  return {
    DealerCode: dealerCode,
    Username: username,
    Password: password,
    CheckKey: providedKey || buildCheckKey(dealerCode, username, password),
  };
}

function baseUrl(): string {
  return (process.env.UNITED_PAYMENT_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
}

export function defaultBankCode(): number {
  const raw = Number(process.env.UNITED_PAYMENT_BANK_CODE || 1);
  return Number.isFinite(raw) && raw > 0 ? raw : 1;
}

export function gatewayChargeAmount(orderTotal: number, _installmentNumber = 1): number {
  const total = Number(orderTotal);
  const safeTotal = Number.isFinite(total) && total > 0 ? Number(total.toFixed(2)) : 0;
  const raw = process.env.UNITED_PAYMENT_TEST_AMOUNT;
  if (raw != null && raw !== "") {
    const forced = Number(raw);
    if (Number.isFinite(forced) && forced > 0) {
      return Number(forced.toFixed(2));
    }
  }
  // Dealer 2 is the United Payment test account and has a tiny daily cap.
  if (UNITED_DEALER_CODE === "2") {
    return 0.1;
  }
  return safeTotal;
}

export function explainUnitedPaymentError(code: string | null | undefined, fallback?: string | null): string {
  const value = `${code || ""} ${fallback || ""}`;
  if (/object reference not set/i.test(value) || /\bEX\b/.test(String(code || ""))) {
    return "ამ სატესტო ანგარიშზე განვადების POS არ არის ჩართული. Extra-ს ინტერნეტბანკის განვადება აქ არ იხსნება — სცადე ბარათით 3D გადახდა.";
  }
  if (value.includes("DailyDealerLimitExceeded")) {
    return "სატესტო ანგარიშის დღიური ლიმიტი ამოიწურა. სცადე ხვალ ან სხვა ბარათით.";
  }
  if (value.includes("DailyCardLimitExceeded")) {
    return "ამ ბარათზე დღიური ლიმიტი ამოიწურა. სცადე სხვა სატესტო ბარათი.";
  }
  if (value.includes("InvalidCardInfo")) {
    return "ბარათის მონაცემები არასწორია.";
  }
  if (value.includes("VirtualPosNotFound") || value.includes("VirtualPosNotAvailable")) {
    return "ამ დილერზე ვირტუალური POS ვერ მოიძებნა.";
  }
  if (value.includes("InvalidAccount")) {
    return "სატესტო ანგარიში არასწორია. შეამოწმე DealerCode / Username / Password.";
  }
  if (value.includes("InvalidRequest") || value.includes("CheckKey")) {
    return "ავტორიზაციის გასაღები არასწორია (CheckKey).";
  }
  if (value.includes("IpAddressNotAllowed")) {
    return "ამ IP-დან გადახდა აკრძალულია სატესტო ანგარიშზე.";
  }
  if (value.includes("RedirectUrlRequired")) {
    return "გადახდის დასაბრუნებელი მისამართი არ არის მითითებული.";
  }
  if (value.includes("Installment")) {
    return "ეს განვადების ვადა ამ სატესტო ანგარიშზე არ არის ხელმისაწვდომი. სცადე ბარათით გადახდა.";
  }
  return (fallback || code || "გადახდის ინიციალიზაცია ვერ მოხერხდა").toString();
}

export function getRequestOrigin(request: Request): string {
  const override = process.env.UNITED_PAYMENT_REDIRECT_BASE?.replace(/\/$/, "");
  if (override) return override;

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (host?.includes("localhost") || host?.startsWith("127.") || host?.startsWith("192.168.") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002").replace(/\/$/, "");
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "127.0.0.1";
  return request.headers.get("x-real-ip")?.trim() || "127.0.0.1";
}

export function normalizeGsm(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("995") && digits.length >= 12) return digits.slice(-9);
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

export function verifyThreeDHash(codeForHash: string, hashValue: string): "SUCCESS" | "FAIL" | "INVALID" {
  const base = String(codeForHash || "").toUpperCase();
  const incoming = String(hashValue || "").toLowerCase();
  if (!base || !incoming) return "INVALID";
  const successHash = sha256Hex(`${base}T`).toLowerCase();
  const failHash = sha256Hex(`${base}F`).toLowerCase();
  if (incoming === successHash) return "SUCCESS";
  if (incoming === failHash) return "FAIL";
  return "INVALID";
}

async function postJson<T>(path: string, body: unknown): Promise<UnitedPaymentResult<T>> {
  const response = await fetch(`${baseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await response.text();
  let parsed: UnitedPaymentResult<T> | null = null;
  try {
    parsed = JSON.parse(text) as UnitedPaymentResult<T>;
  } catch {
    throw new Error(`United Payment-მა დააბრუნა არასწორი პასუხი (${response.status})`);
  }

  if (!parsed) {
    throw new Error("United Payment-ის პასუხი ცარიელია");
  }
  return parsed;
}

export async function createThreeDPayment(input: {
  amount: number;
  clientIp: string;
  otherTrxCode: string;
  redirectUrl: string;
  installmentNumber?: number;
  description?: string;
  buyer?: {
    fullName?: string;
    email?: string;
    gsm?: string;
    address?: string;
  };
}): Promise<{ url: string; codeForHash: string; raw: UnitedPaymentResult<DirectPaymentData> }> {
  const installment = Math.max(1, Math.min(12, Number(input.installmentNumber || 1)));
  const fullName = (input.buyer?.fullName || "").trim();
  const [firstName, ...lastParts] = fullName.split(/\s+/).filter(Boolean);
  const authentication = authPayload();
  const payload = {
    PaymentDealerAuthentication: authentication,
    PaymentDealerRequest: {
      Amount: Number(input.amount.toFixed(2)),
      Currency: "GEL",
      BankCode: defaultBankCode(),
      InstallmentNumber: installment,
      ClientIP: input.clientIp,
      OtherTrxCode: input.otherTrxCode,
      SubMerchantName: "",
      IsPoolPayment: 0,
      IsPreAuth: 0,
      IsTokenized: 0,
      IntegratorId: 0,
      Software: "Spilo",
      Description: (input.description || "").slice(0, 200),
      ReturnHash: 1,
      RedirectUrl: input.redirectUrl,
      RedirectType: 0,
      BuyerInformation: {
        BuyerFullName: fullName,
        BuyerEmail: input.buyer?.email || "",
        BuyerGsmNumber: input.buyer?.gsm || "",
        BuyerAddress: input.buyer?.address || "",
      },
      CustomerInformation: {
        DealerCustomerId: "",
        CustomerCode: input.otherTrxCode.slice(0, 32),
        FirstName: firstName || "Customer",
        LastName: lastParts.join(" ") || "",
        Email: input.buyer?.email || "",
        GsmNumber: input.buyer?.gsm || "",
        Address: input.buyer?.address || "",
      },
    },
  };

  console.info(
    `[United Payment] DealerCode=${authentication.DealerCode} BankCode=${defaultBankCode()}`
  );

  const raw = await postJson<DirectPaymentData>("/PaymentDealer/DoDirectPaymentThreeDGE", payload);
  if (raw.ResultCode !== "Success" || !raw.Data?.Url || !raw.Data?.CodeForHash) {
    throw new Error(explainUnitedPaymentError(raw.ResultCode, raw.ResultMessage || raw.Exception));
  }

  return { url: raw.Data.Url, codeForHash: raw.Data.CodeForHash, raw };
}

export async function voidPayment(input: {
  virtualPosOrderId?: string;
  otherTrxCode?: string;
}): Promise<UnitedPaymentResult<VoidData>> {
  if (!input.virtualPosOrderId && !input.otherTrxCode) {
    throw new Error("გაუქმებისთვის საჭიროა trxCode ან OtherTrxCode");
  }

  const raw = await postJson<VoidData>("/PaymentDealer/DoVoid", {
    PaymentDealerAuthentication: authPayload(),
    PaymentDealerRequest: {
      VirtualPosOrderId: input.virtualPosOrderId || "",
      OtherTrxCode: input.otherTrxCode || "",
    },
  });

  if (raw.ResultCode !== "Success") {
    throw new Error(raw.ResultMessage || raw.ResultCode || "ტრანზაქციის გაუქმება ვერ მოხერხდა");
  }
  return raw;
}

export async function refundPayment(input: {
  virtualPosOrderId?: string;
  otherTrxCode?: string;
  amount?: number;
}): Promise<UnitedPaymentResult<RefundData>> {
  if (!input.virtualPosOrderId && !input.otherTrxCode) {
    throw new Error("დაბრუნებისთვის საჭიროა trxCode ან OtherTrxCode");
  }

  const raw = await postJson<RefundData>("/PaymentDealer/DoCreateRefundRequest", {
    PaymentDealerAuthentication: authPayload(),
    PaymentDealerRequest: {
      VirtualPosOrderId: input.virtualPosOrderId || "",
      OtherTrxCode: input.otherTrxCode || "",
      Amount: input.amount && input.amount > 0 ? Number(input.amount.toFixed(2)) : 0,
    },
  });

  if (raw.ResultCode !== "Success") {
    throw new Error(raw.ResultMessage || raw.ResultCode || "თანხის დაბრუნება ვერ მოხერხდა");
  }
  return raw;
}

export async function getSavedCards(customerCode: string) {
  return postJson("/DealerCustomer/GetCardList", {
    DealerCustomerAuthentication: authPayload(),
    DealerCustomerRequest: {
      DealerCustomerId: "",
      CustomerCode: customerCode,
    },
  });
}
