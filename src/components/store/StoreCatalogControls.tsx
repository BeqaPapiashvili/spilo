"use client";

import { useRouter } from "next/navigation";

type Props = {
  slug: string;
  query: string;
  category: string;
  sort: string;
  categories: { id: string; name: string }[];
};

export function StoreCatalogControls({ slug, query, category, sort, categories }: Props) {
  const router = useRouter();

  const push = (next: { q?: string; category?: string; sort?: string }) => {
    const params = new URLSearchParams();
    const q = next.q ?? query;
    const cat = next.category ?? category;
    const s = next.sort ?? sort;
    if (q) params.set("q", q);
    if (cat) params.set("category", cat);
    if (s && s !== "newest") params.set("sort", s);
    const suffix = params.toString();
    router.push(suffix ? `/stores/${slug}?${suffix}` : `/stores/${slug}`);
  };

  return (
    <form
      className="bg-white rounded-2xl px-4 py-3 flex flex-col md:flex-row gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        push({
          q: String(form.get("q") || "").trim(),
          category: String(form.get("category") || ""),
          sort: String(form.get("sort") || "newest"),
        });
      }}
    >
      <input
        name="q"
        defaultValue={query}
        placeholder="ძიება ამ მაღაზიაში"
        className="flex-1 h-10 px-3 bg-[#F4F5F7] rounded-xl text-sm text-gray-900 outline-none"
      />
      <select
        name="category"
        defaultValue={category}
        className="h-10 px-3 bg-[#F4F5F7] rounded-xl text-sm text-gray-800"
      >
        <option value="">ყველა კატეგორია</option>
        {categories.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <select name="sort" defaultValue={sort} className="h-10 px-3 bg-[#F4F5F7] rounded-xl text-sm text-gray-800">
        <option value="newest">ახალი</option>
        <option value="price_asc">ფასი: ზრდადი</option>
        <option value="price_desc">ფასი: კლებადი</option>
      </select>
      <button type="submit" className="h-10 px-4 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-xl text-sm">
        გაფილტვრა
      </button>
    </form>
  );
}
