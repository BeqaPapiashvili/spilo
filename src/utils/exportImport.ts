import { Product } from "@/types";

export interface ParsedProduct extends Partial<Product> {
  title: string;
  price: number;
}

/**
 * Download text content as a file with proper UTF-8 BOM for Excel Georgian support
 */
export function downloadFile(filename: string, content: string, mimeType = "text/csv;charset=utf-8;") {
  const blob = new Blob(["\uFEFF" + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape cell for CSV format
 */
function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export Products to CSV
 */
export function exportProductsToCSV(products: Product[]) {
  const headers = ["ID", "სათაური", "SKU", "კატეგორია", "ბრენდი", "ფასი", "ფასდაკლებული ფასი", "მარაგი", "სურათის URL", "აღწერა"];
  
  const rows = products.map(p => [
    p.id,
    p.title,
    p.sku || p.code || "",
    p.categoryName || p.categoryId || "",
    p.brandName || p.brandId || "",
    p.price,
    p.discountPrice || "",
    p.stock,
    p.images?.[0] || "",
    (p.description || "").replace(/\n/g, " "),
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map(row => row.map(escapeCSV).join(","))
  ].join("\n");

  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(`spilo-products-${dateStr}.csv`, csvContent);
}

/**
 * Export Orders to CSV (accepts Store Orders or DB Orders)
 */
export function exportOrdersToCSV(orders: any[]) {
  const headers = ["შეკვეთა ID", "თარიღი", "თანხა (₾)", "სტატუსი", "გადახდის მეთოდი", "მისამართი", "ტელეფონი", "პროდუქტების რაოდენობა"];

  const rows = orders.map(o => [
    o.id,
    o.date || o.createdAt || "",
    o.totalAmount,
    o.status,
    o.paymentMethod,
    o.shippingAddress || o.address || "",
    o.contactPhone || o.phone || "",
    o.items?.length || 0,
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map(row => row.map(escapeCSV).join(","))
  ].join("\n");

  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(`spilo-orders-${dateStr}.csv`, csvContent);
}

/**
 * Generate a Sample CSV Template for importing products
 */
export function generateSampleProductsCSV(): string {
  const headers = ["სათაური", "SKU", "ფასი", "ფასდაკლებული_ფასი", "მარაგი", "კატეგორია_ID", "ბრენდი_ID", "სურათი_URL", "აღწერა"];
  
  const sampleRows = [
    [
      "iPhone 16 Pro 128GB Desert Titanium",
      "IPHONE-16-128",
      "3499",
      "3299",
      "15",
      "mobiles",
      "apple",
      "https://veli.store/media-cdn/__sized__/product/iphone16pro-thumbnail-200x200-95.jpg",
      "ახალი თაობის Apple ფლაგმანი A18 Pro ჩიპით და ტიტანის კორპუსით"
    ],
    [
      "Samsung Galaxy S24 Ultra 256GB Titanium Gray",
      "SAMSUNG-S24U-256",
      "3899",
      "",
      "8",
      "mobiles",
      "samsung",
      "https://veli.store/media-cdn/__sized__/product/s24ultra-thumbnail-200x200-95.jpg",
      "Galaxy AI და 200MP პროფესიონალური კამერა"
    ]
  ];

  return [
    headers.map(escapeCSV).join(","),
    ...sampleRows.map(row => row.map(escapeCSV).join(","))
  ].join("\n");
}

/**
 * Parse CSV text into Product objects
 */
export function parseProductsCSV(csvText: string): { products: ParsedProduct[]; errors: string[] } {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return { products: [], errors: ["ფაილი ცარიელია ან სათაურების ხაზი აკლია"] };
  }

  const products: ParsedProduct[] = [];
  const errors: string[] = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(line))) {
      let val = match[1] || "";
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      matches.push(val.trim());
      if (match.index === regex.lastIndex) regex.lastIndex++;
    }

    if (matches.length > 0 && matches[matches.length - 1] === "") {
      matches.pop();
    }

    const [title, sku, priceStr, discountPriceStr, stockStr, categoryId, brandId, imageUrl, description] = matches;

    if (!title) {
      errors.push(`ხაზი #${i + 1}: სათაური სავალდებულოა`);
      continue;
    }

    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) {
      errors.push(`ხაზი #${i + 1} (${title}): არასწორი ფასი "${priceStr}"`);
      continue;
    }

    const discountPrice = discountPriceStr ? parseFloat(discountPriceStr) : undefined;
    const stock = stockStr ? parseInt(stockStr, 10) : 10;

    products.push({
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9ge]/g, "-").replace(/-+/g, "-") + `-${Date.now().toString().slice(-4)}`,
      sku: sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
      price,
      discountPrice: discountPrice && !isNaN(discountPrice) ? discountPrice : undefined,
      stock: !isNaN(stock) ? stock : 10,
      categoryId: categoryId || "mobiles",
      brandId: brandId || "apple",
      images: imageUrl ? [imageUrl] : ["https://veli.store/media-cdn/__sized__/product/iphone16pro-thumbnail-200x200-95.jpg"],
      description: description || "პროდუქტის დეტალური აღწერა",
      isFeatured: true,
      rating: 5,
      reviewCount: 1,
    });
  }

  return { products, errors };
}
