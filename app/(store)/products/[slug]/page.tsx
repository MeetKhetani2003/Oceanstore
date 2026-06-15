import { notFound } from "next/navigation";
import { ProductRepository } from "@/lib/db/repositories/product.repository";
import ProductDetailView from "@/components/store/ProductDetailView";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Find product by slug
  const product = await ProductRepository.findBySlug(slug);
  if (!product) {
    notFound();
  }

  // Get related products of the same category
  const { products: relatedProducts } = await ProductRepository.list({
    category: product.category,
    limit: 5,
  });

  // Filter out the current product from related products
  const filteredRelated = relatedProducts
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  const productForClient = {
    id: product.slug,
    name: product.name,
    price: product.price,
    unit: product.unit,
    image: product.externalImages?.[0] || "",
    images: product.externalImages || [],
    category: product.category,
    description: product.description,
    origin: product.origin,
    weight: product.weight,
    comparePrice: product.comparePrice,
    badge: product.badge,
    ratingAverage: product.rating?.average || 4.8,
    ratingCount: product.rating?.count || 24,
  };

  return (
    <div className="bg-cream-50 min-h-screen pt-28 pb-20">
      <div className="container-x">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-xs font-semibold uppercase tracking-[0.14em] text-muted flex items-center gap-2">
          <Link href="/" className="hover:text-ink transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/collections" className="hover:text-ink transition-colors">
            Collections
          </Link>
          <span>/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        {/* Premium Product Detail View */}
        <ProductDetailView product={productForClient} relatedProducts={filteredRelated} />
      </div>
    </div>
  );
}
