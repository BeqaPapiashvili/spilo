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

  const [address, setAddress] = useState(user?.address || "");
  const [deliverySettings, setDeliverySettings] = useState({
    freeShippingThreshold: 100,
    standardDeliveryFee: 5,
    regionsDeliveryFee: 10,
  });
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
  const [recipientEmail, setRecipientEmail] = useState(user?.email || "");

  // Step 2: Payment Details state (defaulting to COD)
  const [paymentCategory, setPaymentCategory] = useState<"card" | "installment" | "cod" | "transfer">("card");
  const [installmentMonths, setInstallmentMonths] = useState<3 | 6 | 9 | 12>(3);
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

  useEffect(() => {
    fetch("/api/delivery")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setDeliverySettings({
            freeShippingThreshold: Number(json.data.freeShippingThreshold) || 100,
            standardDeliveryFee: Number(json.data.standardDeliveryFee) || 5,
            regionsDeliveryFee: Number(json.data.regionsDeliveryFee) || 10,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Fetch real profile data from DB on mount
  useEffect(() => {
    if (!user) return;

    if (user.address && !address) setAddress(user.address);
    if (user.phone && !recipientPhone) setRecipientPhone(user.phone);
    if (user.email && !recipientEmail) setRecipientEmail(user.email);
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
          if (u.email) setRecipientEmail(u.email);
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
  const shippingCost =
    deliveryMethod === "pickup"
      ? 0
      : cartSubtotal >= deliverySettings.freeShippingThreshold
        ? 0
        : city === "თბილისი"
          ? deliverySettings.standardDeliveryFee
          : deliverySettings.regionsDeliveryFee;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalAmount = Math.max(0, cartSubtotal + shippingCost - discountAmount);
  const monthlyInstallment = totalAmount / installmentMonths;

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
          items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
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
    if (deliveryMethod !== "pickup" && !address.trim()) newErrors.address = "მიუთითეთ მისამართი";

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

    const isOnlinePayment = paymentCategory === "card" || paymentCategory === "installment";

    let paymentMethodLabel = "კურიერთან ანგარიშსწორება (ადგილზე გადახდა)";
    if (paymentCategory === "cod") {
      paymentMethodLabel = "კურიერთან ანგარიშსწორება (ადგილზე გადახდა)";
    } else if (paymentCategory === "transfer") {
      paymentMethodLabel = "საბანკო გადარიცხვა (Bank Transfer)";
    } else if (paymentCategory === "installment") {
      paymentMethodLabel = `განვადება: საქართველოს ბანკი (${installmentMonths} თვე)`;
    } else {
      paymentMethodLabel = "ბარათით გადახდა (United Payment / Bank of Georgia)";
    }

    const fullRecipientName = `${recipientFirstName} ${recipientLastName}`.trim();
    const fullShippingAddress = `${city}, ${address}${comment ? ` (${comment})` : ""}`;

    const orderPayload = {
      items: cart.map((item) => ({
        id: item.id,
        productId: item.id,
        title: item.title || "",
        quantity: item.quantity,
        price: item.discountPrice || item.price,
        originalPrice: item.price,
        discountPrice: item.discountPrice || null,
        selectedVariants: item.color || item.storage ? { color: item.color, storage: item.storage } : null,
        image: item.image || "",
      })),
      customer: {
        name: fullRecipientName,
        phone: recipientPhone,
        email: recipientEmail.trim() || user?.email || "",
        idNumber: recipientIdNumber,
        personType,
      },
      deliveryMethod,
      city,
      address,
      notes: comment || "",
      subtotal: Number(cartSubtotal.toFixed(2)),
      shippingFee: shippingCost,
      discountAmount: Number(discountAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      paymentMethod: paymentMethodLabel,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      deferSettlement: isOnlinePayment,
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

      if (isOnlinePayment) {
        const payRes = await fetch("/api/checkout/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: resData.order?.id || finalOrderNumber,
            installmentNumber: paymentCategory === "installment" ? installmentMonths : 1,
          }),
        });
        const payData = await payRes.json();
        if (!payRes.ok || !payData.success || !payData.redirectUrl) {
          setIsSubmitting(false);
          addToast({
            title: paymentCategory === "installment" ? "განვადება ვერ გაიხსნა" : "გადახდის გვერდი ვერ გაიხსნა",
            message: payData.error || "სცადეთ ხელახლა ან აირჩიეთ ბარათით გადახდა",
            type: "error",
          });
          return;
        }
        window.location.href = payData.redirectUrl;
        return;
      }
      
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
                className="inline-flex items-center gap-2 text-gray-700 hover:text-[#FF5238] cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-500" />
                <span>უკან დაბრუნება</span>
              </button>

              {step === 1 && (
                <div className="relative">
                  <select
                    value={personType}
                    onChange={(e) => setPersonType(e.target.value as any)}
                    className="appearance-none bg-transparent pr-6 text-[#FF5238] font-sans text-xs md:text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="physical">ფიზიკური პირი</option>
                    <option value="legal">იურიდიული პირი</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#FF5238] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                          ? "border-[#FF5238] bg-[#FFF5F2] text-[#FF5238] ring-1 ring-[#FF5238]"
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
                          ? "border-[#FF5238] bg-[#FFF5F2] text-[#FF5238] ring-1 ring-[#FF5238]"
                          : "border-transparent bg-[#F1F3F6] text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      ჩემით წავიღებ
                    </button>
                  </div>
                </div>

                {deliveryMethod === "pickup" && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
                    თვითგატანისას მისამართი არ არის საჭირო. პროდუქტს წაიღებთ მაღაზიიდან.
                  </div>
                )}

                {deliveryMethod !== "pickup" && (
                <>
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
                        <div className="border border-[#FF5238] bg-white rounded-2xl h-12 px-4 flex items-center gap-2 shadow-2xs">
                          <Search className="w-4 h-4 text-[#FF5238] shrink-0" />
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
                                    ? "bg-[#FFF5F2] text-[#FF5238]"
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
                    className="border-2 border-[#FF5238] bg-[#FFF5F2]/40 rounded-2xl p-5 flex items-center justify-between cursor-pointer shadow-2xs"
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
                          className="text-gray-400 hover:text-[#FF5238] p-0.5 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-500 block">
                        {comment ? comment : "კომენტარი"}
                      </span>
                    </div>

                    {/* Radio Selected Circle */}
                    <div className="w-5 h-5 rounded-full border-2 border-[#FF5238] flex items-center justify-center shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF5238]" />
                    </div>
                  </div>

                  {/* Add New Address Button */}
                  <button
                    type="button"
                    onClick={() => setIsAddAddressOpen(true)}
                    className="flex items-center gap-2 text-xs md:text-sm text-gray-900 pt-2 cursor-pointer hover:text-[#FF5238] transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#FF5238] text-white flex items-center justify-center text-xs">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span>ახალი მისამართის დამატება</span>
                  </button>
                </div>
                </>
                )}

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
                        className="w-full h-14 px-5 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5238]"
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
                        className="w-full h-14 px-5 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5238]"
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
                        className="w-full h-14 px-5 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5238]"
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
                        className="w-full h-14 px-5 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5238]"
                      />
                      {errors.recipientPhone && <p className="text-xs text-red-500 pt-1 px-2">{errors.recipientPhone}</p>}
                    </div>

                    {/* Recipient Email */}
                    <div>
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="მიმღების ელ-ფოსტა (სურვილისამებრ)"
                        className="w-full h-14 px-5 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5238]"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* STEP 2 CONTENT: Payment Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-[#FED7CC] bg-[#FFF5F2] px-4 py-3 text-xs text-[#9A3412]">
                  {paymentCategory === "installment"
                    ? "განვადებაზე ბანკის გვერდი იგივე 3D ბარათის ფორმაა — იქ ბარათს შეიყვან და თანხა არჩეულ თვეებზე იყოფა. Extra-ს ინტერნეტბანკის განაცხადი ამ სატესტო ანგარიშზე არ იხსნება."
                    : "სატესტო გარემო · United Payment / BOG 3D. ბანკში ახლა ჩაირიცხება 0.10 ₾, შეკვეთის რეალური თანხა საიტზე უცვლელი რჩება."}
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm text-gray-900">გადახდის მეთოდები</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: "card", label: "ბარათით გადახდა", hint: "Visa / Mastercard" },
                      { id: "installment", label: "განვადება", hint: "BOG 3–12 თვე" },
                      { id: "cod", label: "ადგილზე გადახდა", hint: "კურიერთან" },
                      { id: "transfer", label: "საბანკო გადარიცხვა", hint: "ინვოისი" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPaymentCategory(item.id as typeof paymentCategory)}
                        className={`min-h-[4.25rem] py-2 px-3 rounded-2xl text-xs transition-all cursor-pointer border text-left ${
                          paymentCategory === item.id
                            ? "border-[#FF5238] bg-[#FFF5F2] text-[#FF5238] ring-1 ring-[#FF5238]"
                            : "border-transparent bg-[#F1F3F6] text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <span className="block text-[13px]">{item.label}</span>
                        <span className={`block mt-0.5 text-[10px] ${paymentCategory === item.id ? "text-[#FF5238]/80" : "text-gray-500"}`}>
                          {item.hint}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {paymentCategory === "card" && (
                  <div className="p-5 bg-[#F1F3F6] rounded-2xl text-xs text-gray-700 space-y-2 border border-gray-200/60">
                    <p className="text-gray-900 text-sm">ბარათით გადახდა · Bank of Georgia</p>
                    <p>შეკვეთის გაფორმების შემდეგ გადახვალთ United Payment-ის 3D უსაფრთხო გვერდზე. იქ შეიყვანთ ბარათს და SMS კოდს.</p>
                    <p className="text-[#FF5238]">თანხა ჩამოიჭრება მხოლოდ წარმატებული 3D დადასტურების შემდეგ.</p>
                  </div>
                )}

                {paymentCategory === "installment" && (
                  <div className="p-5 bg-[#FFF5F2] border border-[#FED7CC] rounded-2xl space-y-4">
                    <div>
                      <p className="text-sm text-gray-900">საქართველოს ბანკის განვადება · 0%</p>
                      <p className="text-[11px] text-gray-500 mt-1">აირჩიე ვადა — ყოველთვიური თანხა იცვლება</p>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {([3, 6, 9, 12] as const).map((months) => {
                        const monthly = totalAmount / months;
                        const selected = installmentMonths === months;
                        return (
                          <button
                            key={months}
                            type="button"
                            onClick={() => setInstallmentMonths(months)}
                            className={`min-h-[4.25rem] rounded-xl text-xs cursor-pointer border px-1 py-2 ${
                              selected
                                ? "border-[#FF5238] bg-white text-[#FF5238] ring-1 ring-[#FF5238]"
                                : "border-transparent bg-white text-gray-700"
                            }`}
                          >
                            <span className="block text-[13px]">{months} თვე</span>
                            <span className={`block mt-0.5 font-mono text-[11px] ${selected ? "text-[#FF5238]" : "text-gray-500"}`}>
                              {monthly.toFixed(2)} ₾
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="rounded-xl bg-white border border-[#FED7CC] px-3 py-3 space-y-1.5 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>არჩეული გეგმა</span>
                        <span className="text-gray-900">{installmentMonths} თვე · 0%</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>ყოველთვიურად</span>
                        <span className="text-gray-900 font-mono">{monthlyInstallment.toFixed(2)} ₾</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>სულ</span>
                        <span className="text-[#FF5238] font-mono">{totalAmount.toFixed(2)} ₾</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      შემდეგ გაიხსნება United Payment-ის 3D გვერდი. იქ ბარათს შეიყვან — ეს არის განვადება, არა ერთჯერადი გადახდა: POS-ს ეგზავნება {installmentMonths} თვე.
                    </p>
                  </div>
                )}

                {paymentCategory === "cod" && (
                  <div className="p-6 bg-[#F1F3F6] rounded-2xl text-xs text-gray-700 space-y-2 border border-gray-200/60">
                    <p className="text-gray-900 text-sm">ადგილზე გადახდა კურიერთან</p>
                    <p>თანხას გადაიხდით ჩაბარებისას ნაღდად ან POS ტერმინალით. ონლაინ ბარათი არ ჩამოიჭრება.</p>
                  </div>
                )}

                {paymentCategory === "transfer" && (
                  <div className="p-6 bg-[#F1F3F6] rounded-2xl text-xs text-gray-700 space-y-2.5 border border-gray-200/60">
                    <p className="text-gray-900 text-sm">საბანკო გადარიცხვა</p>
                    <p>შეკვეთის შემდეგ მიიღებთ ინვოისს. გადარიცხეთ თანხა ამ რეკვიზიტებზე და დანიშნულებაში მიუთითეთ შეკვეთის ნომერი.</p>
                    <div className="p-3 bg-white rounded-xl border border-gray-200/60 space-y-1 font-mono text-[11px] text-gray-800">
                      <p>მიმღები: შპს სპილო (Spilo LLC)</p>
                      <p>TBC Bank: GE89TB7749102938102938</p>
                      <p>Bank of Georgia: GE12BG0000000889201928</p>
                    </div>
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
                  <span className="text-[#FF5238] font-mono">
                    {shippingCost === 0 ? "უფასო (0 ₾)" : `${shippingCost.toFixed(2)} ₾`}
                  </span>
                </div>
                {paymentCategory === "installment" && step === 2 && (
                  <div className="flex justify-between text-gray-600">
                    <span>განვადება {installmentMonths} თვე</span>
                    <span className="text-gray-900 font-mono">{monthlyInstallment.toFixed(2)} ₾/თვე</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-200/60 flex justify-between items-center">
                <span className="text-xs md:text-sm text-gray-600">გადასახდელი თანხა</span>
                <span className="text-lg md:text-xl text-[#FF5238] font-mono">{totalAmount.toFixed(2)} ₾</span>
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
                  className="mt-0.5 w-4 h-4 accent-[#FF5238] cursor-pointer"
                />
                <label htmlFor="terms" className="text-[11px] text-gray-600 hover:text-gray-900 leading-tight cursor-pointer">
                  წავიკითხე და ვეთანხმები წესებს, პირობებს და პერსონალურ მონაცემთა დაცვის პოლიტიკას
                </label>
              </div>
            )}

            {/* Primary Action Button "შემდეგი" */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                if (step === 1) handleProceedToStep2();
                else handleFinalOrderSubmit();
              }}
              className="w-full h-14 bg-[#FF5238] hover:bg-[#EA3A20] disabled:opacity-70 text-white rounded-2xl text-xs md:text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>მუშავდება...</span>
                </>
              ) : (
                <span>
                  {step === 1
                    ? "შემდეგი"
                    : paymentCategory === "installment"
                      ? `განვადების გაფორმება · ${installmentMonths} თვე`
                      : paymentCategory === "card"
                        ? "გადახდაზე გადასვლა"
                        : "შეკვეთის გაფორმება"}
                </span>
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
                  className="flex-1 h-12 px-4 bg-[#F1F3F6] rounded-2xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/30 uppercase font-mono"
                />
                <button
                  type="button"
                  disabled={isValidatingPromo}
                  onClick={handleApplyCoupon}
                  className="px-5 h-12 bg-[#059669] hover:bg-[#047857] disabled:opacity-70 text-white rounded-2xl text-xs cursor-pointer transition-colors shrink-0 shadow-xs flex items-center justify-center gap-1"
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
