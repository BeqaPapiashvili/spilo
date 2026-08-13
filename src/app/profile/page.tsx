"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { 
  User, 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, setUser, orders, toggleAuthModal } = useStore();
  const [activeTab, setActiveTab] = useState<"orders" | "details" | "addresses">("orders");

  if (!user) {
    return (
      <div className="bg-[#F8FAFC] min-h-[75vh] flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-[32px] p-8 md:p-12 max-w-md w-full text-center space-y-5 shadow-xs border border-gray-100">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl text-gray-900">პირადი კაბინეტი</h1>
          <p className="text-xs text-gray-500">
            შეკვეთების ისტორიისა და პროფილის სანახავად გთხოვთ გაიაროთ ავტორიზაცია
          </p>
          <button
            onClick={() => toggleAuthModal(true)}
            className="w-full py-3.5 bg-[#111111] hover:bg-black text-white rounded-2xl text-xs sm:text-sm cursor-pointer transition-colors"
          >
            ავტორიზაცია / რეგისტრაცია
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        
        {/* Profile Header Banner */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-xs border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4 text-left">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shrink-0 shadow-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl text-gray-900">{user.name}</h1>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>ვერიფიცირებული</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{user.phone} • {user.email}</p>
            </div>
          </div>

          <button
            onClick={() => setUser(null)}
            className="flex items-center gap-2 text-xs text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-2xl border border-red-100 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>ანგარიშიდან გამოსვლა</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200/80 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs md:text-sm cursor-pointer transition-all ${
              activeTab === "orders"
                ? "bg-[#111111] text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>ჩემი შეკვეთები ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("details")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs md:text-sm cursor-pointer transition-all ${
              activeTab === "details"
                ? "bg-[#111111] text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
            }`}
          >
            <User className="w-4 h-4" />
            <span>პროფილის მონაცემები</span>
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs md:text-sm cursor-pointer transition-all ${
              activeTab === "addresses"
                ? "bg-[#111111] text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>მისამართები</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-[28px] p-12 text-center text-gray-500 space-y-3">
                <Package className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-base text-gray-900">შეკვეთები არ მოიძებნა</p>
                <p className="text-xs text-gray-400">თქვენ ჯერ არ გაქვთ განხორციელებული შეკვეთა</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-[28px] p-6 shadow-xs border border-gray-100 space-y-4">
                  
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">შეკვეთის N:</span>
                        <span className="text-sm font-mono text-gray-900">{order.id}</span>
                      </div>
                      <span className="text-[11px] text-gray-500 block">{order.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        order.status === "ჩაბარებულია"
                          ? "bg-emerald-50 text-emerald-700"
                          : order.status === "გზაშია"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                      }`}>
                        {order.status === "ჩაბარებულია" && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {order.status === "გზაშია" && <Truck className="w-3.5 h-3.5" />}
                        {order.status === "მუშავდება" && <Clock className="w-3.5 h-3.5" />}
                        <span>{order.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.title} className="w-12 h-12 object-contain bg-[#F1F3F6] p-1 rounded-xl shrink-0" />
                          <div>
                            <p className="text-gray-900 max-w-sm truncate">{item.title}</p>
                            <span className="text-[11px] text-gray-400">რაოდენობა: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="text-gray-900 font-mono text-sm shrink-0">
                          {((item.discountPrice || item.price) * item.quantity).toFixed(2)} ₾
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer Info */}
                  <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500">
                    <div className="space-y-0.5">
                      <p>გადახდის მეთოდი: <span className="text-gray-900">{order.paymentMethod}</span></p>
                      <p>მისამართი: <span className="text-gray-900">{order.address}</span></p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 block text-[11px]">სულ გადახდილი:</span>
                      <span className="text-lg text-blue-600 font-mono">{order.totalAmount.toFixed(2)} ₾</span>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "details" && (
          <div className="bg-white rounded-[28px] p-6 md:p-8 shadow-xs border border-gray-100 max-w-xl space-y-5">
            <h3 className="text-lg text-gray-900 border-b border-gray-100 pb-3">პროფილის პარამეტრები</h3>
            
            <div className="space-y-4 text-xs md:text-sm">
              <div>
                <label className="text-gray-500 block mb-1">სრული სახელი</label>
                <input type="text" value={user.name} readOnly className="w-full h-11 px-4 bg-[#F1F3F6] rounded-xl text-gray-900" />
              </div>

              <div>
                <label className="text-gray-500 block mb-1">ელექტრონული ფოსტა</label>
                <input type="email" value={user.email} readOnly className="w-full h-11 px-4 bg-[#F1F3F6] rounded-xl text-gray-900" />
              </div>

              <div>
                <label className="text-gray-500 block mb-1">ტელეფონის ნომერი</label>
                <input type="tel" value={user.phone} readOnly className="w-full h-11 px-4 bg-[#F1F3F6] rounded-xl text-gray-900" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "addresses" && (
          <div className="bg-white rounded-[28px] p-6 md:p-8 shadow-xs border border-gray-100 max-w-xl space-y-4">
            <h3 className="text-lg text-gray-900 border-b border-gray-100 pb-3">შენახული მისამართები</h3>
            
            <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs md:text-sm text-gray-900">მთავარი მისამართი</h4>
                <p className="text-xs text-gray-500 mt-0.5">თბილისი, ჭავჭავაძის გამზირი N34, ბინა 12</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
