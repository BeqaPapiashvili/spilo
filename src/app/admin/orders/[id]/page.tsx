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
  Printer
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
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 text-center p-6 bg-white rounded-2xl border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">შეკვეთა ვერ მოიძებნა (#{id})</h2>
        <Link href="/admin/orders" className="text-xs text-blue-600 font-semibold hover:underline">
          უკან შეკვეთებში
        </Link>
      </div>
    );
  }

  const handleStatusChange = (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus);
    alert(`შეკვეთის #${order.id} სტატუსი შეცვლილია: ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 font-mono">შეკვეთა #{order.id}</h1>
              <span className="text-xs text-gray-400">({order.date})</span>
            </div>
            <p className="text-xs text-gray-500">შეკვეთის დეტალური ინფორმაცია და სტატუსების მართვა</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>ინვოისის დაბეჭდვა</span>
          </button>
        </div>
      </div>

      {/* 2. Order Status Workflow Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">შეკვეთის სტატუსის მართვა (Status Workflow)</h4>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { status: "მუშავდება" as OrderStatus, label: "მუშავდება (Processing)", icon: <Clock className="w-3.5 h-3.5" /> },
            { status: "გზაშია" as OrderStatus, label: "გზაშია (Shipped)", icon: <Truck className="w-3.5 h-3.5" /> },
            { status: "ჩაბარებულია" as OrderStatus, label: "ჩაბარებულია (Delivered)", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
            { status: "გაუქმებულია" as OrderStatus, label: "გაუქმებულია (Cancelled)", icon: <XCircle className="w-3.5 h-3.5" /> },
          ].map((st) => (
            <button
              key={st.status}
              onClick={() => handleStatusChange(st.status)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentStatus === st.status
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {st.icon}
              <span>{st.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Ordered Items Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
            შეკვეთილი პროდუქტები ({order.items?.length || 1})
          </h3>

          <div className="divide-y divide-gray-100">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || "https://veli.store/media-cdn/__sized__/product/iphone16pro-thumbnail-200x200-95.jpg"}
                      alt={item.title}
                      className="w-12 h-12 object-contain rounded-xl bg-gray-50 border border-gray-100"
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-[11px] text-gray-500 font-mono">რაოდენობა: {item.quantity} ცალი</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-900">{item.price * item.quantity} ₾</span>
                    <span className="text-[10px] text-gray-400 block">({item.price} ₾ / ცალი)</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-xs text-gray-500">პროდუქტი: დრონი DJI Neo Gray — 1 ცალი (549 ₾)</div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-1.5 text-right text-xs">
            <div className="flex justify-between text-gray-500">
              <span>ქვესამი (Subtotal):</span>
              <span>{order.totalAmount} ₾</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>მიწოდების საფასური:</span>
              <span className="text-emerald-600 font-semibold">უფასო</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>სულ გადასახდელი:</span>
              <span className="text-blue-600">{order.totalAmount} ₾</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Customer & Delivery Info */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span>მომხმარებლის დეტალები</span>
            </h4>
            <div className="text-xs space-y-1 text-gray-700">
              <p className="font-semibold text-gray-900">Beka Papiashvili</p>
              <p className="text-gray-500">beka@spilo.ge</p>
              <p className="text-gray-500">+995 599 12 34 56</p>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>მიწოდების მისამართი</span>
            </h4>
            <div className="text-xs text-gray-700 space-y-1">
              <p className="font-medium text-gray-900">{order.address || "თბილისი, ჭავჭავაძის გამზირი #34"}</p>
              <p className="text-gray-500">სტანდარტული უფასო მიწოდება (1-2 სამუშაო დღე)</p>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>გადახდის დეტალები</span>
            </h4>
            <div className="text-xs text-gray-700 space-y-1">
              <p className="font-medium text-gray-900">მეთოდი: {order.paymentMethod}</p>
              <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                გადახდილია (PAID)
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
