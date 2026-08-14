"use client";

import React, { use } from "react";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { dataService } from "@/services/dataService";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditPageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const product = dataService.getProductById(id);

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 text-center p-6 bg-white rounded-2xl border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">პროდუქტი ვერ მოიძებნა (ID: {id})</h2>
        <Link href="/admin/products" className="text-xs text-blue-600 font-semibold hover:underline">
          უკან პროდუქტების სიაში
        </Link>
      </div>
    );
  }

  return <ProductForm initialProduct={product} isEdit={true} />;
}
