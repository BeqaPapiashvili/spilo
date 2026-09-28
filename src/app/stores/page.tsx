export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MapPin, Package, Store } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "მაღაზიები - ონლაინ მარკეტპლეისი",
  description: "პარტნიორი მაღაზიები და მათი პროდუქცია ერთ სივრცეში",
};

export default async function StoresPage() {
  const stores = await prisma.store.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          products: { where: { status: "PUBLISHED", isApproved: true } },
        },
      },
    },
  });

  return (
    <div className="bg-[#F4F5F7] min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1560px] space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight">მაღაზიები</h1>
          <p className="mt-1 text-sm text-gray-500">პარტნიორი მაღაზიები და მათი პროდუქცია</p>
        </div>

        {stores.length === 0 ? (
          <div className="bg-white rounded-[24px] py-20 text-center">
            <Store className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="mt-3 text-sm text-gray-600">მაღაზიები ჯერ არ არის დამატებული</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stores.map((store) => (
              <Link
                key={store.id}
                href={`/stores/${store.slug}`}
                className="group flex flex-col bg-white rounded-[24px] p-2.5 ring-1 ring-black/[0.04] hover:ring-black/[0.08] transition-all duration-300"
              >
                <div className="relative h-32 rounded-[18px] overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-50">
                  {store.coverImage ? (
                    <img
                      src={store.coverImage}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-8 h-8 text-zinc-300" />
                    </div>
                  )}
                  {store.pickupEnabled ? (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/95 text-[11px] text-emerald-700">
                      თვითგატანა
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-3 px-2 pt-3.5 pb-2">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-white ring-1 ring-black/[0.06] overflow-hidden flex items-center justify-center">
                    {store.logo ? (
                      <img src={store.logo} alt={store.name} className="w-full h-full object-contain p-1.5" />
                    ) : (
                      <span className="text-sm text-zinc-500">{store.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[15px] text-gray-900 truncate">{store.name}</h2>
                    <div className="mt-0.5 flex items-center gap-2.5 text-xs text-gray-500">
                      {store.city ? (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{store.city}</span>
                        </span>
                      ) : null}
                      <span className="flex items-center gap-1 shrink-0">
                        <Package className="w-3 h-3" />
                        {store._count.products} პროდუქტი
                      </span>
                    </div>
                  </div>
                  <span className="w-8 h-8 shrink-0 rounded-full bg-zinc-50 group-hover:bg-[#FF5238] text-zinc-400 group-hover:text-white flex items-center justify-center transition-colors duration-300">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
