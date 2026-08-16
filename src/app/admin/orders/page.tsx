"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Search, 
  Eye, 
  ShoppingBag, 
  Download, 
  Loader2, 
  ChevronDown, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  X,
  FileText,
  DollarSign,
  PackageCheck,
  RefreshCw,
  MapPin,
  User,
  CreditCard
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { exportOrdersToCSV } from "@/utils/exportImport";
import { OrderStatus } from "@/types";

// Custom Status Badge Configs with SVG Icons & Palette
const STATUS_CONFIGS: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
  "მუშავდება": {
    label: "მუშავდება",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
  },
  "გზაშია": {
    label: "გზაშია",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: <Truck className="w-3.5 h-3.5 text-blue-600" />,
  },
  "ჩაბარებულია": {
    label: "ჩაბარებულია",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
  },
  "გაუქმებულია": {
    label: "გაუქმებულია",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: <XCircle className="w-3.5 h-3.5 text-red-600" />,
  },
};

export default function AdminOrdersPage() {
  const { orders: storeOrders, adminUser, setOrders, updateOrderStatus, addToast } = useStore();
  const canManageOrders = adminUser?.role === "SUPER_ADMIN" || adminUser?.role === "STORE_MANAGER";
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [activeDropdownMenu, setActiveDropdownMenu] = useState<{
    id: string;
    top: number;
    left: number;
    currentStatus: string;
  } | null>(null);
  const [previewOrder, setPreviewOrder] = useState<any | null>(null);

  // Toggle custom floating dropdown overlay with fixed viewport positioning
  const handleToggleDropdown = (
    e: React.MouseEvent<HTMLButtonElement>,
    orderId: string,
    currentStatus: string
  ) => {
    e.stopPropagation();
    if (activeDropdownMenu?.id === orderId) {
      setActiveDropdownMenu(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setActiveDropdownMenu({
        id: orderId,
        top: rect.bottom + 6,
        left: Math.min(rect.left, window.innerWidth - 190),
        currentStatus,
      });
    }
  };

  // Fetch real orders from SQL Database API on load
  const fetchDbOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const mappedOrders = data.data.map((o: any) => ({
          id: o.orderNumber || o.id,
          rawId: o.id,
          date: new Date(o.createdAt).toLocaleDateString("ka-GE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          status:
            o.status === "DELIVERED"
              ? "ჩაბარებულია"
              : o.status === "SHIPPED"
              ? "გზაშია"
              : o.status === "CANCELLED"
              ? "გაუქმებულია"
              : "მუშავდება",
          totalAmount: o.totalAmount,
          paymentMethod: o.paymentMethod || "საბანკო ბარათი",
          address: o.shippingAddress || "",
          customerName: o.customerName || "მომხმარებელი",
          contactPhone: o.contactPhone || "",
          items: o.items || [],
        }));
        setDbOrders(mappedOrders);
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.warn("Could not fetch orders from DB:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDbOrders();
  }, []);

  const displayOrders = dbOrders;

  // KPIs Metrics calculations
  const totalCount = displayOrders.length;
  const processingCount = displayOrders.filter(o => o.status === "მუშავდება" || o.status === "გზაშია").length;
  const deliveredCount = displayOrders.filter(o => o.status === "ჩაბარებულია").length;
  const totalRevenue = displayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Filtered orders list
  const filteredOrders = displayOrders.filter((o) => {
    const query = searchQuery.toLowerCase().trim();
    const matchSearch =
      !query ||
      o.id.toLowerCase().includes(query) ||
      (o.customerName && o.customerName.toLowerCase().includes(query)) ||
      (o.contactPhone && o.contactPhone.toLowerCase().includes(query)) ||
      (o.paymentMethod && o.paymentMethod.toLowerCase().includes(query)) ||
      (o.address && o.address.toLowerCase().includes(query));
    const matchStatus = selectedStatusFilter === "ALL" || o.status === selectedStatusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ["ALL", "მუშავდება", "გზაშია", "ჩაბარებულია", "გაუქმებულია"];

  // Live status update function via PUT /api/orders
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setActiveDropdownMenu(null);
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setDbOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (previewOrder && previewOrder.id === orderId) {
          setPreviewOrder((prev: any) => ({ ...prev, status: newStatus }));
        }
        updateOrderStatus(orderId, newStatus as OrderStatus);
        addToast({
          title: "სტატუსი განახლდა",
          message: `შეკვეთის #${orderId} სტატუსი წარმატებით შეინახა: ${newStatus}`,
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
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>გაყიდვების მართვა</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">
            შეკვეთები ({filteredOrders.length})
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            შეკვეთების სრული ისტორია, სტატუსების მართვა და ინვოისები.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchDbOrders}
            disabled={isLoading}
            className="h-11 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>განახლება</span>
          </button>

          <button
            type="button"
            onClick={() => exportOrdersToCSV(displayOrders)}
            className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>ექსპორტი (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Orders */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">სულ შეკვეთები</span>
            <div className="w-8 h-8 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl text-slate-900 font-mono">{totalCount}</p>
        </div>

        {/* Metric 2: Active / Processing */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">მიმდინარე</span>
            <div className="w-8 h-8 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl text-amber-700 font-mono">{processingCount}</p>
        </div>

        {/* Metric 3: Delivered */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">ჩაბარებული</span>
            <div className="w-8 h-8 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl text-emerald-700 font-mono">{deliveredCount}</p>
        </div>

        {/* Metric 4: Total Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">სულ შემოსავალი</span>
            <div className="w-8 h-8 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl text-blue-600 font-mono">{totalRevenue.toFixed(0)} ₾</p>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Custom Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ძიება: შეკვეთის #, სახელი, ტელეფონი, მისამართი..."
              className="w-full h-12 pl-11 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedStatusFilter(s)}
                className={`h-10 px-4 rounded-2xl text-xs cursor-pointer transition-all border ${
                  selectedStatusFilter === s
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {s === "ALL" ? "ყველა" : s}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-4 px-6">შეკვეთა ID</th>
                <th className="py-4 px-6">თარიღი</th>
                <th className="py-4 px-6">მომხმარებელი / მისამართი</th>
                <th className="py-4 px-6">გადახდა</th>
                <th className="py-4 px-6">თანხა</th>
                <th className="py-4 px-6">სტატუსის შეცვლა</th>
                <th className="py-4 px-6 text-right">მოქმედება</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200 rounded-md w-20" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200 rounded-md w-24" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1.5">
                        <div className="h-4 bg-slate-200 rounded-md w-36" />
                        <div className="h-3 bg-slate-100 rounded-md w-48" />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200 rounded-md w-24" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200 rounded-md w-16" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-8 bg-slate-200 rounded-full w-28" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-9 h-9 bg-slate-200 rounded-2xl" />
                        <div className="w-9 h-9 bg-slate-200 rounded-2xl" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const cfg = STATUS_CONFIGS[order.status] || STATUS_CONFIGS["მუშავდება"];

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* Order ID */}
                      <td className="py-4 px-6 font-mono text-blue-600 font-normal">
                        #{order.id}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-slate-500">
                        {order.date}
                      </td>

                      {/* Customer & Address */}
                      <td className="py-4 px-6 max-w-xs">
                        <div className="space-y-0.5">
                          <p className="text-slate-900 truncate">
                            {order.customerName || "მომხმარებელი"}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {order.address || "მისამართი მითითებული არ არის"}
                          </p>
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-6 text-slate-600">
                        {order.paymentMethod}
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-6 text-slate-900 font-mono text-sm">
                        {order.totalAmount} ₾
                      </td>

                      {/* Custom Status Dropdown / Read-Only Badge */}
                      <td className="py-4 px-6">
                        {!canManageOrders ? (
                          <div className={`h-9 px-3.5 rounded-full border text-xs inline-flex items-center gap-2 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            {cfg.icon}
                            <span>{cfg.label}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleToggleDropdown(e, order.id, order.status)}
                            className={`h-9 px-3.5 rounded-full border text-xs flex items-center gap-2 cursor-pointer transition-all ${cfg.bg} ${cfg.text} ${cfg.border} shadow-2xs hover:opacity-90`}
                          >
                            {cfg.icon}
                            <span>{cfg.label}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdownMenu?.id === order.id ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewOrder(order)}
                            className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors cursor-pointer"
                            title="სწრაფი პროსმოტრი"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                            title="დეტალების ნახვა"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 text-xs">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-slate-700">შეკვეთები ვერ მოიძებნა</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      მითითებული საძიებო პარამეტრებით ან არჩეული სტატუსის ფილტრით შეკვეთები არ არსებობს.
                    </p>
                    {(selectedStatusFilter !== "ALL" || searchQuery.trim() !== "") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStatusFilter("ALL");
                          setSearchQuery("");
                        }}
                        className="mt-3.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>ფილტრების გასუფთავება</span>
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick View Order Drawer Modal */}
      {previewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setPreviewOrder(null)} />
          <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 border border-slate-100 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg text-slate-900 font-mono">
                  შეკვეთა #{previewOrder.id}
                </h3>
                <p className="text-xs text-slate-400">{previewOrder.date}</p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Switcher Bar inside Modal */}
            <div className="space-y-2">
              <span className="text-xs text-slate-500 block">სტატუსის შეცვლა:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(STATUS_CONFIGS).map(([stKey, stCfg]) => (
                  <button
                    key={stKey}
                    type="button"
                    onClick={() => handleStatusUpdate(previewOrder.id, stKey)}
                    className={`h-10 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer border transition-all ${
                      previewOrder.status === stKey
                        ? `${stCfg.bg} ${stCfg.text} ${stCfg.border} ring-2 ring-blue-600/20`
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {stCfg.icon}
                    <span>{stCfg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Shipping Details */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs text-slate-700 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-900">
                <User className="w-4 h-4 text-blue-600" />
                <span>{previewOrder.customerName || "მომხმარებელი"}</span>
                {previewOrder.contactPhone && <span className="text-slate-400 font-mono">({previewOrder.contactPhone})</span>}
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{previewOrder.address || "მისამართი მითითებული არ არის"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>გადახდა: {previewOrder.paymentMethod}</span>
              </div>
            </div>

            {/* Order Items List */}
            <div className="space-y-3">
              <span className="text-xs text-slate-500 block">პროდუქტები ({previewOrder.items?.length || 0}):</span>
              <div className="bg-slate-50 rounded-2xl p-4 divide-y divide-slate-200/60 max-h-48 overflow-y-auto">
                {previewOrder.items && previewOrder.items.length > 0 ? (
                  previewOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || "https://veli.store/media-cdn/__sized__/product/iphone16pro-thumbnail-200x200-95.jpg"}
                          alt={item.title}
                          className="w-10 h-10 object-contain bg-white rounded-xl p-1 border border-slate-100"
                        />
                        <div>
                          <p className="text-slate-900 max-w-[220px] truncate">{item.title}</p>
                          <span className="text-[11px] text-slate-400 font-mono">{item.quantity}x {item.price} ₾</span>
                        </div>
                      </div>
                      <span className="text-slate-900 font-mono">{item.price * item.quantity} ₾</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-2">პროდუქტის დეტალები არ არის</p>
                )}
              </div>
            </div>

            {/* Total Footer & Invoice Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs md:text-sm">
              <span className="text-slate-600">სულ ჯამი:</span>
              <span className="text-blue-600 font-mono text-lg">{previewOrder.totalAmount} ₾</span>
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href={`/admin/orders/${previewOrder.id}`}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>სრული გვერდი & ინვოისი</span>
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* Global Fixed Viewport Status Dropdown Overlay */}
      {activeDropdownMenu && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setActiveDropdownMenu(null)}
          />
          <div
            style={{
              position: "fixed",
              top: `${activeDropdownMenu.top}px`,
              left: `${activeDropdownMenu.left}px`,
            }}
            className="w-44 bg-white rounded-2xl shadow-2xl border border-slate-200 p-1.5 z-[9999] animate-in fade-in duration-150 space-y-1"
          >
            {Object.entries(STATUS_CONFIGS).map(([stKey, stCfg]) => (
              <button
                key={stKey}
                type="button"
                onClick={() => handleStatusUpdate(activeDropdownMenu.id, stKey)}
                className={`w-full h-9 px-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors text-left ${
                  activeDropdownMenu.currentStatus === stKey
                    ? `${stCfg.bg} ${stCfg.text}`
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {stCfg.icon}
                <span>{stCfg.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
