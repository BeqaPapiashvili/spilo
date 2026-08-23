/**
 * Transactional Email Dispatcher for Spilo.ge
 * Powered by official Resend SDK & REST Fallback
 */

import { Resend } from "resend";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<{ success: boolean; message?: string; id?: string }> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY || "";
    const fromAddress = process.env.EMAIL_FROM || "Spilo <onboarding@resend.dev>";

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, ""),
      });

      if (error) {
        console.warn("[Resend Notice]:", error);
        return { success: false, message: error.message };
      }

      console.log("[Resend Success] Email sent successfully, ID:", data?.id);
      return { success: true, message: "Email sent successfully via Resend", id: data?.id };
    }

    // Console logging fallback
    console.log(`\n======================================================`);
    console.log(`[EMAIL NOTICE] To: ${to}`);
    console.log(`[EMAIL NOTICE] Subject: ${subject}`);
    console.log(`======================================================\n`);

    return { success: true, message: "Email logged to console" };
  } catch (error: any) {
    console.error("[Email Dispatcher Exception]:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Sends Password Reset instructions to user with secure link and reset code
 */
export async function sendPasswordResetEmail({
  to,
  name,
  code,
  resetUrl,
}: {
  to: string;
  name: string;
  code: string;
  resetUrl?: string;
}) {
  const subject = `Spilo.ge - პაროლის აღდგენის კოდი: ${code}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: 700;">Spilo.ge</h2>
      </div>
      
      <p style="color: #1e293b; font-size: 15px; line-height: 1.6;">
        გამარჯობა ${name || "მომხმარებელო"},
      </p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">
        მივიღეთ პაროლის აღდგენის მოთხოვნა თქვენს ანგარიშზე. თქვენი ერთჯერადი 6-ნიშნა კოდია:
      </p>
      
      <div style="background-color: #f1f5f9; padding: 18px; border-radius: 12px; text-align: center; margin: 24px 0;">
        <span style="font-size: 28px; letter-spacing: 6px; color: #0f172a; font-family: monospace; font-weight: 700;">${code}</span>
      </div>

      <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
        კოდი მოქმედია 15 წუთის განმავლობაში. თუ ეს მოთხოვნა თქვენ არ გაგიგზავნიათ, გთხოვთ უგულებელყოთ ეს წერილი.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
        Spilo.ge — ტექნიკის ონლაინ ჰიპერმარკეტი
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject,
    html,
    text: `თქვენი Spilo.ge პაროლის აღდგენის კოდია: ${code}. კოდის ვადაა 15 წუთი.`,
  });
}

/**
 * Sends Order Confirmation Email to Customer
 */
export async function sendOrderConfirmationEmail({
  to,
  name,
  orderNumber,
  totalAmount,
  paymentMethod,
  items,
  shippingAddress,
}: {
  to: string;
  name: string;
  orderNumber: string;
  totalAmount: number;
  paymentMethod: string;
  items: Array<{ title: string; quantity: number; price: number }>;
  shippingAddress: string;
}) {
  const isBankTransfer = paymentMethod.includes("გადარიცხვა") || paymentMethod.toLowerCase().includes("transfer");
  const subject = `Spilo.ge - თქვენი შეკვეთა მიღებულია: #${orderNumber}`;

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-size: 13px;">${item.title}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: center; color: #475569; font-size: 13px;">${item.quantity}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-size: 13px; font-family: monospace;">${(item.price * item.quantity).toLocaleString()} ₾</td>
      </tr>
    `
    )
    .join("");

  const bankDetailsHtml = isBankTransfer
    ? `
      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 12px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px;">საბანკო რეკვიზიტები გადარიცხვისთვის:</h4>
        <p style="margin: 4px 0; font-size: 13px; color: #1e293b;"><strong>მიმღები:</strong> შპს სპილო (Spilo LLC)</p>
        <p style="margin: 4px 0; font-size: 13px; color: #1e293b;"><strong>TBC Bank:</strong> <span style="font-family: monospace;">GE89TB7749102938102938</span></p>
        <p style="margin: 4px 0; font-size: 13px; color: #1e293b;"><strong>Bank of Georgia:</strong> <span style="font-family: monospace;">GE12BG0000000889201928</span></p>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: #2563eb;"><strong>დანიშნულება:</strong> #${orderNumber}</p>
      </div>
    `
    : "";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: 700;">Spilo.ge</h2>
        <p style="color: #16a34a; font-size: 14px; margin-top: 4px;">შეკვეთა #${orderNumber} წარმატებით დარეგისტრირდა</p>
      </div>

      <p style="color: #1e293b; font-size: 14px; line-height: 1.5;">
        გამარჯობა ${name || "მომხმარებელო"}, მადლობას გიხდით შენაძენისთვის!
      </p>

      <div style="margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase;">
              <th style="padding: 8px 0; text-align: left;">პროდუქტი</th>
              <th style="padding: 8px 0; text-align: center;">რაოდენობა</th>
              <th style="padding: 8px 0; text-align: right;">თანხა</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px 0; text-align: right; color: #1e293b; font-size: 14px;"><strong>სრული თანხა:</strong></td>
              <td style="padding: 12px 0; text-align: right; color: #2563eb; font-size: 16px; font-family: monospace;"><strong>${totalAmount.toLocaleString()} ₾</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style="background-color: #f8fafc; padding: 14px; border-radius: 12px; font-size: 13px; color: #334155; margin: 16px 0;">
        <p style="margin: 3px 0;"><strong>გადახდის მეთოდი:</strong> ${paymentMethod}</p>
        <p style="margin: 3px 0;"><strong>მიწოდების მისამართი:</strong> ${shippingAddress}</p>
      </div>

      ${bankDetailsHtml}

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
        შეკითხვების შემთხვევაში დაგვიკავშირდით: support@spilo.ge | +995 (32) 2 00 00 00
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject,
    html,
    text: `თქვენი შეკვეთა #${orderNumber} მიღებულია. სრული თანხა: ${totalAmount} ₾. გადახდის მეთოდი: ${paymentMethod}.`,
  });
}
