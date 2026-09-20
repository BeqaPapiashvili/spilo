"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  RotateCcw,
  ArrowLeftRight,
  Search,
  RefreshCw,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Package,
  Layers,
  Phone,
  User,
  ArrowRight,
  ChevronRight,
  Filter,
  Calendar,
  ExternalLink,
  MessageSquare,
  Loader2,
  ChevronDown,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/store/useStore";

interface ReturnLogItem {
  id: string;
  action: string;
  status?: string | null;
  comment?: string | null;
  authorName?: string | null;
  createdAt: string;
}

interface ReturnItemPayload {
  orderItemId: string;
  productId?: string;
  title: string;
  sku?: string | null;
  image?: string | null;
  quantity: number;
  price: number;
}

interface OrderReturnRecord {
  id: string;
  orderId: string;
  type: "RETURN" | "EXCHANGE";
  status: "REQUESTED" | "IN_PROGRESS" | "COURIER_ASSIGNED" | "COMPLETED" | "REJECTED";
  reason: string;
  internalNotes?: string | null;
  exchangeTo?: string | null;
  items?: ReturnItemPayload[] | null;
  logs?: ReturnLogItem[];
  createdAt: string;
  updatedAt: string;
  order?: {
    id: string;
    orderNumber: string;
    customerName: string;
    contactPhone: string;
    customerEmail?: string | null;
    shippingAddress?: string | null;
    totalAmount: number;
    items?: any[];
  };
}

export default function AdminReturnsPage() {
  const { addToast } = useStore();
  const [returns, setReturns] = useState<OrderReturnRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");
  const [updatingReturnId, setUpdatingReturnId] = useState<string | null>(null);

  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/returns");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setReturns(json.data);
      } else {
        addToast({
          title: "შეცდომა",
          message: json.error || "დაბრუნებების ჩატვირთვა ვერ მოხერხდა",
          type: "error",
        });
      }
    } catch (err: any) {
      addToast({
        title: "შეცდომა",
        message: err.message || "სერვერთან კავშირი შეწყდა",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleInlineStatusChange = async (
    orderId: string,
    returnId: string,
    newStatus: "REQUESTED" | "IN_PROGRESS" | "COURIER_ASSIGNED" | "COMPLETED" | "REJECTED"
  ) => {
    setUpdatingReturnId(returnId);
    try {
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnId, status: newStatus }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setReturns((prev) =>
          prev.map((r) => (r.id === returnId ? { ...r, ...json.data } : r))
        );
        addToast({
          title: "სტატუსი განახლდა",
          message: `სტატუსი წარმატებით შეიცვალა`,
          type: "success",
        });
      } else {
        addToast({
          title: "შეცდომა",
          message: json.error || "სტატუსის შეცვლა ვერ მოხერხდა",
          type: "error",
        });
      }
    } catch (err: any) {
      addToast({
        title: "შეცდომა",
        message: err.message || "სერვერთან კავშირი შეწყდა",
        type: "error",
      });
    } finally {
      setUpdatingReturnId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return {
          label: "მოთხოვნილია",
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200/90",
          icon: Clock,
        };
      case "IN_PROGRESS":
        return {
          label: "პროცესშია",
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200/90",
          icon: Layers,
        };
      case "COURIER_ASSIGNED":
        return {
          label: "კურიერთან გადაცემულია",
          bg: "bg-purple-50",
          text: "text-purple-700",
          border: "border-purple-200/90",
          icon: Truck,
        };
      case "COMPLETED":
        return {
          label: "დასრულდა",
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200/90",
          icon: CheckCircle2,
        };
      case "REJECTED":
        return {
          label: "უარყოფილია",
          bg: "bg-rose-50",
          text: "text-rose-700",
          border: "border-rose-200/90",
          icon: XCircle,
        };
      default:
        return {
          label: status,
          bg: "bg-zinc-100",
          text: "text-zinc-700",
          border: "border-zinc-200",
          icon: Clock,
        };
    }
  };

  const getTypeBadge = (type: string) => {
    if (type === "EXCHANGE") {
      return {
        label: "გადაცვლა",
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        icon: ArrowLeftRight,
      };
    }
    return {
      label: "დაბრუნება",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      icon: RotateCcw,
    };
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("ka-GE", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const total = returns.length;
    const requested = returns.filter((r) => r.status === "REQUESTED").length;
    const inProgress = returns.filter((r) => r.status === "IN_PROGRESS").length;
    const courierAssigned = returns.filter((r) => r.status === "COURIER_ASSIGNED").length;
    const completed = returns.filter((r) => r.status === "COMPLETED").length;
    const returnsCount = returns.filter((r) => r.type === "RETURN").length;
    const exchangesCount = returns.filter((r) => r.type === "EXCHANGE").length;

    return { total, requested, inProgress, courierAssigned, completed, returnsCount, exchangesCount };
  }, [returns]);

  // Filtered Returns List
  const filteredReturns = useMemo(() => {
    return returns.filter((ret) => {
      // Status Filter
      if (selectedStatusFilter !== "ALL" && ret.status !== selectedStatusFilter) {
        return false;
      }

      // Type Filter
      if (selectedTypeFilter !== "ALL" && ret.type !== selectedTypeFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const orderNum = ret.order?.orderNumber?.toLowerCase() || "";
        const custName = ret.order?.customerName?.toLowerCase() || "";
        const custPhone = ret.order?.contactPhone?.toLowerCase() || "";
        const reason = ret.reason?.toLowerCase() || "";
        const exchangeTo = ret.exchangeTo?.toLowerCase() || "";
        const itemTitles = Array.isArray(ret.items)
          ? ret.items.map((i) => i.title.toLowerCase()).join(" ")
          : "";

        return (
          orderNum.includes(q) ||
          custName.includes(q) ||
          custPhone.includes(q) ||
          reason.includes(q) ||
          exchangeTo.includes(q) ||
          itemTitles.includes(q)
        );
      }

      return true;
    });
  }, [returns, selectedStatusFilter, selectedTypeFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-[#FF5238] border border-orange-200/80 rounded-full text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ლოჯისტიკა & სერვისი</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-zinc-900 tracking-tight">
            დაბრუნებები & გადაცვლები ({filteredReturns.length})
          </h1>
          <p className="text-xs md:text-sm text-zinc-500">
            ცალკე გამოყოფილი სექცია შეკვეთილი პროდუქტების დასაბრუნებლად, გადასაცვლელად და კურიერის ლოგისტიკისთვის.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchReturns}
            disabled={isLoading}
            className="h-11 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#FF5238]" : ""}`} />
            <span className="hidden sm:inline">განახლება</span>
          </button>

          <Link
            href="/admin/orders"
            className="h-11 px-5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-xs"
          >
            <span>შეკვეთების სიაში გადასვლა</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 2. KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* Metric 1: Total Returns */}
        <button
          type="button"
          onClick={() => { setSelectedStatusFilter("ALL"); setSelectedTypeFilter("ALL"); }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer bg-zinc-50 border-zinc-200 ${
            selectedStatusFilter === "ALL" && selectedTypeFilter === "ALL" ? "ring-2 ring-[#FF5238] shadow-xs" : "hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>სულ მოთხოვნა</span>
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <p className="text-xl text-zinc-900 mt-1 tracking-tight">{metrics.total}</p>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1 font-mono">
            <span>დაბრუნება: {metrics.returnsCount}</span>
            <span>•</span>
            <span>გადაცვლა: {metrics.exchangesCount}</span>
          </div>
        </button>

        {/* Metric 2: Requested */}
        <button
          type="button"
          onClick={() => setSelectedStatusFilter("REQUESTED")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer bg-amber-50/70 border-amber-200/80 ${
            selectedStatusFilter === "REQUESTED" ? "ring-2 ring-amber-500 shadow-xs" : "hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 text-xs">
            <span>მოთხოვნილია</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-xl text-zinc-900 mt-1 tracking-tight">{metrics.requested}</p>
          <span className="text-[10px] text-amber-600/80 block mt-1">ახალი შემოსული</span>
        </button>

        {/* Metric 3: In Progress */}
        <button
          type="button"
          onClick={() => setSelectedStatusFilter("IN_PROGRESS")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer bg-blue-50/70 border-blue-200/80 ${
            selectedStatusFilter === "IN_PROGRESS" ? "ring-2 ring-blue-500 shadow-xs" : "hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-blue-700 text-xs">
            <span>პროცესშია</span>
            <Layers className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl text-zinc-900 mt-1 tracking-tight">{metrics.inProgress}</p>
          <span className="text-[10px] text-blue-600/80 block mt-1">საწყობთან მუშავდება</span>
        </button>

        {/* Metric 4: Courier Assigned */}
        <button
          type="button"
          onClick={() => setSelectedStatusFilter("COURIER_ASSIGNED")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer bg-purple-50/70 border-purple-200/80 ${
            selectedStatusFilter === "COURIER_ASSIGNED" ? "ring-2 ring-purple-500 shadow-xs" : "hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-purple-700 text-xs">
            <span>კურიერთან</span>
            <Truck className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <p className="text-xl text-zinc-900 mt-1 tracking-tight">{metrics.courierAssigned}</p>
          <span className="text-[10px] text-purple-600/80 block mt-1">გზაშია / ჩასაბარებელია</span>
        </button>

        {/* Metric 5: Completed */}
        <button
          type="button"
          onClick={() => setSelectedStatusFilter("COMPLETED")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer bg-emerald-50/70 border-emerald-200/80 ${
            selectedStatusFilter === "COMPLETED" ? "ring-2 ring-emerald-500 shadow-xs" : "hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs">
            <span>დასრულდა</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl text-zinc-900 mt-1 tracking-tight">{metrics.completed}</p>
          <span className="text-[10px] text-emerald-600/80 block mt-1">თანხა/ნივთი გადაცემულია</span>
        </button>

      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="მოძებნე შეკვეთის #, კლიენტის სახელი, ტელეფონი, პროდუქტის დასახელება..."
              className="w-full h-11 pl-10 pr-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5238] focus:bg-white transition-all placeholder:text-zinc-400"
            />
          </div>

          {/* Type Filters (All vs Return vs Exchange) */}
          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-2xl self-start md:self-auto">
            {[
              { id: "ALL", label: "ყველა ტიპი" },
              { id: "RETURN", label: "დაბრუნება" },
              { id: "EXCHANGE", label: "გადაცვლა" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTypeFilter(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                  selectedTypeFilter === t.id
                    ? "bg-white text-zinc-900 shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 4. Returns List Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-7 h-7 text-[#FF5238] animate-spin" />
            <p className="text-xs text-zinc-500 font-mono">დაბრუნებების სია იტვირთება...</p>
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-800">
                ჩანაწერები ვერ მოიძებნა
              </p>
              <p className="text-xs text-zinc-400">
                მითითებული ფილტრებით დაბრუნების ან გადაცვლის მოთხოვნა არ არსებობს.
              </p>
            </div>
          </div>
        ) : (
          filteredReturns.map((ret) => {
            const sb = getStatusBadge(ret.status);
            const tb = getTypeBadge(ret.type);
            const StatusIcon = sb.icon;
            const TypeIcon = tb.icon;

            // Resolve items: from ret.items or fallback to ret.order.items
            const displayItems: ReturnItemPayload[] = (Array.isArray(ret.items) && ret.items.length > 0)
              ? ret.items
              : (Array.isArray(ret.order?.items) && ret.order.items.length > 0)
              ? ret.order.items.map((it: any) => ({
                  orderItemId: it.id,
                  productId: it.productId,
                  title: it.title,
                  sku: it.sku || it.product?.sku || null,
                  image: it.image || it.product?.images?.[0] || it.product?.image || null,
                  quantity: it.quantity || 1,
                  price: Number(it.price) || 0,
                }))
              : [];

            const isUpdating = updatingReturnId === ret.id;

            return (
              <div
                key={ret.id}
                className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-all p-5 md:p-6 space-y-5"
              >
                {/* 1. Card Top Bar: Order link, Type, Status, Inline status update, and Action */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                  
                  {/* Left: Order number & Badges */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                      href={`/admin/orders/${ret.order?.orderNumber || ret.orderId}`}
                      className="text-sm text-zinc-900 hover:text-[#FF5238] font-mono flex items-center gap-1.5 transition-colors cursor-pointer bg-zinc-50 hover:bg-orange-50/50 px-3 py-1.5 rounded-xl border border-zinc-200/80"
                    >
                      <span>შეკვეთა #{ret.order?.orderNumber || ret.orderId}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    </Link>

                    {/* Type Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${tb.bg} ${tb.text} ${tb.border}`}>
                      <TypeIcon className="w-3.5 h-3.5" />
                      <span>{tb.label}</span>
                    </span>

                    {/* Current Status Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${sb.bg} ${sb.text} ${sb.border}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{sb.label}</span>
                    </span>

                    <span className="text-[11px] text-zinc-400 font-mono">
                      {formatDate(ret.createdAt)}
                    </span>
                  </div>

                  {/* Right: Inline Status Selector & Details button */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    
                    {/* Quick status dropdown */}
                    <div className="relative flex items-center">
                      <select
                        value={ret.status}
                        disabled={isUpdating}
                        onChange={(e) =>
                          handleInlineStatusChange(
                            ret.orderId,
                            ret.id,
                            e.target.value as any
                          )
                        }
                        className="h-9 pl-3 pr-8 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:border-[#FF5238] cursor-pointer appearance-none transition-colors disabled:opacity-50"
                      >
                        <option value="REQUESTED">მოთხოვნილია</option>
                        <option value="IN_PROGRESS">პროცესშია</option>
                        <option value="COURIER_ASSIGNED">კურიერთან გადაცემულია</option>
                        <option value="COMPLETED">დასრულდა</option>
                        <option value="REJECTED">უარყოფილია</option>
                      </select>
                      {isUpdating ? (
                        <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      )}
                    </div>

                    {/* Open full order button */}
                    <Link
                      href={`/admin/orders/${ret.order?.orderNumber || ret.orderId}`}
                      className="h-9 px-4 bg-zinc-900 hover:bg-[#FF5238] text-white rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <span>შეკვეთის დეტალები</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>

                {/* 2. Card Body: Grid of Product Showcase & Customer Info */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* Left Column (8 cols): Large Product Showcase */}
                  <div className="lg:col-span-8 space-y-3">
                    
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="uppercase tracking-wider flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#FF5238]" />
                        <span>
                          {ret.type === "EXCHANGE" ? "გადასაცვლელი პროდუქტი" : "დასაბრუნებელი პროდუქტი"}
                        </span>
                      </span>
                      {displayItems.length > 0 && (
                        <span className="font-mono text-zinc-400">
                          {displayItems.length} დასახელება
                        </span>
                      )}
                    </div>

                    {displayItems.length > 0 ? (
                      <div className="space-y-3">
                        {displayItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-zinc-50/70 border border-zinc-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            {/* Product Image & Title */}
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-zinc-200/90 shrink-0 flex items-center justify-center p-1.5 shadow-2xs overflow-hidden">
                                <img
                                  src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"}
                                  alt={item.title}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src =
                                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80";
                                  }}
                                />
                              </div>

                              <div className="space-y-1.5 min-w-0">
                                <h4 className="text-sm text-zinc-900 leading-snug">
                                  {item.title}
                                </h4>
                                
                                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-mono">
                                  {item.sku && (
                                    <span className="bg-white px-2 py-0.5 rounded-md border border-zinc-200">
                                      SKU: {item.sku}
                                    </span>
                                  )}
                                  <span className="bg-zinc-200/70 px-2 py-0.5 rounded-md text-zinc-800">
                                    {item.quantity} ცალი
                                  </span>
                                  <span className="text-[#FF5238]">
                                    {Number(item.price).toFixed(2)} ₾ / ცალი
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Item Subtotal */}
                            <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-200/50">
                              <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">
                                ჯამური ღირებულება
                              </span>
                              <span className="text-base font-mono text-zinc-900">
                                {(Number(item.price) * item.quantity).toFixed(2)} ₾
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs text-zinc-500 flex items-center gap-2">
                        <Package className="w-4 h-4 text-zinc-400" />
                        <span>ვრცელდება მთლიან შეკვეთაზე (#{ret.order?.orderNumber || ret.orderId})</span>
                      </div>
                    )}

                    {/* Exchange Destination or Return Refund Highlight Box */}
                    {ret.type === "EXCHANGE" && ret.exchangeTo ? (
                      <div className="p-4 bg-orange-50/80 border border-orange-200/90 rounded-2xl space-y-1">
                        <div className="flex items-center gap-2 text-xs text-orange-900">
                          <ArrowRight className="w-4 h-4 text-orange-600 shrink-0" />
                          <span>რაში იცვლება (საწყობისა და კურიერისთვის):</span>
                        </div>
                        <p className="text-sm text-orange-950 font-mono bg-white px-3 py-2 rounded-xl border border-orange-200">
                          {ret.exchangeTo}
                        </p>
                      </div>
                    ) : ret.type === "RETURN" && displayItems.length > 0 ? (
                      <div className="p-3.5 bg-indigo-50/80 border border-indigo-200/90 rounded-2xl flex items-center justify-between text-xs text-indigo-950">
                        <div className="flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>მომხმარებელზე დასაბრუნებელი თანხა:</span>
                        </div>
                        <span className="text-sm font-mono text-indigo-900">
                          {displayItems.reduce((acc, curr) => acc + (Number(curr.price) * curr.quantity), 0).toFixed(2)} ₾
                        </span>
                      </div>
                    ) : null}

                  </div>

                  {/* Right Column (4 cols): Customer & Logistics Details */}
                  <div className="lg:col-span-4 space-y-3">
                    
                    <span className="text-xs text-zinc-400 uppercase tracking-wider block">
                      მომხმარებელი & მიწოდება
                    </span>

                    <div className="p-4 bg-zinc-50/70 border border-zinc-200/80 rounded-2xl space-y-3 text-xs">
                      
                      {/* Customer Name */}
                      <div className="flex items-center gap-2.5 text-zinc-900">
                        <div className="w-7 h-7 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-500">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] text-zinc-400 block uppercase">კლიენტი</span>
                          <span className="truncate block">{ret.order?.customerName || "მომხმარებელი"}</span>
                        </div>
                      </div>

                      {/* Phone */}
                      {ret.order?.contactPhone && (
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-500">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] text-zinc-400 block uppercase">ტელეფონი</span>
                            <a
                              href={`tel:${ret.order.contactPhone}`}
                              className="font-mono text-zinc-800 hover:text-[#FF5238] transition-colors"
                            >
                              {ret.order.contactPhone}
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Shipping Address */}
                      {ret.order?.shippingAddress && (
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-500 mt-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] text-zinc-400 block uppercase">მისამართი</span>
                            <span className="text-zinc-600 block leading-snug">{ret.order.shippingAddress}</span>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Reason & Internal Note */}
                    <div className="p-4 bg-white border border-zinc-200/80 rounded-2xl space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                          დაბრუნების მიზეზი:
                        </span>
                        <p className="text-zinc-800 mt-0.5">
                          {ret.reason}
                        </p>
                      </div>

                      {ret.internalNotes && (
                        <div className="pt-2 border-t border-zinc-100">
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                            შიდა შენიშვნა:
                          </span>
                          <p className="text-zinc-600 italic mt-0.5">
                            "{ret.internalNotes}"
                          </p>
                        </div>
                      )}

                      {ret.logs && ret.logs.length > 0 && ret.logs[0].comment && (
                        <div className="pt-2 border-t border-zinc-100 flex items-center gap-1.5 text-[11px] text-zinc-500">
                          <MessageSquare className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate">
                            ბოლო ლოგი: "{ret.logs[0].comment}"
                          </span>
                        </div>
                      )}
                    </div>

                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

