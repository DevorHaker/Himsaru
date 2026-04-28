import ghee from "@/assets/product-ghee.jpg";
import honey from "@/assets/product-honey.jpg";
import salt from "@/assets/product-salt.jpg";
import rajma from "@/assets/product-rajma.jpg";
import spices from "@/assets/product-spices.jpg";
import dals from "@/assets/product-dals.jpg";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";

const imageMap: Record<string, string> = {
  ghee, honey, salt, rajma, spices, dals
};

type Product = {
  img: string;
  badge?: string;
  name: string;
  desc: string;
  price: string;
  unit: string;
};

const products: Product[] = [
  {
    img: ghee,
    badge: "Signature",
    name: "A2 Badri Cow Ghee",
    desc: "The rarest of Pahadi ghees — made from the milk of the sacred Badri cow. Rich, golden, aromatic, brimming with A2 beta-casein goodness.",
    price: "₹2,000",
    unit: "/ 1 kg",
  },
  {
    img: ghee,
    name: "Pahadi Cow Ghee",
    desc: "Free-range cows grazing on Himalayan herbs. Traditional Bilona method gives this ghee its distinctive nutty aroma and golden color.",
    price: "₹1,500",
    unit: "/ 1 kg",
  },
  {
    img: salt,
    badge: "Heritage",
    name: "Pahadi Salt — Pisyu Loon",
    desc: "Stone-ground Himalayan rock salt blended with aromatic local herbs. A sacred flavor of Uttarakhand handed down through generations.",
    price: "₹350",
    unit: "/ 500 g",
  },
  {
    img: honey,
    name: "Wild Pahadi Honey",
    desc: "Raw, unfiltered honey collected from wild Himalayan beehives nestled among rhododendron, buransh and alpine wildflowers.",
    price: "₹450",
    unit: "/ 500 g",
  },
  {
    img: rajma,
    name: "Pahadi Rajma",
    desc: "The famous high-altitude kidney beans — small, spotted, incredibly flavorful. Cooks soft, tastes nothing like the plains variety.",
    price: "₹500",
    unit: "/ 1 kg",
  },
  {
    img: spices,
    name: "Pahadi Haldi & Mirch",
    desc: "Stone-ground turmeric with naturally high curcumin, paired with fiery mountain-grown chillies. Unbeatable flavor and strength.",
    price: "₹250",
    unit: "/ 250 g",
  },
  {
    img: dals,
    name: "Pahadi Pulses — Dal",
    desc: "A premium selection of Pahadi dals — Gahat, Maas and Pahadi Chana — grown in fertile, chemical-free mountain soil.",
    price: "₹400",
    unit: "/ 1 kg",
  },
];

export const Products = () => {
  const [liveProducts, setLiveProducts] = useState<any[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    // Fetch products from backend
    api.get('/products')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setLiveProducts(res.data);
        }
      })
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  // Use live products if available, otherwise fallback to static
  const displayProducts = liveProducts.length > 0 ? liveProducts.map(p => ({
    id: p.id || p.slug,
    name: p.name,
    desc: p.description,
    rawPrice: Number(p.pricing),
    price: `₹${Number(p.pricing).toLocaleString()}`,
    unit: "", // can add unit to db later if needed
    badge: p.isFeatured ? "Featured" : undefined,
    img: p.images?.[0] && imageMap[p.images[0]] ? imageMap[p.images[0]] : imageMap.ghee // Fallback image
  })) : products.map(p => ({
    ...p,
    id: p.name.toLowerCase().replace(/\s+/g, '-'),
    rawPrice: Number(p.price.replace(/[^0-9.-]+/g, ""))
  }));

  return (
    <section id="products" className="bg-gradient-mist py-24">
      <div className="container-narrow">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-gold">
            ✦ The Collection
          </span>
          <h2 className="mt-4 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-bold leading-tight text-forest">
            Our Pure <span className="text-gradient-gold">Pahadi</span> Products
          </h2>
          <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg italic text-stone">
            Each one tells a story of the mountains
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayProducts.map((p) => (
            <article
              key={p.name}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-elevated"
            >
              <div className="relative aspect-square overflow-hidden bg-mist">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  width={800}
                  height={800}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {p.badge && (
                  <span className="absolute left-4 top-4 rounded-full bg-gradient-gold px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-forest shadow-gold">
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-lg font-bold text-forest">
                  {p.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {p.desc}
                </p>
                <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                  <div className="font-serif">
                    <span className="text-2xl font-bold text-gold">{p.price}</span>{" "}
                    {p.unit && <span className="text-sm text-stone">{p.unit}</span>}
                  </div>
                  <button
                    onClick={() => addToCart({ id: p.id, name: p.name, price: p.rawPrice, img: p.img })}
                    className="rounded-full bg-forest px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-cream transition-colors hover:bg-moss"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-dashed border-gold/40 bg-gold/5 p-6 text-center">
          <h3 className="font-display text-lg font-bold text-forest">
            More Pahadi Treasures Coming Soon
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Pahadi Atta, Mandua Flour, Buransh Sharbat, Himalayan Herbal Teas,
            Rhododendron Jam & much more...
          </p>
        </div>
      </div>
    </section>
  );
};
