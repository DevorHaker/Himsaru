import { useCart } from "@/contexts/CartContext";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export const FloatingCart = () => {
  const { totalItems, totalPrice, setIsOpen } = useCart();

  if (totalItems === 0) return null;

  return (
    <button
      onClick={() => setIsOpen(true)}
      className={cn(
        "fixed bottom-6 right-6 z-40 flex items-center gap-3 overflow-hidden rounded-full bg-gradient-gold p-1 pr-5 shadow-gold transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated animate-fade-up",
        "group"
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest text-cream transition-colors group-hover:bg-moss">
        <ShoppingBag size={20} />
      </div>
      <div className="flex flex-col items-start text-forest">
        <span className="text-[0.65rem] font-bold uppercase tracking-widest text-forest/70">
          {totalItems} {totalItems === 1 ? "Item" : "Items"}
        </span>
        <span className="font-serif font-bold text-base leading-none">
          ₹{totalPrice.toLocaleString()}
        </span>
      </div>
    </button>
  );
};
