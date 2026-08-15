"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  ShoppingBag, 
  User, 
  MapPin, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  FileText,
  Printer,
  Package,
  Lock
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { OrderStatus } from "@/types";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const orders = useStore((state) => state.orders);

  const order = orders.find((o) => o.id === id) || orders[0];

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order?.status || "მუშავდება");

  if (!order) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 text-center p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <h2 className="text-xl text-slate-900">შეკვეთა ვერ მოიძებნა (#{id})</h2>
        <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline">
          ← უკან შეკვეთებში
        </Link>
      </div>
    );
  }

  const { updateOrderStatus, adminUser, addToast } = useStore();
  
  // ONLY SUPER_ADMIN and STORE_MANAGER can edit order status
  const canManageOrders = adminUser?.role === "SUPER_ADMIN" || adminUser?.role === "STORE_MANAGER";
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    if (!canManageOrders) {
      addToast({
        title: "წვდომა შეზღუდულია",
        message: "თქვენს თანამდებობას არ აქვს შეკვეთის სტატუსის შეცვლის უფლება",
        type: "warning",
      });
      return;
    }

    setCurrentStatus(newStatus);
    setIsUpdating(true);

    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.id,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        updateOrderStatus(order.id, newStatus);
        addToast({
          title: "სტატუსი განახლდა",
          message: `შეკვეთის #${order.id} სტატუსი შეინახა ბაზაში: ${newStatus}`,
          type: "success",
        });
      } else {
        addToast({
          title: "შეცდომა",
          message: data.error || "სტატუსის განახლება ვერ მოხერხდა",
          type: "error",
        });
      }
    } catch (err: any) {
      addToast({
        title: "შეცდომა",
        message: err.message || "სერვერთან კავშირის შეცდომა",
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <Link
            href="/admin/orders"
            className="w-10 h-10 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl text-slate-900 font-mono">შეკვეთა #{order.id}</h1>
              <span className="text-xs text-slate-400">({order.date})</span>
            </div>
            <p className="text-xs text-slate-500">შეკვეთის დეტალური ინფორმაცია, მისამართი და ინვოისები.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="h-11 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-2xl transition-colors inline-flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            <span>ინვოისის დაბეჭდვა</span>
          </button>
        </div>
      </div>

      {/* Status Workflow Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 uppercase tracking-wider block">
            შეკვეთის მიმდინარე სტატუსი
          </span>
          {!canManageOrders && (
            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-mono inline-flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>მხოლოდ ნახვის რეჟიმი ({adminUser?.role})</span>
            </span>
          )}
        </div>

        {!canManageOrders ? (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 inline-flex items-center gap-3">
            <span className="text-xs text-slate-500">სტატუსი:</span>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-mono font-medium">
              {currentStatus}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              (სტატუსის შეცვლის უფლება აქვს მხოლოდ Store Manager-ს და Super Admin-ს)
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5">
            {[
              { status: "მუშავდება" as OrderStatus, label: "მუშავდება (Processing)", icon: <Clock className="w-3.5 h-3.5" /> },
              { status: "გზაშია" as OrderStatus, label: "გზაშია (Shipped)", icon: <Truck className="w-3.5 h-3.5" /> },
              { status: "ჩაბარებულია" as OrderStatus, label: "ჩაბარებულია (Delivered)", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
              { status: "გაუქმებულია" as OrderStatus, label: "გაუქმებულია (Cancelled)", icon: <XCircle className="w-3.5 h-3.5" /> },
            ].map((st) => (
              <button
                key={st.status}
                type="button"
                onClick={() => handleStatusChange(st.status)}
                className={`h-10 px-4 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  currentStatus === st.status
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {st.icon}
                <span>{st.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ordered Items List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h3 className="text-base text-slate-900 border-b border-slate-100 pb-4">
            შეკვეთილი პროდუქტები ({order.items?.length || 1})
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items && order.items.length > 0 ? (
              order.items.map((item: any, idx: number) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={item.image || "https://veli.store/media-cdn/__sized__/product/iphone16pro-thumbnail-200x200-95.jpg"}
                      alt={item.title}
                      className="w-12 h-12 object-contain rounded-2xl bg-slate-50 border border-slate-100 p-1"
                    />
                    <div>
                      <h4 className="text-xs text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">რაოდენობა: {item.quantity} ცალი</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono text-slate-900">{item.price * item.quantity} ₾</span>
                    <span className="text-[10px] text-slate-400 block font-mono">({item.price} ₾ / ცალი)</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-xs text-slate-500">პროდუქტის დეტალები</div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-right text-xs">
            <div className="flex justify-between text-slate-500">
              <span>ქვესამი (Subtotal):</span>
              <span className="font-mono">{order.totalAmount} ₾</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>მიწოდების საფასური:</span>
              <span className="text-emerald-600">უფასო</span>
            </div>
            <div className="flex justify-between text-sm text-slate-900 pt-3 border-t border-slate-100">
              <span>სულ გადასახდელი:</span>
              <span className="text-blue-600 font-mono text-lg">{order.totalAmount} ₾</span>
            </div>
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="space-y-3">
            <h4 className="text-xs text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>მომხმარებლის დეტალები</span>
            </h4>
            <div className="text-xs space-y-1 text-slate-700">
              <p className="text-slate-900">Beka Papiashvili</p>
              <p className="text-slate-500">beka@spilo.ge</p>
              <p className="text-slate-500 font-mono">+995 599 12 34 56</p>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>მიწოდების მისამართი</span>
            </h4>
            <div className="text-xs text-slate-700 space-y-1">
              <p className="text-slate-900">{order.address || "თბილისი, ჭავჭავაძის გამზირი #34"}</p>
              <p className="text-slate-400">სტანდარტული უფასო მიწოდება (1-2 სამუშაო დღე)</p>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>გადახდის დეტალები</span>
            </h4>
            <div className="text-xs text-slate-700 space-y-1.5">
              <p className="text-slate-900">მეთოდი: {order.paymentMethod}</p>
              <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px]">
                გადახდილია (PAID)
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
