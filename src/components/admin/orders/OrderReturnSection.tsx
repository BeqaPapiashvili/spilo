"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowLeftRight,
  RotateCcw,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Plus,
  Send,
  Loader2,
  ChevronDown,
  History,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  Tag,
  CornerDownRight,
  Check,
} from "lucide-react";
import { useStore } from "@/store/useStore";

export type ReturnType = "RETURN" | "EXCHANGE";
export type ReturnStatus =
  | "REQUESTED"
  | "IN_PROGRESS"
  | "COURIER_ASSIGNED"
  | "COMPLETED"
  | "REJECTED";

export interface SelectedItemPayload {
  orderItemId: string;
  productId?: string;
  title: string;
  sku?: string | null;
  image?: string | null;
  quantity: number;
  maxQuantity: number;
  price: number;
  selectedVariants?: any;
}

export interface ReturnLogItem {
  id: string;
  orderReturnId: string;
  status?: ReturnStatus | null;
  action: string;
  comment?: string | null;
  authorName?: string | null;
  authorEmail?: string | null;
  createdAt: string;
}

export interface OrderReturnItem {
  id: string;
  orderId: string;
  type: ReturnType;
  status: ReturnStatus;
  reason: string;
  internalNotes?: string | null;
  items?: SelectedItemPayload[] | null;
  exchangeTo?: string | null;
  logs?: ReturnLogItem[];
  createdAt: string;
  updatedAt: string;
}

interface OrderReturnSectionProps {
  orderId: string;
  orderNumber: string;
  orderItems?: any[];
  initialReturns?: OrderReturnItem[];
  canManage?: boolean;
}

const PRESET_REASONS = [
  "ზომა არ მოერგო (არასწორი ზომა)",
  "ქარხნული წუნი / დეფექტი",
  "არ შეესაბამება საიტის აღწერას / ფოტოს",
  "არასწორი ნივთი მივიდა მომხმარებელთან",
  "მომხმარებელმა გადაიფიქრა (ხარისხიანი ნივთის დაბრუნება)",
  "სხვა მიზეზი",
];

export default function OrderReturnSection({
  orderId,
  orderNumber,
  orderItems = [],
  initialReturns = [],
  canManage = true,
}: OrderReturnSectionProps) {
  const { addToast } = useStore();

  const [returnsList, setReturnsList] = useState<OrderReturnItem[]>(initialReturns);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);

  // New Request Form State
  const [newType, setNewType] = useState<ReturnType>("RETURN");
  const [selectedReasonOption, setSelectedReasonOption] = useState<string>(PRESET_REASONS[0]);
  const [customReasonText, setCustomReasonText] = useState<string>("");
  const [initialNotes, setInitialNotes] = useState<string>("");
  const [exchangeToText, setExchangeToText] = useState<string>("");

  // Product Selection Map: { [orderItemId]: { selected: boolean, quantity: number } }
  const [selectedItemsMap, setSelectedItemsMap] = useState<Record<string, { selected: boolean; quantity: number }>>(() => {
    const initialMap: Record<string, { selected: boolean; quantity: number }> = {};
    orderItems.forEach((item) => {
      initialMap[item.id] = { selected: orderItems.length === 1, quantity: 1 };
    });
    return initialMap;
  });

  // Comment Input for Active Return
  const [newCommentText, setNewCommentText] = useState<string>("");

  // Active return (unfinalized)
  const activeReturn = returnsList.find(
    (r) => r.status === "REQUESTED" || r.status === "IN_PROGRESS" || r.status === "COURIER_ASSIGNED"
  );

  const pastReturns = returnsList.filter(
    (r) => r.status === "COMPLETED" || r.status === "REJECTED"
  );

  const primaryReturn = activeReturn || returnsList[0];

  const getStatusBadge = (status: ReturnStatus) => {
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
          label: "უარყოფილია / გაუქმდა",
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
          icon: AlertCircle,
        };
    }
  };

  const getTypeBadge = (type: ReturnType) => {
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

  const toggleItemSelection = (itemId: string) => {
    setSelectedItemsMap((prev) => {
      const current = prev[itemId] || { selected: false, quantity: 1 };
      return {
        ...prev,
        [itemId]: { ...current, selected: !current.selected },
      };
    });
  };

  const changeItemQuantity = (itemId: string, qty: number, maxQty: number) => {
    const validQty = Math.max(1, Math.min(qty, maxQty));
    setSelectedItemsMap((prev) => {
      const current = prev[itemId] || { selected: true, quantity: 1 };
      return {
        ...prev,
        [itemId]: { ...current, quantity: validQty },
      };
    });
  };

  // 1. Create Return / Exchange Request
  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      addToast({
        title: "წვდომა შეზღუდულია",
        message: "თქვენ არ გაქვთ მოთხოვნის დაფიქსირების უფლება",
        type: "warning",
      });
      return;
    }

    const finalReason =
      selectedReasonOption === "სხვა მიზეზი" && customReasonText.trim()
        ? customReasonText.trim()
        : selectedReasonOption;

    if (!finalReason.trim()) {
      addToast({
        title: "შეცდომა",
        message: "გთხოვთ მიუთითოთ დაბრუნების/გადაცვლის მიზეზი",
        type: "error",
      });
      return;
    }

    // Build selected items list
    const chosenItems: SelectedItemPayload[] = [];
    orderItems.forEach((it) => {
      const sel = selectedItemsMap[it.id];
      if (sel && sel.selected) {
        chosenItems.push({
          orderItemId: it.id,
          productId: it.productId,
          title: it.title,
          sku: it.sku || it.product?.sku || null,
          image: it.image || it.product?.images?.[0] || null,
          quantity: sel.quantity,
          maxQuantity: it.quantity,
          price: Number(it.price) || 0,
          selectedVariants: it.selectedVariants || null,
        });
      }
    });

    if (orderItems.length > 0 && chosenItems.length === 0) {
      addToast({
        title: "აირჩიეთ პროდუქტი",
        message: "გთხოვთ მონიშნოთ მინიმუმ ერთი პროდუქტი შეკვეთიდან, რომელიც ბრუნდება ან იცვლება",
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newType,
          reason: finalReason,
          internalNotes: initialNotes.trim() || undefined,
          items: chosenItems.length > 0 ? chosenItems : undefined,
          exchangeTo: newType === "EXCHANGE" && exchangeToText.trim() ? exchangeToText.trim() : undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setReturnsList((prev) => [json.data, ...prev]);
        setIsFormOpen(false);
        setCustomReasonText("");
        setInitialNotes("");
        setExchangeToText("");
        addToast({
          title: "მოთხოვნა შეიქმნა",
          message: `${newType === "EXCHANGE" ? "გადაცვლის" : "დაბრუნების"} მოთხოვნა წარმატებით დაფიქსირდა`,
          type: "success",
        });
      } else {
        addToast({
          title: "შეცდომა",
          message: json.error || "მოთხოვნის შექმნა ვერ მოხერხდა",
          type: "error",
        });
      }
    } catch (error: any) {
      addToast({
        title: "შეცდომა",
        message: error.message || "სერვერთან კავშირის შეცდომა",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Change Status
  const handleStatusUpdate = async (newStatus: ReturnStatus) => {
    if (!primaryReturn) return;
    if (!canManage) {
      addToast({
        title: "წვდომა შეზღუდულია",
        message: "თქვენ არ გაქვთ სტატუსის შეცვლის უფლება",
        type: "warning",
      });
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/return`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnId: primaryReturn.id,
          status: newStatus,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setReturnsList((prev) =>
          prev.map((item) => (item.id === primaryReturn.id ? json.data : item))
        );
        addToast({
          title: "სტატუსი განახლდა",
          message: `დაბრუნების სტატუსი: ${getStatusBadge(newStatus).label}`,
          type: "success",
        });
      } else {
        addToast({
          title: "შეცდომა",
          message: json.error || "სტატუსის განახლება ვერ მოხერხდა",
          type: "error",
        });
      }
    } catch (error: any) {
      addToast({
        title: "შეცდომა",
        message: error.message || "სერვერთან კავშირი შეწყდა",
        type: "error",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 3. Add Internal Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryReturn || !newCommentText.trim()) return;
    if (!canManage) {
      addToast({
        title: "წვდომა შეზღუდულია",
        message: "თქვენ არ გაქვთ შენიშვნის დამატების უფლება",
        type: "warning",
      });
      return;
    }

    setIsAddingComment(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/return`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnId: primaryReturn.id,
          comment: newCommentText.trim(),
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setReturnsList((prev) =>
          prev.map((item) => (item.id === primaryReturn.id ? json.data : item))
        );
        setNewCommentText("");
        addToast({
          title: "ჩანაწერი დაემატა",
          message: "შიდა კომენტარი წარმატებით დაფიქსირდა ისტორიაში",
          type: "success",
        });
      } else {
        addToast({
          title: "შეცდომა",
          message: json.error || "კომენტარის დამატება ვერ მოხერხდა",
          type: "error",
        });
      }
    } catch (error: any) {
      addToast({
        title: "შეცდომა",
        message: error.message || "სერვერთან კავშირი შეწყდა",
        type: "error",
      });
    } finally {
      setIsAddingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("ka-GE", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Highlighted items in primary return, fallback to orderItems if return.items was empty
  const returnItemsList: SelectedItemPayload[] = (Array.isArray(primaryReturn?.items) && primaryReturn.items.length > 0)
    ? (primaryReturn.items as SelectedItemPayload[])
    : orderItems.length > 0
    ? orderItems.map((it) => ({
        orderItemId: it.id,
        productId: it.productId,
        title: it.title,
        sku: it.sku || it.product?.sku || null,
        image: it.image || it.product?.images?.[0] || it.product?.image || null,
        quantity: it.quantity || 1,
        maxQuantity: it.quantity || 1,
        price: Number(it.price) || 0,
        selectedVariants: it.selectedVariants || null,
      }))
    : [];

  return (
    <div id="returns-section" className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs p-6 space-y-6 scroll-mt-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-orange-50 border border-orange-200/70 flex items-center justify-center text-[#FF5238] shadow-2xs">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm text-zinc-900 tracking-tight">
                დაბრუნება / გადაცვლა
              </h3>
              <span className="text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full font-mono">
                Returns & Exchanges
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              ოპერატორის შიდა პანელი: დაბრუნებული/გადასაცვლელი პროდუქტების, ეტაპებისა და კურიერის ლოგისტიკის სამართავად
            </p>
          </div>
        </div>

        {/* Action Button if no active return */}
        {!activeReturn && !isFormOpen && canManage && (
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-[#FF5238] text-white rounded-xl text-xs transition-all cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>დაბრუნების / გადაცვლის დაფიქსირება</span>
          </button>
        )}
      </div>

      {/* Initiation Form (Modal / Collapsible) */}
      {isFormOpen && (
        <form
          onSubmit={handleCreateReturn}
          className="p-5 bg-zinc-50/80 border border-zinc-200/90 rounded-2xl space-y-5"
        >
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF5238]" />
              <span className="text-xs text-zinc-900">
                დაბრუნების/გადაცვლის დაფიქსირება შეკვეთაზე #{orderNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-zinc-200/50"
            >
              გაუქმება
            </button>
          </div>

          {/* 1. Type Selector: Return vs Exchange */}
          <div className="space-y-2">
            <label className="text-[11px] text-zinc-500 block uppercase tracking-wider">
              1. აირჩიეთ მოთხოვნის ტიპი:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setNewType("RETURN")}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  newType === "RETURN"
                    ? "bg-indigo-50/70 border-indigo-300 shadow-xs"
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50/80"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${newType === "RETURN" ? "bg-indigo-100 text-indigo-700" : "bg-zinc-100 text-zinc-400"}`}>
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className={`text-xs block ${newType === "RETURN" ? "text-indigo-900" : "text-zinc-800"}`}>
                    პროდუქტის დაბრუნება (Refund)
                  </span>
                  <span className="text-[11px] text-zinc-500 block leading-normal">
                    ნივთი ბრუნდება მაღაზიაში და მომხმარებელს უბრუნდება გადახდილი თანხა
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setNewType("EXCHANGE")}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  newType === "EXCHANGE"
                    ? "bg-orange-50/70 border-orange-300 shadow-xs"
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50/80"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${newType === "EXCHANGE" ? "bg-orange-100 text-orange-700" : "bg-zinc-100 text-zinc-400"}`}>
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className={`text-xs block ${newType === "EXCHANGE" ? "text-orange-900" : "text-zinc-800"}`}>
                    პროდუქტის გადაცვლა (Exchange)
                  </span>
                  <span className="text-[11px] text-zinc-500 block leading-normal">
                    ნივთი იცვლება სხვა ზომაში, ფერში ან ალტერნატიულ მოდელში
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Product Picker: WHICH products are being returned / exchanged? */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] text-zinc-500 uppercase tracking-wider block">
                2. მონიშნეთ კონკრეტული პროდუქტი (რომელი ბრუნდება/იცვლება):
              </label>
              <span className="text-[11px] text-zinc-400">
                სულ შეკვეთაშია: {orderItems.length} ნივთი
              </span>
            </div>

            {orderItems.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {orderItems.map((item) => {
                  const state = selectedItemsMap[item.id] || { selected: false, quantity: 1 };
                  const itemImg = item.image || item.product?.images?.[0];
                  const itemSku = item.sku || item.product?.sku;

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItemSelection(item.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        state.selected
                          ? "bg-white border-[#FF5238] shadow-xs ring-1 ring-[#FF5238]/30"
                          : "bg-white/80 border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Custom Checkbox */}
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                            state.selected
                              ? "bg-[#FF5238] border-[#FF5238] text-white"
                              : "border-zinc-300 bg-zinc-50"
                          }`}
                        >
                          {state.selected && <Check className="w-3 h-3" />}
                        </div>

                        {/* Product Image */}
                        <div className="w-14 h-14 rounded-xl bg-zinc-50 border border-zinc-100 relative overflow-hidden shrink-0 flex items-center justify-center p-1">
                          <img
                            src={itemImg || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"}
                            alt={item.title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80";
                            }}
                          />
                        </div>

                        {/* Title & SKU */}
                        <div className="space-y-0.5 text-xs">
                          <p className="text-zinc-900 leading-snug line-clamp-1 max-w-sm">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                            {itemSku && <span>SKU: {itemSku}</span>}
                            <span>•</span>
                            <span className="text-[#FF5238]">
                              {Number(item.price).toFixed(2)} ₾
                            </span>
                          </div>
                          {item.selectedVariants && (
                            <span className="text-[10px] text-zinc-500 block">
                              არჩეული ვარიანტი: {typeof item.selectedVariants === "string" ? item.selectedVariants : JSON.stringify(item.selectedVariants)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity selector (if selected) */}
                      {state.selected && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 bg-zinc-50 px-2.5 py-1.5 rounded-xl border border-zinc-200/80 text-xs shrink-0"
                        >
                          <span className="text-[11px] text-zinc-500">რაოდენობა:</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => changeItemQuantity(item.id, state.quantity - 1, item.quantity)}
                              className="w-6 h-6 rounded-md bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100 flex items-center justify-center text-xs cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-mono text-zinc-900 px-1">
                              {state.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={state.quantity >= item.quantity}
                              onClick={() => changeItemQuantity(item.id, state.quantity + 1, item.quantity)}
                              className="w-6 h-6 rounded-md bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100 flex items-center justify-center text-xs cursor-pointer disabled:opacity-30"
                            >
                              +
                            </button>
                            <span className="text-[10px] text-zinc-400">/ {item.quantity} ც</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-white rounded-xl border border-zinc-200 text-xs text-zinc-500">
                შეკვეთაში პროდუქტების სია არ არის მითითებული.
              </div>
            )}
          </div>

          {/* 3. If Exchange: WHAT IS IT BEING EXCHANGED TO? */}
          {newType === "EXCHANGE" && (
            <div className="space-y-1.5 p-3.5 bg-orange-50/50 border border-orange-200/80 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-orange-950">
                <ArrowRight className="w-3.5 h-3.5 text-orange-600" />
                <span>რაში იცვლება პროდუქტი? (სასურველი ზომა / ფერი / მოდელი):</span>
              </div>
              <input
                type="text"
                placeholder="მაგ: ზომა L-ის ნაცვლად XL; ან ფერი: შავი-ს ნაცვლად თეთრი..."
                value={exchangeToText}
                onChange={(e) => setExchangeToText(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-orange-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5238]"
              />
              <span className="text-[10px] text-orange-800/80 block">
                ეს ტექსტი პირდაპირ გამოჩნდება ბარათში, რათა საწყობის თანამშრომელმა და კურიერმა ზუსტად იცოდეს რა უნდა გაატანოს.
              </span>
            </div>
          )}

          {/* 4. Reason Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-zinc-500 block uppercase tracking-wider">
              3. დაბრუნების / გადაცვლის მიზეზი:
            </label>
            <div className="relative">
              <select
                value={selectedReasonOption}
                onChange={(e) => setSelectedReasonOption(e.target.value)}
                className="w-full h-10 px-3 pr-8 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5238] appearance-none"
              >
                {PRESET_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {selectedReasonOption === "სხვა მიზეზი" && (
              <input
                type="text"
                placeholder="დააკონკრეტეთ მიზეზი დეტალურად..."
                value={customReasonText}
                onChange={(e) => setCustomReasonText(e.target.value)}
                className="w-full h-10 px-3 mt-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5238]"
              />
            )}
          </div>

          {/* 5. Initial Internal Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-zinc-500 block uppercase tracking-wider">
              4. საწყისი შიდა კომენტარი ოპერატორისთვის:
            </label>
            <textarea
              rows={2}
              placeholder="მაგ. მომხმარებელმა დარეკა, შევუთანხმდით რომ ხვალ გავაგზავნით კურიერს..."
              value={initialNotes}
              onChange={(e) => setInitialNotes(e.target.value)}
              className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5238] resize-none"
            />
          </div>

          {/* Form Submit & Cancel Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200/60">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="h-9 px-3.5 bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100 rounded-xl text-xs transition-colors cursor-pointer"
            >
              გაუქმება
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-4 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>მოთხოვნის დაფიქსირება</span>
            </button>
          </div>
        </form>
      )}

      {/* Main View: If a Return Request exists */}
      {primaryReturn ? (
        <div className="space-y-6">
          
          {/* Active Return Status Header & Quick Actions Bar */}
          <div className="p-5 bg-zinc-50/70 border border-zinc-200/80 rounded-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/60">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Type Badge */}
                {(() => {
                  const tb = getTypeBadge(primaryReturn.type);
                  const Icon = tb.icon;
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${tb.bg} ${tb.text} ${tb.border}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tb.label}</span>
                    </span>
                  );
                })()}

                {/* Status Badge */}
                {(() => {
                  const sb = getStatusBadge(primaryReturn.status);
                  const Icon = sb.icon;
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${sb.bg} ${sb.text} ${sb.border}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{sb.label}</span>
                    </span>
                  );
                })()}

                <span className="text-[11px] text-zinc-400 font-mono">
                  დაფიქსირდა: {formatDate(primaryReturn.createdAt)}
                </span>
              </div>

              {/* Status Change Dropdown */}
              {canManage && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-500 hidden sm:inline">
                    სტატუსის შეცვლა:
                  </span>
                  <div className="relative">
                    <select
                      value={primaryReturn.status}
                      disabled={isUpdatingStatus}
                      onChange={(e) =>
                        handleStatusUpdate(e.target.value as ReturnStatus)
                      }
                      className="h-9 pl-3 pr-8 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5238] cursor-pointer disabled:opacity-50 appearance-none shadow-2xs"
                    >
                      <option value="REQUESTED">მოთხოვნილია (Requested)</option>
                      <option value="IN_PROGRESS">პროცესშია (In Progress)</option>
                      <option value="COURIER_ASSIGNED">კურიერთან გადაცემულია (Courier Assigned)</option>
                      <option value="COMPLETED">დასრულდა (Completed)</option>
                      <option value="REJECTED">უარყოფილია / გაუქმდა (Rejected)</option>
                    </select>
                    {isUpdatingStatus ? (
                      <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* VISUAL 4-STEP PROGRESS STEPPER */}
            {primaryReturn.status !== "REJECTED" ? (
              <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 space-y-2">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                  პროცესის ეტაპი:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: "REQUESTED", label: "1. მოთხოვნილია", icon: Clock },
                    { key: "IN_PROGRESS", label: "2. პროცესშია", icon: Layers },
                    { key: "COURIER_ASSIGNED", label: "3. კურიერთან", icon: Truck },
                    { key: "COMPLETED", label: "4. დასრულდა", icon: CheckCircle2 },
                  ].map((step, sIdx) => {
                    const statusOrder = ["REQUESTED", "IN_PROGRESS", "COURIER_ASSIGNED", "COMPLETED"];
                    const currentIdx = statusOrder.indexOf(primaryReturn.status);
                    const isPassed = currentIdx >= sIdx;
                    const isCurrent = primaryReturn.status === step.key;
                    const StepIcon = step.icon;

                    return (
                      <div
                        key={step.key}
                        className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                          isCurrent
                            ? "bg-[#FF5238] text-white border-[#FF5238] shadow-2xs"
                            : isPassed
                            ? "bg-zinc-100 text-zinc-800 border-zinc-200"
                            : "bg-zinc-50/60 text-zinc-400 border-zinc-100"
                        }`}
                      >
                        <StepIcon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-white" : isPassed ? "text-emerald-600" : "text-zinc-300"}`} />
                        <span className="truncate">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>ეს მოთხოვნა უარყოფილია / გაუქმებულია.</span>
              </div>
            )}

            {/* DEDICATED PRODUCT SHOWCASE CARD: WHICH SPECIFIC PRODUCTS ARE BEING RETURNED/EXCHANGED? */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#FF5238]" />
                  <span>
                    {primaryReturn.type === "EXCHANGE" ? "გადასაცვლელი პროდუქტი (ნივთები)" : "დაბრუნებული პროდუქტი (ნივთები)"}
                  </span>
                </span>
                {returnItemsList.length > 0 && (
                  <span className="text-xs text-zinc-400 font-mono">
                    {returnItemsList.length} ერთეული
                  </span>
                )}
              </div>

              {returnItemsList.length > 0 ? (
                <div className="space-y-3">
                  {returnItemsList.map((retItem, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white rounded-2xl border border-zinc-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* High-visibility Product Image Thumbnail */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-50 border border-zinc-200/80 relative overflow-hidden shrink-0 flex items-center justify-center p-1.5 shadow-2xs">
                          <img
                            src={retItem.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"}
                            alt={retItem.title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80";
                            }}
                          />
                        </div>

                        <div className="space-y-1.5 text-xs min-w-0">
                          <h4 className="text-sm text-zinc-900 leading-snug">
                            {retItem.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-mono">
                            {retItem.sku && (
                              <span className="bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200 text-zinc-700">
                                SKU: {retItem.sku}
                              </span>
                            )}
                            <span className="text-[#FF5238]">
                              ფასი: {Number(retItem.price).toFixed(2)} ₾
                            </span>
                            <span className="text-zinc-800 bg-zinc-200/70 px-2 py-0.5 rounded-md">
                              რაოდენობა: {retItem.quantity} ცალი
                            </span>
                          </div>
                          {retItem.selectedVariants && (
                            <span className="text-[11px] text-zinc-500 block">
                              საწყისი ვარიანტი: {typeof retItem.selectedVariants === "string" ? retItem.selectedVariants : JSON.stringify(retItem.selectedVariants)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Total Sum for this returned item */}
                      <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-100">
                        <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">
                          {primaryReturn.type === "EXCHANGE" ? "გადასაცვლელი ჯამი" : "დასაბრუნებელი თანხა"}
                        </span>
                        <span className="text-base font-mono text-[#FF5238]">
                          {(Number(retItem.price) * retItem.quantity).toFixed(2)} ₾
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback if created before item picker */
                <div className="p-3 bg-white rounded-xl border border-zinc-200 text-xs text-zinc-600 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-zinc-400" />
                  <span>მოთხოვნა ვრცელდება მთლიან შეკვეთაზე (#{orderNumber})</span>
                </div>
              )}

              {/* IF EXCHANGE: Distinct, High-contrast Card for Replacement */}
              {primaryReturn.type === "EXCHANGE" && primaryReturn.exchangeTo ? (
                <div className="p-4 bg-orange-50/80 border border-orange-200/90 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-orange-900">
                    <ArrowRight className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>რაში უნდა გადაიცვალოს (საწყობისა & კურიერის ინსტრუქცია):</span>
                  </div>
                  <p className="text-sm text-orange-950 font-mono bg-white px-3.5 py-2.5 rounded-xl border border-orange-200 shadow-2xs">
                    {primaryReturn.exchangeTo}
                  </p>
                </div>
              ) : primaryReturn.type === "RETURN" && returnItemsList.length > 0 ? (
                <div className="p-3.5 bg-indigo-50/80 border border-indigo-200/90 rounded-2xl flex items-center justify-between text-xs text-indigo-950">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>კლიენტისთვის დასაბრუნებელი თანხა:</span>
                  </div>
                  <span className="text-base font-mono text-indigo-900">
                    {returnItemsList.reduce((acc, curr) => acc + (Number(curr.price) * curr.quantity), 0).toFixed(2)} ₾
                  </span>
                </div>
              ) : null}
            </div>

            {/* Reason block */}
            <div className="text-xs space-y-1 pt-2 border-t border-zinc-200/60">
              <span className="text-[11px] text-zinc-400 block">
                დაფიქსირებული მიზეზი:
              </span>
              <p className="text-zinc-800 bg-white p-3 rounded-xl border border-zinc-200/70">
                {primaryReturn.reason}
              </p>
            </div>

            {/* Initial Notes if any */}
            {primaryReturn.internalNotes && (
              <div className="text-xs space-y-1">
                <span className="text-[11px] text-zinc-400 block">
                  საწყისი შიდა შენიშვნა ოპერატორისგან:
                </span>
                <p className="text-zinc-700 bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
                  {primaryReturn.internalNotes}
                </p>
              </div>
            )}

            {/* Add New Comment / Note Input Form */}
            {canManage && (
              <form
                onSubmit={handleAddComment}
                className="pt-2 border-t border-zinc-200/60 flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="დაამატე ახალი შიდა ჩანაწერი / კომენტარი ლოგში..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5238] placeholder:text-zinc-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAddingComment || !newCommentText.trim()}
                  className="h-9 px-3.5 bg-zinc-900 hover:bg-[#FF5238] text-white rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                >
                  {isAddingComment ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>ჩაწერა</span>
                </button>
              </form>
            )}
          </div>

          {/* Timeline / History Block */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#FF5238]" />
              <span>მოძრაობის Timeline & ისტორიის ლოგი</span>
            </h4>

            {primaryReturn.logs && primaryReturn.logs.length > 0 ? (
              <div className="relative pl-5 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-200">
                {primaryReturn.logs.map((log) => {
                  const sb = log.status ? getStatusBadge(log.status) : null;
                  const Icon = sb ? sb.icon : MessageSquare;

                  return (
                    <div key={log.id} className="relative group">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-5 top-1 w-4 h-4 rounded-full border flex items-center justify-center bg-white ${
                          sb ? sb.border : "border-zinc-300"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            sb ? sb.text.replace("text-", "bg-") : "bg-zinc-400"
                          }`}
                        />
                      </div>

                      {/* Log Card */}
                      <div className="p-3 bg-zinc-50/50 rounded-2xl border border-zinc-200/70 space-y-1 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            {sb && (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${sb.bg} ${sb.text} ${sb.border}`}
                              >
                                <Icon className="w-2.5 h-2.5" />
                                <span>{sb.label}</span>
                              </span>
                            )}
                            <span className="text-zinc-800 text-[11px]">
                              {log.authorName || "ოპერატორი"}
                            </span>
                          </div>

                          <span className="text-[10px] text-zinc-400 font-mono">
                            {formatDate(log.createdAt)}
                          </span>
                        </div>

                        {log.comment && (
                          <p className="text-zinc-700 text-xs mt-1 leading-relaxed pl-1">
                            {log.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 pl-2">
                ისტორიის ჩანაწერები ჯერ არ არის.
              </p>
            )}
          </div>

          {/* Past / Archived Returns if any */}
          {pastReturns.length > 0 && pastReturns[0].id !== primaryReturn.id && (
            <div className="pt-4 border-t border-zinc-100 space-y-2">
              <span className="text-[11px] text-zinc-400 block uppercase tracking-wider">
                წინა მოთხოვნების არქივი ({pastReturns.length})
              </span>
              <div className="space-y-2">
                {pastReturns.map((pr) => {
                  const sb = getStatusBadge(pr.status);
                  const tb = getTypeBadge(pr.type);
                  return (
                    <div
                      key={pr.id}
                      className="p-2.5 bg-zinc-50/40 rounded-xl border border-zinc-200/50 flex items-center justify-between text-xs text-zinc-600"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${tb.bg} ${tb.text} ${tb.border}`}>
                          {tb.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${sb.bg} ${sb.text} ${sb.border}`}>
                          {sb.label}
                        </span>
                        <span className="truncate max-w-[200px] text-zinc-500">
                          {pr.reason}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {formatDate(pr.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        !isFormOpen && (
          <div className="py-8 px-4 text-center space-y-3 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-700">
                ამ შეკვეთაზე დაბრუნების ან გადაცვლის მოთხოვნა არ არის დაფიქსირებული
              </p>
              <p className="text-[11px] text-zinc-400">
                მომხმარებლის მოთხოვნის შემთხვევაში, ოპერატორს შეუძლია დაიწყოს დაბრუნების ან გადაცვლის პროცესი
              </p>
            </div>
            {canManage && (
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-[#FF5238] text-white rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>მოთხოვნის ინიცირება</span>
              </button>
            )}
          </div>
        )
      )}
    </div>
  );
}
