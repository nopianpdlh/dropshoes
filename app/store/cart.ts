import { create } from "zustand";
import { StateCreator } from "zustand";

interface CartState {
  count: number;
}

interface CartActions {
  setCount: (count: number) => void;
  incrementCount: () => void;
  decrementCount: () => void;
  fetchCount: () => Promise<void>;
}

type CartStore = CartState & CartActions;

type SetState = (
  partial:
    | CartState
    | Partial<CartState>
    | ((state: CartState) => CartState | Partial<CartState>),
  replace?: boolean
) => void;

const createCartStore: StateCreator<CartStore> = (
  setState,
  getState,
  store
) => ({
  count: 0,
  setCount: (count: number) => setState({ count }),
  incrementCount: () =>
    setState((state: CartState) => ({ count: state.count + 1 })),
  decrementCount: () =>
    setState((state: CartState) => ({ count: Math.max(0, state.count - 1) })),
  fetchCount: async () => {
    try {
      const response = await fetch("/api/cart/count");
      if (!response.ok) throw new Error("Failed to fetch cart count");
      const data = await response.json();
      setState({ count: data.count });
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  },
});

export const useCartStore = create<CartStore>(createCartStore);
