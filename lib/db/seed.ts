import fs from "fs";
import path from "path";

// Load .env.local manually BEFORE importing connectDB
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    for (const line of envConfig.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    }
  }
} catch (error) {
  console.error("Failed to load .env.local:", error);
}

// Make sure MONGODB_URI is set (for example from MONGODB_URI or MONGO_URI)
if (!process.env.MONGODB_URI && process.env.MONGO_URI) {
  process.env.MONGODB_URI = process.env.MONGO_URI;
}

import { PRODUCTS, CATEGORIES } from "../../data/catalog";

async function seed() {
  try {
    console.log("Connecting to database...");
    // Use dynamic import to prevent ESM hoisting from executing connect.ts before process.env is set
    const { default: connectDB } = await import("./connect");
    const { default: Product } = await import("./models/Product");
    const { default: Category } = await import("./models/Category");

    await connectDB();
    console.log("Connected successfully!");

    // Drop old SKU index if it exists in the MongoDB collection
    try {
      await Product.collection.dropIndex("sku_1");
      console.log("Dropped stale sku_1 index.");
    } catch (e) {
      // Index did not exist or was already dropped
    }

    // Clear collections
    console.log("Clearing existing products and categories...");
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Seed categories
    console.log(`Seeding ${CATEGORIES.length} categories...`);
    const seededCategories = [];
    let orderIndex = 0;
    for (const cat of CATEGORIES) {
      const dbCat = await Category.create({
        name: cat.name,
        slug: cat.id,
        blurb: cat.blurb,
        image: {
          externalUrl: cat.image,
          alt: cat.name,
        },
        order: orderIndex++,
        isActive: true,
      });
      seededCategories.push(dbCat);
    }

    // Seed products
    console.log(`Seeding ${PRODUCTS.length} products...`);
    for (const prod of PRODUCTS) {
      // Find category ref
      const matchedCat = seededCategories.find(
        (c) => c.name.toLowerCase() === prod.category.toLowerCase() || c.slug === prod.category.toLowerCase()
      );

      await Product.create({
        name: prod.name,
        slug: prod.id,
        description: `${prod.name} - Premium quality ${prod.category.toLowerCase()} selected for the finest tables.`,
        shortDescription: `${prod.origin || "Premium"} ${prod.name.toLowerCase()}.`,
        category: prod.category,
        categoryRef: matchedCat ? matchedCat._id : undefined,
        tab: prod.tab,
        price: prod.price,
        comparePrice: prod.price * 1.2, // Mock discount
        unit: prod.unit,
        badge: prod.badge,
        origin: prod.origin || "Local",
        externalImages: prod.images || [prod.image],
        images: (prod.images || [prod.image]).map((img, idx) => ({
          variants: [],
          blurDataURL: "",
          alt: `${prod.name} image ${idx + 1}`,
          isPrimary: idx === 0,
        })),
        inventory: {
          availableStock: 50,
          reservedStock: 0,
          soldStock: 0,
          returnedStock: 0,
          damagedStock: 0,
          lowStockThreshold: 5,
          trackInventory: true,
        },
        isActive: true,
        isFeatured: true,
        weight: 500, // standard 500g
        rating: {
          average: 4.5 + Math.random() * 0.5,
          count: 10 + Math.floor(Math.random() * 40),
        },
      });
    }

    console.log("Seeding complete! Database is ready.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
