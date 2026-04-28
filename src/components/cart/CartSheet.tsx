import { useCart } from "@/contexts/CartContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CartSheet = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex w-full flex-col border-l-gold/20 bg-forest/98 p-0 sm:max-w-md backdrop-blur-xl">
        <SheetHeader className="border-b border-gold/10 p-6 text-left">
          <SheetTitle className="flex items-center gap-2 font-display tracking-[0.1em] text-cream">
            <ShoppingBag size={20} className="text-amber" /> Your Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-cream/50">
              <ShoppingBag size={48} className="opacity-20" />
              <p className="text-sm font-semibold uppercase tracking-widest">Your cart is empty</p>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-cream/10 bg-mist">
                    <img src={item.img} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h3 className="font-display text-sm font-bold text-cream">{item.name}</h3>
                    <p className="font-serif text-sm text-gold">₹{item.price.toLocaleString()}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3 rounded-full border border-cream/15 bg-cream/5 px-3 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-cream/70 hover:text-amber"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-bold text-cream w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-cream/70 hover:text-amber"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400/70 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t border-gold/10 p-6 sm:flex-col sm:justify-end">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display tracking-widest text-cream/70">SUBTOTAL</span>
              <span className="font-serif text-2xl font-bold text-gold">₹{totalPrice.toLocaleString()}</span>
            </div>
            <p className="mb-6 text-xs text-cream/50">Shipping and taxes calculated at checkout.</p>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/checkout");
              }}
              className="w-full rounded-xl bg-gradient-gold py-4 text-sm font-bold uppercase tracking-[0.18em] text-forest shadow-gold transition-transform hover:-translate-y-0.5"
            >
              Proceed to Checkout
            </button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
