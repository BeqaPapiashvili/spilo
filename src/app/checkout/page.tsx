"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { 
  Truck, 
  CreditCard, 
  Building2, 
  Banknote, 
  Check, 
  MapPin, 
  Phone, 
  User, 
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const { cart, clearCart, addOrder, user } = useStore();

  // Delivery info state
  const [city, setCity] = useState("თბილისი");
  const [address, setAddress] = useState("");
  const [apt, setApt] = useState("");
  const [fullName, setFullName] = useState(user?.name || "");
  const [contactPhone, setContactPhone] = useState(user?.phone || "");

  // Payment method: "card" | "installment" | "cash"
  const [paymentMethod, setPaymentMethod] = useState<"card" | "installment" | "cash">("card");
  const [selectedBank, setSelectedBank] = useState<"bog" | "tbc" | "credo">("tbc");
  const [installmentMonths, setInstallmentMonths] = useState(12);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl text-gray-900">თქვენი კალათა ცარიელია</h1>
        <p className="text-xs sm:text-sm text-gray-500">შეკვეთის გასაფორმებლად გთხოვთ ჯერ დაამატოთ ნივთები კალათაში</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-[#111111] text-white px-6 py-3 rounded-2xl text-xs sm:text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>მთავარ გვერდზე დაბრუნება</span>
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "გთხოვთ მიუთითოთ სახელი და გვარი";
    if (!contactPhone.trim()) newErrors.contactPhone = "გთხოვთ მიუთითოთ ტელეფონის ნომერი";
    if (!address.trim()) newErrors.address = "გთხოვთ მიუთითოთ მისამართი";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    let paymentMethodText = "საბანკო ბარათი (Visa/Mastercard)";
    if (paymentMethod === "installment") {
      const bankName = selectedBank === "bog" ? "საქართველოს ბანკი" : selectedBank === "tbc" ? "TBC ბანკი" : "კრედო ბანკი";
      paymentMethodText = `0% ონლაინ განვადება (${bankName} - ${installmentMonths} თვე)`;
    } else if (paymentMethod === "cash") {
      paymentMethodText = "ნაღდი ანგარიშსწორება მიწოდებისას";
    }

    const orderId = addOrder({
      items: [...cart],
      totalAmount: cartSubtotal,
      paymentMethod: paymentMethodText,
      address: `${city}, ${address}${apt ? `, ბინა/სართული ${apt}` : ""}`,
    });

    clearCart();
    router.push(`/checkout/success?orderId=${orderId}`);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight">
              შეკვეთის გაფორმება
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              შეავსეთ მიწოდების მისამართი და აირჩიეთ გადახდის მეთოდი
            </p>
          </div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600">
            <ArrowLeft className="w-4 h-4" />
            <span>უკან დაბრუნება</span>
          </Link>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Controls (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Delivery Address Card */}
            <div className="bg-white rounded-[28px] p-6 md:p-8 shadow-xs border border-gray-100 space-y-5">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base text-gray-900">1. მიწოდების მისამართი</h3>
                  <p className="text-xs text-gray-500">უფასო მიწოდება მთელ საქართველოში</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-600 block">სახელი და გვარი *</label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 absolute left-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                      }}
                      placeholder="გიორგი ბერიძე"
                      className="w-full h-12 pl-10 pr-4 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  {errors.fullName && <p className="text-xs text-red-500 pt-0.5">{errors.fullName}</p>}
                </div>

                {/* Contact Phone */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-600 block">ტელეფონის ნომერი *</label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 absolute left-3.5 text-gray-400" />
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => {
                        setContactPhone(e.target.value);
                        if (errors.contactPhone) setErrors((prev) => ({ ...prev, contactPhone: "" }));
                      }}
                      placeholder="+995 599 00 00 00"
                      className="w-full h-12 pl-10 pr-4 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  {errors.contactPhone && <p className="text-xs text-red-500 pt-0.5">{errors.contactPhone}</p>}
                </div>

                {/* City Selection */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-600 block">ქალაქი / რეგიონი</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-12 px-4 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="თბილისი">თბილისი</option>
                    <option value="ბათუმი">ბათუმი</option>
                    <option value="ქუთაისი">ქუთაისი</option>
                    <option value="რუსთავი">რუსთავი</option>
                    <option value="ფოთი">ფოთი</option>
                    <option value="სხვა რეგიონი">სხვა რეგიონი</option>
                  </select>
                </div>

                {/* Street Address */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-600 block">ქუჩა და N *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors((prev) => ({ ...prev, address: "" }));
                    }}
                    placeholder="მაგ: ჭავჭავაძის გამზირი N34"
                    className="w-full h-12 px-4 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {errors.address && <p className="text-xs text-red-500 pt-0.5">{errors.address}</p>}
                </div>
              </div>

              {/* Apartment / Floor optional */}
              <div className="space-y-1">
                <label className="text-xs text-gray-600 block">სართული / ბინა (არასავალდებულო)</label>
                <input
                  type="text"
                  value={apt}
                  onChange={(e) => setApt(e.target.value)}
                  placeholder="მაგ: სართული 4, ბინა 12"
                  className="w-full h-12 px-4 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* 2. Payment Method Card */}
            <div className="bg-white rounded-[28px] p-6 md:p-8 shadow-xs border border-gray-100 space-y-5">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base text-gray-900">2. გადახდის მეთოდი</h3>
                  <p className="text-xs text-gray-500">აირჩიეთ თქვენთვის მოსახერხებელი გადახდა</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Method 1: Card */}
                <div
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    paymentMethod === "card"
                      ? "border-blue-600 bg-blue-50/40"
                      : "border-gray-100 bg-[#F8FAFC] hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <CreditCard className={`w-5 h-5 ${paymentMethod === "card" ? "text-blue-600" : "text-gray-500"}`} />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "card" ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300"
                    }`}>
                      {paymentMethod === "card" && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm text-gray-900">საბანკო ბარათი</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Visa / Mastercard</p>
                  </div>
                </div>

                {/* Method 2: 0% Installment */}
                <div
                  onClick={() => setPaymentMethod("installment")}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    paymentMethod === "installment"
                      ? "border-blue-600 bg-blue-50/40"
                      : "border-gray-100 bg-[#F8FAFC] hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Building2 className={`w-5 h-5 ${paymentMethod === "installment" ? "text-blue-600" : "text-gray-500"}`} />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "installment" ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300"
                    }`}>
                      {paymentMethod === "installment" && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm text-gray-900">0% ონლაინ განვადება</h4>
                    <p className="text-[11px] text-blue-600 mt-0.5">TBC, BOG, Credo</p>
                  </div>
                </div>

                {/* Method 3: Cash */}
                <div
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    paymentMethod === "cash"
                      ? "border-blue-600 bg-blue-50/40"
                      : "border-gray-100 bg-[#F8FAFC] hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Banknote className={`w-5 h-5 ${paymentMethod === "cash" ? "text-blue-600" : "text-gray-500"}`} />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "cash" ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300"
                    }`}>
                      {paymentMethod === "cash" && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm text-gray-900">ნაღდი ანგარიშსწორება</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">კურიერთან ჩაბარებისას</p>
                  </div>
                </div>
              </div>

              {/* Installment Bank Options (when Installment selected) */}
              {paymentMethod === "installment" && (
                <div className="pt-4 border-t border-gray-100 space-y-4 animate-in fade-in">
                  <span className="text-xs text-gray-600 block">აირჩიეთ ბანკი 0%-იანი განვადებისთვის:</span>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "tbc", name: "TBC ბანკი", color: "text-sky-600 bg-sky-50" },
                      { id: "bog", name: "საქართველოს ბანკი", color: "text-amber-600 bg-amber-50" },
                      { id: "credo", name: "კრედო ბანკი", color: "text-emerald-600 bg-emerald-50" },
                    ].map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.id as any)}
                        className={`p-3 rounded-xl border text-xs text-center cursor-pointer transition-all ${
                          selectedBank === bank.id
                            ? "border-blue-600 bg-blue-50 text-gray-900"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <span className={bank.color}>{bank.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>განვადების ვადა:</span>
                      <span className="text-gray-900 font-mono">{installmentMonths} თვე</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="24"
                      step="3"
                      value={installmentMonths}
                      onChange={(e) => setInstallmentMonths(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-gray-500 pt-1">
                      <span>ყოველთვიური გადასახადი:</span>
                      <span className="text-blue-600 font-mono">{(cartSubtotal / installmentMonths).toFixed(2)} ₾ / თვეში</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Right Column: Order Summary Card (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-[28px] p-6 shadow-xs border border-gray-100 space-y-6 sticky top-20">
            <h3 className="text-lg text-gray-900 border-b border-gray-100 pb-3">
              შეკვეთის რეზიუმე
            </h3>

            {/* Cart Product List */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-xs">
                  <img src={item.image} alt={item.title} className="w-12 h-12 object-contain bg-[#F1F3F6] p-1 rounded-xl shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 truncate">{item.title}</p>
                    <p className="text-gray-400 text-[11px]">{item.quantity}x • {((item.discountPrice || item.price) * item.quantity).toFixed(2)} ₾</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 border-t border-gray-100 pt-4 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>პროდუქტების ღირებულება:</span>
                <span className="text-gray-900">{cartSubtotal.toFixed(2)} ₾</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>მიწოდების სერვისი:</span>
                <span className="text-emerald-600">უფასო</span>
              </div>
              <div className="flex justify-between text-sm text-gray-900 pt-2 border-t border-gray-100">
                <span>სულ გადასახდელი:</span>
                <span className="text-xl text-blue-600">{cartSubtotal.toFixed(2)} ₾</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm md:text-base cursor-pointer transition-colors shadow-xs"
            >
              შეკვეთის გაფორმება
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>დაცული და უსაფრთხო გადახდა</span>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
