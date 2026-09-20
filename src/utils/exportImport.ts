import * as XLSX from "xlsx";
import { Product, SpecGroup } from "@/types";

export interface ParsedImportProduct {
  id: string; // unique client id for keying
  rowIndex: number;
  selected: boolean;
  isValid: boolean;
  validationErrors: string[];

  // Core Product info
  title: string;
  sku: string;
  price: number;
  costPrice?: number;
  stock: number;
  categoryName: string;
  brandName: string;
  description: string;
  colorName?: string;

  // Images
  mainImage: string;
  additionalImages: string[];
  allImages: string[];

  // Structured specifications (matches Spilo SpecGroup[] model)
  specs: SpecGroup[];

  // Raw attributes for preview inspection
  rawAttributes: {
    barcode?: string;
    modelNumber?: string;
    model?: string;
    numberOfSpeeds?: string;
    size?: string;
    packageContents?: string;
    weight?: string;
    height?: string;
    country?: string;
  };
}

/**
 * Downloads a file in browser
 */
export function downloadFile(filename: string, content: string | Uint8Array, mimeType = "text/csv;charset=utf-8;") {
  const blob = typeof content === "string" 
    ? new Blob(["\uFEFF" + content], { type: mimeType })
    : new Blob([content as any], { type: mimeType });
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
 * Standard 23 Headers in Georgian & Latin
 */
export const TEMPLATE_HEADERS_GE = [
  "კატეგორია", "SKU", "პროდუქტის დასახელება", "მთავარი ფოტო", "პროდუქტის აღწერა",
  "ბარკოდი", "მოდელის ნომერი", "ფოტო - 1", "ფოტო - 2", "ფოტო - 3", "ფოტო - 4",
  "ბრენდი", "ფერი", "მოდელი", "სიჩქარეების რაოდენობა", "ფიზიკური ზომა",
  "კომპლექტაცია", "ფიზიკური წონა", "სიმაღლე", "მწარმოებელი ქვეყანა",
  "ასაღები ფასი", "გასაყიდი ფასი", "მარაგი"
];

export const TEMPLATE_HEADERS_EN = [
  "product_category", "shop_sku", "product_title", "product_image", "product_description",
  "barcode", "model_number", "product_image_1", "product_image_2", "product_image_3", "product_image_4",
  "brand", "color", "model", "number_of_speeds", "size",
  "package_contents", "wight", "height", "country_of_manufacture",
  "purchase_price", "retail_price", "margin"
];

/**
 * Generate official Sample Excel Workbook (.xlsx)
 */
export function generateSampleExcelWorkbook(): Uint8Array {
  const sampleRow1 = [
    "მობილურები", "APL-IPH16P-128", "Apple iPhone 16 Pro 128GB Black Titanium",
    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&q=80",
    "ახალი თაობის ფლაგმანი სმარტფონი A18 Pro ჩიპით და ტიტანის კორპუსით.",
    "0195949038241", "A3106",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&q=80",
    "", "",
    "Apple", "Black Titanium", "iPhone 16 Pro", "",
    "146.6 x 70.6 x 8.25 მმ", "სმარტფონი, USB-C კაბელი, დოკუმენტაცია",
    "199 გრ", "146.6 მმ", "ჩინეთი",
    2900, 3499, 15
  ];

  const sampleRow2 = [
    "მობილურები", "SMS-S24U-256", "Samsung Galaxy S24 Ultra 256GB Titanium Gray",
    "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80",
    "Galaxy AI ინოვაცია და 200MP პროფესიონალური კამერა.",
    "8806095311234", "SM-S928B",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&q=80",
    "", "", "",
    "Samsung", "Titanium Gray", "Galaxy S24 Ultra", "",
    "162.3 x 79.0 x 8.6 მმ", "ტელეფონი, S Pen, კაბელი",
    "232 გრ", "162.3 მმ", "ვიეტნამი",
    3100, 3899, 8
  ];

  const data = [
    TEMPLATE_HEADERS_GE,
    TEMPLATE_HEADERS_EN,
    sampleRow1,
    sampleRow2
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "პროდუქტები");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Uint8Array(wbout);
}

/**
 * Clean and normalize text
 */
function clean(val: any): string {
  if (val === null || val === undefined) return "";
  return String(val).trim();
}

/**
 * Normalizes header string to match aliases regardless of casing or extra characters
 */
function normalizeHeader(str: string): string {
  return str.toLowerCase().replace(/[\s\-_]+/g, "").trim();
}

/**
 * Field alias definitions to locate column index dynamically
 */
const ALIAS_MAP: Record<string, string[]> = {
  category: ["კატეგორია", "productcategory", "category", "categoryname", "კატეგორია_id"],
  sku: ["sku", "shopsku", "არტიკული", "სკუ", "code"],
  title: ["პროდუქტისდასახელება", "producttitle", "title", "სათაური", "სახელი", "დასახელება"],
  image: ["მთავარიფოტო", "productimage", "mainimage", "image", "სურათი", "სურათისurl"],
  description: ["პროდუქტისაღწერა", "productdescription", "description", "აღწერა"],
  barcode: ["ბარკოდი", "barcode", "შტრიხკოდი", "ean", "upc"],
  modelNumber: ["მოდელისნომერი", "modelnumber", "modelno"],
  image1: ["ფოტო1", "ფოტო-1", "productimage1", "image1"],
  image2: ["ფოტო2", "ფოტო-2", "productimage2", "image2"],
  image3: ["ფოტო3", "ფოტო-3", "productimage3", "image3"],
  image4: ["ფოტო4", "ფოტო-4", "productimage4", "image4"],
  brand: ["ბრენდი", "brand", "brandname", "ბრენდი_id"],
  color: ["ფერი", "color", "colour"],
  model: ["მოდელი", "model"],
  numberOfSpeeds: ["სიჩქარეებისრაოდენობა", "numberofspeeds", "speeds", "სიჩქარე"],
  size: ["ფიზიკურიზომა", "ზომა", "size", "dimensions"],
  packageContents: ["კომპლექტაცია", "packagecontents", "შეფუთვა"],
  weight: ["ფიზიკურიწონა", "წონა", "wight", "weight"],
  height: ["სიმაღლე", "height"],
  country: ["მწარმოებელიქვეყანა", "ქვეყანა", "countryofmanufacture", "countryoforigin", "country"],
  costPrice: ["ასაღებიფასი", "თვითღირებულება", "purchaseprice", "costprice"],
  price: ["გასაყიდიფასი", "ფასი", "retailprice", "price"],
  stock: ["მარაგი", "ნაშთი", "margin", "stock", "quantity", "qty"],
};

/**
 * Parse an Excel file (.xlsx, .xls) or CSV file into ParsedImportProduct array
 */
export async function parseExcelOrCSV(file: File): Promise<{
  products: ParsedImportProduct[];
  errors: string[];
  totalRows: number;
}> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { products: [], errors: ["ფაილში სამუშაო გვერდი (Sheet) ვერ მოიძებნა"], totalRows: 0 };
  }

  const worksheet = workbook.Sheets[sheetName];
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

  if (!rawRows || rawRows.length === 0) {
    return { products: [], errors: ["ფაილი ცარიელია"], totalRows: 0 };
  }

  // Detect which row contains headers and locate column indices
  let headerRowIndex = 0;
  let dataStartIndex = 1;

  // Check if row 0 or row 1 contains headers
  const colMap: Record<string, number> = {};

  const findColumns = (row: any[]) => {
    const map: Record<string, number> = {};
    row.forEach((cell, idx) => {
      const norm = normalizeHeader(clean(cell));
      if (!norm) return;
      for (const [key, aliases] of Object.entries(ALIAS_MAP)) {
        if (map[key] === undefined && aliases.some(a => normalizeHeader(a) === norm)) {
          map[key] = idx;
        }
      }
    });
    return map;
  };

  const map0 = findColumns(rawRows[0] || []);
  let foundKeys0 = Object.keys(map0).length;

  let map1: Record<string, number> = {};
  if (rawRows.length > 1) {
    map1 = findColumns(rawRows[1] || []);
  }
  let foundKeys1 = Object.keys(map1).length;

  // Merge map0 and map1
  const mergedMap: Record<string, number> = { ...map0, ...map1 };

  // If row 1 was also a header (e.g. Row 0 Georgian, Row 1 Latin), data starts at row 2
  if (foundKeys0 >= 3 && foundKeys1 >= 3) {
    dataStartIndex = 2;
  } else if (foundKeys0 >= 3) {
    dataStartIndex = 1;
  } else if (foundKeys1 >= 3) {
    dataStartIndex = 2;
  } else {
    // Fallback: positional indices 0 to 22
    mergedMap.category = 0;
    mergedMap.sku = 1;
    mergedMap.title = 2;
    mergedMap.image = 3;
    mergedMap.description = 4;
    mergedMap.barcode = 5;
    mergedMap.modelNumber = 6;
    mergedMap.image1 = 7;
    mergedMap.image2 = 8;
    mergedMap.image3 = 9;
    mergedMap.image4 = 10;
    mergedMap.brand = 11;
    mergedMap.color = 12;
    mergedMap.model = 13;
    mergedMap.numberOfSpeeds = 14;
    mergedMap.size = 15;
    mergedMap.packageContents = 16;
    mergedMap.weight = 17;
    mergedMap.height = 18;
    mergedMap.country = 19;
    mergedMap.costPrice = 20;
    mergedMap.price = 21;
    mergedMap.stock = 22;
    dataStartIndex = 2;
  }

  const products: ParsedImportProduct[] = [];
  const errors: string[] = [];

  for (let r = dataStartIndex; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.every(cell => clean(cell) === "")) {
      continue; // Skip empty rows
    }

    const getVal = (key: string): string => {
      const idx = mergedMap[key];
      if (idx === undefined || idx < 0 || idx >= row.length) return "";
      return clean(row[idx]);
    };

    const title = getVal("title");
    const sku = getVal("sku") || `SKU-${Date.now().toString().slice(-6)}-${r}`;
    const priceStr = getVal("price").replace(/[^\d.]/g, "");
    const costPriceStr = getVal("costPrice").replace(/[^\d.]/g, "");
    const stockStr = getVal("stock").replace(/[^\d]/g, "");

    const categoryName = getVal("category") || "სხვა";
    const brandName = getVal("brand") || "სხვა";
    const description = getVal("description");
    const mainImage = getVal("image");
    const img1 = getVal("image1");
    const img2 = getVal("image2");
    const img3 = getVal("image3");
    const img4 = getVal("image4");
    const color = getVal("color");

    const barcode = getVal("barcode");
    const modelNumber = getVal("modelNumber");
    const model = getVal("model");
    const numberOfSpeeds = getVal("numberOfSpeeds");
    const size = getVal("size");
    const packageContents = getVal("packageContents");
    const weight = getVal("weight");
    const height = getVal("height");
    const country = getVal("country");

    const rowErrors: string[] = [];

    if (!title) {
      rowErrors.push("სათაური აკლია");
    }

    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) {
      rowErrors.push(`ფასი არასწორია (${getVal("price") || "ცარიელია"})`);
    }

    const costPrice = costPriceStr ? parseFloat(costPriceStr) : undefined;
    const stock = stockStr ? parseInt(stockStr, 10) : 10;

    // Collect images
    const additionalImages = [img1, img2, img3, img4].filter(Boolean);
    const allImages = [mainImage, ...additionalImages].filter(Boolean);
    if (allImages.length === 0) {
      allImages.push("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80");
    }

    // Build structured Spilo SpecGroup[]
    const generalItems = [
      brandName ? { label: "ბრენდი", value: brandName } : null,
      model ? { label: "მოდელი", value: model } : null,
      modelNumber ? { label: "მოდელის ნომერი", value: modelNumber } : null,
      color ? { label: "ფერი", value: color } : null,
      barcode ? { label: "ბარკოდი", value: barcode } : null,
      country ? { label: "მწარმოებელი ქვეყანა", value: country } : null,
    ].filter(Boolean) as { label: string; value: string }[];

    const physicalItems = [
      size ? { label: "ფიზიკური ზომა", value: size } : null,
      height ? { label: "სიმაღლე", value: height } : null,
      weight ? { label: "ფიზიკური წონა", value: weight } : null,
    ].filter(Boolean) as { label: string; value: string }[];

    const extraItems = [
      numberOfSpeeds ? { label: "სიჩქარეების რაოდენობა", value: numberOfSpeeds } : null,
      packageContents ? { label: "კომპლექტაცია", value: packageContents } : null,
    ].filter(Boolean) as { label: string; value: string }[];

    const specs: SpecGroup[] = [];
    if (generalItems.length > 0) {
      specs.push({ title: "ძირითადი მახასიათებლები", items: generalItems });
    }
    if (physicalItems.length > 0) {
      specs.push({ title: "ფიზიკური პარამეტრები", items: physicalItems });
    }
    if (extraItems.length > 0) {
      specs.push({ title: "დამატებითი ფუნქციები", items: extraItems });
    }

    const isValid = rowErrors.length === 0;
    if (!isValid) {
      errors.push(`ხაზი #${r + 1}: ${rowErrors.join(", ")}`);
    }

    products.push({
      id: `row-${r}-${sku}`,
      rowIndex: r + 1,
      selected: isValid,
      isValid,
      validationErrors: rowErrors,
      title: title || "უსათაურო პროდუქტი",
      sku,
      price: !isNaN(price) ? price : 0,
      costPrice: costPrice && !isNaN(costPrice) ? costPrice : undefined,
      stock: !isNaN(stock) ? stock : 10,
      categoryName,
      brandName,
      description: description || `${title} - დეტალური ინფორმაცია`,
      colorName: color || undefined,
      mainImage: mainImage || allImages[0],
      additionalImages,
      allImages,
      specs,
      rawAttributes: {
        barcode,
        modelNumber,
        model,
        numberOfSpeeds,
        size,
        packageContents,
        weight,
        height,
        country,
      },
    });
  }

  return {
    products,
    errors,
    totalRows: products.length,
  };
}

/**
 * Legacy CSV parser for backward compatibility
 */
export function parseProductsCSV(csvText: string) {
  // Convert text string to uint8array and pass through xlsx
  const encoder = new TextEncoder();
  const data = encoder.encode(csvText);
  const workbook = XLSX.read(data, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

  const products: any[] = [];
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || !clean(row[0])) continue;
    const title = clean(row[0]);
    const price = parseFloat(clean(row[2]));
    products.push({
      title,
      sku: clean(row[1]) || `SKU-${Date.now()}-${i}`,
      price: !isNaN(price) ? price : 100,
      stock: parseInt(clean(row[4])) || 10,
      categoryId: clean(row[5]) || "mobiles",
      brandId: clean(row[6]) || "apple",
      images: [clean(row[7]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"],
      description: clean(row[8]) || "",
    });
  }

  return { products, errors };
}

/**
 * Export Products to CSV with Georgian BOM
 */
export function exportProductsToCSV(products: Product[]) {
  const headers = ["ID", "სათაური", "SKU", "კატეგორია", "ბრენდი", "ფასი", "თვითღირებულება", "მარაგი", "სურათი", "აღწერა"];
  const rows = products.map(p => [
    p.id,
    p.title,
    p.sku || p.code || "",
    p.categoryName || p.categoryId || "",
    p.brandName || p.brandId || "",
    p.price,
    p.costPrice || "",
    p.stock,
    p.images?.[0] || "",
    (p.description || "").replace(/\n/g, " "),
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(`spilo-products-${dateStr}.csv`, csv);
}

/**
 * Export Orders to CSV
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

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(`spilo-orders-${dateStr}.csv`, csv);
}
