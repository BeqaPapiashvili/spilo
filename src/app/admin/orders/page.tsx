"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  CreditCard,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FilterX,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Phone,
  Package
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { exportOrdersToCSV } from "@/utils/exportImport";
import { OrderStatus } from "@/types";
import { CustomSelect, CustomSelectOption } from "@/components/admin/ui/CustomSelect";

// Custom Status Badge Configs
const STATUS_CONFIGS: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
  "მუშავდება": {
    label: "მუშავდება",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/80",
    icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
  },
  "გზაშია": {
    label: "გზაშია",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200/80",
    icon: <Truck className="w-3.5 h-3.5 text-sky-600" />,
  },
  "ჩაბარებულია": {
    label: "ჩაბარებულია",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/80",
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
  },
  "გაუქმებულია": {
    label: "გაუქმებულია",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200/80",
    icon: <XCircle className="w-3.5 h-3.5 text-red-600" />,
  },
};

export default function AdminOrdersPage() {
  const { adminUser, setOrders, updateOrderStatus, addToast } = useStore();
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Floating Dropdown & Modals
  const [activeDropdownMenu, setActiveDropdownMenu] = useState<{
    id: string;
    top: number;
    left: number;
    currentStatus: string;
  } | null>(null);
  const [previewOrder, setPreviewOrder] = useState<any | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle custom floating dropdown overlay
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

  // Fetch real orders from Database
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
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          rawDate: o.createdAt,
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
          paymentStatus: o.paymentStatus || "PAID",
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

  // Filtered & Sorted orders list
  const filteredOrders = useMemo(() => {
    return dbOrders.filter((o) => {
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        o.id.toLowerCase().includes(query) ||
        (o.customerName && o.customerName.toLowerCase().includes(query)) ||
        (o.contactPhone && o.contactPhone.toLowerCase().includes(query)) ||
        (o.paymentMethod && o.paymentMethod.toLowerCase().includes(query)) ||
        (o.address && o.address.toLowerCase().includes(query));

      const matchStatus = selectedStatusFilter === "ALL" || o.status === selectedStatusFilter;
      const matchPayment = paymentFilter === "ALL" || o.paymentMethod.toLowerCase().includes(paymentFilter.toLowerCase());

      return matchSearch && matchStatus && matchPayment;
    }).sort((a, b) => {
      if (sortBy === "NEWEST") return new Date(b.rawDate || 0).getTime() - new Date(a.rawDate || 0).getTime();
      if (sortBy === "OLDEST") return new Date(a.rawDate || 0).getTime() - new Date(b.rawDate || 0).getTime();
      if (sortBy === "AMOUNT_DESC") return (b.totalAmount || 0) - (a.totalAmount || 0);
      if (sortBy === "AMOUNT_ASC") return (a.totalAmount || 0) - (b.totalAmount || 0);
      return 0;
    });
  }, [dbOrders, searchQuery, selectedStatusFilter, paymentFilter, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // KPIs Metrics
  const metrics = useMemo(() => {
    const total = dbOrders.length;
    const processing = dbOrders.filter((o) => o.status === "მუშავდება").length;
    const shipped = dbOrders.filter((o) => o.status === "გზაშია").length;
    const delivered = dbOrders.filter((o) => o.status === "ჩაბარებულია").length;
    const cancelled = dbOrders.filter((o) => o.status === "გაუქმებულია").length;
    const totalRevenue = dbOrders
      .filter((o) => o.status !== "გაუქმებულია")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return { total, processing, shipped, delivered, cancelled, totalRevenue };
  }, [dbOrders]);

  const statuses = ["ALL", "მუშავდება", "გზაშია", "ჩაბარებულია", "გაუქმებულია"];

  const sortOptions: CustomSelectOption[] = [
    { value: "NEWEST", label: "უახლესი პირველი" },
    { value: "OLDEST", label: "ძველი პირველი" },
    { value: "AMOUNT_DESC", label: "თანხა: მაღლიდან დაბლა" },
    { value: "AMOUNT_ASC", label: "თანხა: დაბლიდან მაღლა" },
  ];

  const paymentOptions: CustomSelectOption[] = [
    { value: "ALL", label: "ყველა გადახდის მეთოდი" },
    { value: "ბარათი", label: "საბანკო ბარათი" },
    { value: "განვადება", label: "ონლაინ განვადება" },
    { value: "ნაღდი", label: "ნაღდი ანგარიშსწორება" },
  ];

  // Live status update via PUT /api/orders
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

  // Safe Order Delete
  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/orders?id=${encodeURIComponent(orderToDelete.rawId || orderToDelete.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        addToast({
          title: "წაშლილია",
          message: `შეკვეთა #${orderToDelete.id} წარმატებით წაიშალა`,
          type: "success",
        });
        setDbOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
        if (previewOrder?.id === orderToDelete.id) {
          setPreviewOrder(null);
        }
        setOrderToDelete(null);
      } else {
        addToast({
          title: "შეცდომა",
          message: data.error || "შეკვეთის წაშლა ვერ მოხერხდა",
          type: "error",
        });
      }
    } catch (err) {
      addToast({
        title: "შეცდომა",
        message: "სერვერთან კავშირი შეწყდა",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. Top Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF5F2] text-[#FF5238] border border-[#FED7CC] rounded-full text-xs">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>გაყიდვების & შეკვეთების მართვა</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-zinc-900 tracking-tight">
            შეკვეთები ({filteredOrders.length})
          </h1>
          <p className="text-xs md:text-sm text-zinc-500">
            მართეთ ონლაინ შეკვეთები, მიწოდების სტატუსები, ინვოისები და მომხმარებლის დეტალები.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={fetchDbOrders}
            disabled={isLoading}
            className="h-11 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#FF5238]" : ""}`} />
            <span className="hidden sm:inline">განახლება</span>
          </button>

          <button
            type="button"
            onClick={() => exportOrdersToCSV(filteredOrders)}
            className="h-11 px-5 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-xs active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>ექსპორტი (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive KPI Stats Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* Metric 1: Total Orders */}
        <button
          type="button"
          onClick={() => { setSelectedStatusFilter("ALL"); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer bg-zinc-50 border-zinc-200 ${
            selectedStatusFilter === "ALL" ? "ring-2 ring-[#FF5238] shadow-xs" : "hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>სულ შეკვეთა</span>
            <ShoppingBag className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <p className="text-xl text-zinc-900 mt-1 tracking-tight">{metrics.total}</p>
        </button>

        {/* Metric 2: Processing */}
        <button
          type="button"
          onClick={() => { setSelectedStatusFilter("მუშავდება"); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer bg-amber-50/70 border-amber-200/80 ${
            selectedStatusFilter === "მუშავდება" ? "ring-2 ring-amber-500 shadow-xs" : "hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 text-xs">
            <span>მუშავდება</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-xl text-zinc-900 mt-1 tracking-tight">{metrics.processing}</p>
        </button>

        {/* Metric 3: Shipped */}
        <button
          type="button"
          onClick={() => { setSelectedStatusFilter("გზაშია"); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer bg-sky-50/70 border-sky-200/80 ${
            selectedStatusFilter === "გზაშია" ? "ring-2 ring-sky-500 shadow-xs" : "hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-sky-700 text-xs">
            <span>გზაშია</span>
            <Truck className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <p className="text-xl text-zinc-900 mt-1 tracking-tight">{metrics.shipped}</p>
        </button>

        {/* Metric 4: Delivered */}
        <button
          type="button"
          onClick={() => { setSelectedStatusFilter("ჩაბარებულია"); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer bg-emerald-50/70 border-emerald-200/80 ${
            selectedStatusFilter === "ჩაბარებულია" ? "ring-2 ring-emerald-500 shadow-xs" : "hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs">
            <span>ჩაბარებულია</span>
            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl text-zinc-900 mt-1 tracking-tight">{metrics.delivered}</p>
        </button>

        {/* Metric 5: Total Revenue */}
        <div className="p-4 rounded-2xl border text-left bg-[#FFF5F2] border-[#FED7CC] col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[#FF5238] text-xs">
            <span>სულ შემოსავალი</span>
            <DollarSign className="w-3.5 h-3.5 text-[#FF5238]" />
          </div>
          <p className="text-xl text-zinc-900 mt-1 tracking-tight font-mono">₾{metrics.totalRevenue.toFixed(0)}</p>
        </div>

      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-4">
        
        {/* Search & Status Filters */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Custom Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ძებნა: შეკვეთა #, სახელი, ტელეფონი, მისამართი..."
              className="w-full h-11 pl-10 pr-10 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FF5238]/15 focus:border-[#FF5238] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-100/80 rounded-2xl">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSelectedStatusFilter(s);
                  setCurrentPage(1);
                }}
                className={`h-9 px-3.5 rounded-xl text-xs cursor-pointer transition-all ${
                  selectedStatusFilter === s
                    ? "bg-[#FF5238] text-white shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {s === "ALL" ? "ყველა" : s}
              </button>
            ))}
          </div>

        </div>

        {/* CustomSelect Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-zinc-100">
          <CustomSelect
            placeholder="გადახდის მეთოდი"
            options={paymentOptions}
            value={paymentFilter}
            onChange={(val) => {
              setPaymentFilter(val);
              setCurrentPage(1);
            }}
          />

          <CustomSelect
            placeholder="დალაგება"
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
          />

          {(searchQuery !== "" || selectedStatusFilter !== "ALL" || paymentFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedStatusFilter("ALL");
                setPaymentFilter("ALL");
                setCurrentPage(1);
              }}
              className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>ფილტრების გასუფთავება</span>
            </button>
          )}
        </div>

      </div>

      {/* 4. Orders Table */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 text-[11px] select-none">
                <th className="py-3.5 px-6">შეკვეთა ID</th>
                <th className="py-3.5 px-6">თარიღი</th>
                <th className="py-3.5 px-6">მომხმარებელი & მისამართი</th>
                <th className="py-3.5 px-6">გადახდა & ნივთები</th>
                <th className="py-3.5 px-6">ჯამური თანხა</th>
                <th className="py-3.5 px-6">სტატუსი</th>
                <th className="py-3.5 px-6 text-right pr-6">მოქმედება</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 bg-zinc-200 rounded w-24" /></td>
                    <td className="py-4 px-6"><div className="h-3.5 bg-zinc-100 rounded w-20" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-zinc-200 rounded w-36 mb-1" /><div className="h-3 bg-zinc-100 rounded w-28" /></td>
                    <td className="py-4 px-6"><div className="h-3.5 bg-zinc-100 rounded w-24" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-zinc-200 rounded w-16" /></td>
                    <td className="py-4 px-6"><div className="h-7 bg-zinc-100 rounded-full w-24" /></td>
                    <td className="py-4 px-6 text-right pr-6"><div className="h-8 bg-zinc-100 rounded-xl w-20 inline-block" /></td>
                  </tr>
                ))
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-400">
                    <div className="w-14 h-14 rounded-3xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center mb-3">
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <p className="text-sm text-zinc-800">შეკვეთები ვერ მოიძებნა</p>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                      მითითებული პარამეტრებით შეკვეთა არ მოიძებნა.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const cfg = STATUS_CONFIGS[order.status] || STATUS_CONFIGS["მუშავდება"];
                  const isMenuOpen = activeDropdownMenu?.id === order.id;

                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-zinc-50/80 transition-colors group"
                    >
                      
                      {/* Order Number */}
                      <td className="py-3.5 px-6 font-mono text-zinc-900 font-medium">
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/admin/orders/${order.rawId || order.id}`}
                            className="hover:text-[#FF5238] transition-colors"
                          >
                            #{order.id}
                          </Link>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-6 text-zinc-500 font-mono text-[11px] whitespace-nowrap">
                        {order.date}
                      </td>

                      {/* Customer & Address */}
                      <td className="py-3.5 px-6">
                        <div className="space-y-0.5 max-w-[220px]">
                          <p className="text-zinc-900 truncate font-sans">{order.customerName}</p>
                          {order.contactPhone && (
                            <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                              <Phone className="w-3 h-3 text-zinc-400" />
                              <span>{order.contactPhone}</span>
                            </p>
                          )}
                          {order.address && (
                            <p className="text-[11px] text-zinc-500 truncate flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                              <span className="truncate">{order.address}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Payment & Items */}
                      <td className="py-3.5 px-6">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-zinc-700">
                            <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-[11px]">{order.paymentMethod}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 font-mono">
                            {order.items?.length || 0} ნივთი
                          </p>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-6 font-mono whitespace-nowrap">
                        <span className="text-sm text-zinc-900">
                          {order.totalAmount} ₾
                        </span>
                      </td>

                      {/* Status Dropdown Trigger */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => handleToggleDropdown(e, order.id, order.status)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${cfg.bg} ${cfg.text} ${cfg.border} hover:opacity-85 transition-all cursor-pointer`}
                        >
                          {cfg.icon}
                          <span>{cfg.label}</span>
                          <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-6 text-right pr-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Quick Inspection View */}
                          <button
                            type="button"
                            onClick={() => setPreviewOrder(order)}
                            title="სწრაფი დათვალიერება"
                            className="p-2 text-zinc-400 hover:text-[#FF5238] hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Full Page & Invoice */}
                          <Link
                            href={`/admin/orders/${order.rawId || order.id}`}
                            title="სრული ინვოისი & გვერდი"
                            className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>

                          {/* Delete Order */}
                          <button
                            type="button"
                            onClick={() => setOrderToDelete(order)}
                            title="შეკვეთის წაშლა"
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-zinc-500">
            ნაჩვენებია <span className="text-zinc-900">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
            <span className="text-zinc-900">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> სულ{" "}
            <span className="text-zinc-900">{filteredOrders.length}</span> შეკვეთიდან
          </div>

          <div className="flex items-center gap-2 self-center">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                let pageNum = idx + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + idx;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - idx);
                }
                const isActive = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#FF5238] text-white shadow-2xs"
                        : "text-zinc-700 hover:bg-zinc-100 border border-zinc-200/60"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 6. Global Fixed Status Dropdown Overlay */}
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
            className="w-44 bg-white rounded-2xl shadow-2xl border border-zinc-200 p-1.5 z-[9999] animate-in fade-in duration-150 space-y-1"
          >
            {Object.entries(STATUS_CONFIGS).map(([stKey, stCfg]) => (
              <button
                key={stKey}
                type="button"
                onClick={() => handleStatusUpdate(activeDropdownMenu.id, stKey)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-left transition-colors cursor-pointer ${
                  activeDropdownMenu.currentStatus === stKey
                    ? "bg-[#FFF5F2] text-[#FF5238] font-medium"
                    : "hover:bg-zinc-50 text-zinc-700"
                }`}
              >
                {stCfg.icon}
                <span>{stCfg.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* 7. Quick Order Preview Modal */}
      {previewOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-zinc-100 space-y-5 animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h3 className="text-base text-zinc-900">შეკვეთის დეტალები</h3>
                <p className="text-xs text-zinc-400 font-mono">#{previewOrder.id} • {previewOrder.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOrder(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-xl hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Strip */}
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">მომხმარებელი:</span>
                <span className="text-zinc-900 font-medium">{previewOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">ტელეფონი:</span>
                <a href={`tel:${previewOrder.contactPhone}`} className="text-zinc-900 hover:text-[#FF5238] font-mono">
                  {previewOrder.contactPhone || "-"}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">მისამართი:</span>
                <span className="text-zinc-900 text-right max-w-[240px]">{previewOrder.address || "მისამართი არ არის"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">გადახდა:</span>
                <span className="text-zinc-900">{previewOrder.paymentMethod}</span>
              </div>
            </div>

            {/* Order Items List */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              <h4 className="text-xs text-zinc-500 font-medium">შეკვეთილი ნივთები ({previewOrder.items?.length || 0}):</h4>
              {previewOrder.items && previewOrder.items.length > 0 ? (
                previewOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between gap-3 p-2 bg-white rounded-xl border border-zinc-100 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.image && (
                        <img src={item.image} alt={item.title} className="w-9 h-9 object-contain rounded-lg border border-zinc-200 p-0.5 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-zinc-900 truncate">{item.title}</p>
                        <p className="text-[11px] text-zinc-400 font-mono">{item.quantity} x {item.price} ₾</p>
                      </div>
                    </div>
                    <span className="font-mono text-zinc-900 shrink-0">{(item.quantity * item.price).toFixed(0)} ₾</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400 py-2 text-center">ნივთების სია ცარიელია</p>
              )}
            </div>

            {/* Total Footer */}
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-sm">
              <span className="text-zinc-600">სულ ჯამი:</span>
              <span className="text-[#FF5238] font-mono text-lg">{previewOrder.totalAmount} ₾</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2">
              <Link
                href={`/admin/orders/${previewOrder.rawId || previewOrder.id}`}
                className="flex-1 h-11 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>სრული გვერდი & ინვოისი</span>
              </Link>

              <button
                type="button"
                onClick={() => setPreviewOrder(null)}
                className="px-4 h-11 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs transition-colors cursor-pointer"
              >
                დახურვა
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 8. Safe Order Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setOrderToDelete(null)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 md:p-8 border border-zinc-100 shadow-2xl z-10 space-y-4 animate-in zoom-in-95 duration-150">
            
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base text-zinc-900">შეკვეთის წაშლის დადასტურება</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                ნამდვილად გსურთ შეკვეთა <strong>#{orderToDelete.id}</strong>-ის წაშლა? ეს ქმედება შეუქცევადია და წაშლის შეკვეთის ნივთებსა და ჩანაწერს.
              </p>
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-1 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>მომხმარებელი:</span>
                <span className="text-zinc-800">{orderToDelete.customerName}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>ჯამური თანხა:</span>
                <span className="text-zinc-800">₾{orderToDelete.totalAmount}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>სტატუსი:</span>
                <span className="text-zinc-800">{orderToDelete.status}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs transition-colors cursor-pointer"
              >
                გაუქმება
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>წაშლის დადასტურება</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
