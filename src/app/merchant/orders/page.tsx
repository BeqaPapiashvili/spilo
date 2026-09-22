"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock, MapPin, Phone, Search } from "lucide-react";
import {
  deliveryMethodLabel,
  formatShortDateTime,
  formatTime,
  itemStatusLabel,
  orderStatusLabel,
  orderStatusTone,
  paymentStatusLabel,
  paymentStatusTone,
} from "@/lib/merchantLabels";

type Row = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  contactPhone: string;
  shippingAddress: string;
  notes: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  deliveryMethod: string | null;
  deliveryDate: string | null;
  createdAt: string;
  itemCount: number;
  total: number;
  items: {
    title: string;
    sku: string | null;
    quantity: number;
    image: string | null;
    fulfillmentStatus: string;
  }[];
};

function MerchantOrdersList() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Row[]>([]);
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [q, setQ] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q.trim()) params.set("q", q.trim());
    fetch(`/api/merchant/orders?${params}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setOrders(json.data);
      })
      .catch(() => {});
  }, [status, q]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl text-slate-900">შეკვეთები</h1>
        <p className="text-sm text-slate-500 mt-1">ჩანს მხოლოდ ამ მაღაზიის პროდუქტები, თარიღი და საკონტაქტო ინფორმაცია</p>
      </div>
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ნომერი, სახელი ან ტელეფონი"
            className="w-full h-11 pl-10 pr-3 bg-white rounded-2xl text-sm border border-slate-200 outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-11 px-3 bg-white rounded-2xl text-sm border border-slate-200"
        >
          <option value="">ყველა სტატუსი</option>
          <option value="PENDING">ახალი</option>
          <option value="PROCESSING">მუშავდება</option>
          <option value="SHIPPED">გზაშია / გასატანად</option>
          <option value="DELIVERED">ჩაბარებულია</option>
          <option value="CANCELLED">გაუქმებულია</option>
        </select>
      </div>
      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-10 text-sm text-slate-400 text-center">
            შეკვეთა არ მოიძებნა
          </div>
        ) : (
          orders.map((order) => {
            const pickup = order.deliveryMethod === "pickup";
            return (
              <Link
                key={order.id}
                href={`/merchant/orders/${order.id}`}
                className="block bg-white rounded-3xl border border-slate-200/80 p-4 md:p-5 hover:border-slate-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base text-slate-900">{order.orderNumber}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${orderStatusTone(order.status)}`}>
                        {orderStatusLabel(order.status, pickup)}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${paymentStatusTone(order.paymentStatus)}`}>
                        {paymentStatusLabel(order.paymentStatus)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">
                      {order.customerName}
                      <span className="text-slate-400"> · </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {order.contactPhone}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatShortDateTime(order.createdAt)} · {formatTime(order.createdAt)}
                    </p>
                    <p className="text-xs text-slate-500 inline-flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>
                        {deliveryMethodLabel(order.deliveryMethod)}
                        {order.shippingAddress ? ` · ${order.shippingAddress}` : ""}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.paymentMethod || "გადახდის მეთოდი არ არის მითითებული"}
                      {order.notes ? ` · შენიშვნა: ${order.notes}` : ""}
                    </p>
                  </div>
                  <div className="text-left lg:text-right shrink-0">
                    <p className="text-lg font-mono text-slate-900">{order.total.toFixed(2)} ₾</p>
                    <p className="text-[11px] text-slate-400">{order.itemCount} ერთეული · ასაღები თანხა</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                  {order.items.map((item) => (
                    <span key={`${order.id}-${item.title}-${item.sku || ""}`} className="text-[11px] px-2.5 py-1 rounded-full bg-slate-50 text-slate-600">
                      {item.title} ×{item.quantity} · {itemStatusLabel(item.fulfillmentStatus)}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function MerchantOrdersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">იტვირთება...</p>}>
      <MerchantOrdersList />
    </Suspense>
  );
}
