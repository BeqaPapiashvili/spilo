"use client";

import { use, useState } from "react";
import Link from "next/link";
import { 
  Heart, 
  ShoppingBag, 
  Check, 
  Moon, 
  Star, 
  ChevronRight, 
  ChevronLeft,
  Share2,
  GitCompare,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import ProductCarousel from "@/components/ProductCarousel";
import { useStore } from "@/store/useStore";

interface ProductDetail {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  monthlyInstallment?: number;
  rating: number;
  reviewCount: number;
  brand: string;
  modelPn: string;
  type: string;
  sku: string;
  images: string[];
  description: string;
  specs: { label: string; value: string }[];
}

const PRODUCTS_DB: Record<string, ProductDetail> = {
  "dji-neo": {
    id: "dji-neo",
    title: "დრონი DJI Neo Drone Gray",
    price: 799,
    discountPrice: 699,
    discountPercentage: 12,
    monthlyInstallment: 28,
    rating: 4.9,
    reviewCount: 42,
    brand: "DJI",
    modelPn: "DJI-NEO-GRY-01",
    type: "კომპაქტური ვლოგ დრონი",
    sku: "172122",
    images: [
      "https://veli.store/media-cdn/__sized__/product/DJI_Neo_Drone-1-thumbnail-200x200-95.jpeg",
      "https://veli.store/media-cdn/__sized__/product/DJI_RC-N3-1-thumbnail-200x200-95.jpg",
      "https://veli.store/media-cdn/__sized__/product/DJI-ZM700_20250710210650-thumbnail-200x200-95.jpg",
      "https://veli.store/media-cdn/__sized__/product/DJI-ZPK300-C1-8_20250710160051-thumbnail-200x200-95.jpg"
    ],
    description: "DJI Neo არის ულტრამსუბუქი (135 გრამი) და კომპაქტური დრონი, რომელიც იდეალურია ყოველდღიური ვლოგებისა და მოგზაურობისთვის. მას გააჩნია 4K AI თრექინგის ვიდეო გადაღება, ხელის გულიდან აფრენა და ავტომატური რეჟიმები.",
    specs: [
      { label: "ბრენდი", value: "DJI" },
      { label: "მოდელი / PN", value: "DJI-NEO-GRY-01" },
      { label: "ტიპი", value: "კომპაქტური დრონი" },
      { label: "ფერი", value: "ნაცრისფერი" },
      { label: "ვიდეო რეზოლუცია", value: "4K UHD / 30fps" },
      { label: "ფოტოს რეზოლუცია", value: "12 მეგაპიქსელი" },
      { label: "ფრენის მაქსიმალური დრო", value: "18 წუთი" },
      { label: "სიგნალის გადაცემის მანძილი", value: "10 კილომეტრი" },
      { label: "შიდა მეხსიერება", value: "22 გბ" },
      { label: "წონა", value: "135 გრამი" },
      { label: "გარანტია", value: "1 წელი ოფიციალური" },
    ],
  },
  "dji-mini-4": {
    id: "dji-mini-4",
    title: "დრონი DJI Mini 4 Pro Fly More Combo",
    price: 3899,
    discountPrice: 3299,
    discountPercentage: 15,
    monthlyInstallment: 132,
    rating: 5.0,
    reviewCount: 89,
    brand: "DJI",
    modelPn: "DJI-M4P-FMC-02",
    type: "პროფესიონალური დრონი",
    sku: "172123",
    images: [
      "https://veli.store/media-cdn/__sized__/product/DJI-ZM700_20250710210650-thumbnail-200x200-95.jpg",
      "https://veli.store/media-cdn/__sized__/product/DJI_RC-N3-1-thumbnail-200x200-95.jpg",
    ],
    description: "DJI Mini 4 Pro არის ფლაგმანური კომპაქტური დრონი 4K 60fps HDR გადაღებით, 360-გრადუსიანი დაბრკოლებების აცილების სენსორებითა და გაფართოებული ფრენის დროით.",
    specs: [
      { label: "ბრენდი", value: "DJI" },
      { label: "მოდელი / PN", value: "DJI-M4P-FMC-02" },
      { label: "ვიდეო რეზოლუცია", value: "4K HDR / 60fps" },
      { label: "ფრენის დრო", value: "34 წუთი" },
      { label: "წონა", value: "249 გრამი" },
      { label: "გარანტია", value: "1 წელი ოფიციალური" },
    ],
  },
};

import { useRouter } from "next/navigation";

const FALLBACK_PRODUCT: ProductDetail = PRODUCTS_DB["dji-neo"];

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams?.id || "dji-neo";
  const product = PRODUCTS_DB[productId] || FALLBACK_PRODUCT;

  const router = useRouter();
  const { addToCart, addToCompare } = useStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isCompared, setIsCompared] = useState(false);

  const currentPrice = product.discountPrice || product.price;

  const handleQuickBuy = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0],
    });
    router.push("/checkout");
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0],
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev > 0 ? prev - 1 : product.images.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev < product.images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 font-sans pb-24">
      
      {/* Top Breadcrumbs */}
      <div className="py-3.5 bg-white shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto">
            <Link href="/" className="hover:text-blue-600 transition-colors shrink-0">
              მთავარი
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            <Link href="#" className="hover:text-blue-600 transition-colors shrink-0">
              ტექნიკა & დრონები
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            <span className="text-gray-900 truncate">{product.title}</span>
          </nav>

          <div className="flex items-center gap-3 text-xs md:text-sm text-gray-500">
            <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">ID: {product.sku}</span>
            <button className="p-2 hover:text-black transition-colors cursor-pointer rounded-lg hover:bg-gray-50">
              <Share2 className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <main className="pt-8 md:pt-12">
        <div className="container mx-auto px-4 lg:px-8 space-y-16">
          
          {/* 2-Column Hero Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left Showcase (Zero Border, Zero Shadow) */}
            <div className="lg:col-span-6 flex gap-4">
              
              {/* Vertical Thumbnails */}
              <div className="flex flex-col gap-3 shrink-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-18 h-18 md:w-22 md:h-22 rounded-xl p-1.5 shrink-0 overflow-hidden cursor-pointer transition-colors bg-[#F8FAFD] ${
                      selectedImage === idx 
                        ? "ring-2 ring-blue-600 opacity-100" 
                        : "opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>

              {/* Main Photo Box */}
              <div className="relative flex-1 h-[420px] md:h-[500px] bg-[#F8FAFD] rounded-2xl p-8 flex items-center justify-center overflow-hidden group">
                
                {/* Discount Badge */}
                {product.discountPercentage && (
                  <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs md:text-sm px-3 py-1 rounded-lg">
                    -{product.discountPercentage}% ფასდაკლება
                  </div>
                )}

                {/* Wishlist Button */}
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`absolute top-4 right-4 z-10 p-3 rounded-full cursor-pointer transition-colors bg-white ${
                    isLiked ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-red-500"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500" : ""}`} />
                </button>

                {/* Slider Next/Prev Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 z-10 p-3 rounded-full bg-white text-gray-700 hover:bg-gray-100 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 z-10 p-3 rounded-full bg-white text-gray-700 hover:bg-gray-100 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                <img
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
            </div>

            {/* Right Information & Order Panel */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Header Info */}
              <div className="space-y-3 pb-6 border-b border-gray-100">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="bg-blue-50 text-blue-700 px-3.5 py-1 rounded-lg">
                    ბრენდი: {product.brand}
                  </span>
                  <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>მარაგშია • მზადაა გასაგზავნად</span>
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 leading-snug tracking-tight">
                  {product.title}
                </h1>

                <div className="flex items-center gap-3 text-xs md:text-sm text-gray-500 pt-1 flex-wrap">
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                    <span className="text-gray-400">({product.reviewCount} შეფასება)</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">ID / კოდი: {product.sku}</span>
                  <span className="text-gray-300">|</span>
                  <span>მოდელი: {product.modelPn}</span>
                </div>
              </div>

              {/* Price & Soft Shadow Card */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
                
                <div className="space-y-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl md:text-4xl lg:text-5xl text-gray-900 tracking-tight">
                      {currentPrice.toFixed(2)} ₾
                    </span>
                    {product.discountPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        {product.price.toFixed(2)} ₾
                      </span>
                    )}
                  </div>

                  {product.monthlyInstallment && (
                    <div className="bg-[#F4F6FB] text-gray-800 px-4 py-3.5 rounded-xl text-xs md:text-sm flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Moon className="w-4.5 h-4.5 text-blue-600" />
                        <span>0%-იანი ონლაინ განვადება</span>
                      </div>
                      <span className="text-blue-700 text-sm md:text-base">
                        თვეში {product.monthlyInstallment} ₾-დან
                      </span>
                    </div>
                  )}
                </div>

                {/* Borderless Buttons (Clean Soft Tint Backgrounds) */}
                <div className="space-y-3.5 pt-2">
                  {/* Primary Blue Action Button */}
                  <button
                    onClick={handleQuickBuy}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-base flex items-center justify-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <Zap className="w-5 h-5" />
                    <span>სწრაფი ყიდვა</span>
                  </button>

                  {/* Secondary Borderless Soft Buttons */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      onClick={handleAddToCart}
                      className={`h-13 rounded-xl text-sm md:text-base flex items-center justify-center gap-2.5 cursor-pointer transition-colors ${
                        isAdded
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-[#F1F5F9] hover:bg-[#E2E8F0] text-gray-800"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-5 h-5" />
                          <span>დაემატა</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-5 h-5 text-gray-500" />
                          <span>კალათაში დამატება</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        addToCompare(product.id);
                        router.push("/compare");
                      }}
                      className="h-13 rounded-xl text-sm md:text-base flex items-center justify-center gap-2.5 cursor-pointer transition-colors bg-[#F1F5F9] hover:bg-[#E2E8F0] text-gray-800"
                    >
                      <GitCompare className="w-5 h-5 text-gray-500" />
                      <span>შედარება</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Service Perks Grid (Smooth Shadow Cards) */}
              <div className="grid grid-cols-3 gap-3.5 pt-2 text-xs md:text-sm">
                <div className="p-4 rounded-xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col items-center text-center gap-1.5">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900">უფასო მიწოდება</span>
                  <span className="text-xs text-gray-500">3 საათში თბილისში</span>
                </div>

                <div className="p-4 rounded-xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col items-center text-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900">ოფიციალური</span>
                  <span className="text-xs text-gray-500">1 წლიანი გარანტია</span>
                </div>

                <div className="p-4 rounded-xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col items-center text-center gap-1.5">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900">დაბრუნება</span>
                  <span className="text-xs text-gray-500">14 დღის ვადაში</span>
                </div>
              </div>

            </div>

          </div>

          {/* Technical Specifications Section */}
          <section className="pt-12 border-t border-gray-100 space-y-6">
            <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">
              ტექნიკური მახასიათებლები
            </h2>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-3">
              <div className="divide-y divide-gray-100 text-xs md:text-sm">
                {product.specs.map((spec, idx) => (
                  <div key={idx} className="py-3.5 flex justify-between items-center odd:bg-[#F8FAFD]/70 px-4 rounded-lg">
                    <span className="text-gray-500">{spec.label}</span>
                    <span className="text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Description Section */}
          <section className="pt-8 border-t border-gray-100 space-y-3 text-xs md:text-sm text-gray-600 leading-relaxed">
            <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">
              აღწერა
            </h2>
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <p className="max-w-4xl text-gray-700 leading-relaxed text-sm md:text-base">
                {product.description}
              </p>
            </div>
          </section>

          {/* Related Products Carousel */}
          <section className="pt-10 border-t border-gray-100">
            <h2 className="text-xl md:text-2xl text-gray-900 mb-6">
              მსგავსი პროდუქტები
            </h2>
            <ProductCarousel
              products={[
                { id: "dji-mini-4", title: "დრონი DJI Mini 4 Pro Fly More Combo", price: 3899, discountPrice: 3299, monthlyInstallment: 132, image: "https://veli.store/media-cdn/__sized__/product/DJI-ZM700_20250710210650-thumbnail-200x200-95.jpg", discountPercentage: 15 },
                { id: "dji-pocket-3", title: "სტაბილიზატორი DJI Osmo Pocket 3 Creator Combo", price: 2499, discountPrice: 2199, monthlyInstallment: 88, image: "https://veli.store/media-cdn/__sized__/product/DJI-ZPK300-C1-8_20250710160051-thumbnail-200x200-95.jpg", discountPercentage: 12 },
                { id: "dji-osmo-6", title: "სმარტფონის სტაბილიზატორი DJI Osmo Mobile 6", price: 599, discountPrice: 499, monthlyInstallment: 20, image: "https://veli.store/media-cdn/__sized__/product/DJI_Osmo_Mobile_7P-thumbnail-200x200-95.jpg", discountPercentage: 17 },
                { id: "dji-rc-n3", title: "დისტანციური მართვის პულტი DJI RC-N3 Remote Controller", price: 449, discountPrice: 379, monthlyInstallment: 15, image: "https://veli.store/media-cdn/__sized__/product/DJI_RC-N3-1-thumbnail-200x200-95.jpg", discountPercentage: 15 },
              ]}
            />
          </section>

        </div>
      </main>
    </div>
  );
}
