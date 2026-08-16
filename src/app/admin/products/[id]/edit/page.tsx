"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { Product } from "@/types";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditPageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
        const json = await res.json();
        if (isMounted) {
          if (json.success && json.data) {
            setProduct(json.data);
          } else {
            setProduct(null);
          }
        }
      } catch (err) {
        console.error("EditProductPage: Failed to fetch product:", err);
        if (isMounted) setProduct(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 p-6 bg-white rounded-2xl border border-gray-200">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <p className="text-xs text-gray-500">იტვირთება პროდუქტის მონაცემები...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 text-center p-6 bg-white rounded-2xl border border-gray-200">
        <h2 className="text-xl text-gray-900">პროდუქტი ვერ მოიძებნა (ID: {id})</h2>
        <Link href="/admin/products" className="text-xs text-blue-600 hover:underline">
          უკან პროდუქტების სიაში
        </Link>
      </div>
    );
  }

  return <ProductForm initialProduct={product} isEdit={true} />;
}
