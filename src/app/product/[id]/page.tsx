"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useStore } from "@/store/useStore";
import { dataService } from "@/services/dataService";
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

  // Fetch product live data
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

  // Add to cart without opening cart drawer (openCart = false)
  const handleAddToCart = (qty: number = 1) => {
    for (let i = 0; i < qty; i++) {
      addToCart(
        {
          id: product.id,
          title: product.title,
          price: product.price,
          discountPrice: product.discountPrice,
          image: product.images[0] || product.image || "",
        },
        false
      );
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleOpenQuickBuy = (qty: number = 1) => {
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
    <div className="bg-white min-h-screen pb-24">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation Bar */}
      <div className="bg-gray-50/80 border-b border-gray-100 py-3">
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
            <Link href="/" className="hover:text-blue-600 transition-colors">მთავარი</Link>
            <ChevronRight className="size-3.5" />
            <Link href="/catalog" className="hover:text-blue-600 transition-colors">კატალოგი</Link>
            {product.categoryName && (
              <>
                <ChevronRight className="size-3.5" />
                <Link href={`/catalog?category=${product.categoryId}`} className="hover:text-blue-600 transition-colors">
                  {product.categoryName}
                </Link>
              </>
            )}
            <ChevronRight className="size-3.5" />
            <span className="text-gray-900 truncate max-w-xs">{product.title}</span>
          </nav>

          <Link
            href="/catalog"
            className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors shrink-0"
          >
            <ArrowLeft className="size-3.5" /> უკან კატალოგში
          </Link>
        </div>
      </div>

      {/* Main Showcase Layout */}
      <div className="container mx-auto px-4 lg:px-8 pt-6 md:pt-10">
        
        {/* Top Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left: Sticky Media Gallery */}
          <div className="lg:col-span-7">
            <ProductGalleryPro
              images={product.images}
              title={product.title}
              discountPercentage={product.discountPercentage}
              isHot={product.isHot}
            />
          </div>

          {/* Right: Purchase Panel & Installment Hub */}
          <div className="lg:col-span-5">
            <ProductPurchasePanel
              product={{
                id: product.id,
                title: product.title,
                brandName: product.brandName,
                stock: product.stock,
                sku: product.sku,
                code: product.code,
                price: product.price,
                discountPrice: product.discountPrice,
                images: product.images,
                variants: product.variants,
              }}
              isLiked={isLiked}
              isCompared={isCompared}
              isAdded={isAdded}
              onToggleWishlist={() => toggleWishlist({
                id: product.id,
                title: product.title,
                price: product.price,
                discountPrice: product.discountPrice,
                image: product.images[0] || "",
              })}
              onToggleCompare={() => toggleCompare(product.id)}
              onAddToCart={handleAddToCart}
              onOpenQuickBuy={handleOpenQuickBuy}
            />
          </div>

        </div>

        {/* Sticky Underline Tabs: Specs, Description, Delivery & FAQ */}
        <div id="product-tabs" className="mt-8">
          <ProductSpecsAndTabs
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
