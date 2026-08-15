"use client";

import { useState } from "react";
import { Zap, CheckCircle2, ShieldCheck, MapPin, Phone, User, CreditCard } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/store/useStore";

interface QuickBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price: number;
    discountPrice?: number;
    image: string;
  };
  quantity: number;
}

export function QuickBuyModal({
  isOpen,
  onClose,
  product,
  quantity,
}: QuickBuyModalProps) {
  const { addToast } = useStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "თბილისი",
    paymentMethod: "cash" as "cash" | "card" | "installment",
  });

  const unitPrice = product.discountPrice || product.price;
  const totalPrice = unitPrice * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) return;

    setIsSubmitted(true);
    addToast({
      title: "შეკვეთა მიღებულია!",
      message: "ოპერატორი დაგიკავშირდებათ 15 წუთში შეკვეთის დასადასტურებლად.",
      type: "success",
    });

    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 3000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="სწრაფი 1-დაწკაპუნებით ყიდვა">
      {isSubmitted ? (
        <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
          <div className="size-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <CheckCircle2 className="size-8" />
          </div>
          <h3 className="text-base text-gray-900">შეკვეთა წარმატებით გაფორმდა!</h3>
          <p className="text-xs text-gray-500 max-w-xs">
            გმადლობთ შეკვეთისთვის. ჩვენი მენეჯერი უახლოეს 15 წუთში დაგიკავშირდებათ მითითებულ ნომერზე.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Summary Box */}
          <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center gap-3">
            <img
              src={product.image}
              alt={product.title}
              className="size-14 object-contain mix-blend-multiply rounded-xl bg-white p-1 border border-gray-100 shadow-2xs"
            />
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-xs text-gray-900 truncate">{product.title}</span>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>რაოდენობა: {quantity} ცალი</span>
                <span className="text-gray-900">სულ: {totalPrice.toFixed(2)} ₾</span>
              </div>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1 text-xs">
              <label className="text-gray-700 flex items-center gap-1">
                <User className="size-3.5 text-blue-600" /> სრული სახელი:
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="მაგ: გიორგი ბერიძე"
                className="w-full h-10 border border-gray-200/80 rounded-xl px-3.5 text-xs focus:outline-none focus:border-blue-600 bg-white"
              />
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="text-gray-700 flex items-center gap-1">
                <Phone className="size-3.5 text-blue-600" /> ტელეფონის ნომერი:
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="5XX XX XX XX"
                className="w-full h-10 border border-gray-200/80 rounded-xl px-3.5 text-xs focus:outline-none focus:border-blue-600 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 text-xs">
                <label className="text-gray-700 flex items-center gap-1">
                  <MapPin className="size-3.5 text-blue-600" /> ქალაქი:
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full h-10 border border-gray-200/80 rounded-xl px-3 text-xs focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="თბილისი">თბილისი</option>
                  <option value="ბათუმი">ბათუმი</option>
                  <option value="ქუთაისი">ქუთაისი</option>
                  <option value="რუსთავი">რუსთავი</option>
                  <option value="სხვა">სხვა რეგიონი</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="text-gray-700">მისამართი:</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="ქუჩა, ბინის N"
                  className="w-full h-10 border border-gray-200/80 rounded-xl px-3 text-xs focus:outline-none focus:border-blue-600 bg-white"
                />
              </div>
            </div>

            {/* Payment Options Pills matching site system */}
            <div className="flex flex-col gap-1.5 text-xs pt-1">
              <label className="text-gray-700 flex items-center gap-1">
                <CreditCard className="size-3.5 text-blue-600" /> გადახდის მეთოდი:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "cash", label: "ნაღდი/კურიერთან" },
                  { id: "card", label: "ბარათით" },
                  { id: "installment", label: "0% განვადება" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: m.id as any })}
                    className={`py-2 px-2 rounded-xl border text-[11px] transition-all cursor-pointer ${
                      formData.paymentMethod === m.id
                        ? "bg-blue-50 border-blue-600 text-blue-700 shadow-2xs"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              leftIcon={<Zap className="size-4" />}
              className="w-full shadow-xs"
            >
              შეკვეთის დადასტურება ({totalPrice.toFixed(2)} ₾)
            </Button>
            <span className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="size-3 text-emerald-600" /> 100% უსაფრთხო შეკვეთა კონფიდენციალურობის დაცვით
            </span>
          </div>
        </form>
      )}
    </Modal>
  );
}
