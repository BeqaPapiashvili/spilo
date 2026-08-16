"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { 
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Check,
  Loader2,
  Search,
  Tag
} from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AddAddressModal from "@/components/AddAddressModal";

// Complete List of All Cities and Municipalities in Georgia
const GEORGIAN_CITIES = [
  "თბილისი",
  "ბათუმი",
  "ქუთაისი",
  "რუსთავი",
  "ფოთი",
  "ზუგდიდი",
  "გორი",
  "თელავი",
  "ხაშური",
  "სამტრედია",
  "სენაკი",
  "ზესტაფონი",
  "ახალციხე",
  "ქობულეთი",
  "ოზურგეთი",
  "კასპი",
  "ჭიათურა",
  "წყალტუბო",
  "საგარეჯო",
  "გარდაბანი",
  "ბორჯომი",
  "ტყიბული",
  "ხონი",
  "ბოლნისი",
  "ახალქალაქი",
  "გურჯაანი",
  "ყვარელი",
  "ახმეტა",
  "საჩხერე",
  "ლაგოდეხი",
  "ნინოწმინდა",
  "მცხეთა",
  "მარნეული",
  "ხობი",
  "თეთრიწყარო",
  "ვალე",
  "წნორი",
  "ჯვარი",
  "მარტვილი",
  "დმანისი",
  "ონი",
  "აბაშა",
  "ამბროლაური",
  "წალკა",
  "სიღნაღი",
  "ცაგერი",
  "სტეფანწმინდა",
  "მესტია",
  "ბაკურიანი",
  "გუდაური",
  "შუახევი",
  "ხულო",
  "ქედა",
  "ჩოხატაური",
  "ლენტეხი",
  "ყაზბეგი",
  "დედოფლისწყარო",
  "თიანეთი",
  "ქარელი",
  "ასპინძა",
  "ადიგენი",
  "ხარაგაული",
  "თერჯოლა",
  "ვანი",
  "ბაღდათი",
  "დუშეთი",
  "ურეკი",
  "ანაკლია",
  "ჩაქვი"
];

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const { cart, clearCart, addOrder, user, addToast } = useStore();

  // Step 1 or Step 2
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Order Details state
  const [personType, setPersonType] = useState<"physical" | "legal">("physical");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  
  // Custom City Dropdown & Search state
  const [city, setCity] = useState("თბილისი");
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");

  const [address, setAddress] = useState(user?.address || "23 Ilori St, T'bilisi 0153, Georgia");
  const [comment, setComment] = useState("");
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);

  // Recipient info states pre-filled from user profile
  const [recipientFirstName, setRecipientFirstName] = useState(
    user?.firstName || (user?.name ? user.name.split(" ")[0] : "")
  );
  const [recipientLastName, setRecipientLastName] = useState(
    user?.lastName || (user?.name ? user.name.split(" ").slice(1).join(" ") : "")
  );
  const [recipientIdNumber, setRecipientIdNumber] = useState(user?.idNumber || "");
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || "");

  // Step 2: Payment Details state
  const [paymentCategory, setPaymentCategory] = useState<
    "card" | "installment" | "cod" | "transfer" | "points" | "keepz" | "crypto"
  >("card");
  const [selectedInstallmentBank, setSelectedInstallmentBank] = useState<
    "bog" | "tbc" | "tbc_ganatsileba" | "credo"
  >("bog");
  const [expandedCardGateway, setExpandedCardGateway] = useState<"tbc" | "bog">("bog");
  const [selectedCardOption, setSelectedCardOption] = useState<"card" | "applepay">("card");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Promo Code State
  const [promoCode, setPromoCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    finalTotal: number;
  } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // Loading & Errors
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch real profile data from DB on mount
  useEffect(() => {
    if (!user) return;

    if (user.address && !address) setAddress(user.address);
    if (user.phone && !recipientPhone) setRecipientPhone(user.phone);
    if (user.firstName && !recipientFirstName) setRecipientFirstName(user.firstName);
    if (user.lastName && !recipientLastName) setRecipientLastName(user.lastName);
    if (user.idNumber && !recipientIdNumber) setRecipientIdNumber(user.idNumber);

    const fetchRealProfile = async () => {
      try {
        const query = user.email
          ? `email=${encodeURIComponent(user.email)}`
          : `phone=${encodeURIComponent(user.phone || "")}`;
        const res = await fetch(`/api/user/profile?${query}`);
        const data = await res.json();

        if (data.success && data.user) {
          const u = data.user;
          if (u.address) setAddress(u.address);
          if (u.phone) setRecipientPhone(u.phone);
          if (u.firstName) setRecipientFirstName(u.firstName);
          if (u.lastName) setRecipientLastName(u.lastName);
          if (u.idNumber) setRecipientIdNumber(u.idNumber);
        }
      } catch (err) {
        console.warn("Checkout fetch profile error:", err);
      }
    };

    fetchRealProfile();
  }, [user?.email, user?.phone]);

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0);
  const shippingCost = deliveryMethod === "pickup" ? 0 : 0; // Free delivery
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalAmount = Math.max(0, cartSubtotal + shippingCost - discountAmount);

  const handleApplyCoupon = async () => {
    if (!promoCode.trim()) {
      addToast({
        title: "შეცდომა",
        message: "გთხოვთ შეიყვანოთ პრომო კოდი",
        type: "error",
      });
      return;
    }

    setIsValidatingPromo(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.trim(),
          orderTotal: cartSubtotal,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.coupon) {
        setAppliedCoupon(data.coupon);
        addToast({
          title: "პრომო კოდი გააქტიურდა!",
          message: data.message || `ფასდაკლება -${data.coupon.discountAmount} ₾`,
          type: "success",
        });
      } else {
        setAppliedCoupon(null);
        addToast({
          title: "არასწორი პრომო კოდი",
          message: data.error || "პრომო კოდი ვერ მოიძებნა ან ვადაგასულია",
          type: "error",
        });
      }
    } catch (err) {
      addToast({
        title: "შეცდომა",
        message: "პრომო კოდის გადამოწმება ვერ მოხერხდა",
        type: "error",
      });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setPromoCode("");
    addToast({
      title: "ინფორმაცია",
      message: "პრომო კოდი მოხსნილია",
      type: "info",
    });
  };

  // Filter cities by search term
  const filteredCities = GEORGIAN_CITIES.filter((c) =>
    c.toLowerCase().includes(citySearchQuery.trim().toLowerCase())
  );

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl text-gray-900">თქვენი კალათა ცარიელია</h1>
        <p className="text-xs sm:text-sm text-gray-500">შეკვეთის გასაფორმებლად გთხოვთ ჯერ დაამატოთ ნივთები კალათაში</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-xs transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>მთავარ გვერდზე დაბრუნება</span>
        </Link>
      </div>
    );
  }

  // Handle Step 1 Next button
  const handleProceedToStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!recipientFirstName.trim()) newErrors.recipientFirstName = "მიუთითეთ მიმღების სახელი";
    if (!recipientLastName.trim()) newErrors.recipientLastName = "მიუთითეთ მიმღების გვარი";
    if (!recipientPhone.trim()) newErrors.recipientPhone = "მიუთითეთ მიმღების ტელეფონის ნომერი";
    if (!address.trim()) newErrors.address = "მიუთითეთ მისამართი";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Step 2 Final Submit button
  const handleFinalOrderSubmit = async () => {
    if (!agreedToTerms) {
      addToast({
        title: "შეცდომა",
        message: "გთხოვთ დაეთანხმოთ წესებსა და პირობებს",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    let paymentMethodLabel = "ონლაინ განვადება";
    if (paymentCategory === "installment") {
      const bankNames: Record<string, string> = {
        bog: "საქართველოს ბანკი (0% განვადება)",
        tbc: "TBC ბანკი (0% განვადება)",
        tbc_ganatsileba: "TBC განაწილება",
        credo: "კრედო ბანკი",
      };
      paymentMethodLabel = `განვადება: ${bankNames[selectedInstallmentBank] || "საქართველოს ბანკი"}`;
    } else if (paymentCategory === "card") {
      paymentMethodLabel = `ბარათით გადახდა (${expandedCardGateway.toUpperCase()} - ${selectedCardOption === "applepay" ? "Apple Pay" : "Visa/Mastercard"})`;
    } else if (paymentCategory === "points") {
      paymentMethodLabel = "ქულებით შეძენა";
    } else if (paymentCategory === "transfer") {
      paymentMethodLabel = "საბანკო გადარიცხვა";
    } else if (paymentCategory === "keepz") {
      paymentMethodLabel = "Keepz - ონლაინ ბანკით შეძენა";
    } else if (paymentCategory === "crypto") {
      paymentMethodLabel = "კრიპტოთი შეძენა";
    }

    const fullRecipientName = `${recipientFirstName} ${recipientLastName}`.trim();
    const fullShippingAddress = `${city}, ${address}${comment ? ` (${comment})` : ""}`;

    const orderPayload = {
      items: [...cart],
      customer: {
        name: fullRecipientName,
        phone: recipientPhone,
        idNumber: recipientIdNumber,
        personType,
      },
      totalAmount: Number(totalAmount.toFixed(2)),
      paymentMethod: paymentMethodLabel,
      address: fullShippingAddress,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
    };

    let finalOrderNumber = `SP-${Date.now().toString().slice(-6)}`;

    // Post to MySQL API Endpoint
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setIsSubmitting(false);
        addToast({
          title: "შეკვეთის გაფორმება ვერ მოხერხდა",
          message: resData.error || "მოხდა შეცდომა შეკვეთის გაფორმებისას",
          type: "error",
        });
        return;
      }

      finalOrderNumber = resData.order?.orderNumber || resData.order?.id || finalOrderNumber;
      
      const newOrderRecord = {
        id: finalOrderNumber,
        date: new Date().toLocaleDateString("ka-GE", { day: "numeric", month: "long", year: "numeric" }),
        status: "მუშავდება" as const,
        items: [...cart],
        totalAmount,
        paymentMethod: paymentMethodLabel,
        address: fullShippingAddress,
      };

      const existingOrders = useStore.getState().orders;
      useStore.getState().setOrders([newOrderRecord, ...existingOrders.filter((o) => o.id !== finalOrderNumber)]);

      addToast({
        title: "შეკვეთა მიღებულია!",
        message: `შეკვეთის N ${finalOrderNumber}`,
        type: "success",
      });

      clearCart();
      setIsSubmitting(false);
      router.push(`/checkout/success?orderId=${finalOrderNumber}`);
    } catch (err: any) {
      console.error("Failed to persist order to MySQL:", err);
      setIsSubmitting(false);
      addToast({
        title: "სერვერთან დაკავშირების შეცდომა",
        message: "გთხოვთ შეამოწმოთ კავშირი და სცადოთ ხელახლა",
        type: "error",
      });
    }
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl space-y-8">
        
        {/* Main Title Heading */}
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight">
            {step === 1 ? "შეკვეთის დეტალები" : "გადახდის დეტალები"}
          </h1>
        </div>

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Controls Area (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Back Nav & Person Type Row */}
            <div className="flex items-center justify-between text-xs md:text-sm">
              <button
                type="button"
                onClick={() => {
                  if (step === 2) setStep(1);
                  else router.push("/cart");
                }}
                className="inline-flex items-center gap-2 text-gray-700 hover:text-blue-600 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-500" />
                <span>უკან დაბრუნება</span>
              </button>

              {step === 1 && (
                <div className="relative">
                  <select
                    value={personType}
                    onChange={(e) => setPersonType(e.target.value as any)}
                    className="appearance-none bg-transparent pr-6 text-blue-600 font-sans text-xs md:text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="physical">ფიზიკური პირი</option>
                    <option value="legal">იურიდიული პირი</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-600 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>

            {/* STEP 1 CONTENT: Order Details */}
            {step === 1 && (
              <div className="space-y-6">
                
                {/* Delivery Method Selector */}
                <div className="space-y-3">
                  <h3 className="text-sm text-gray-900">მიწოდების მეთოდი</h3>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("delivery")}
                      className={`px-5 py-3 rounded-full text-xs md:text-sm transition-all cursor-pointer border ${
                        deliveryMethod === "delivery"
                          ? "border-blue-600 bg-blue-50/50 text-blue-600 ring-1 ring-blue-600"
                          : "border-transparent bg-[#F1F3F6] text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      ადგილზე მომიტანეთ
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("pickup")}
                      className={`px-5 py-3 rounded-full text-xs md:text-sm transition-all cursor-pointer border ${
                        deliveryMethod === "pickup"
                          ? "border-blue-600 bg-blue-50/50 text-blue-600 ring-1 ring-blue-600"
                          : "border-transparent bg-[#F1F3F6] text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      ჩემით წავიღებ
                    </button>
                  </div>
                </div>

                {/* Custom City Accordion & Floating Dropdown */}
                <div className="relative z-30 space-y-2">
                  {/* Closed / Opened Header Card */}
                  <div
                    onClick={() => setIsCityOpen(!isCityOpen)}
                    className="w-full h-14 px-5 bg-[#F1F3F6] hover:bg-gray-200/60 rounded-2xl flex items-center justify-between cursor-pointer text-xs md:text-sm text-gray-900 transition-colors"
                  >
                    <span>{city ? city : "აირჩიეთ ქალაქი"}</span>
                    {isCityOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-700" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-700" />
                    )}
                  </div>

                  {/* Expanded Floating City Panel */}
                  {isCityOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsCityOpen(false)} />
                      <div className="absolute top-full left-0 right-0 z-40 bg-white p-3 rounded-2xl shadow-xl border border-gray-100 space-y-2 mt-1.5 animate-in fade-in duration-150">
                        {/* Search Input Box */}
                        <div className="border border-blue-600 bg-white rounded-2xl h-12 px-4 flex items-center gap-2 shadow-2xs">
                          <Search className="w-4 h-4 text-blue-600 shrink-0" />
                          <input
                            type="text"
                            value={citySearchQuery}
                            onChange={(e) => setCitySearchQuery(e.target.value)}
                            placeholder="ძიება"
                            className="w-full h-full text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
                            autoFocus
                          />
                        </div>

                        {/* Scrollable City Items List */}
                        <div className="bg-[#F1F3F6] rounded-2xl max-h-60 overflow-y-auto divide-y divide-gray-200/60 shadow-xs">
                          {filteredCities.length === 0 ? (
                            <div className="p-4 text-xs text-gray-500 text-center">
                              ქალაქი არ მოიძებნა
                            </div>
                          ) : (
                            filteredCities.map((cityName) => (
                              <button
                                key={cityName}
                                type="button"
                                onClick={() => {
                                  setCity(cityName);
                                  setIsCityOpen(false);
                                  setCitySearchQuery("");
                                }}
                                className={`w-full h-13 px-5 flex items-center text-left text-xs md:text-sm transition-colors cursor-pointer ${
                                  city === cityName
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-900 hover:bg-gray-200/60"
                                }`}
                              >
                                <span>{cityName}</span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Saved Address Radio Selection Box */}
                <div className="space-y-2">
                  <div
                    onClick={() => {}}
                    className="border-2 border-blue-600 bg-blue-50/20 rounded-2xl p-5 flex items-center justify-between cursor-pointer shadow-2xs"
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs md:text-sm text-gray-900">{address}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAddAddressOpen(true);
                          }}
                          className="text-gray-400 hover:text-blue-600 p-0.5 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-500 block">
                        {comment ? comment : "კომენტარი"}
                      </span>
                    </div>

                    {/* Radio Selected Blue Circle */}
                    <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    </div>
                  </div>

                  {/* Add New Address Button */}
                  <button
                    type="button"
                    onClick={() => setIsAddAddressOpen(true)}
                    className="flex items-center gap-2 text-xs md:text-sm text-gray-900 pt-2 cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span>ახალი მისამართის დამატება</span>
                  </button>
                </div>

                {/* Recipient Information Form */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm text-gray-900">მიმღების ინფორმაცია</h3>

                  <div className="space-y-3">
                    {/* Recipient First Name */}
                    <div>
                      <input
                        type="text"
                        value={recipientFirstName}
                        onChange={(e) => {
                          setRecipientFirstName(e.target.value);
                          if (errors.recipientFirstName) setErrors((prev) => ({ ...prev, recipientFirstName: "" }));
                        }}
                        placeholder="მიმღების სახელი"
                        className="w-full h-14 px-5 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      {errors.recipientFirstName && <p className="text-xs text-red-500 pt-1 px-2">{errors.recipientFirstName}</p>}
                    </div>

                    {/* Recipient Last Name */}
                    <div>
                      <input
                        type="text"
                        value={recipientLastName}
                        onChange={(e) => {
                          setRecipientLastName(e.target.value);
                          if (errors.recipientLastName) setErrors((prev) => ({ ...prev, recipientLastName: "" }));
                        }}
                        placeholder="მიმღების გვარი"
                        className="w-full h-14 px-5 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      {errors.recipientLastName && <p className="text-xs text-red-500 pt-1 px-2">{errors.recipientLastName}</p>}
                    </div>

                    {/* Recipient ID Number */}
                    <div>
                      <input
                        type="text"
                        value={recipientIdNumber}
                        onChange={(e) => setRecipientIdNumber(e.target.value)}
                        placeholder="მიმღების პირადი ნომერი"
                        className="w-full h-14 px-5 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    {/* Recipient Phone Number */}
                    <div>
                      <input
                        type="tel"
                        value={recipientPhone}
                        onChange={(e) => {
                          setRecipientPhone(e.target.value);
                          if (errors.recipientPhone) setErrors((prev) => ({ ...prev, recipientPhone: "" }));
                        }}
                        placeholder="მიმღების ტელეფონის ნომერი"
                        className="w-full h-14 px-5 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      {errors.recipientPhone && <p className="text-xs text-red-500 pt-1 px-2">{errors.recipientPhone}</p>}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* STEP 2 CONTENT: Payment Details */}
            {step === 2 && (
              <div className="space-y-6">
                
                {/* Payment Methods Top Pills */}
                <div className="space-y-3">
                  <h3 className="text-sm text-gray-900">გადახდის მეთოდები</h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {[
                      { id: "card", label: "ბარათით გადახდა" },
                      { id: "installment", label: "0% განვადება" },
                      { id: "cod", label: "ადგილზე გადახდა (COD)" },
                      { id: "transfer", label: "საბანკო გადარიცხვა" },
                      { id: "points", label: "ქულებით შეძენა" },
                      { id: "keepz", label: "Keepz - ონლაინ ბანკი" },
                      { id: "crypto", label: "კრიპტოთი შეძენა" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPaymentCategory(item.id as any)}
                        className={`h-12 px-3 rounded-2xl text-xs transition-all cursor-pointer border text-center flex items-center justify-center ${
                          paymentCategory === item.id
                            ? "border-blue-600 bg-blue-50/60 text-blue-600 ring-1 ring-blue-600"
                            : "border-transparent bg-[#F1F3F6] text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-Panel: Cash on Delivery */}
                {paymentCategory === "cod" && (
                  <div className="p-6 bg-[#F1F3F6] rounded-2xl text-xs text-gray-700 space-y-2 border border-gray-200/60">
                    <p className="text-gray-900 text-sm">ადგილზე გადახდა კურიერთან (Cash on Delivery)</p>
                    <p>შეკვეთის საფასურს გადაიხდით ნივთის ჩაბარებისას კურიერთან ნაღდი ანგარიშსწორებით ან საბანკო ბარათით (POS ტერმინალით).</p>
                    <p className="text-emerald-700">✓ წინასწარი გადახდა არ მოითხოვება. შეკვეთა დაუყოვნებლივ გადაეცემა კურიერს.</p>
                  </div>
                )}

                {/* Sub-Panel: Bank Transfer */}
                {paymentCategory === "transfer" && (
                  <div className="p-6 bg-[#F1F3F6] rounded-2xl text-xs text-gray-700 space-y-2.5 border border-gray-200/60">
                    <p className="text-gray-900 text-sm">საბანკო გადარიცხვა (Manual Bank Transfer)</p>
                    <p>შეკვეთის დადასტურების შემდეგ მიიღებთ ინვოისს. გთხოვთ გადარიცხოთ თანხა ქვემოთ მითითებულ რეკვიზიტებზე:</p>
                    <div className="p-3 bg-white rounded-xl border border-gray-200/60 space-y-1 font-mono text-[11px] text-gray-800">
                      <p>მიმღები: შპს სპილო (Spilo LLC)</p>
                      <p>TBC Bank: GE89TB7749102938102938</p>
                      <p>Bank of Georgia: GE12BG0000000889201928</p>
                      <p className="text-blue-600">დანიშნულება: მიუთითეთ შეკვეთის ნომერი</p>
                    </div>
                  </div>
                )}

                {/* Sub-Panel: Installment Banks */}
                {paymentCategory === "installment" && (
                  <div className="space-y-3 pt-2">
                    {/* BOG Installment */}
                    <div
                      onClick={() => setSelectedInstallmentBank("bog")}
                      className={`h-16 px-5 bg-[#F1F3F6] rounded-2xl flex items-center justify-between cursor-pointer border transition-colors ${
                        selectedInstallmentBank === "bog" ? "border-blue-600 bg-white" : "border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                          🦁
                        </div>
                        <span className="text-xs md:text-sm text-gray-900">საქართველოს ბანკი</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedInstallmentBank === "bog" ? "border-blue-600" : "border-gray-300"
                      }`}>
                        {selectedInstallmentBank === "bog" && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                      </div>
                    </div>

                    {/* TBC Installment */}
                    <div
                      onClick={() => setSelectedInstallmentBank("tbc")}
                      className={`h-16 px-5 bg-[#F1F3F6] rounded-2xl flex items-center justify-between cursor-pointer border transition-colors ${
                        selectedInstallmentBank === "tbc" ? "border-blue-600 bg-white" : "border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-500 text-white text-xs flex items-center justify-center">
                          ▲
                        </div>
                        <span className="text-xs md:text-sm text-gray-900">თიბისი ბანკი</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedInstallmentBank === "tbc" ? "border-blue-600" : "border-gray-300"
                      }`}>
                        {selectedInstallmentBank === "tbc" && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                      </div>
                    </div>

                    {/* TBC Ganatsileba */}
                    <div
                      onClick={() => setSelectedInstallmentBank("tbc_ganatsileba")}
                      className={`h-16 px-5 bg-[#F1F3F6] rounded-2xl flex items-center justify-between cursor-pointer border transition-colors ${
                        selectedInstallmentBank === "tbc_ganatsileba" ? "border-blue-600 bg-white" : "border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-500 text-white text-xs flex items-center justify-center">
                          ▲
                        </div>
                        <span className="text-xs md:text-sm text-gray-900">თიბისი <span className="text-gray-500 pl-1">განაწილება</span></span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedInstallmentBank === "tbc_ganatsileba" ? "border-blue-600" : "border-gray-300"
                      }`}>
                        {selectedInstallmentBank === "tbc_ganatsileba" && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                      </div>
                    </div>

                    {/* Credo Bank */}
                    <div
                      onClick={() => setSelectedInstallmentBank("credo")}
                      className={`h-16 px-5 bg-[#F1F3F6] rounded-2xl flex items-center justify-between cursor-pointer border transition-colors ${
                        selectedInstallmentBank === "credo" ? "border-blue-600 bg-white" : "border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                          🔄
                        </div>
                        <span className="text-xs md:text-sm text-gray-900">კრედო ბანკი</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedInstallmentBank === "credo" ? "border-blue-600" : "border-gray-300"
                      }`}>
                        {selectedInstallmentBank === "credo" && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Panel: Card Gateways */}
                {paymentCategory === "card" && (
                  <div className="space-y-3 pt-2">
                    {/* TBC Gateway Accordion */}
                    <div className="bg-[#F1F3F6] rounded-2xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setExpandedCardGateway(expandedCardGateway === "tbc" ? "bog" : "tbc")}
                        className="w-full h-16 px-5 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-sky-500 text-white text-xs flex items-center justify-center">
                            ▲
                          </div>
                          <span className="text-xs md:text-sm text-gray-900">TBC</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
                          expandedCardGateway === "tbc" ? "rotate-180" : ""
                        }`} />
                      </button>

                      {expandedCardGateway === "tbc" && (
                        <div className="p-4 pt-0 space-y-3 bg-[#F1F3F6] border-t border-gray-200/60">
                          <div
                            onClick={() => setSelectedCardOption("card")}
                            className="flex items-center justify-between p-3 bg-white rounded-xl cursor-pointer"
                          >
                            <span className="text-xs md:text-sm text-gray-900">ბარათით გადახდა (Visa / Mastercard)</span>
                            <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                              {selectedCardOption === "card" && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bank of Georgia Gateway Accordion */}
                    <div className={`rounded-2xl overflow-hidden border-2 transition-colors ${
                      expandedCardGateway === "bog" ? "border-blue-600 bg-[#F1F3F6]" : "border-transparent bg-[#F1F3F6]"
                    }`}>
                      <button
                        type="button"
                        onClick={() => setExpandedCardGateway(expandedCardGateway === "bog" ? "tbc" : "bog")}
                        className="w-full h-16 px-5 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                            🦁
                          </div>
                          <span className="text-xs md:text-sm text-gray-900">Bank of Georgia</span>
                        </div>
                        {expandedCardGateway === "bog" ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </button>

                      {expandedCardGateway === "bog" && (
                        <div className="p-4 pt-2 space-y-3 border-t border-gray-200/40">
                          {/* Option 1: Card Pay */}
                          <div
                            onClick={() => setSelectedCardOption("card")}
                            className="flex items-center justify-between p-3 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs tracking-widest text-blue-900">VISA</span>
                              <span className="text-xs md:text-sm text-gray-900">ბარათით გადახდა</span>
                            </div>
                            <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                              {selectedCardOption === "card" && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                            </div>
                          </div>

                          {/* Option 2: Apple Pay */}
                          <div
                            onClick={() => setSelectedCardOption("applepay")}
                            className="flex items-center justify-between p-3 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm"></span>
                              <span className="text-xs md:text-sm text-gray-900">Apple Pay</span>
                            </div>
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                              {selectedCardOption === "applepay" && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-Panel: Other payment methods */}
                {["points", "transfer", "keepz", "crypto"].includes(paymentCategory) && (
                  <div className="p-6 bg-[#F1F3F6] rounded-2xl text-xs text-gray-600 space-y-2">
                    <p className="text-gray-900 text-sm">გადახდის ინსტრუქცია</p>
                    <p>შეკვეთის დადასტურების შემდეგ მიიღებთ შესაბამის რეკვიზიტებს და გადახდის ინსტრუქციას.</p>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Right Summary Sidebar Area (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Gray Summary Card */}
            <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-gray-100 space-y-4">
              <div className="space-y-3 pb-3 border-b border-gray-200/60 max-h-56 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <img src={item.image} alt={item.title} className="w-10 h-10 object-contain bg-white rounded-lg p-0.5 border border-gray-200/60 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 truncate">{item.title}</p>
                      {(item.color || item.storage || item.extraProtection) && (
                        <p className="text-[10px] text-gray-500 truncate">
                          {[item.color, item.storage, item.extraProtection ? "+2 წელი გარანტია" : null].filter(Boolean).join(" • ")}
                        </p>
                      )}
                    </div>
                    <span className="text-gray-900 font-mono shrink-0">
                      {item.quantity} × {((item.discountPrice || item.price)).toFixed(0)} ₾
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-xs md:text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>ღირებულება</span>
                  <span className="text-gray-900 font-mono">{cartSubtotal.toFixed(2)} ₾</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600">
                    <span>ფასდაკლება ({appliedCoupon.code})</span>
                    <span className="font-mono">-{discountAmount.toFixed(2)} ₾</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>მიწოდების ღირებულება</span>
                  <span className="text-[#10B981] font-mono">უფასო (0 ₾)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200/60 flex justify-between items-center">
                <span className="text-xs md:text-sm text-gray-600">გადასახდელი თანხა</span>
                <span className="text-lg md:text-xl text-blue-600 font-mono">{totalAmount.toFixed(2)} ₾</span>
              </div>
            </div>

            {/* Terms Agreement Checkbox (Required on Step 2) */}
            {step === 2 && (
              <div className="flex items-start gap-2.5 pt-2 px-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer"
                />
                <label htmlFor="terms" className="text-[11px] text-gray-600 hover:text-gray-900 leading-tight cursor-pointer">
                  წავიკითხე და ვეთანხმები წესებს, პირობებს და პერსონალურ მონაცემთა დაცვის პოლიტიკას
                </label>
              </div>
            )}

            {/* Primary Blue Action Button "შემდეგი" */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                if (step === 1) handleProceedToStep2();
                else handleFinalOrderSubmit();
              }}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-2xl text-xs md:text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>მუშავდება...</span>
                </>
              ) : (
                <span>{step === 1 ? "შემდეგი" : "შეკვეთის გაფორმება"}</span>
              )}
            </button>

            {/* Live Database Coupon Form */}
            {appliedCoupon ? (
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-emerald-900 font-mono">{appliedCoupon.code}</p>
                    <p className="text-[10px] text-emerald-700">
                      -{appliedCoupon.discountType === "percentage" ? `${appliedCoupon.discountValue}%` : `${appliedCoupon.discountValue} ₾`} ფასდაკლება
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                >
                  მოხსნა
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="შეიყვანე პრომო კოდი"
                  className="flex-1 h-12 px-4 bg-[#F1F3F6] rounded-2xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 uppercase font-mono"
                />
                <button
                  type="button"
                  disabled={isValidatingPromo}
                  onClick={handleApplyCoupon}
                  className="px-5 h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-2xl text-xs cursor-pointer transition-colors shrink-0 shadow-xs flex items-center justify-center gap-1"
                >
                  {isValidatingPromo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "გააქტიურება"}
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Add Address Modal with Google Map Autocomplete */}
      <AddAddressModal
        isOpen={isAddAddressOpen}
        onClose={() => setIsAddAddressOpen(false)}
        initialAddress={address}
        onSaveAddress={(newAddr) => setAddress(newAddr)}
      />
    </div>
  );
}
