'use server';

import connectDB from '@/lib/db';
import { Product } from './models';
import { Category } from './categoryModel';
import { Inventory } from '../inventory/models';

export async function seedDatabase() {
  await connectDB();
  
  // Seed categories
  let vegCategory = await Category.findOne({ slug: 'fresh-produce' });
  if (!vegCategory) {
    vegCategory = await Category.create({
      name: 'Fresh Produce',
      slug: 'fresh-produce',
      description: 'Fresh organic vegetables and fruits sourced daily.',
      featured: true,
    });
  }

  let dairyCategory = await Category.findOne({ slug: 'artisan-dairy' });
  if (!dairyCategory) {
    dairyCategory = await Category.create({
      name: 'Artisan Dairy',
      slug: 'artisan-dairy',
      description: 'Artisanal cheeses, fresh milk, and cultured organic butter.',
      featured: true,
    });
  }

  let bakeryCategory = await Category.findOne({ slug: 'bakery' });
  if (!bakeryCategory) {
    bakeryCategory = await Category.create({
      name: 'Pantry & Bakery',
      slug: 'bakery',
      description: 'Warm daily bread and pantry staples.',
      featured: true,
    });
  }

  // Seed products if collection is empty
  const count = await Product.countDocuments();
  if (count === 0) {
    const productsData = [
      {
        name: 'Organic Hass Avocado',
        slug: 'organic-hass-avocado',
        sku: 'AVO-ORG-01',
        description: 'Perfect organic ripe Hass avocados. Excellent source of healthy fats, fiber, and essential nutrients.',
        price: 349,
        salePrice: 299,
        costPrice: 150,
        brand: 'Local Farm',
        category: vegCategory._id,
        images: ['avocado'],
        tags: ['avocado', 'fresh', 'organic', 'fruit'],
        featured: true,
      },
      {
        name: 'Heirloom Tomatoes',
        slug: 'heirloom-tomatoes',
        sku: 'TOM-HEI-02',
        description: 'Rich, colorful organic heirloom tomatoes. Bursting with sweet, vine-ripened flavor.',
        price: 180,
        salePrice: 149,
        costPrice: 80,
        brand: 'Vine Growers',
        category: vegCategory._id,
        images: ['tomatoes'],
        tags: ['tomatoes', 'fresh', 'organic', 'vegetable'],
        featured: true,
      },
      {
        name: 'Artisan Sourdough Loaf',
        slug: 'artisan-sourdough',
        sku: 'SDR-ART-03',
        description: 'Daily baked, naturally fermented sourdough bread with a golden crispy crust and soft chewy center.',
        price: 220,
        salePrice: 199,
        costPrice: 90,
        brand: 'Daily Baked',
        category: bakeryCategory._id,
        images: ['sourdough'],
        tags: ['bread', 'sourdough', 'bakery', 'fresh'],
        featured: true,
      },
      {
        name: 'Cold Pressed Olive Oil',
        slug: 'cold-pressed-olive-oil',
        sku: 'OIL-OLI-04',
        description: 'Extra virgin cold-pressed olive oil from carefully selected hand-picked Italian olives.',
        price: 1899,
        salePrice: 1599,
        costPrice: 800,
        brand: 'Monini',
        category: bakeryCategory._id,
        images: ['olive_oil'],
        tags: ['oil', 'olive', 'cooking', 'premium'],
        featured: true,
      },
    ];

    for (const p of productsData) {
      const newProduct = await Product.create(p);
      
      // Seed corresponding Inventory
      await Inventory.create({
        productId: newProduct._id,
        availableStock: 50,
        reservedStock: 0,
        soldStock: 0,
        damagedStock: 0,
        returnedStock: 0,
        stockHistory: [
          {
            adjustmentType: 'ADDITION',
            quantity: 50,
            notes: 'Database seed initialization',
            date: new Date(),
          },
        ],
      });

      // Maintain product stock field
      newProduct.stock = 50;
      await newProduct.save();
    }
  }
}

export async function getProductsAction() {
  try {
    await connectDB();
    await seedDatabase();

    const products = await Product.find({ published: true }).populate('category');
    
    return {
      success: true,
      products: products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        price: p.price.toString(),
        salePrice: p.salePrice ? p.salePrice.toString() : null,
        brand: p.brand || 'OCEON',
        category: (p.category as any).name,
        image: p.images?.[0] ? `/images/${p.images[0]}.png` : '/images/avocado.png',
        stock: p.stock,
      })),
    };
  } catch (error) {
    console.error('getProductsAction error:', error);
    return { success: false, products: [] };
  }
}

export async function getProductBySlug(slug: string) {
  try {
    await connectDB();
    await seedDatabase();

    const p = await Product.findOne({ slug, published: true }).populate('category');
    if (!p) return { success: false, product: null, related: [] };

    // Store populated category info before converting
    const categoryName = (p.category as any)?.name || '';
    const categorySlug = (p.category as any)?.slug || '';

    // Related products: same category ObjectId, exclude self, limit 4
    const related = await Product.find({
      category: (p.category as any)._id,
      _id: { $ne: p._id },
      published: true,
    })
      .limit(4)
      .populate('category')
      .lean();

    const mapProduct = (prod: any, catName?: string, catSlug?: string) => ({
      id: prod._id.toString(),
      name: prod.name,
      slug: prod.slug,
      sku: prod.sku,
      description: prod.description,
      shortDescription: prod.shortDescription || '',
      price: prod.price.toString(),
      salePrice: prod.salePrice != null ? prod.salePrice.toString() : null,
      brand: prod.brand || 'OCEON',
      category: catName ?? (typeof prod.category === 'object' && prod.category?.name ? prod.category.name : ''),
      categorySlug: catSlug ?? (typeof prod.category === 'object' && prod.category?.slug ? prod.category.slug : ''),
      images: (prod.images || []).map((img: string) => `/images/${img}.png`),
      image: prod.images?.[0] ? `/images/${prod.images[0]}.png` : '/images/avocado.png',
      tags: prod.tags || [],
      stock: prod.stock,
      featured: prod.featured ?? false,
    });

    return {
      success: true,
      product: mapProduct(p.toObject(), categoryName, categorySlug),
      related: related.map((r) => mapProduct(r)),
    };
  } catch (error) {
    console.error('getProductBySlug error:', error);
    return { success: false, product: null, related: [] };
  }
}

