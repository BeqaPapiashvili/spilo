"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Truck, 
  ShieldCheck, 
  ChevronDown, 
  PackageCheck,
  Star,
  MessageSquare,
  Check,
  User,
  Loader2
} from "lucide-react";
import { useStore } from "@/store/useStore";

interface SpecGroup {
  title: string;
  items: { label: string; value: string }[];
}

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

interface ProductSpecsAndTabsProps {
  productId?: string;
  specs?: SpecGroup[];
  description: string;
  warrantyMonths?: number;
}

export function ProductSpecsAndTabs({
  productId,
  specs,
  description,
  warrantyMonths = 12,
}: ProductSpecsAndTabsProps) {
  const { user, addToast } = useStore();
  const [activeSection, setActiveSection] = useState<"specs" | "description" | "delivery" | "reviews" | "faq">("specs");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Reviews State
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState(user?.name || "");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!productId) return;
    setReviewsLoading(true);
    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setReviews(res.data);
        }
      })
      .catch((err) => console.warn("Failed to fetch reviews:", err))
      .finally(() => setReviewsLoading(false));
  }, [productId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !newAuthor.trim() || !newComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          userId: user?.id,
          author: newAuthor,
          rating: newRating,
          comment: newComment,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setReviews([data.data, ...reviews]);
        setIsReviewModalOpen(false);
        setNewComment("");
        addToast({
          title: "შეფასება დამატებულია!",
          message: "მადლობა გამოხმაურებისთვის.",
          type: "success",
        });
      }
    } catch (err) {
      console.warn("Failed to post review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const isGenericTitle = (title: string) => {
    const t = title.trim().toLowerCase();
    return (
      t === "ძირითადი მახასიათებლები" ||
      t === "ძირითადი პარამეტრები" ||
      t === "მახასიათებლები" ||
      t === "ზოგადი მახასიათებლები" ||
      t === "general specs" ||
      t === "specifications"
    );
  };

  const faqs = [
    {
      q: "რა შედის პროდუქტის კომპლექტაციაში (ყუთში)?",
      a: "ყუთში მოყვება პროდუქტი, ოფიციალური დამტენი კაბელი, საგარანტიო ტალონი და ინსტრუქცია.",
    },
    {
      q: "როგორ მოქმედებს 0%-იანი განვადება?",
      a: "ონლაინ განვადება ფორმდება 0%-იანი ეფექტური განაკვეთით 3-დან 36 თვემდე ვადით TBC, BOG, Credo ან Space ბანკის მეშვეობით.",
    },
    {
      q: "როგორ ხდება გარანტიით სარგებლობა შეკეთების შემთხვევაში?",
      a: "საგარანტიო შემთხვევისას შეგიძლიათ მიმართოთ Spilo-ს ოფიციალურ სერვის ცენტრს ან ნებისმიერ ავტორიზებულ სერვისს საქართველოს მასშტაბით.",
    },
  ];

  return (
    <div className="mt-10 flex flex-col gap-8">
      
      {/* Clean Human-Designed Underline Navigation Bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-2xs">
        <div className="flex items-center gap-6 md:gap-8 overflow-x-auto scrollbar-none px-2">
          {[
            { id: "specs", label: "მახასიათებლები" },
            { id: "description", label: "აღწერა" },
            { id: "delivery", label: "მიწოდება & გარანტია" },
            { id: "reviews", label: `შეფასებები (${reviews.length})` },
            { id: "faq", label: "ხშირად დასმული კითხვები" },
          ].map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as any)}
                className={`py-3.5 px-1 text-xs md:text-sm shrink-0 relative transition-colors cursor-pointer ${
                  isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Specifications Section - Clean 2-Column Grid Layout */}
      {activeSection === "specs" && (
        <div className="flex flex-col gap-6">
          {specs && specs.length > 0 ? (
            <div className="flex flex-col gap-6">
              {specs.map((group, idx) => (
                <div key={idx} className="flex flex-col gap-2.5">
                  {!isGenericTitle(group.title) && (
                    <h4 className="text-xs text-gray-900 px-1">
                      {group.title}
                    </h4>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1 bg-white rounded-2xl border border-gray-200/80 p-5 md:p-6 shadow-2xs">
                    {group.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-center justify-between gap-4 py-2.5 border-b border-gray-100/70 last:border-b-0 text-xs"
                      >
                        <span className="text-gray-500 shrink-0">{item.label}</span>
                        <span className="text-gray-900 text-right leading-snug">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-gray-400">
              მახასიათებლები მალე დაემატება.
            </div>
          )}
        </div>
      )}

      {/* Description Section */}
      {activeSection === "description" && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 text-xs md:text-sm text-gray-700 leading-relaxed shadow-2xs">
          <p className="whitespace-pre-line">{description}</p>
        </div>
      )}

      {/* Delivery & Warranty Section */}
      {activeSection === "delivery" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-white rounded-2xl border border-gray-200/80 flex flex-col gap-3 shadow-2xs">
            <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Truck className="size-5" />
            </div>
            <h4 className="text-xs text-gray-900">თბილისში მიწოდება</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              იმავე დღეს ან მეორე დღეს კურიერის მიერ პირდაპირ თქვენს კარამდე.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-200/80 flex flex-col gap-3 shadow-2xs">
            <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <PackageCheck className="size-5" />
            </div>
            <h4 className="text-xs text-gray-900">რეგიონებში მიწოდება</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              1-3 სამუშაო დღის ვადაში საქართველოს ნებისმიერ ქალაქსა და სოფელში.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-200/80 flex flex-col gap-3 shadow-2xs">
            <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="size-5" />
            </div>
            <h4 className="text-xs text-gray-900">ოფიციალური გარანტია</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              {warrantyMonths} თვიანი სრული სერვისული გარანტია და ტექნიკური მხარდაჭერა.
            </p>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      {activeSection === "reviews" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
            <div>
              <h3 className="text-base text-gray-900">მომხმარებელთა შეფასებები</h3>
              <p className="text-xs text-gray-500 mt-0.5">გაეცანით რეალურ გამოხმაურებებს ან გააზიარეთ თქვენი აზრი</p>
            </div>
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <MessageSquare className="size-3.5" />
              <span>შეფასების დაწერა</span>
            </button>
          </div>

          {reviewsLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 className="size-5 animate-spin text-blue-600" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200/80 text-xs text-gray-400">
              ამ პროდუქტზე შეფასებები ჯერ არ არის. იყავით პირველი!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-5 bg-white rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                        <User className="size-4" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-900 block">{rev.author}</span>
                        {rev.verifiedPurchase && (
                          <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                            <Check className="size-3" /> ვერიფიცირებული მყიდველი
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`size-3.5 ${
                            star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Review Modal */}
          {isReviewModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
                <h3 className="text-base text-gray-900">შეფასების დამატება</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">თქვენი სახელი *</label>
                    <input
                      type="text"
                      required
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="გიორგი ბერიძე"
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">შეფასება (ვარსკვლავები)</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewRating(s)}
                          className="p-1 cursor-pointer"
                        >
                          <Star className={`size-6 ${s <= newRating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">თქვენი კომენტარი *</label>
                    <textarea
                      required
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="გაუზიარეთ თქვენი შთაბეჭდილება სხვა მყიდველებს..."
                      className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                    >
                      გაუქმება
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-5 py-2.5 rounded-xl text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {submittingReview ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                      <span>გაგზავნა</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAQ Section */}
      {activeSection === "faq" && (
        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left text-xs md:text-sm text-gray-900 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`size-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs md:text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
