"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Product } from "@/types";
import { RecentlyViewedCarousel } from "@/components/RecentlyViewedCarousel";
import { ProductDetailSkeleton } from "@/components/skeletons/ProductDetailSkeleton";

// Pro Product Page Components
import { ProductGalleryPro } from "@/components/product/ProductGalleryPro";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductSpecsAndTabs } from "@/components/product/ProductSpecsAndTabs";
import { ProductMobileStickyBar } from "@/components/product/ProductMobileStickyBar";
import { QuickBuyModal } from "@/components/product/QuickBuyModal";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    toggleCompare, 
    compareList, 
    addRecentlyViewed 
  } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Buy Modal State
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false);
  const [quickBuyQty, setQuickBuyQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Fetch product live from database
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(resolvedParams.id)}`);
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setProduct(json.data);
        } else if (isMounted) {
          setProduct(null);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        if (isMounted) setProduct(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id]);

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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50/50 py-8">
        <ProductDetailSkeleton />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] py-20">
        <div className="container mx-auto px-4 text-center space-y-4">
          <h1 className="text-2xl text-gray-900">პროდუქტი ვერ მოიძებნა</h1>
          <p className="text-xs sm:text-sm text-gray-500">მოცემული პროდუქტი არ არსებობს ან წაშლილია</p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>კატალოგში დაბრუნება</span>
          </Link>
        </div>
      </main>
    );
  }

  const isLiked = isInWishlist(product.id);
  const isCompared = compareList.includes(product.id);
  const currentPrice = product.discountPrice || product.price;

  // Add to cart without opening cart drawer (openCart = false)
  const handleAddToCart = (qty: number = 1, options?: { color?: string; storage?: string; hasExtraProtection?: boolean; unitPrice?: number }) => {
    const finalPrice = options?.unitPrice ? options.unitPrice : product.price + (options?.hasExtraProtection ? 29 : 0);
    const finalDiscountPrice = product.discountPrice ? (product.discountPrice + (options?.hasExtraProtection ? 29 : 0)) : undefined;

    for (let i = 0; i < qty; i++) {
      addToCart(
        {
          id: product.id,
          title: product.title,
          price: finalPrice,
          discountPrice: finalDiscountPrice,
          image: product.images[0] || product.image || "",
          color: options?.color,
          storage: options?.storage,
          extraProtection: options?.hasExtraProtection,
        },
        false
      );
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleOpenQuickBuy = (qty: number = 1, options?: { color?: string; storage?: string; hasExtraProtection?: boolean; unitPrice?: number }) => {
    setQuickBuyQty(qty);
    setIsQuickBuyOpen(true);
  };

  // Schema.org Product structured data for SEO
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
      price: currentPrice,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Spilo E-Commerce",
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-gray-900 font-sans pb-24 md:pb-16">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Breadcrumbs Navigation */}
      <div className="py-3.5 bg-white border-b border-gray-100 mb-6">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <nav className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              მთავარი
            </Link>
            <ChevronRight className="size-3.5 text-gray-300 shrink-0" />
            <Link href="/catalog" className="hover:text-blue-600 transition-colors">
              კატალოგი
            </Link>
            {product.categoryName && (
              <>
                <ChevronRight className="size-3.5 text-gray-300 shrink-0" />
                <Link
                  href={`/catalog?category=${product.categoryId}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {product.categoryName}
                </Link>
              </>
            )}
            <ChevronRight className="size-3.5 text-gray-300 shrink-0" />
            <span className="text-gray-900 truncate max-w-[200px]">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        {/* Back Link */}
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>უკან დაბრუნება</span>
          </button>
        </div>

        {/* 2-Column Product Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start bg-white rounded-3xl p-6 lg:p-10 border border-gray-200/60 shadow-2xs">
          {/* Left Column: Pro Media Carousel */}
          <div className="lg:col-span-7">
            <ProductGalleryPro
              images={product.images && product.images.length > 0 ? product.images : [product.image || ""]}
              title={product.title}
              discountPercentage={product.discountPercentage}
            />
          </div>

          {/* Right Column: Dynamic Price, Bank Installment & Pro Purchase Panel */}
          <div className="lg:col-span-5">
            <ProductPurchasePanel
              product={product}
              isLiked={isLiked}
              isCompared={isCompared}
              isAdded={isAdded}
              onToggleWishlist={() =>
                toggleWishlist({
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  discountPrice: product.discountPrice,
                  monthlyInstallment: product.monthlyInstallment,
                  image: product.images[0] || product.image || "",
                  discountPercentage: product.discountPercentage,
                })
              }
              onToggleCompare={() => toggleCompare(product.id)}
              onAddToCart={handleAddToCart}
              onOpenQuickBuy={handleOpenQuickBuy}
            />
          </div>
        </div>

        {/* Sticky Underline Tabs: Specs, Description, Delivery & FAQ */}
        <div id="product-tabs" className="mt-8">
          <ProductSpecsAndTabs
            productId={product.id}
            specs={product.specs}
            description={product.description}
            warrantyMonths={product.warrantyMonths}
          />
        </div>

        {/* Recently Viewed Items */}
        <RecentlyViewedCarousel />
      </div>

      {/* Floating Mobile Bottom Purchase Bar */}
      <ProductMobileStickyBar
        title={product.title}
        price={currentPrice}
        isAdded={isAdded}
        stock={product.stock}
        onOpenQuickBuy={() => handleOpenQuickBuy(1)}
        onAddToCart={() => handleAddToCart(1)}
      />

      {/* 1-Click Quick Purchase Modal */}
      <QuickBuyModal
        isOpen={isQuickBuyOpen}
        onClose={() => setIsQuickBuyOpen(false)}
        product={{
          id: product.id,
          title: product.title,
          price: product.price,
          discountPrice: product.discountPrice,
          image: product.images[0] || product.image || "",
        }}
        quantity={quickBuyQty}
      />
    </div>
  );
}
