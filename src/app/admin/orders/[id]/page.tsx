"use client";

import React, { use, useState, useEffect } from "react";
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
  Lock, 
  Mail, 
  Calendar, 
  DollarSign, 
  Save, 
  Loader2, 
  Tag, 
  Percent, 
  Building, 
  FileCheck, 
  Info,
  Layers,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  ArrowLeftRight,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { OrderStatus } from "@/types";
import OrderReturnSection from "@/components/admin/orders/OrderReturnSection";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { adminUser, updateOrderStatus, addToast } = useStore();

  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>("მუშავდება");
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingDelivery, setIsUpdatingDelivery] = useState(false);

  // ONLY SUPER_ADMIN and STORE_MANAGER can edit order status
  const canManageOrders = adminUser?.role === "SUPER_ADMIN" || adminUser?.role === "STORE_MANAGER";

  // Fetch real order from database
  useEffect(() => {
    let isMounted = true;
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/orders?id=${encodeURIComponent(id)}`);
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const o = json.data[0];
          setOrder(o);
          const mappedStatus =
            o.status === "DELIVERED"
              ? "ჩაბარებულია"
              : o.status === "SHIPPED"
              ? "გზაშია"
              : o.status === "CANCELLED"
              ? "გაუქმებულია"
              : "მუშავდება";
          setCurrentStatus(mappedStatus as OrderStatus);
          if (o.deliveryDate) {
            try {
              const d = new Date(o.deliveryDate);
              setDeliveryDate(d.toISOString().slice(0, 10));
            } catch {
              setDeliveryDate("");
            }
          }
        }
      } catch (err) {
        console.warn("Fetch order error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchOrder();
    return () => {
      isMounted = false;
    };
  }, [id]);

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
    setIsUpdatingStatus(true);

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
        updateOrderStatus(order.orderNumber || order.id, newStatus);
        addToast({
          title: "სტატუსი განახლდა",
          message: `შეკვეთის #${order.orderNumber || order.id} სტატუსი შეინახა: ${newStatus}`,
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
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveDeliveryDate = async () => {
    if (!order) return;
    if (!canManageOrders) {
      addToast({
        title: "წვდომა შეზღუდულია",
        message: "თქვენს თანამდებობას არ აქვს ჩაბარების თარიღის რედაქტირების უფლება",
        type: "warning",
      });
      return;
    }

    setIsUpdatingDelivery(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.id,
          deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrder((prev: any) => ({
          ...prev,
          deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : null,
        }));
        addToast({
          title: "თარიღი შენახულია",
          message: deliveryDate
            ? `ჩაბარების თარიღად განისაზღვრა: ${deliveryDate}`
            : "ჩაბარების თარიღი მოხსნილია",
          type: "success",
        });
      } else {
        addToast({
          title: "შეცდომა",
          message: data.error || "თარიღის განახლება ვერ მოხერხდა",
          type: "error",
        });
      }
    } catch (err: any) {
      addToast({
        title: "შეცდომა",
        message: err.message || "სერვერთან დაკავშირება ვერ მოხერხდა",
        type: "error",
      });
    } finally {
      setIsUpdatingDelivery(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 p-8 bg-white rounded-3xl border border-zinc-200/80 shadow-xs">
        <Loader2 className="w-8 h-8 text-[#FF5238] animate-spin" />
        <p className="text-xs text-zinc-500 font-mono">შეკვეთის მონაცემები იტვირთება...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 text-center p-8 bg-white rounded-3xl border border-zinc-200/80 shadow-xs">
        <h2 className="text-xl text-zinc-900">შეკვეთა ვერ მოიძებნა (#{id})</h2>
        <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline">
          ← უკან შეკვეთებში
        </Link>
      </div>
    );
  }

  const items = order.items || [];

  // Financial Computations
  let totalCatalogValue = 0;
  let totalCost = 0;
  let totalRevenue = Number(order.totalAmount) || 0;

  items.forEach((item: any) => {
    const qty = Number(item.quantity) || 1;
    const origPrice = Number(item.originalPrice || item.product?.price || item.price);
    const costP = Number(item.costPrice || item.product?.costPrice || 0);

    totalCatalogValue += origPrice * qty;
    totalCost += costP * qty;
  });

  const hasCostData = items.some((item: any) => Number(item.costPrice || item.product?.costPrice || 0) > 0);
  const totalGrossProfit = totalRevenue - totalCost;
  const totalProfitMargin = totalRevenue > 0 ? Math.round((totalGrossProfit / totalRevenue) * 100) : 0;
  const customerDiscountSavings = Math.max(0, totalCatalogValue - totalRevenue);

  const formattedCreatedDate = new Date(order.createdAt).toLocaleDateString("ka-GE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDeliveryDate = order.deliveryDate
    ? new Date(order.deliveryDate).toLocaleDateString("ka-GE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "არ არის მითითებული";

  return (
    <div className="space-y-6">
      
      {/* Hero Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-zinc-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <Link
            href="/admin/orders"
            className="w-10 h-10 text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-2xl flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl md:text-2xl text-zinc-900 font-mono">
                შეკვეთა #{order.orderNumber || order.id}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-mono">
                {formattedCreatedDate}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                {currentStatus}
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              შეკვეთის სრული დეტალები: საიტის ფასი, გაყიდვის ფასი, ასაღები ფასი, მოგების მარჟა, მყიდველის რეკვიზიტები და ჩაბარების ვადა.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="h-11 px-5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs rounded-2xl transition-colors inline-flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            <span>ინვოისის დაბეჭდვა</span>
          </button>
        </div>
      </div>

      {/* 4 Overview KPI Cards: Price Comparison & Margin */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Sold Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>გაყიდვის ჯამი (Revenue)</span>
            <DollarSign className="w-4 h-4 text-[#FF5238]" />
          </div>
          <p className="text-2xl text-zinc-900 font-mono tracking-tight">
            {totalRevenue.toFixed(2)} ₾
          </p>
          <span className="text-[11px] text-zinc-400 block font-mono">
            კლიენტის მიერ გადახდილი თანხა
          </span>
        </div>

        {/* 2. Catalog / Site Price */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>საიტის საწყისი ფასი</span>
            <Tag className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl text-zinc-900 font-mono tracking-tight">
            {totalCatalogValue.toFixed(2)} ₾
          </p>
          <span className="text-[11px] text-zinc-400 block font-mono">
            {customerDiscountSavings > 0
              ? `ფასდაკლება: -${customerDiscountSavings.toFixed(2)} ₾`
              : "საიტის სტანდარტული ფასი"}
          </span>
        </div>

        {/* 3. Cost Price (თვითღირებულება) */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>ასაღები ფასი (თვითღირებულება)</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl text-zinc-900 font-mono tracking-tight">
            {hasCostData ? `${totalCost.toFixed(2)} ₾` : "-"}
          </p>
          <span className="text-[11px] text-amber-600 block font-mono">
            🔒 კონფიდენციალური (მხოლოდ ადმინი)
          </span>
        </div>

        {/* 4. Net Profit & Margin */}
        <div className="bg-[#F0FDF4] p-5 rounded-3xl border border-emerald-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-800">
            <span>სუფთა მოგება (Gross Profit)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl text-emerald-700 font-mono tracking-tight">
            {hasCostData ? `+${totalGrossProfit.toFixed(2)} ₾` : "-"}
          </p>
          <span className="text-[11px] text-emerald-700 block font-mono">
            {hasCostData ? `მარჟა: ${totalProfitMargin}%` : "ასაღები ფასი არ არის მითითებული"}
          </span>
        </div>
      </div>

      {/* Status Workflow Bar */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400 uppercase tracking-wider block">
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
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/70 inline-flex items-center gap-3">
            <span className="text-xs text-zinc-500">სტატუსი:</span>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-mono">
              {currentStatus}
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
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange(st.status)}
                className={`h-10 px-4 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  currentStatus === st.status
                    ? "bg-[#FF5238] text-white shadow-2xs"
                    : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {st.icon}
                <span>{st.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ⚠️ High-Visibility Top Alert Banner for Active / Existing Returns & Exchanges */}
      {order.returns && order.returns.length > 0 && (() => {
        const topReturn = order.returns[0];
        const isExchange = topReturn.type === "EXCHANGE";
        const returnItems = (Array.isArray(topReturn.items) && topReturn.items.length > 0)
          ? topReturn.items
          : items.length > 0
          ? items
          : [];
        const firstItem = returnItems[0];
        const itemImg = firstItem?.image || firstItem?.product?.images?.[0] || firstItem?.product?.image;

        return (
          <div className="bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-indigo-50/80 border border-orange-200/90 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {/* Product Thumbnail or Type Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-orange-200/80 shrink-0 flex items-center justify-center p-1.5 shadow-2xs overflow-hidden">
                {itemImg ? (
                  <img
                    src={itemImg}
                    alt={firstItem?.title || "პროდუქტი"}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80";
                    }}
                  />
                ) : (
                  <Package className="w-6 h-6 text-orange-500" />
                )}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${
                    isExchange
                      ? "bg-orange-100 text-orange-800 border-orange-300"
                      : "bg-indigo-100 text-indigo-800 border-indigo-300"
                  }`}>
                    {isExchange ? "გადაცვლის მოთხოვნა" : "დაბრუნების მოთხოვნა"}
                  </span>

                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white text-zinc-700 border border-zinc-200 font-mono">
                    სტატუსი: {topReturn.status}
                  </span>
                </div>

                <p className="text-sm text-zinc-900 leading-snug truncate">
                  {firstItem?.title ? `პროდუქტი: ${firstItem.title}` : `დაფიქსირებულია ${isExchange ? "გადაცვლა" : "დაბრუნება"}`}
                </p>

                {isExchange && topReturn.exchangeTo && (
                  <p className="text-xs text-orange-950 font-mono">
                    👉 იცვლება: {topReturn.exchangeTo}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
              <a
                href="#returns-section"
                className="h-10 px-4 bg-zinc-900 hover:bg-[#FF5238] text-white rounded-2xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>დაბრუნების ბარათზე გადასვლა</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </a>

              <Link
                href="/admin/returns"
                className="h-10 px-3.5 bg-white hover:bg-zinc-100 text-zinc-700 rounded-2xl text-xs border border-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ყველა დაბრუნება</span>
              </Link>
            </div>
          </div>
        );
      })()}

      {/* Details Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Ordered Items List & Returns Management (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h3 className="text-base text-zinc-900">
                რა იყიდა: შეკვეთილი პროდუქტები ({items.length})
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                საიტის ფასი, გაყიდვის ფასი, ასაღები ფასი და სუფთა მოგება თითოეულ ნივთზე
              </p>
            </div>
            <span className="text-[11px] text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 font-mono">
              🔒 ადმინ დეტალები
            </span>
          </div>

          <div className="space-y-4">
            {items && items.length > 0 ? (
              items.map((item: any, idx: number) => {
                const qty = Number(item.quantity) || 1;
                const soldUnitPrice = Number(item.price);
                const originalSitePrice = Number(item.originalPrice || item.product?.price || soldUnitPrice);
                const catalogDiscountPrice = item.discountPrice || item.product?.discountPrice ? Number(item.discountPrice || item.product?.discountPrice) : null;
                const costPrice = item.costPrice || item.product?.costPrice ? Number(item.costPrice || item.product?.costPrice) : null;
                const unitProfit = costPrice !== null ? soldUnitPrice - costPrice : null;
                const totalItemProfit = unitProfit !== null ? unitProfit * qty : null;
                const marginPercent = costPrice !== null && soldUnitPrice > 0 ? Math.round(((soldUnitPrice - costPrice) / soldUnitPrice) * 100) : null;
                const itemSku = item.sku || item.product?.sku || "-";
                const brandName = item.product?.brand?.name || null;
                const categoryName = item.product?.category?.name || null;

                // Parse selected variants if any
                let variantsObj: Record<string, string> | null = null;
                if (item.selectedVariants) {
                  try {
                    variantsObj = typeof item.selectedVariants === "string" ? JSON.parse(item.selectedVariants) : item.selectedVariants;
                  } catch {
                    variantsObj = null;
                  }
                }

                return (
                  <div 
                    key={idx} 
                    className="p-4 bg-zinc-50/70 hover:bg-zinc-50 border border-zinc-200/70 rounded-2xl space-y-4 transition-colors"
                  >
                    {/* Top Row: Image, Title, Tags */}
                    <div className="flex items-start gap-4">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"}
                        alt={item.title}
                        className="w-16 h-16 object-contain rounded-2xl bg-white border border-zinc-200/80 p-1.5 shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm text-zinc-900 leading-snug">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {(() => {
                              const itemReturnInfo = (order?.returns || []).find((ret: any) =>
                                (Array.isArray(ret.items) && ret.items.some((it: any) => it.orderItemId === item.id || it.productId === item.productId)) ||
                                (!ret.items || ret.items.length === 0)
                              );
                              if (!itemReturnInfo) return null;
                              const isExchange = itemReturnInfo.type === "EXCHANGE";
                              return (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${
                                  isExchange
                                    ? "bg-orange-50 text-orange-700 border-orange-200"
                                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                }`}>
                                  {isExchange ? "გადასაცვლელია" : "დასაბრუნებელია"}
                                </span>
                              );
                            })()}
                            <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-800 font-mono shrink-0">
                              {qty} ცალი
                            </span>
                          </div>
                        </div>

                        {/* Metadata badges: SKU, Brand, Category */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 font-mono">
                          <span className="bg-white border border-zinc-200 px-2 py-0.5 rounded-md">
                            SKU: {itemSku}
                          </span>
                          {brandName && (
                            <span className="bg-white border border-zinc-200 px-2 py-0.5 rounded-md">
                              ბრენდი: {brandName}
                            </span>
                          )}
                          {categoryName && (
                            <span className="bg-white border border-zinc-200 px-2 py-0.5 rounded-md">
                              კატეგორია: {categoryName}
                            </span>
                          )}
                        </div>

                        {/* Selected Variants if customer picked color/storage */}
                        {variantsObj && Object.keys(variantsObj).length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {Object.entries(variantsObj).map(([k, v]) => (
                              <span key={k} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded-md font-mono">
                                {k}: {String(v)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detailed Pricing Grid Comparison for this Item */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-zinc-200/60 text-xs">
                      
                      {/* 1. საიტზე რა ფასში იყო */}
                      <div className="p-2.5 bg-white rounded-xl border border-zinc-200/60 space-y-0.5">
                        <span className="text-[10px] text-zinc-400 block">საიტზე რა ფასში იყო</span>
                        <p className="text-xs text-zinc-800 font-mono">
                          {originalSitePrice.toFixed(2)} ₾
                        </p>
                        {catalogDiscountPrice && (
                          <span className="text-[10px] text-zinc-500 block font-mono">
                            აქცია: {catalogDiscountPrice.toFixed(2)} ₾
                          </span>
                        )}
                      </div>

                      {/* 2. რა ფასში გაიყიდა */}
                      <div className="p-2.5 bg-white rounded-xl border border-zinc-200/60 space-y-0.5">
                        <span className="text-[10px] text-zinc-400 block">რა ფასში გაიყიდა</span>
                        <p className="text-xs text-zinc-900 font-mono">
                          {soldUnitPrice.toFixed(2)} ₾ / ცალი
                        </p>
                        <span className="text-[10px] text-[#FF5238] block font-mono">
                          სულ: {(soldUnitPrice * qty).toFixed(2)} ₾
                        </span>
                      </div>

                      {/* 3. ასაღები ფასი (თვითღირებულება) */}
                      <div className="p-2.5 bg-white rounded-xl border border-zinc-200/60 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-400 block">ასაღები ფასი</span>
                          <span className="text-[9px] text-amber-600 bg-amber-50 px-1 rounded">🔒</span>
                        </div>
                        <p className="text-xs text-zinc-800 font-mono">
                          {costPrice !== null ? `${costPrice.toFixed(2)} ₾ / ცალი` : "-"}
                        </p>
                        <span className="text-[10px] text-zinc-500 block font-mono">
                          {costPrice !== null ? `სულ: ${(costPrice * qty).toFixed(2)} ₾` : "არ არის მითითებული"}
                        </span>
                      </div>

                      {/* 4. სუფთა მოგება ნივთზე */}
                      <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200/60 space-y-0.5">
                        <span className="text-[10px] text-emerald-800 block">სუფთა მოგება</span>
                        <p className="text-xs text-emerald-700 font-mono">
                          {totalItemProfit !== null ? `+${totalItemProfit.toFixed(2)} ₾` : "-"}
                        </p>
                        <span className="text-[10px] text-emerald-700 block font-mono">
                          {marginPercent !== null ? `${marginPercent}% მარჟა` : "-"}
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-zinc-400">პროდუქტები არ არის მითითებული</div>
            )}
          </div>

          {/* Full Financial Breakdown Table */}
          <div className="pt-4 border-t border-zinc-200 space-y-2.5 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>საიტის საწყისი ჯამური ღირებულება (Catalog Total):</span>
              <span className="font-mono text-zinc-800">{totalCatalogValue.toFixed(2)} ₾</span>
            </div>

            {customerDiscountSavings > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>ფასდაკლების ოდენობა (აქცია + კუპონი):</span>
                <span className="font-mono">-{customerDiscountSavings.toFixed(2)} ₾</span>
              </div>
            )}

            {order.couponCode && (
              <div className="flex justify-between text-blue-700">
                <span>გამოყენებული პრომო კოდი:</span>
                <span className="font-mono">{order.couponCode} {order.discountAmount ? `(-${order.discountAmount} ₾)` : ""}</span>
              </div>
            )}

            <div className="flex justify-between text-zinc-500">
              <span>მიწოდების საფასური:</span>
              <span className="text-emerald-600 font-mono">უფასო (0.00 ₾)</span>
            </div>

            {hasCostData && (
              <div className="flex justify-between text-zinc-500 pt-2 border-t border-zinc-100">
                <span>ჯამური თვითღირებულება (ასაღები ფასები):</span>
                <span className="font-mono text-zinc-800">{totalCost.toFixed(2)} ₾</span>
              </div>
            )}

            {hasCostData && (
              <div className="flex justify-between text-emerald-800 bg-emerald-50 p-3 rounded-2xl border border-emerald-200/80">
                <span>მაღაზიის სუფთა მოგება (Total Gross Profit):</span>
                <span className="font-mono text-sm">
                  +{totalGrossProfit.toFixed(2)} ₾ ({totalProfitMargin}% საერთო მარჟა)
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm text-zinc-900 pt-3 border-t border-zinc-200">
              <span>სულ გადასახდელი კლიენტის მიერ (Total Revenue):</span>
              <span className="text-[#FF5238] font-mono text-xl">{totalRevenue.toFixed(2)} ₾</span>
            </div>
          </div>
        </div>

        {/* Order Returns & Exchanges (დაბრუნება / გადაცვლა) Section */}
        <OrderReturnSection
          orderId={order.id}
          orderNumber={order.orderNumber || order.id}
          orderItems={items}
          initialReturns={order.returns || []}
          canManage={canManageOrders}
        />
      </div>

        {/* Right Column: Customer & Order Execution Details (1 col) */}
        <div className="space-y-6">
          
          {/* 1. მომხმარებლის დეტალები */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs p-6 space-y-4">
            <h4 className="text-xs text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-100 flex items-center gap-2">
              <User className="w-4 h-4 text-[#FF5238]" />
              <span>მომხმარებლის დეტალები</span>
            </h4>
            
            <div className="text-xs space-y-3 text-zinc-700">
              <div>
                <span className="text-[11px] text-zinc-400 block">სახელი & გვარი:</span>
                <p className="text-zinc-900 mt-0.5">{order.customerName || "მომხმარებელი"}</p>
              </div>

              {/* მომხმარებლის სტატუსი: ფიზიკური თუ იურიდიული */}
              <div>
                <span className="text-[11px] text-zinc-400 block">მყიდველის ტიპი:</span>
                <p className="text-zinc-800 mt-0.5">
                  {order.personType === "legal" ? "იურიდიული პირი (კომპანია)" : "ფიზიკური პირი"}
                </p>
              </div>

              {/* პირადი ნომერი ან საიდენტიფიკაციო კოდი */}
              {order.idNumber && (
                <div>
                  <span className="text-[11px] text-zinc-400 block">პირადი / საიდენტიფიკაციო #:</span>
                  <p className="text-zinc-900 font-mono mt-0.5">{order.idNumber}</p>
                </div>
              )}
              
              {/* მომხმარებლის მეილი */}
              <div>
                <span className="text-[11px] text-zinc-400 block">მომხმარებლის მეილი:</span>
                {order.customerEmail || order.user?.email ? (
                  <a 
                    href={`mailto:${order.customerEmail || order.user?.email}`}
                    className="text-zinc-900 hover:text-[#FF5238] font-mono flex items-center gap-1.5 mt-0.5 transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{order.customerEmail || order.user?.email}</span>
                  </a>
                ) : (
                  <p className="text-zinc-400 font-mono mt-0.5">არ არის მითითებული</p>
                )}
              </div>

              {/* ტელეფონის ნომერი */}
              <div>
                <span className="text-[11px] text-zinc-400 block">ტელეფონის ნომერი:</span>
                {order.contactPhone ? (
                  <a 
                    href={`tel:${order.contactPhone}`}
                    className="text-zinc-900 hover:text-[#FF5238] font-mono mt-0.5 block transition-colors cursor-pointer"
                  >
                    {order.contactPhone}
                  </a>
                ) : (
                  <p className="text-zinc-400 font-mono mt-0.5">არ არის მითითებული</p>
                )}
              </div>
            </div>
          </div>

          {/* 2. როგორ იყიდა: გადახდის მეთოდი & პრომო */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs p-6 space-y-4">
            <h4 className="text-xs text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#FF5238]" />
              <span>გადახდის დეტალები</span>
            </h4>

            <div className="text-xs space-y-3 text-zinc-700">
              <div>
                <span className="text-[11px] text-zinc-400 block">გადახდის მეთოდი:</span>
                <p className="text-zinc-900 mt-0.5">{order.paymentMethod || "ადგილზე გადახდა (COD)"}</p>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 block">გადახდის სტატუსი:</span>
                <span className="inline-block px-2.5 py-0.5 mt-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-mono">
                  {order.paymentStatus || "PAID"}
                </span>
              </div>

              {order.couponCode && (
                <div>
                  <span className="text-[11px] text-zinc-400 block">გამოყენებული კუპონი:</span>
                  <p className="text-blue-700 font-mono mt-0.5">
                    {order.couponCode} {order.discountAmount ? `(-${order.discountAmount} ₾)` : ""}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3. მიწოდების დეტალები & მისამართი */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs p-6 space-y-4">
            <h4 className="text-xs text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF5238]" />
              <span>მიწოდების დეტალები</span>
            </h4>

            <div className="text-xs space-y-3 text-zinc-700">
              <div>
                <span className="text-[11px] text-zinc-400 block">მიწოდების მეთოდი:</span>
                <p className="text-zinc-900 mt-0.5">
                  {order.deliveryMethod === "pickup" ? "მაღაზიიდან გატანა (Pickup)" : "კურიერით მიტანა (Delivery)"}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 block">მისამართი:</span>
                <p className="text-zinc-900 mt-0.5 leading-relaxed">
                  {order.shippingAddress || "მისამართი არ არის მითითებული"}
                </p>
              </div>

              {order.notes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
                  <span className="text-[10px] text-amber-800 block">კომენტარი / შენიშვნა კურიერს:</span>
                  <p className="text-xs text-amber-900 mt-0.5">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* 4. შეკვეთის ჩაბარების თარიღი Card & Date Picker */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs p-6 space-y-4">
            <h4 className="text-xs text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF5238]" />
              <span>შეკვეთის ჩაბარების თარიღი</span>
            </h4>
            
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80">
                <span className="text-[11px] text-zinc-400 block">მიმდინარე ჩაბარების ვადა:</span>
                <p className="text-zinc-900 font-mono mt-1 text-sm">
                  {formattedDeliveryDate}
                </p>
              </div>

              {canManageOrders && (
                <div className="space-y-2 pt-1">
                  <label className="block text-[11px] text-zinc-500">
                    თარიღის შეცვლა / დანიშვნა:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="flex-1 h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5238]"
                    />
                    <button
                      type="button"
                      disabled={isUpdatingDelivery}
                      onClick={handleSaveDeliveryDate}
                      className="h-10 px-3.5 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingDelivery ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>შენახვა</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
