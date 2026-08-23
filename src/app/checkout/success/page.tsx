"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, Home, ShoppingBag, FileText, Copy, Check } from "lucide-react";
import Link from "next/link";
import OrderInvoiceModal from "@/components/OrderInvoiceModal";
import { useStore } from "@/store/useStore";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "SP-92841";
  const { orders, addToast } = useStore();
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [dbOrder, setDbOrder] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${encodeURIComponent(orderId)}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data) {
            const o = res.data;
            const mapped = {
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
              items: Array.isArray(o.items) ? o.items : [],
              totalAmount: o.totalAmount,
              paymentMethod: o.paymentMethod || "კურიერთან ანგარიშსწორება",
              address: o.shippingAddress || "",
            };
            setDbOrder(mapped);
          }
        })
        .catch(() => {});
    }
  }, [orderId]);

  const storeOrder = orders.find((o) => o.id === orderId);
  const activeOrder = dbOrder || storeOrder || {
    id: orderId,
    date: new Date().toLocaleDateString("ka-GE", { day: "numeric", month: "long", year: "numeric" }),
    status: "მუშავდება" as const,
    items: [],
    totalAmount: 0,
    paymentMethod: "საბანკო გადარიცხვა",
    address: "თბილისი, საქართველო",
  };

  const isBankTransfer =
    activeOrder.paymentMethod?.includes("გადარიცხვა") ||
    activeOrder.paymentMethod?.toLowerCase().includes("transfer");

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    addToast({
      title: "დაკოპირებულია",
      message: `${text}`,
      type: "info",
      duration: 2000,
    });
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <>
      <div className="bg-white rounded-[32px] p-6 md:p-10 max-w-xl w-full text-center space-y-6 shadow-xs border border-gray-100 animate-in zoom-in-95">
        
        {/* Success Icon */}
        <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            შეკვეთა მიღებულია!
          </span>
          <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight pt-1">
            მადლობა შეკვეთისთვის!
          </h1>
          <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
            თქვენი შეკვეთა ნომრით <span className="font-mono text-gray-900">{orderId}</span> წარმატებით დარეგისტრირდა.
          </p>
        </div>

        {/* Status Box */}
        <div className="bg-[#F1F3F6] rounded-2xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-gray-700">
            <Package className="w-4 h-4 text-blue-600" />
            <span>შეკვეთის სტატუსი:</span>
          </div>
          <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg">მუშავდება</span>
        </div>

        {/* Bank Transfer Details Block if Bank Transfer was selected */}
        {isBankTransfer && (
          <div className="bg-blue-50/50 border border-blue-200/80 rounded-2xl p-5 text-left space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs text-blue-900">საბანკო რეკვიზიტები გადარიცხვისთვის</h2>
              <span className="text-[11px] text-blue-600 font-mono">
                თანხა: {Number(activeOrder.totalAmount || 0).toLocaleString()} ₾
              </span>
            </div>

            <div className="space-y-2 text-xs text-gray-800">
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-blue-100">
                <div>
                  <span className="text-[10px] text-gray-400 block">მიმღები</span>
                  <span>შპს სპილო (Spilo LLC)</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-blue-100">
                <div>
                  <span className="text-[10px] text-gray-400 block">TBC Bank IBAN</span>
                  <span className="font-mono">GE89TB7749102938102938</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard("GE89TB7749102938102938", "tbc")}
                  className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  title="დაკოპირება"
                >
                  {copiedField === "tbc" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-blue-100">
                <div>
                  <span className="text-[10px] text-gray-400 block">Bank of Georgia IBAN</span>
                  <span className="font-mono">GE12BG0000000889201928</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard("GE12BG0000000889201928", "bog")}
                  className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  title="დაკოპირება"
                >
                  {copiedField === "bog" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-blue-100">
                <div>
                  <span className="text-[10px] text-gray-400 block">დანიშნულება (აუცილებელი)</span>
                  <span className="font-mono text-blue-600">#{orderId}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`#${orderId}`, "ref")}
                  className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  title="დაკოპირება"
                >
                  {copiedField === "ref" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            
            <p className="text-[11px] text-blue-700/80 leading-relaxed">
              თანხის ასახვის შემდეგ შეკვეთა გადაეცემა საკურიერო სამსახურს.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          <button
            onClick={() => setIsInvoiceOpen(true)}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>🧾 PDF ინვოისის ჩამოტვირთვა / ბეჭდვა</span>
          </button>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/profile"
              className="flex-1 py-3 bg-[#111111] hover:bg-black text-white rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ჩემი შეკვეთები</span>
            </Link>
            <Link
              href="/"
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>მთავარი გვერდი</span>
            </Link>
          </div>
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
    <div className="bg-[#F8FAFC] min-h-[80vh] flex items-center justify-center py-16 px-4">
      <Suspense fallback={<div className="text-gray-500 text-sm">იტვირთება...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
