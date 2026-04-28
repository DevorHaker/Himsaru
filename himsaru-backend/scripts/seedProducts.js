import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

const staticProducts = [
  {
    name: "A2 Badri Cow Ghee",
    slug: "a2-badri-cow-ghee",
    category: "ghee",
    description: "The rarest of Pahadi ghees — made from the milk of the sacred Badri cow. Rich, golden, aromatic, brimming with A2 beta-casein goodness.",
    pricing: 2000,
    stock: 50,
    images: ["ghee"],
    sku: "PRD-GHEE-001",
    isFeatured: true,
  },
  {
    name: "Pahadi Cow Ghee",
    slug: "pahadi-cow-ghee",
    category: "ghee",
    description: "Free-range cows grazing on Himalayan herbs. Traditional Bilona method gives this ghee its distinctive nutty aroma and golden color.",
    pricing: 1500,
    stock: 100,
    images: ["ghee"],
    sku: "PRD-GHEE-002",
    isFeatured: false,
  },
  {
    name: "Pahadi Salt — Pisyu Loon",
    slug: "pahadi-salt-pisyu-loon",
    category: "salt",
    description: "Stone-ground Himalayan rock salt blended with aromatic local herbs. A sacred flavor of Uttarakhand handed down through generations.",
    pricing: 350,
    stock: 200,
    images: ["salt"],
    sku: "PRD-SALT-001",
    isFeatured: true,
  },
  {
    name: "Wild Pahadi Honey",
    slug: "wild-pahadi-honey",
    category: "honey",
    description: "Raw, unfiltered honey collected from wild Himalayan beehives nestled among rhododendron, buransh and alpine wildflowers.",
    pricing: 450,
    stock: 150,
    images: ["honey"],
    sku: "PRD-HONY-001",
    isFeatured: false,
  },
  {
    name: "Pahadi Rajma",
    slug: "pahadi-rajma",
    category: "pulses",
    description: "The famous high-altitude kidney beans — small, spotted, incredibly flavorful. Cooks soft, tastes nothing like the plains variety.",
    pricing: 500,
    stock: 80,
    images: ["rajma"],
    sku: "PRD-PLSE-001",
    isFeatured: false,
  },
  {
    name: "Pahadi Haldi & Mirch",
    slug: "pahadi-haldi-mirch",
    category: "spices",
    description: "Stone-ground turmeric with naturally high curcumin, paired with fiery mountain-grown chillies. Unbeatable flavor and strength.",
    pricing: 250,
    stock: 300,
    images: ["spices"],
    sku: "PRD-SPCE-001",
    isFeatured: false,
  },
  {
    name: "Pahadi Pulses — Dal",
    slug: "pahadi-pulses-dal",
    category: "pulses",
    description: "A premium selection of Pahadi dals — Gahat, Maas and Pahadi Chana — grown in fertile, chemical-free mountain soil.",
    pricing: 400,
    stock: 120,
    images: ["dals"],
    sku: "PRD-PLSE-002",
    isFeatured: false,
  },
];

async function seedProducts() {
  console.log('Seeding products...');
  for (const prod of staticProducts) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });
  }
  console.log('Products seeded successfully!');
  await prisma.$disconnect();
}

seedProducts().catch(e => {
  console.error(e);
  prisma.$disconnect();
});
