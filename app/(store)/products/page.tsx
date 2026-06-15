import { ProductRepository } from "@/lib/db/repositories/product.repository";
import { ProductCard } from "@/components/store/ProductCard";
import { CATEGORIES } from "@/data/catalog";
import { cn } from "@/utils/cn";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const category = params.category || "";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const sortBy = (params.sortBy as any) || "newest";
  const page = params.page ? parseInt(params.page) : 1;

  // Fetch from Mongoose Repository
  const { products, total, pages } = await ProductRepository.list({
    search,
    category: category === "all" ? undefined : category,
    minPrice,
    maxPrice,
    sortBy,
    page,
    limit: 12,
  });

  const activeCategory = category === "all" ? "" : category;

  return (
    <div className="bg-cream-100 min-h-screen pt-24 pb-20">
      <div className="container-x">
        
        {/* Banner Section */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-ocean-500 to-ocean-700 p-8 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              {activeCategory ? activeCategory : "All Aisles"}
            </h1>
            <p className="mt-2 text-white/80 max-w-xl text-[14px]">
              {activeCategory 
                ? `Browse our fresh, handpicked collection of ${activeCategory.toLowerCase()} sourced directly from local cooperatives.`
                : "Explore our complete aisle of farm fresh vegetables, dairy, breakfast essentials, namkeens, beverages and household cleaners."}
            </p>
          </div>
          <span className="shrink-0 bg-white/15 border border-white/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
            {total} {total === 1 ? 'Product' : 'Products'} Available
          </span>
        </div>

        {/* Split Grid Layout */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* Left Panel: Category Sidebar Selector (Sticky on Desktop) */}
          <aside className="col-span-12 lg:col-span-3 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-line p-4 shadow-sm">
              <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-muted mb-4 px-2">
                Aisles &amp; Departments
              </h2>
              
              <nav className="space-y-1">
                {/* All Products Link */}
                <Link
                  href="/products"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-bold transition-all border-l-4",
                    !activeCategory
                      ? "border-ocean-500 bg-ocean-50 text-ocean-600"
                      : "border-transparent text-ink/80 hover:bg-gray-50 hover:text-ink"
                  )}
                >
                  <span className="truncate flex-1">All Aisles</span>
                </Link>

                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory.toLowerCase() === cat.name.toLowerCase();
                  return (
                    <Link
                      key={cat.id}
                      href={`/products?category=${encodeURIComponent(cat.name)}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-bold transition-all mt-1 border-l-4",
                        isActive
                          ? "border-ocean-500 bg-ocean-50 text-ocean-600"
                          : "border-transparent text-ink/80 hover:bg-gray-50 hover:text-ink"
                      )}
                    >
                      <span className="truncate flex-1">{cat.name}</span>
                      <span className="text-[10px] bg-cream-100 text-muted px-2 py-0.5 rounded-full font-bold ml-2">
                        {cat.count.split(" ")[0]}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Right Panel: Filters Bar & Products Grid */}
          <main className="col-span-12 lg:col-span-9 space-y-6">
            
            {/* Horizontal Filter Bar */}
            <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
              <form method="GET" action="/products" className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Preserve Category inside form */}
                {category && <input type="hidden" name="category" value={category} />}
                
                {/* Search Bar Input */}
                <div className="relative w-full sm:max-w-sm">
                  <input
                    type="text"
                    name="search"
                    defaultValue={search}
                    placeholder="Search in this aisle..."
                    className="w-full rounded-xl border border-line bg-sand px-4 py-2.5 pl-10 text-[13.5px] text-ink placeholder-ink/40 focus:border-ocean-500 focus:bg-white focus:outline-none transition-all"
                  />
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="absolute left-3.5 top-3.5 h-4 w-4 text-muted/60"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>

                {/* Sort dropdown and apply button wrapper */}
                <div className="flex w-full sm:w-auto items-center gap-3">
                  <select
                    name="sortBy"
                    defaultValue={sortBy}
                    className="w-full sm:w-44 rounded-xl border border-line bg-white px-3 py-2.5 text-[13.5px] font-bold text-ink focus:border-ocean-500 focus:outline-none transition-colors"
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>

                  <button
                    type="submit"
                    className="h-10 shrink-0 rounded-xl bg-leaf-500 px-5 text-[13.5px] font-bold text-white hover:bg-leaf-600 transition-colors shadow-[0_4px_12px_rgba(0,181,98,0.2)]"
                  >
                    Filter
                  </button>

                  {(search || category) && (
                    <Link
                      href="/products"
                      className="text-[13px] font-bold text-ocean-500 hover:underline shrink-0"
                    >
                      Clear
                    </Link>
                  )}
                </div>
              </form>
            </div>

            {/* Product Grid */}
            {products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-line shadow-sm">
                <p className="text-base font-medium text-muted">No products found matching your search.</p>
                <Link href="/products" className="mt-3 inline-block text-[13.5px] font-bold text-ocean-500 hover:underline">
                  Browse all groceries
                </Link>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 animate-fadeIn">
                  {products.map((product) => {
                    const cardProduct = {
                      id: product.slug,
                      name: product.name,
                      category: product.category,
                      tab: (product.tab as any) || "all",
                      price: product.price,
                      comparePrice: product.comparePrice,
                      unit: product.unit,
                      image: product.externalImages?.[0] || "",
                      badge: product.badge as any,
                      origin: product.origin,
                    };

                    return (
                      <div key={product._id.toString()} className="group relative">
                        <ProductCard product={cardProduct} />
                      </div>
                    );
                  })}
                </div>

                {/* Pagination links */}
                {pages > 1 && (
                  <div className="mt-12 flex justify-center gap-2">
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
                      const queryParams = new URLSearchParams();
                      if (search) queryParams.set("search", search);
                      if (category) queryParams.set("category", category);
                      if (sortBy) queryParams.set("sortBy", sortBy);
                      queryParams.set("page", p.toString());

                      return (
                        <Link
                          key={p}
                          href={`/products?${queryParams.toString()}`}
                          className={cn(
                            "h-9 w-9 rounded-xl flex items-center justify-center text-[13px] font-bold transition-all",
                            page === p
                              ? "bg-ocean-500 text-white shadow-md shadow-ocean-500/20"
                              : "bg-white border border-line hover:bg-gray-50 text-ink"
                          )}
                        >
                          {p}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
