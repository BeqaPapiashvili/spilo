/**
 * Georgian <-> Latin Phonetic Transliteration & E-Commerce Synonym Dictionary
 * Enables seamless search in both Georgian and English.
 */

// Georgian to Latin character mapping
const GEO_TO_LAT_MAP: Record<string, string> = {
  ა: "a",
  ბ: "b",
  გ: "g",
  დ: "d",
  ე: "e",
  ვ: "v",
  ზ: "z",
  თ: "t",
  ი: "i",
  კ: "k",
  ლ: "l",
  მ: "m",
  ნ: "n",
  ო: "o",
  პ: "p",
  ჟ: "zh",
  რ: "r",
  ს: "s",
  ტ: "t",
  უ: "u",
  ფ: "f",
  ქ: "k",
  ღ: "gh",
  ყ: "y",
  შ: "sh",
  ჩ: "ch",
  ც: "ts",
  ძ: "dz",
  წ: "ts",
  ჭ: "ch",
  ხ: "kh",
  ჯ: "j",
  ჰ: "h",
};

// Latin to Georgian character mapping
const LAT_TO_GEO_MAP: Record<string, string> = {
  a: "ა",
  b: "ბ",
  c: "ც",
  d: "დ",
  e: "ე",
  f: "ფ",
  g: "გ",
  h: "ჰ",
  i: "ი",
  j: "ჯ",
  k: "კ",
  l: "ლ",
  m: "მ",
  n: "ნ",
  o: "ო",
  p: "პ",
  q: "ქ",
  r: "რ",
  s: "ს",
  t: "ტ",
  u: "უ",
  v: "ვ",
  w: "ვ",
  x: "ხ",
  y: "ყ",
  z: "ზ",
};

// Multi-character Latin digraphs to Georgian
const LAT_DIGRAPHS: Record<string, string> = {
  sh: "შ",
  ch: "ჩ",
  zh: "ჟ",
  kh: "ხ",
  gh: "ღ",
  ts: "ც",
  dz: "ძ",
  ph: "ფ",
};

/**
 * Transliterates Georgian string to Latin phonetic equivalent
 */
export function geoToLat(text: string): string {
  return text
    .split("")
    .map((char) => GEO_TO_LAT_MAP[char] || char)
    .join("");
}

/**
 * Transliterates Latin string to Georgian phonetic equivalent
 */
export function latToGeo(text: string): string {
  let lower = text.toLowerCase();
  for (const [digraph, geoChar] of Object.entries(LAT_DIGRAPHS)) {
    lower = lower.replaceAll(digraph, geoChar);
  }
  return lower
    .split("")
    .map((char) => LAT_TO_GEO_MAP[char] || char)
    .join("");
}

/**
 * Tech and E-Commerce Synonym Clusters
 */
const SYNONYM_CLUSTERS: string[][] = [
  // Phones & Brands
  ["iphone", "აიფონი", "აიფონ", "apple", "ეფლი", "ეპლი"],
  ["samsung", "სამსუნგი", "სამსუნგ", "galaxy", "გალაქსი"],
  ["xiaomi", "ქსიაომი", "შიაომი", "redmi", "რედმი", "poco", "პოკო"],
  ["google", "გუგლი", "pixel", "პიქსელი", "პიქსელ"],
  ["oneplus", "ვანპლასი", "ვანპლას"],
  ["motorola", "მოტოროლა", "moto"],
  ["phone", "smartphone", "mobile", "ტელეფონი", "სმარტფონი", "მობილური"],

  // Computers & Laptops
  ["laptop", "notebook", "ლეპტოპი", "ნოუთბუქი", "კომპიუტერი", "ნოუტბუქი"],
  ["macbook", "მაკბუქი", "მაკბუკ", "mac", "მაკი", "apple macbook"],
  ["asus", "ასუსი", "rog", "tuf", "zenbook"],
  ["lenovo", "ლენოვო", "thinkpad", "legion", "ideapad"],
  ["dell", "დელი", "xps", "alienware"],
  ["hp", "ეიჩპი", "victus", "omen", "pavilion"],
  ["acer", "ეისერი", "nitro", "predator", "aspire"],

  // Audio & Wearables
  ["headphones", "earbuds", "earphones", "headset", "ყურსასმენი", "ყურსასმენები", "ნაოშნიკი"],
  ["airpods", "აირპოდსი", "აირპოდს", "აირპოდები", "airpod"],
  ["galaxy buds", "გალაქსი ბადსი", "buds"],
  ["speaker", "speakers", "დინამიკი", "დინამიკები", "სპიკერი", "ბლუთუზ დინამიკი"],
  ["jbl", "ჯებეელი", "ჯბლ", "flip", "charge", "boombox"],
  ["marshall", "მარშალი", "მარშალ"],
  ["sony", "სონი", "wh-1000xm", "wf-1000xm"],
  ["watch", "smartwatch", "საათი", "სმარტ საათი", "ჭკვიანი საათი"],
  ["apple watch", "ეფლ ვოჩი", "ეპლ ვოჩი"],

  // Gaming & Drones & Accessories
  ["playstation", "ფლეისთეიშენი", "ფლეისთეიშენ", "ps5", "ps4", "პლეისთეიშენი", "სონი"],
  ["xbox", "იქსბოქსი", "იქსბოქს"],
  ["nintendo", "ნინტენდო", "switch"],
  ["drone", "drones", "დრონი", "დრონები", "კვადროკოპტერი", "dji", "დიჯეი"],
  ["gopro", "გოპრო", "action camera", "ექშენ კამერა"],
  ["mouse", "მაუსი", "თაგვი"],
  ["keyboard", "კლავიატურა"],
  ["tablet", "ipad", "პლანშეტი", "აიპადი", "აიპად", "ტაბლეტი"],
  ["monitor", "მონიტორი", "display", "ეკრანი"],
  ["charger", "დამტენი", "adapter", "ადაპტერი", "ბლოკი", "კაბელი", "cable"],
  ["power bank", "ფაუერ ბანკი", "პაუერ ბანკი", "პორტატული დამტენი"],
  ["case", "ქეისი", "ჩასადები", "შალითა"],
];

export function tokenizeSearchQuery(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/[\s,;:/\\]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

export function isCodeLikeToken(token: string): boolean {
  const value = token.trim();
  if (!value) return false;
  if (/^(zoom|sp|sku)[-_]?/i.test(value)) return true;
  if (/^\d+$/.test(value) && value.length >= 4) return true;
  if (value.length >= 6 && /[0-9]/.test(value) && /[a-z]/i.test(value)) return true;
  return false;
}

function tokenMatchesKeyword(token: string, keyword: string): boolean {
  const t = token.toLowerCase();
  const k = keyword.toLowerCase();
  if (!t || !k) return false;
  if (t === k) return true;
  if (k.includes(" ")) return t.includes(k);
  if (t.length >= 3 && k.length >= 3 && (k.startsWith(t) || t.startsWith(k))) return true;
  return false;
}

export function expandToken(token: string): string[] {
  const trimmed = token.trim().toLowerCase();
  if (!trimmed) return [];

  const terms = new Set<string>();
  terms.add(trimmed);
  const compact = trimmed.replace(/[-_]/g, "");
  if (compact) terms.add(compact);

  if (isCodeLikeToken(trimmed)) {
    return Array.from(terms);
  }

  const lat = geoToLat(trimmed);
  if (lat && lat !== trimmed) terms.add(lat);

  const geo = latToGeo(trimmed);
  if (geo && geo !== trimmed) terms.add(geo);

  for (const cluster of SYNONYM_CLUSTERS) {
    if (cluster.some((keyword) => tokenMatchesKeyword(trimmed, keyword))) {
      for (const synonym of cluster) {
        terms.add(synonym.toLowerCase());
      }
    }
  }

  return Array.from(terms);
}

/**
 * Returns an expanded array of search terms for a given query
 * incorporating transliteration and semantic synonyms.
 */
export function expandSearchTerms(query: string): string[] {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) return [];

  const terms = new Set<string>();
  terms.add(query.trim().toLowerCase());
  for (const token of tokens) {
    for (const term of expandToken(token)) {
      terms.add(term);
    }
  }
  return Array.from(terms);
}

export function productSearchTokenClauses(query: string): Record<string, unknown>[] {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) return [];

  return tokens.map((token) => {
    const terms = expandToken(token);
    const ors: Record<string, unknown>[] = [];

    for (const term of terms) {
      if (!term) continue;
      ors.push(
        { title: { contains: term } },
        { sku: { contains: term } },
        { slug: { contains: term } },
        { colorName: { contains: term } },
        { storage: { contains: term } },
        { brand: { name: { contains: term } } },
        { category: { name: { contains: term } } },
        { variants: { some: { sku: { contains: term } } } }
      );
      if (term.length >= 4 && !isCodeLikeToken(token)) {
        ors.push({ description: { contains: term } });
      }
    }

    return { OR: ors };
  });
}

export function rankSearchResults<T extends { title?: string | null; sku?: string | null }>(
  items: T[],
  query: string
): T[] {
  const raw = query.trim().toLowerCase();
  const compact = raw.replace(/[-_\s]/g, "");
  const tokens = tokenizeSearchQuery(query);

  const score = (item: T) => {
    const title = (item.title || "").toLowerCase();
    const sku = (item.sku || "").toLowerCase();
    const skuCompact = sku.replace(/[-_]/g, "");
    let points = 0;
    if (sku === raw || skuCompact === compact) points += 1000;
    if (sku.includes(raw) || (compact && skuCompact.includes(compact))) points += 400;
    if (title.startsWith(raw)) points += 300;
    if (tokens.length > 0 && tokens.every((token) => title.includes(token) || sku.includes(token))) {
      points += 200;
    }
    if (title.includes(raw)) points += 100;
    return points;
  };

  return [...items].sort((a, b) => score(b) - score(a));
}
