export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ExternalLink, Globe, Mail, MapPin, Phone, Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { StoreCatalogControls } from "@/components/store/StoreCatalogControls";
import { getStoreOpenState, storeMapEmbedSrc, storeMapLink } from "@/lib/storeHours";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
};

function parseImages(images: unknown): string[] {
  if (Array.isArray(images)) return images.filter((item): item is string => typeof item === "string" && Boolean(item));
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [images];
    } catch {
      return images ? [images] : [];
    }
  }
  return [];
}

async function getStore(slug: string) {
  return prisma.store.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: "PUBLISHED", isApproved: true },
        orderBy: { createdAt: "desc" },
        include: { category: { select: { id: true, name: true } } },
      },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await prisma.store.findUnique({
    where: { slug },
    select: { name: true, description: true, logo: true, isActive: true },
  });

  if (!store || !store.isActive) {
    return { title: "მაღაზია ვერ მოიძებნა" };
  }

  return {
    title: `${store.name} - ონლაინ მაღაზია`,
    description: store.description || `${store.name} - პარტნიორი მაღაზია ჩვენს მარკეტპლეისზე`,
    openGraph: {
      title: `${store.name} - ონლაინ მაღაზია`,
      description: store.description || undefined,
      images: store.logo ? [{ url: store.logo }] : undefined,
    },
  };
}

export default async function StoreDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const filters = await searchParams;
  const store = await getStore(slug);

  if (!store || !store.isActive) {
    notFound();
  }

  const query = String(filters.q || "").trim().toLowerCase();
  const category = String(filters.category || "");
  const sort = String(filters.sort || "newest");

  let products = store.products;
  if (query) {
    products = products.filter((product) => product.title.toLowerCase().includes(query));
  }
  if (category) {
    products = products.filter((product) => product.categoryId === category || product.category?.id === category);
  }
  if (sort === "price_asc") {
    products = [...products].sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    products = [...products].sort((a, b) => b.price - a.price);
  }

  const openState = getStoreOpenState(store.workingHours);
  const mapSrc = storeMapEmbedSrc(store.mapUrl, store.address, store.city, store.latitude, store.longitude);
  const mapLink = storeMapLink(store.mapUrl, store.latitude, store.longitude);
  const showRails = !query && !category;
  const featured = store.products.filter((product) => product.isFeatured).slice(0, 4);
  const sale = store.products.filter((product) => Boolean(product.discountPrice)).slice(0, 4);
  const newest = store.products.slice(0, 4);

  const categories = Array.from(
    new Map(
      store.products
        .filter((product) => product.category)
        .map((product) => [product.category.id, { id: product.category.id, name: product.category.name }])
    ).values()
  );

  return (
    <div className="bg-[#F4F5F7] min-h-screen pb-16">
      <div className="relative h-48 md:h-64 bg-[#E6E8EC]">
        {store.coverImage ? (
          <img src={store.coverImage} alt="" className="w-full h-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
        <div className="bg-white rounded-[24px] -mt-10 md:-mt-14 relative px-5 py-6 md:px-8 md:py-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white border-[3px] border-white shadow-[0_4px_18px_rgba(17,17,17,0.08)] overflow-hidden flex items-center justify-center -mt-16 md:-mt-20">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="w-full h-full object-contain p-2" />
              ) : (
                <Store className="w-8 h-8 text-gray-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-[28px] text-gray-900 tracking-tight">{store.name}</h1>
                {openState.known && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${openState.isOpen ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {openState.isOpen ? "ახლა ღიაა" : "დახურულია"}
                  </span>
                )}
                {store.pickupEnabled && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFF5F2] text-[#FF5238]">გატანა</span>
                )}
              </div>
              {store.description && <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-3xl">{store.description}</p>}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
                {store.city && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF5238]" />
                    {store.city}
                  </span>
                )}
                {store.address && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF5238]" />
                    {store.address}
                  </span>
                )}
                {store.workingHours && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#FF5238]" />
                    {store.workingHours}
                  </span>
                )}
                {store.email && (
                  <a href={`mailto:${store.email}`} className="inline-flex items-center gap-1.5 hover:text-gray-800">
                    <Mail className="w-3.5 h-3.5 text-[#FF5238]" />
                    {store.email}
                  </a>
                )}
                {mapLink && (
                  <a href={mapLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-gray-800">
                    <ExternalLink className="w-3.5 h-3.5 text-[#FF5238]" />
                    რუკა
                  </a>
                )}
                {store.phone && (
                  <a href={`tel:${store.phone}`} className="inline-flex items-center gap-1.5 hover:text-gray-800">
                    <Phone className="w-3.5 h-3.5 text-[#FF5238]" />
                    {store.phone}
                  </a>
                )}
                {store.websiteUrl && (
                  <a href={store.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-gray-800">
                    <Globe className="w-3.5 h-3.5 text-[#FF5238]" />
                    ვებსაიტი
                  </a>
                )}
                {store.facebookUrl && (
                  <a href={store.facebookUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-gray-800">
                    <ExternalLink className="w-3.5 h-3.5 text-[#FF5238]" />
                    ფეისბუქი
                  </a>
                )}
                {store.instagramUrl && (
                  <a href={store.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-gray-800">
                    <ExternalLink className="w-3.5 h-3.5 text-[#FF5238]" />
                    ინსტაგრამი
                  </a>
                )}
              </div>
              {store.pickupEnabled && store.pickupNote && (
                <p className="mt-3 text-xs text-gray-500">{store.pickupNote}</p>
              )}
            </div>
          </div>
        </div>

        {mapSrc && (
          <div className="mt-4 bg-white rounded-[24px] overflow-hidden h-56">
            <iframe title="store-map" src={mapSrc} className="w-full h-full border-0" loading="lazy" />
          </div>
        )}

        <div className="mt-4 bg-white rounded-2xl px-5 py-3 text-sm text-gray-600">
          ხელმისაწვდომია {products.length} პროდუქტი
        </div>

        {store.products.length > 0 && (
          <div className="mt-4">
            <StoreCatalogControls
              slug={store.slug}
              query={filters.q || ""}
              category={category}
              sort={sort}
              categories={categories}
            />
          </div>
        )}

        {showRails && (featured.length > 0 || sale.length > 0 || newest.length > 0) && (
          <div className="mt-6 space-y-8">
            {featured.length > 0 && (
              <section>
                <h2 className="text-lg text-gray-900 mb-3">რჩეული</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {featured.map((product) => {
                    const images = parseImages(product.images);
                    return (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        price={product.price}
                        discountPrice={product.discountPrice || undefined}
                        monthlyInstallment={product.monthlyInstallment || undefined}
                        image={images[0] || "/placeholder.png"}
                        images={images}
                        stock={product.stock}
                        storeName={store.name}
                        storeSlug={store.slug}
                      />
                    );
                  })}
                </div>
              </section>
            )}
            {sale.length > 0 && (
              <section>
                <h2 className="text-lg text-gray-900 mb-3">ფასდაკლება</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {sale.map((product) => {
                    const images = parseImages(product.images);
                    return (
                      <ProductCard
                        key={`sale-${product.id}`}
                        id={product.id}
                        title={product.title}
                        price={product.price}
                        discountPrice={product.discountPrice || undefined}
                        monthlyInstallment={product.monthlyInstallment || undefined}
                        image={images[0] || "/placeholder.png"}
                        images={images}
                        stock={product.stock}
                        storeName={store.name}
                        storeSlug={store.slug}
                      />
                    );
                  })}
                </div>
              </section>
            )}
            {newest.length > 0 && (
              <section>
                <h2 className="text-lg text-gray-900 mb-3">ახალი</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {newest.map((product) => {
                    const images = parseImages(product.images);
                    return (
                      <ProductCard
                        key={`new-${product.id}`}
                        id={product.id}
                        title={product.title}
                        price={product.price}
                        discountPrice={product.discountPrice || undefined}
                        monthlyInstallment={product.monthlyInstallment || undefined}
                        image={images[0] || "/placeholder.png"}
                        images={images}
                        stock={product.stock}
                        storeName={store.name}
                        storeSlug={store.slug}
                      />
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        <div className="mt-6">
          {products.length === 0 ? (
            <div className="bg-white rounded-[24px] py-20 text-center">
              <Store className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="mt-3 text-sm text-gray-900">
                {store.products.length === 0 ? "ამ მაღაზიაში პროდუქტი ჯერ არ არის" : "ფილტრს პროდუქტი არ ემთხვევა"}
              </p>
              <Link href="/catalog" className="mt-4 inline-flex text-sm text-[#FF5238]">
                კატალოგის ნახვა
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {products.map((product) => {
                const images = parseImages(product.images);
                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    discountPrice={product.discountPrice || undefined}
                    monthlyInstallment={product.monthlyInstallment || undefined}
                    image={images[0] || "/placeholder.png"}
                    images={images}
                    stock={product.stock}
                    storeName={store.name}
                    storeSlug={store.slug}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
