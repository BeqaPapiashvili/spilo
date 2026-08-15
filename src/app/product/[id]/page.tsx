"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Heart, 
  ShoppingBag, 
  Check, 
  Moon, 
  Star, 
  ChevronRight, 
  Share2,
  GitCompare,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  MessageSquare,
  Package,
  X
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { dataService } from "@/services/dataService";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { RecentlyViewedCarousel } from "@/components/RecentlyViewedCarousel";
import { ProductDetailSkeleton } from "@/components/skeletons/ProductDetailSkeleton";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    toggleCompare, 
    compareList, 
    addRecentlyViewed,
    addToast
  } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live product from dataService / MySQL API
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadProduct = () => {
      const found = dataService.getProductById(resolvedParams.id);
      if (found) {
        if (isMounted) {
          setProduct(found);
          setIsLoading(false);
        }
      } else {
        fetch(`/api/products/${resolvedParams.id}`)
          .then((res) => res.json())
          .then((json) => {
            if (isMounted && json.success && json.data) {
              setProduct(json.data);
            }
          })
          .catch(() => {})
          .finally(() => {
            if (isMounted) setIsLoading(false);
          });
      }
    };

    loadProduct();
    const unsub = dataService.subscribe(loadProduct);
    return () => {
      isMounted = false;
      unsub();
    };
  }, [resolvedParams.id]);

  // States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [selectedBank, setSelectedBank] = useState<"TBC" | "BOG" | "Credo">("TBC");
  const [installmentMonths, setInstallmentMonths] = useState<number>(12);
  const [activeTab, setActiveTab] = useState<"specs" | "description" | "delivery" | "reviews">("specs");
  const [isAdded, setIsAdded] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "", author: "" });

  // Track product in recently viewed
  useEffect(() => {
    if (product) {
      addRecentlyViewed({
        id: product.id,
        title: product.title,
        price: product.price,
        discountPrice: product.discountPrice,
        monthlyInstallment: product.monthlyInstallment,
        image: product.images?.[0] || product.image || "",
        discountPercentage: product.discountPercentage,
      });
    }
  }, [product, addRecentlyViewed]);

  if (isLoading || !product) {
    return (
      <main className="min-h-screen bg-gray-50/50 py-8">
        <ProductDetailSkeleton />
      </main>
    );
  }

  const isLiked = isInWishlist(product.id);
  const isCompared = compareList.includes(product.id);

  const currentPrice = product.discountPrice || product.price;

  // Monthly Installment calculation
  const calculatedMonthly = (currentPrice / installmentMonths).toFixed(2);

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        discountPrice: product.discountPrice,
        image: product.images[selectedImageIndex] || product.images[0],
      },
      true
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        discountPrice: product.discountPrice,
        image: product.images[selectedImageIndex] || product.images[0],
      },
      false
    );
    router.push("/checkout");
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    addToast({
      title: "მიმოხილვა დაემატა!",
      message: "მადლობა შეფასებისთვის",
      type: "success",
    });
    setIsReviewModalOpen(false);
    setNewReview({ rating: 5, comment: "", author: "" });
  };

  // Schema.org Product structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images,
    description: product.description,
    sku: product.sku || product.code || product.id,
    brand: {
      "@type": "Brand",
      name: product.brandName || "Spilo",
    },
    offers: {
      "@type": "Offer",
      url: `https://spilo.ge/product/${product.id}`,
      priceCurrency: "GEL",
      price: product.discountPrice || product.price,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Spilo E-Commerce",
      },
    },
  };

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Google Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumbs */}
      <div className="bg-gray-50/70 border-b border-gray-100 py-3">
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
            <Link href="/" className="hover:text-blue-600 transition-colors">მთავარი</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/catalog" className="hover:text-blue-600 transition-colors">კატალოგი</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/catalog?category=${product.categoryId}`} className="hover:text-blue-600 transition-colors">
              {product.categoryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 truncate max-w-xs">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Container */}
      <div className="container mx-auto px-4 lg:px-8 pt-6 md:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Media Gallery (5 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Display Image */}
            <div className="relative aspect-4/3 w-full bg-gray-50 rounded-3xl border border-gray-100 p-6 flex items-center justify-center overflow-hidden shadow-2xs">
              {product.discountPercentage && (
                <span className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs px-3 py-1 rounded-lg">
                  -{product.discountPercentage}%
                </span>
              )}
              {product.isHot && (
                <span className="absolute top-4 left-20 z-10 bg-amber-500 text-white text-xs px-3 py-1 rounded-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> HOT
                </span>
              )}
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Thumbnail Selectors */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl border bg-gray-50 p-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    selectedImageIndex === idx
                      ? "border-blue-600 ring-2 ring-blue-500/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Details & Actions (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Brand & Stock Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-lg">
                {product.brandName}
              </span>
              <div className="flex items-center gap-2 text-xs">
                {product.stock > 0 ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Check className="w-4 h-4" /> მარაგშია ({product.stock} ცალი)
                  </span>
                ) : (
                  <span className="text-red-500">მარაგი ამოწურულია</span>
                )}
                <span className="text-gray-300">|</span>
                <span className="text-gray-400">SKU: {product.sku}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-2xl text-gray-900 leading-snug">
              {product.title}
            </h1>

            {/* Rating Breakdown */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="text-gray-900">{product.rating}</span>
              </div>
              <span className="text-gray-400">({product.reviewCount} მიმოხილვა)</span>
              <button
                onClick={() => setActiveTab("reviews")}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                მიმოხილვის დაწერა
              </button>
            </div>

            {/* Price Block */}
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl text-gray-900 tracking-tight">
                  {currentPrice.toFixed(2)} ₾
                </span>
                {product.discountPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {product.price.toFixed(2)} ₾
                  </span>
                )}
              </div>
              {product.monthlyInstallment && (
                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-blue-600" />
                  <span>0% ონლაინ განვადება <b>{calculatedMonthly} ₾/თვეში</b></span>
                </p>
              )}
            </div>

            {/* Variant Selector (if available) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 pt-2">
                {product.variants.map((v) => (
                  <div key={v.id} className="space-y-2">
                    <label className="text-xs text-gray-700 block">{v.name}:</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {v.options.map((opt) => {
                        const isSelected = selectedVariants[v.id] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() =>
                              setSelectedVariants((prev) => ({ ...prev, [v.id]: opt.value }))
                            }
                            className={`px-3 py-2 rounded-xl text-xs border transition-all cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? "border-blue-600 bg-blue-50 text-blue-600"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            {opt.colorHex && (
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/10"
                                style={{ backgroundColor: opt.colorHex }}
                              />
                            )}
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 0% Bank Installment Calculator Widget */}
            <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-900 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-blue-600" />
                  ონლაინ განვადების კალკულატორი
                </span>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">0% პროცენტი</span>
              </div>
              <div className="flex items-center gap-2">
                {(["TBC", "BOG", "Credo"] as const).map((bank) => (
                  <button
                    key={bank}
                    onClick={() => setSelectedBank(bank)}
                    className={`flex-1 py-1.5 rounded-xl text-xs border transition-all cursor-pointer ${
                      selectedBank === bank
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {bank} Bank
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {[3, 6, 12, 24, 36].map((months) => (
                  <button
                    key={months}
                    onClick={() => setInstallmentMonths(months)}
                    className={`px-3 py-1 rounded-lg text-xs border transition-all cursor-pointer ${
                      installmentMonths === months
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    {months} თვე
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-600 flex justify-between pt-1">
                <span>ყოველთვიური შენატანი:</span>
                <span className="text-sm text-gray-900">{calculatedMonthly} ₾ / თვე</span>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleBuyNow}
                variant="primary"
                size="lg"
                className="flex-1"
              >
                სწრაფი ყიდვა
              </Button>
              <Button
                onClick={handleAddToCart}
                variant="secondary"
                size="lg"
                leftIcon={isAdded ? <Check className="w-5 h-5 text-emerald-600" /> : <ShoppingBag className="w-5 h-5" />}
              >
                {isAdded ? "დაემატა" : "კალათაში"}
              </Button>
              <button
                onClick={() => toggleWishlist({
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  discountPrice: product.discountPrice,
                  image: product.images[0],
                })}
                className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                  isLiked ? "border-red-200 bg-red-50 text-red-500" : "border-gray-200 hover:bg-gray-50 text-gray-600"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500" : ""}`} />
              </button>
              <button
                onClick={() => toggleCompare(product.id)}
                className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                  isCompared ? "border-blue-200 bg-blue-50 text-blue-600" : "border-gray-200 hover:bg-gray-50 text-gray-600"
                }`}
              >
                <GitCompare className="w-5 h-5" />
              </button>
            </div>

            {/* Service Features Highlights */}
            <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-4 text-center">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <Truck className="w-5 h-5 text-blue-600 mx-auto" />
                <p className="text-[11px] text-gray-700">უფასო მიწოდება</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <ShieldCheck className="w-5 h-5 text-blue-600 mx-auto" />
                <p className="text-[11px] text-gray-700">{product.warrantyMonths || 12} თვე გარანტია</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <RotateCcw className="w-5 h-5 text-blue-600 mx-auto" />
                <p className="text-[11px] text-gray-700">14 დღიანი დაბრუნება</p>
              </div>
            </div>

          </div>
        </div>

        {/* Tabbed Specs, Description & Reviews */}
        <div className="mt-16 border-t border-gray-100 pt-8">
          <Tabs
            tabs={[
              { id: "specs", label: "ტექნიკური მახასიათებლები" },
              { id: "description", label: "აღწერა" },
              { id: "delivery", label: "მიწოდება & გარანტია" },
              { id: "reviews", label: `მიმოხილვები (${product.reviewCount})` },
            ]}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as any)}
            className="mb-6"
          />

          <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
            {activeTab === "specs" && product.specs && (
              <div className="space-y-6">
                {product.specs.map((group, idx) => (
                  <div key={idx} className="space-y-3">
                    <h4 className="text-sm text-gray-900 border-b border-gray-200 pb-2">
                      {group.title}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex justify-between text-xs py-1.5 border-b border-gray-100">
                          <span className="text-gray-500">{item.label}</span>
                          <span className="text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "description" && (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === "delivery" && (
              <div className="space-y-4 text-xs text-gray-700">
                <p className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span><b>თბილისში მიწოდება:</b> იმავე დღეს ან მეორე დღეს (უფასო).</span>
                </p>
                <p className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600 shrink-0" />
                  <span><b>რეგიონებში მიწოდება:</b> 1-3 სამუშაო დღეში საქართველოს მასშტაბით.</span>
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span><b>ოფიციალური გარანტია:</b> {product.warrantyMonths || 12} თვიანი სერვის-ცენტრის გარანტია.</span>
                </p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base text-gray-900">მომხმარებელთა შეფასებები</h3>
                  <Button
                    onClick={() => setIsReviewModalOpen(true)}
                    variant="outline"
                    size="sm"
                    leftIcon={<MessageSquare className="w-4 h-4" />}
                  >
                    შეფასების დაწერა
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl border border-gray-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-900">გიორგი მ.</span>
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">ძალიან კმაყოფილი ვარ, მიწოდება მოხდა 3 საათში. პროდუქტი იდეალურია!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recently Viewed Carousel */}
        <RecentlyViewedCarousel />
      </div>

      {/* Write Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="მიმოხილვის დაწერა"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-700 block mb-1">თქვენი სახელი</label>
            <input
              type="text"
              required
              value={newReview.author}
              onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
              className="w-full h-10 border border-gray-200 rounded-xl px-3 text-xs focus:outline-none focus:border-blue-600"
              placeholder="მაგ: გიორგი"
            />
          </div>
          <div>
            <label className="text-xs text-gray-700 block mb-1">კომენტარი</label>
            <textarea
              required
              rows={4}
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-600"
              placeholder="დაწერეთ თქვენი შთაბეჭდილებები..."
            />
          </div>
          <Button type="submit" variant="primary" className="w-full">
            გაგზავნა
          </Button>
        </form>
      </Modal>

      {/* Mobile Sticky Purchase Bar */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <p className="text-xs text-gray-900 truncate max-w-[140px]">{product.title}</p>
          <p className="text-sm text-gray-900">{currentPrice.toFixed(2)} ₾</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleBuyNow} variant="primary" size="sm">
            ყიდვა
          </Button>
          <Button onClick={handleAddToCart} variant="secondary" size="sm">
            კალათაში
          </Button>
        </div>
      </div>
    </div>
  );
}
