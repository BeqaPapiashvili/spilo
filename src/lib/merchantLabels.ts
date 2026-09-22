export const ITEM_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  READY: "READY",
  DONE: "DONE",
} as const;

export const MERCHANT_ORDER_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export const FULFILLMENT_BY_ORDER: Record<string, string> = {
  PENDING: ITEM_STATUS.PENDING,
  PROCESSING: ITEM_STATUS.CONFIRMED,
  SHIPPED: ITEM_STATUS.READY,
  DELIVERED: ITEM_STATUS.DONE,
};

export function orderStatusFromFulfillment(status: string) {
  if (status === ITEM_STATUS.DONE) return "DELIVERED";
  if (status === ITEM_STATUS.READY) return "SHIPPED";
  if (status === ITEM_STATUS.CONFIRMED) return "PROCESSING";
  return "PENDING";
}

export function itemStatusLabel(status: string) {
  if (status === "CONFIRMED") return "მიღებულია";
  if (status === "READY") return "მზადაა";
  if (status === "DONE") return "დასრულებულია";
  return "ახალი";
}

export function merchantUnitCost(costPrice: number | null | undefined): number {
  const cost = Number(costPrice);
  return Number.isFinite(cost) && cost > 0 ? cost : 0;
}

export function merchantLineTotal(costPrice: number | null | undefined, quantity: number): number {
  return Number((merchantUnitCost(costPrice) * Math.max(0, Number(quantity) || 0)).toFixed(2));
}

export function orderStatusLabel(status: string, pickup = false) {
  if (status === "PROCESSING") return "მუშავდება";
  if (status === "SHIPPED") return pickup ? "მზადაა გასატანად" : "გზაშია";
  if (status === "DELIVERED") return "ჩაბარებულია";
  if (status === "CANCELLED") return "გაუქმებულია";
  return "ახალი";
}

function asDate(value: string | Date | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value: string | Date | null | undefined) {
  const date = asDate(value);
  if (!date) return "—";
  return date.toLocaleString("ka-GE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value: string | Date | null | undefined) {
  const date = asDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("ka-GE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(value: string | Date | null | undefined) {
  const date = asDate(value);
  if (!date) return "—";
  return date.toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" });
}

export function formatShortDateTime(value: string | Date | null | undefined) {
  const date = asDate(value);
  if (!date) return "—";
  return date.toLocaleString("ka-GE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function paymentStatusLabel(status: string | null | undefined) {
  const value = String(status || "").toUpperCase();
  if (value === "PAID") return "გადახდილია";
  if (value === "FAILED") return "ვერ გადაიხადა";
  if (value === "REFUNDED") return "თანხა დაბრუნდა";
  if (value === "PARTIAL_REFUND") return "ნაწილობრივ დაბრუნდა";
  if (value === "VOIDED") return "გადახდა გაუქმდა";
  return "გადახდა მოლოდინში";
}

export function deliveryMethodLabel(method: string | null | undefined) {
  return method === "pickup" ? "თვითგატანა მაღაზიიდან" : "კურიერით მიტანა";
}

export function personTypeLabel(type: string | null | undefined) {
  return type === "legal" ? "იურიდიული პირი" : "ფიზიკური პირი";
}

export function variantText(value: unknown) {
  if (!value) return "";
  let parsed: unknown = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return value;
    }
  }
  if (typeof parsed !== "object" || parsed === null) return "";
  return Object.entries(parsed as Record<string, unknown>)
    .filter(([, entry]) => entry !== null && entry !== undefined && String(entry).trim() !== "")
    .map(([key, entry]) => `${key}: ${entry}`)
    .join(" · ");
}

export function orderStatusTone(status: string) {
  if (status === "DELIVERED") return "bg-emerald-50 text-emerald-700";
  if (status === "SHIPPED") return "bg-sky-50 text-sky-700";
  if (status === "PROCESSING") return "bg-amber-50 text-amber-700";
  if (status === "CANCELLED") return "bg-rose-50 text-rose-700";
  return "bg-[#FFF5F2] text-[#FF5238]";
}

export function paymentStatusTone(status: string | null | undefined) {
  const value = String(status || "").toUpperCase();
  if (value === "PAID") return "bg-emerald-50 text-emerald-700";
  if (value === "FAILED" || value === "VOIDED") return "bg-rose-50 text-rose-700";
  if (value === "REFUNDED" || value === "PARTIAL_REFUND") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
}
