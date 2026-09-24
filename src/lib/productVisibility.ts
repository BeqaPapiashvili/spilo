export const PUBLIC_PRODUCT_WHERE = {
  status: { not: "PENDING_REVIEW" },
  isApproved: { not: false },
};

export function isPublicProduct(product: {
  status?: string | null;
  isApproved?: boolean | null;
}): boolean {
  if (product.status === "PENDING_REVIEW") return false;
  if (product.isApproved === false) return false;
  return true;
}
