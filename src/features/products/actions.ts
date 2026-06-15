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

  let meatCategory = await Category.findOne({ slug: 'meat-seafood' });
  if (!meatCategory) {
    meatCategory = await Category.create({
      name: 'Meat & Seafood',
      slug: 'meat-seafood',
      description: 'Premium cut meat and fresh ethically sourced seafood.',
      featured: true,
    });
  }

  // Idempotent seeding list
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
    {
      name: 'Organic Strawberries',
      slug: 'organic-strawberries',
      sku: 'STR-ORG-05',
      description: 'Sweet, juicy organic strawberries. Handpicked at peak flavor from local fields.',
      price: 249,
      salePrice: 199,
      costPrice: 100,
      brand: 'Berry Farms',
      category: vegCategory._id,
      images: ['https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=800'],
      tags: ['strawberry', 'fresh', 'organic', 'fruit'],
      featured: true,
    },
    {
      name: 'Artisan Greek Yogurt',
      slug: 'artisan-greek-yogurt',
      sku: 'YOG-GRK-06',
      description: 'Rich and creamy strained Greek yogurt made with organic whole milk from pasture-raised cows.',
      price: 299,
      salePrice: 249,
      costPrice: 120,
      brand: 'Epigamia',
      category: dairyCategory._id,
      images: ['https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800'],
      tags: ['yogurt', 'greek', 'dairy', 'organic'],
      featured: true,
    },
    {
      name: 'Farm Fresh Organic Eggs',
      slug: 'farm-fresh-organic-eggs',
      sku: 'EGG-ORG-07',
      description: 'Free-range organic brown eggs laid by hens fed a 100% vegetarian diet. Rich yolk and superb flavor.',
      price: 150,
      costPrice: 70,
      brand: 'Hen Fruit',
      category: dairyCategory._id,
      images: ['https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=800'],
      tags: ['eggs', 'organic', 'dairy', 'fresh'],
      featured: true,
    },
    {
      name: 'Wild Atlantic Salmon Fillet',
      slug: 'wild-atlantic-salmon',
      sku: 'SLM-WLD-08',
      description: 'Fresh wild-caught Atlantic salmon fillet, rich in Omega-3 fatty acids and vacuum sealed for optimal freshness.',
      price: 999,
      salePrice: 849,
      costPrice: 500,
      brand: 'Ocean Catch',
      category: meatCategory._id,
      images: ['https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800'],
      tags: ['salmon', 'seafood', 'fresh', 'fish'],
      featured: true,
    }
  ];

  for (const p of productsData) {
    const existing = await Product.findOne({ slug: p.slug });
    if (!existing) {
      const newProduct = await Product.create(p as any);
      
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
        image: p.images?.[0] 
          ? (p.images[0].startsWith('http') ? p.images[0] : `/images/${p.images[0]}.png`) 
          : '/images/avocado.png',
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
      images: (prod.images || []).map((img: string) => img.startsWith('http') ? img : `/images/${img}.png`),
      image: prod.images?.[0] 
        ? (prod.images[0].startsWith('http') ? prod.images[0] : `/images/${prod.images[0]}.png`) 
        : '/images/avocado.png',
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
