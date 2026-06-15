export const BRAND = {
  name: "OCEON",
  tagline: "Quality In Lowest Prices",
  descriptor: "Premium Grocery & Daily Essentials",
  phone: "+91 98765 43210",
  email: "hello@oceon.com",
  whatsapp: "919876543210",
  city: "Delivering citywide, six days a week",
};

const waText = encodeURIComponent("Hi OCEON — I'd like to place an order.");
export const WHATSAPP_URL = `https://wa.me/${BRAND.whatsapp}?text=${waText}`;

/** Build a Pexels image URL from a photo id. */
export const px = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}`;

export const IMAGES = {
  hero: px(37304356, 2200),
  editorialMain: px(6065912, 1500),
  editorialSecond: px(10432860, 900),
  ctaBg: px(7355003, 1800),
};

export const NAV = [
  { label: "Shop", href: "/collections" },
  { label: "Categories", href: "/#categories" },
  { label: "Our Story", href: "/#story" },
  { label: "Why OCEON", href: "/#trust" },
];

export type Category = {
  id: string;
  name: string;
  blurb: string;
  image: string;
  count: string;
};

export const CATEGORIES: Category[] = [
  {
    id: "bread-pow",
    name: "Bread Pow 🍞",
    blurb: "Freshly baked pav buns and soft breads.",
    image: "/categories/cat_pack_bread_pav_1781540872791.png",
    count: "20+ items",
  },
  {
    id: "curd-yogurt",
    name: "Curd Yogurt 🥣",
    blurb: "Thick, creamy traditional dahi and flavored yogurts.",
    image: "/categories/cat_pack_curd_yogurt_1781540886065.png",
    count: "15+ items",
  },
  {
    id: "fresh-paneer-tofu",
    name: "Fresh Paneer Tofu 🧀",
    blurb: "Soft, high-protein paneer and firm tofu blocks.",
    image: "/categories/cat_pack_paneer_tofu_1781540897764.png",
    count: "10+ items",
  },
  {
    id: "fresh-butter-cheese",
    name: "Fresh Butter Cheese 🧈",
    blurb: "Rich farm butter and premium assorted cheese slices.",
    image: "/categories/cat_pack_butter_cheese_1781540909958.png",
    count: "25+ items",
  },
  {
    id: "amul-milk-lassi",
    name: "Amul Milk & Lassi 🥛",
    blurb: "Fresh Amul milk pouches and sweet refreshing lassi.",
    image: "/categories/cat_pack_milk_lassi_1781540922315.png",
    count: "12+ items",
  },
  {
    id: "chilled-soft-drinks",
    name: "Chilled Soft Drinks 🧊",
    blurb: "Ice-cold carbonated beverages and juices.",
    image: "/categories/cat_pack_soft_drinks_1781540934712.png",
    count: "30+ items",
  },
  {
    id: "lays-snacks",
    name: "Lays & Chips 🍟",
    blurb: "Crispy Lays potato chips and spicy namkeen snacks.",
    image: "/categories/cat_pack_chips_lays_1781540947114.png",
    count: "40+ items",
  },
];

export type Tab = "all" | "produce" | "pantry" | "drinks" | "beverages";

export type Product = {
  id: string;
  name: string;
  category: string;
  tab: Tab;
  price: number;
  comparePrice?: number;
  unit: string;
  image: string;
  images?: string[];
  badge?: "New" | "Bestseller" | "Limited";
  origin?: string;
};

export const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "produce", label: "Fresh Vegetables" },
  { id: "pantry", label: "Dairy & Staples" },
  { id: "drinks", label: "Packaged Snacks" },
  { id: "beverages", label: "Beverages" },
];

export const PRODUCTS: Product[] = [
  {
    id: "dhaniya",
    name: "Fresh Dhaniya (Coriander)",
    category: "Fresh Produce",
    tab: "produce",
    price: 15,
    comparePrice: 20,
    unit: "/ bunch",
    image: "/Client catalogue/dhaniya.png",
    images: [
      "/Client catalogue/dhaniya.png",
      "/Client catalogue/dhaniya2.png",
      "/Client catalogue/dhaniya3.png"
    ],
    badge: "Bestseller",
    origin: "Local Farms"
  },
  {
    id: "fresh-pudina",
    name: "Fresh Pudina (Mint)",
    category: "Fresh Produce",
    tab: "produce",
    price: 12,
    comparePrice: 15,
    unit: "/ bunch",
    image: "/Client catalogue/freshpudina.png",
    images: [
      "/Client catalogue/freshpudina.png",
      "/Client catalogue/freshpudina2.png",
      "/Client catalogue/freshpudina3.png",
      "/Client catalogue/freshpudina4.png"
    ],
    origin: "Local Farms"
  },
  {
    id: "hari-choti-mirch",
    name: "Hari Choti Mirch (Spicy Green Chilli)",
    category: "Fresh Produce",
    tab: "produce",
    price: 20,
    comparePrice: 25,
    unit: "/ 100g",
    image: "/Client catalogue/harichotimirch.png",
    images: [
      "/Client catalogue/harichotimirch.png",
      "/Client catalogue/harichotimirch2.png",
      "/Client catalogue/harichotimirch3.png"
    ],
    badge: "New",
    origin: "Local Farms"
  },
  {
    id: "moti-hari-mirch",
    name: "Moti Hari Mirch (Thick Green Chilli)",
    category: "Fresh Produce",
    tab: "produce",
    price: 18,
    comparePrice: 22,
    unit: "/ 100g",
    image: "/Client catalogue/motiharimirch.png",
    images: [
      "/Client catalogue/motiharimirch.png",
      "/Client catalogue/motiharimirch2.png"
    ],
    origin: "Local Farms"
  },
  {
    id: "cane-drink",
    name: "Fresh Cane Drink",
    category: "Beverages",
    tab: "beverages",
    price: 40,
    comparePrice: 50,
    unit: "/ 250ml",
    image: "/Client catalogue/cane1.png",
    images: [
      "/Client catalogue/cane1.png",
      "/Client catalogue/cane2.png"
    ],
    badge: "Limited"
  },
  {
    id: "coca-cola",
    name: "Coca Cola Soft Drink",
    category: "Beverages",
    tab: "beverages",
    price: 40,
    comparePrice: 45,
    unit: "/ 750ml",
    image: "/Client catalogue/cocacolasoftdrink.png",
    images: [
      "/Client catalogue/cocacolasoftdrink.png"
    ]
  },
  {
    id: "sprite",
    name: "Sprite Soft Drink",
    category: "Beverages",
    tab: "beverages",
    price: 40,
    comparePrice: 45,
    unit: "/ 750ml",
    image: "/Client catalogue/spritesoftdrink.png",
    images: [
      "/Client catalogue/spritesoftdrink.png"
    ]
  },
  {
    id: "amul-dudh-banana-combo",
    name: "Amul Dudh & Banana Combo",
    category: "Dairy & Eggs",
    tab: "pantry",
    price: 60,
    comparePrice: 70,
    unit: "/ combo",
    image: "/Client catalogue/amuldudhandbananacombo.png",
    images: [
      "/Client catalogue/amuldudhandbananacombo.png",
      "/Client catalogue/lastimgecommon.png"
    ],
    badge: "Bestseller"
  }
];

export const productMap: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p])
);

export const STATS = [
  { value: "15 min", label: "Average delivery" },
  { value: "50k+", label: "Households served" },
  { value: "4.8", label: "Customer rating" },
  { value: "100%", label: "Fresh guarantee" },
];

export type Trust = {
  icon: "truck" | "leaf" | "shield" | "tag" | "check";
  title: string;
  desc: string;
};

export const TRUST: Trust[] = [
  {
    icon: "truck",
    title: "15-Min Delivery",
    desc: "Express dispatch in under 15 minutes across major metros.",
  },
  {
    icon: "leaf",
    title: "Daily Fresh Harvest",
    desc: "Produce restocked twice daily and picked at peak freshness.",
  },
  {
    icon: "shield",
    title: "Reliable Support",
    desc: "Real human customer care and automated instant refunds.",
  },
  {
    icon: "tag",
    title: "Lowest Prices",
    desc: "Fair prices with weekly discounts and no surcharges.",
  },
  {
    icon: "check",
    title: "Quality Guarantee",
    desc: "Every item hand-checked by experts before leaving the hub.",
  },
];

export const money = (n: number) =>
  n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
