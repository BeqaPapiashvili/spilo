"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Clock,
  Package,
  ShoppingBag,
  Store,
  TrendingUp,
} from "lucide-react";
import {
  deliveryMethodLabel,
  formatDate,
  formatShortDateTime,
  formatTime,
  orderStatusLabel,
  orderStatusTone,
  paymentStatusLabel,
  paymentStatusTone,
} from "@/lib/merchantLabels";

type Stats = {
  storeName: string;
  storeCity: string;
  storeLogo: string;
  pickupEnabled: boolean;
  productCount: number;
  orderCount: number;
  unitsSold: number;
  revenue: number;
  todayRevenue: number;
  todayOrders: number;
  newItems: number;
  outOfStockCount: number;
  statusCounts: {
    PENDING: number;
    PROCESSING: number;
    SHIPPED: number;
    DELIVERED: number;
    CANCELLED: number;
  };
  topProducts: { title: string; units: number; revenue: number }[];
  lowStock: { id: string; title: string; stock: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    contactPhone: string;
    status: string;
    createdAt: string;
    deliveryMethod: string | null;
    paymentStatus: string;
    itemCount: number;
    firstItem: string;
    total: number;
  }[];
};

export default function MerchantDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/merchant/stats")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setStats(json.data);
      })
      .catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="space-y-4">
        <div className="h-32 rounded-3xl bg-white border border-slate-100 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((key) => (
            <div key={key} className="h-28 rounded-3xl bg-white border border-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: "დღევანდელი ასაღები",
      value: `${stats.todayRevenue.toFixed(2)} ₾`,
      hint: `${stats.todayOrders} შეკვეთა დღეს`,
      icon: Banknote,
      tone: "bg-[#FFF5F2] text-[#FF5238]",
    },
    {
      label: "სულ ასაღები თანხა",
      value: `${stats.revenue.toFixed(2)} ₾`,
      hint: "ითვლება ასაღებ ფასზე",
      icon: TrendingUp,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "შეკვეთები",
      value: stats.orderCount,
      hint: `${stats.newItems} ახალი პოზიცია`,
      icon: ShoppingBag,
      tone: "bg-sky-50 text-sky-600",
    },
    {
      label: "გაყიდული ერთეული",
      value: stats.unitsSold,
      hint: `${stats.productCount} პროდუქტი კატალოგში`,
      icon: Package,
      tone: "bg-violet-50 text-violet-600",
    },
  ];

  const pipeline = [
    { key: "PENDING", label: "ახალი", href: "/merchant/orders?status=PENDING" },
    { key: "PROCESSING", label: "მუშავდება", href: "/merchant/orders?status=PROCESSING" },
    { key: "SHIPPED", label: "გზაში / გასატანად", href: "/merchant/orders?status=SHIPPED" },
    { key: "DELIVERED", label: "ჩაბარებული", href: "/merchant/orders?status=DELIVERED" },
  ] as const;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden">
        <div className="bg-[#111111] px-5 md:px-7 py-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white/10 overflow-hidden flex items-center justify-center shrink-0">
              {stats.storeLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={stats.storeLogo} alt="" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-5 h-5 text-[#FF5238]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-white/50">მაღაზიის დაფა</p>
              <h1 className="text-xl md:text-2xl truncate">{stats.storeName}</h1>
              <p className="text-xs text-white/55 mt-0.5">
                {formatDate(new Date())}
                {stats.storeCity ? ` · ${stats.storeCity}` : ""}
                {stats.pickupEnabled ? " · თვითგატანა ჩართულია" : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/merchant/orders" className="h-10 px-4 rounded-xl bg-[#FF5238] text-white text-sm inline-flex items-center gap-2">
              შეკვეთები
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/merchant/products" className="h-10 px-4 rounded-xl bg-white/10 text-white text-sm inline-flex items-center">
              პროდუქტები
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100">
          {pipeline.map((item) => (
            <Link key={item.key} href={item.href} className="px-5 py-4 hover:bg-slate-50">
              <p className="text-[11px] text-slate-400">{item.label}</p>
              <p className="text-2xl text-slate-900 font-mono mt-1">{stats.statusCounts[item.key]}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-3xl p-5 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-400">{card.label}</p>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${card.tone}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl text-slate-900 font-mono tracking-tight">{card.value}</p>
              <p className="text-[11px] text-slate-400">{card.hint}</p>
            </div>
          );
        })}
      </div>

      {(stats.lowStock.length > 0 || stats.outOfStockCount > 0) && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/70 px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-900">მარაგის ყურადღება</p>
              <p className="text-xs text-slate-600 mt-0.5">
                {stats.outOfStockCount > 0 ? `ამოწურულია ${stats.outOfStockCount}. ` : ""}
                {stats.lowStock.map((item) => `${item.title} (${item.stock})`).join(" · ")}
              </p>
            </div>
          </div>
          <Link href="/merchant/products" className="h-10 px-4 rounded-xl bg-amber-600 text-white text-xs inline-flex items-center justify-center">
            მარაგის მონიშვნა
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-4">
        <section className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base text-slate-900">ბოლო შეკვეთები</h2>
              <p className="text-xs text-slate-400 mt-0.5">თარიღი, დრო და თქვენი ასაღები თანხა</p>
            </div>
            <Link href="/merchant/orders" className="text-xs text-[#FF5238] inline-flex items-center gap-1">
              ყველა <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">შეკვეთა ჯერ არ არის</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[11px] text-slate-400 border-b border-slate-100">
                    <th className="py-2 pr-3 font-normal">შეკვეთა</th>
                    <th className="py-2 pr-3 font-normal">თარიღი / დრო</th>
                    <th className="py-2 pr-3 font-normal">მყიდველი</th>
                    <th className="py-2 pr-3 font-normal">მიწოდება</th>
                    <th className="py-2 pr-3 font-normal text-right">ასაღები</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80">
                      <td className="py-3 pr-3">
                        <Link href={`/merchant/orders/${order.id}`} className="text-slate-900 hover:text-[#FF5238]">
                          {order.orderNumber}
                        </Link>
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {order.firstItem}
                          {order.itemCount > 1 ? ` +${order.itemCount - 1}` : ""}
                        </p>
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap">
                        <p className="text-slate-700">{formatShortDateTime(order.createdAt)}</p>
                        <p className="text-[11px] text-slate-400 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(order.createdAt)}
                        </p>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="text-slate-800">{order.customerName}</p>
                        <p className="text-[11px] text-slate-400">{order.contactPhone}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${orderStatusTone(order.status)}`}>
                            {orderStatusLabel(order.status, order.deliveryMethod === "pickup")}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${paymentStatusTone(order.paymentStatus)}`}>
                            {paymentStatusLabel(order.paymentStatus)}
                          </span>
                          <span className="text-[11px] text-slate-400">{deliveryMethodLabel(order.deliveryMethod)}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-900">{order.total.toFixed(2)} ₾</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 md:p-6 space-y-4">
          <div>
            <h2 className="text-base text-slate-900">ტოპ პროდუქტები</h2>
            <p className="text-xs text-slate-400 mt-0.5">ასაღები თანხით</p>
          </div>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-slate-400">ჯერ არ არის გაყიდვა</p>
          ) : (
            <ul className="space-y-3">
              {stats.topProducts.map((item, index) => (
                <li key={item.title} className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-[11px] text-slate-500 flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-800 truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-400">{item.units} ერთეული</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-slate-900 shrink-0">{item.revenue.toFixed(2)} ₾</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
