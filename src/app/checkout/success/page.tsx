"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Copy,
  FileText,
  Headphones,
  Home,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import Link from "next/link";
import OrderInvoiceModal from "@/components/OrderInvoiceModal";
import { useStore, type CartItem, type OrderRecord } from "@/store/useStore";

type SuccessOrder = OrderRecord & {
  rawId?: string;
  paymentStatus?: string;
  customerName?: string;
  contactPhone?: string;
};

function mapStatus(status?: string) {
  if (status === "DELIVERED") return "ჩაბარებულია";
  if (status === "SHIPPED") return "გზაშია";
  if (status === "CANCELLED") return "გაუქმებულია";
  return "მუშავდება";
}

function mapItems(items: unknown): CartItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((raw, index) => {
    const item = raw as Record<string, unknown>;
    const variants =
      item.selectedVariants && typeof item.selectedVariants === "object"
        ? (item.selectedVariants as Record<string, unknown>)
        : {};
    return {
      id: String(item.id || item.productId || index),
      title: String(item.title || "პროდუქტი"),
      price: Number(item.originalPrice || item.price || 0),
      discountPrice: Number(item.price || item.discountPrice || 0) || undefined,
      image: String(item.image || ""),
      quantity: Number(item.quantity || 1),
      color: typeof variants.color === "string" ? variants.color : undefined,
      storage: typeof variants.storage === "string" ? variants.storage : undefined,
    };
  });
}

function paymentLabel(status?: string) {
  if (status === "PAID") return { text: "გადახდილია", className: "text-emerald-700" };
  if (status === "FAILED") return { text: "ვერ გადაიხადა", className: "text-red-600" };
  return { text: "მოლოდინში", className: "text-amber-700" };
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const { orders, addToast, clearCart } = useStore();
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [dbOrder, setDbOrder] = useState<SuccessOrder | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${encodeURIComponent(orderId)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const o = res.data;
          setDbOrder({
            id: o.orderNumber || o.id,
            rawId: o.id,
            date: new Date(o.createdAt).toLocaleDateString("ka-GE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            status: mapStatus(o.status) as SuccessOrder["status"],
            items: mapItems(o.items),
            totalAmount: Number(o.totalAmount || 0),
            paymentMethod: o.paymentMethod || "კურიერთან ანგარიშსწორება",
            paymentStatus: o.paymentStatus || "PENDING",
            address: o.shippingAddress || "",
            customerName: o.customerName || "",
            contactPhone: o.contactPhone || "",
          });
          if (o.paymentStatus === "PAID") clearCart();
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  const storeOrder = orders.find((o) => o.id === orderId);
  const activeOrder: SuccessOrder =
    dbOrder ||
    (storeOrder ? { ...storeOrder, paymentStatus: undefined } : null) || {
      id: orderId || "—",
      date: new Date().toLocaleDateString("ka-GE", { day: "numeric", month: "long", year: "numeric" }),
      status: "მუშავდება",
      items: [],
      totalAmount: 0,
      paymentMethod: "",
      address: "",
    };

  const isBankTransfer =
    activeOrder.paymentMethod?.includes("გადარიცხვა") ||
    activeOrder.paymentMethod?.toLowerCase().includes("transfer");
  const pay = paymentLabel(activeOrder.paymentStatus);

  const copyOrderNumber = () => {
    if (!activeOrder.id) return;
    navigator.clipboard.writeText(String(activeOrder.id));
    setCopied(true);
    addToast({ title: "დაკოპირებულია", message: String(activeOrder.id), type: "info", duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({ title: "დაკოპირებულია", message: text, type: "info", duration: 2000 });
  };

  return (
    <>
      <div className="bg-[#F4F5F7] min-h-screen py-6 md:py-12 pb-16">
        <div className="mx-auto w-full max-w-[720px] px-4 space-y-3 md:space-y-4">

          <div className="bg-white rounded-[24px] px-5 py-8 md:px-10 md:py-10 text-center">
            <div className="relative w-[84px] h-[84px] mx-auto">
              <span className="absolute inset-0 rounded-full bg-emerald-100/80" />
              <span className="absolute inset-[10px] rounded-full bg-emerald-50" />
              <span className="absolute inset-[18px] rounded-full bg-[#22C55E] text-white flex items-center justify-center">
                <Check className="w-7 h-7" strokeWidth={2.75} />
              </span>
            </div>
            <h1 className="mt-5 text-[22px] md:text-[28px] text-gray-900 tracking-tight leading-tight">
              შეკვეთა წარმატებით განთავსდა
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              დადასტურებას გამოგიგზავნით SMS-ით. კურიერი დაგიკავშირდება მიწოდებამდე.
            </p>
            <button
              type="button"
              onClick={copyOrderNumber}
              className="mt-5 inline-flex items-center gap-2.5 h-12 px-4 rounded-2xl bg-[#F4F5F7] text-sm text-gray-800 cursor-pointer hover:bg-gray-200"
            >
              <span className="text-gray-400 text-xs">შეკვეთის ნომერი</span>
              <span className="font-mono">{activeOrder.id}</span>
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
          </div>

          <div className="bg-white rounded-[24px] px-4 py-5 md:px-6">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { icon: Package, label: "ვამუშავებთ", active: true },
                { icon: Truck, label: "გამოვგზავნით", active: activeOrder.status === "გზაშია" || activeOrder.status === "ჩაბარებულია" },
                { icon: Home, label: "ჩაგაბარებთ", active: activeOrder.status === "ჩაბარებულია" },
              ].map((step) => (
                <div key={step.label} className="flex flex-col items-center gap-2 py-1">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${step.active ? "bg-[#FFF5F2] text-[#FF5238]" : "bg-[#F4F5F7] text-gray-400"}`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[11px] md:text-xs ${step.active ? "text-gray-900" : "text-gray-400"}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[24px] px-4 py-2 md:px-6">
            <p className="pt-4 pb-1 text-sm text-gray-900">შეკვეთილი ნივთები</p>
            {loading ? (
              <div className="py-4 space-y-3">
                <div className="h-[72px] rounded-2xl bg-[#F4F5F7] animate-pulse" />
                <div className="h-[72px] rounded-2xl bg-[#F4F5F7] animate-pulse" />
              </div>
            ) : activeOrder.items.length === 0 ? (
              <p className="py-6 text-sm text-gray-400">ნივთები იტვირთება...</p>
            ) : (
              <div>
                {activeOrder.items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3.5 py-4 ${index !== activeOrder.items.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <div className="w-[72px] h-[72px] rounded-2xl bg-[#F4F5F7] border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-contain p-1.5" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900 leading-snug line-clamp-2">{item.title}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {[item.color, item.storage, `${item.quantity} ცალი`].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <p className="text-sm text-[#FF5238] font-mono shrink-0">
                      {((item.discountPrice || item.price) * item.quantity).toFixed(2)} ₾
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-gray-100 py-4 space-y-2.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>მიწოდება</span>
                <span className="text-[#FF5238]">უფასო</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-900">ჯამი</span>
                <span className="text-xl text-[#FF5238] font-mono">{Number(activeOrder.totalAmount || 0).toFixed(2)} ₾</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] px-5 py-2 md:px-6">
            {[
              { icon: MapPin, label: "მიწოდება", value: [activeOrder.customerName, activeOrder.address].filter(Boolean).join(" · ") || "მისამართი მითითებულია შეკვეთაში", extra: activeOrder.contactPhone },
              { icon: Package, label: "გადახდა", value: activeOrder.paymentMethod || "გადახდის მეთოდი", extra: pay.text, extraClass: pay.className },
            ].map((row, i, arr) => (
              <div key={row.label} className={`flex gap-3 py-4 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}>
                <div className="w-10 h-10 rounded-2xl bg-[#F4F5F7] text-[#FF5238] flex items-center justify-center shrink-0">
                  <row.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400">{row.label}</p>
                  <p className="mt-0.5 text-sm text-gray-900 leading-snug">{row.value}</p>
                  {row.extra && <p className={`mt-0.5 text-xs ${row.extraClass || "text-gray-400"}`}>{row.extra}</p>}
                </div>
              </div>
            ))}
          </div>

          {isBankTransfer && (
            <div className="bg-white rounded-[24px] px-5 py-5 md:px-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-900">გადარიცხვის რეკვიზიტები</p>
                <span className="font-mono text-sm text-[#FF5238]">{Number(activeOrder.totalAmount || 0).toFixed(2)} ₾</span>
              </div>
              {[
                { label: "მიმღები", value: "შპს სპილო (Spilo LLC)" },
                { label: "TBC Bank", value: "GE89TB7749102938102938" },
                { label: "Bank of Georgia", value: "GE12BG0000000889201928" },
                { label: "დანიშნულება", value: `#${activeOrder.id}` },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 bg-[#F4F5F7] rounded-2xl px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400">{row.label}</p>
                    <p className="text-xs text-gray-900 font-mono truncate">{row.value}</p>
                  </div>
                  <button type="button" onClick={() => copyToClipboard(row.value)} className="p-1.5 text-gray-400 hover:text-[#FF5238] cursor-pointer">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2.5 pt-1">
            <Link
              href="/"
              className="flex h-14 items-center justify-center rounded-2xl bg-[#FF5238] hover:bg-[#EA3A20] text-white text-sm"
            >
              განაგრძე შოპინგი
            </Link>
            <Link
              href="/profile?tab=orders"
              className="flex h-14 items-center justify-center rounded-2xl bg-white text-gray-900 text-sm hover:bg-gray-50"
            >
              ჩემი შეკვეთები
            </Link>
            <button
              type="button"
              onClick={() => setIsInvoiceOpen(true)}
              className="w-full h-11 text-sm text-gray-500 hover:text-[#FF5238] cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              ინვოისის ნახვა
            </button>
          </div>

          <a
            href="tel:+995322000000"
            className="flex items-center justify-center gap-2 pt-2 pb-4 text-xs text-gray-500 hover:text-gray-800"
          >
            <Headphones className="w-4 h-4" />
            კითხვა გაქვს? +995 32 2 00 00 00
          </a>
        </div>
      </div>

      <OrderInvoiceModal
        order={activeOrder}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] bg-[#F4F5F7]" />}>
      <SuccessContent />
    </Suspense>
  );
}
