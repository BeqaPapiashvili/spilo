"use client";

import React, { Suspense } from "react";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <Suspense fallback={null}>
      <ProductForm isEdit={false} />
    </Suspense>
  );
}
