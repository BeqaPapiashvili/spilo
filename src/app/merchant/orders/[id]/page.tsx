"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Phone,
  StickyNote,
  User,
} from "lucide-react";
import { StatusStepper } from "@/components/merchant/StatusStepper";
import {
  deliveryMethodLabel,
  formatDate,
  formatDateTime,
  orderStatusFromFulfillment,
  orderStatusLabel,
  orderStatusTone,
  paymentStatusLabel,
  paymentStatusTone,
  personTypeLabel,
  variantText,
} from "@/lib/merchantLabels";

type Detail = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  contactPhone: string;
  shippingAddress: string;
  deliveryMethod: string | null;
  deliveryDate: string | null;
  paymentMethod: string;
  paymentStatus: string;
  personType: string | null;
  idNumber: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  ownsAll: boolean;
  otherStoreItemCount: number;
  total: number;
  items: {
    id: string;
    title: string;
    sku: string | null;
    quantity: number;
    price: number;
    lineTotal: number;
    image: string | null;
    selectedVariants: unknown;
    fulfillmentStatus: string;
  }[];
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 shrink-0">{label}</span>
      <span className="text-sm text-slate-800 text-right">{value || "—"}</span>
    </div>
  );
}

export default function MerchantOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/merchant/orders/${encodeURIComponent(id)}`);
    const json = await res.json();
    if (json.success) setOrder(json.data);
    else setError(json.error || "შეკვეთა ვერ ჩაიტვირთა");
  };

  useEffect(() => {
    load();
  }, [id]);

  const patch = async (body: Record<string, string>) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/merchant/orders/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) setError(json.error || "განახლება ვერ მოხერხდა");
      else await load();
    } finally {
      setSaving(false);
    }
  };

  if (!order) {
    return <p className="text-sm text-slate-500">{error || "იტვირთება..."}</p>;
  }

  const pickup = order.deliveryMethod === "pickup";
  const variantsOf = (item: Detail["items"][number]) => variantText(item.selectedVariants);
  const rank: Record<string, number> = { PENDING: 0, CONFIRMED: 1, READY: 2, DONE: 3 };
  const lowestItem = order.items.reduce((min, item) => Math.min(min, rank[item.fulfillmentStatus] ?? 0), 3);
  const progressStatus = order.ownsAll
    ? order.status
    : orderStatusFromFulfillment(["PENDING", "CONFIRMED", "READY", "DONE"][lowestItem] || "PENDING");
  const statusSteps = [
    { key: "PENDING", label: "ახალი" },
    { key: "PROCESSING", label: "მუშავდება" },
    { key: "SHIPPED", label: pickup ? "მზადაა გასატანად" : "გზაშია" },
    { key: "DELIVERED", label: "ჩაბარებულია" },
  ];

  return (
    <div className="space-y-5">
      <Link href="/merchant/orders" className="text-sm text-slate-500 hover:text-[#FF5238] inline-flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" />
        უკან შეკვეთებში
      </Link>

      <section className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden">
        <div className="px-5 md:px-6 py-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl text-slate-900">{order.orderNumber}</h1>
              <span className={`text-[11px] px-2.5 py-1 rounded-full ${orderStatusTone(order.status)}`}>
                {orderStatusLabel(order.status, pickup)}
              </span>
              <span className={`text-[11px] px-2.5 py-1 rounded-full ${paymentStatusTone(order.paymentStatus)}`}>
                {paymentStatusLabel(order.paymentStatus)}
              </span>
            </div>
            <p className="text-sm text-slate-600 inline-flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              {formatDateTime(order.createdAt)}
            </p>
            <p className="text-xs text-slate-400 inline-flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              ბოლო განახლება: {formatDateTime(order.updatedAt)}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[11px] text-slate-400">თქვენი ასაღები თანხა</p>
            <p className="text-2xl font-mono text-slate-900">{order.total.toFixed(2)} ₾</p>
            <p className="text-xs text-slate-400 mt-1">{order.items.reduce((sum, item) => sum + item.quantity, 0)} ერთეული</p>
          </div>
        </div>
        {order.status !== "CANCELLED" && (
          <div className="px-5 md:px-6 pb-6 pt-1 border-t border-slate-100">
            <StatusStepper
              value={progressStatus}
              disabled={saving}
              onChange={(status) => patch({ status })}
              steps={statusSteps}
              title="შეკვეთის სტატუსი"
              hint="დააჭირეთ ნაბიჯს სტატუსის შესაცვლელად"
              currentLabel="ახლა ეს არის"
              nextLabel="დააჭირე შესაცვლელად"
            />
            {!order.ownsAll && (
              <p className="mt-4 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-2xl px-3 py-2">
                ამ შეკვეთაში სხვა მაღაზიის {order.otherStoreItemCount} პოზიციაცაა. სტატუსი იცვლება მხოლოდ თქვენს პროდუქტებზე.
              </p>
            )}
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-[#FF5238]" />
            <h2 className="text-sm text-slate-900">მყიდველი</h2>
          </div>
          <InfoRow label="სახელი" value={order.customerName} />
          <InfoRow label="ტელეფონი" value={order.contactPhone} />
          <InfoRow label="ელფოსტა" value={order.customerEmail || "—"} />
          <InfoRow label="პირის ტიპი" value={personTypeLabel(order.personType)} />
          <InfoRow label="საიდენტიფიკაციო" value={order.idNumber || "—"} />
          <a href={`tel:${order.contactPhone}`} className="mt-3 h-10 px-3 rounded-xl bg-slate-100 text-xs inline-flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" />
            დარეკვა
          </a>
        </section>

        <section className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-[#FF5238]" />
            <h2 className="text-sm text-slate-900">მიწოდება და გადახდა</h2>
          </div>
          <InfoRow label="მეთოდი" value={deliveryMethodLabel(order.deliveryMethod)} />
          <InfoRow label="მისამართი" value={order.shippingAddress} />
          <InfoRow label="მიტანის თარიღი" value={order.deliveryDate ? formatDate(order.deliveryDate) : "არ არის მითითებული"} />
          <InfoRow label="გადახდა" value={order.paymentMethod || "—"} />
          <InfoRow label="გადახდის სტატუსი" value={paymentStatusLabel(order.paymentStatus)} />
          {order.notes && (
            <div className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-2xl px-3 py-2 inline-flex items-start gap-2 w-full">
              <StickyNote className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span>{order.notes}</span>
            </div>
          )}
        </section>
      </div>

      <section className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#FF5238]" />
          <h2 className="text-sm text-slate-900">თქვენი პროდუქტები</h2>
        </div>
        {order.items.map((item) => {
          const variants = variantsOf(item);
          return (
            <div key={item.id} className="flex items-center justify-between gap-3 py-3 border-b border-slate-50 last:border-0">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden shrink-0">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Package className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.sku ? `SKU ${item.sku}` : "SKU არ არის"}
                    {variants ? ` · ${variants}` : ""}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.quantity} × {item.price.toFixed(2)} ₾ = {item.lineTotal.toFixed(2)} ₾
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-slate-500 inline-flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            ასაღები ჯამი
          </span>
          <span className="text-lg font-mono text-slate-900">{order.total.toFixed(2)} ₾</span>
        </div>
      </section>

      {error && <p className="text-sm text-[#FF5238]">{error}</p>}
    </div>
  );
}
