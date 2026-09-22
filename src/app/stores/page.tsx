export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import Link from "next/link";
import { Store } from "lucide-react";
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
                className="group bg-white rounded-[20px] overflow-hidden border border-gray-100 hover:border-[#FED7CC] transition-colors"
              >
                <div className="h-28 bg-[#EEF0F3] overflow-hidden">
                  {store.coverImage ? (
                    <img src={store.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                  ) : null}
                </div>
                <div className="px-4 pb-4">
                  <div className="w-16 h-16 -mt-8 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                    {store.logo ? (
                      <img src={store.logo} alt={store.name} className="w-full h-full object-contain p-1.5" />
                    ) : (
                      <Store className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <h2 className="mt-3 text-[15px] text-gray-900">{store.name}</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {store.city ? `${store.city} · ` : ""}{store._count.products} პროდუქტი
                  </p>
                  {store.pickupEnabled ? (
                    <p className="mt-1 text-[11px] text-emerald-700">თვითგატანა</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
