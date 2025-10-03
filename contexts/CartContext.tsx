import { clearCart as clearCartDB, loadCart, removeCartItem, saveCartItem, updateCartItem } from '@/services/database';
import { CartState, Product } from '@/types/inventory';
import React, { ReactNode, createContext, useContext, useEffect, useReducer } from 'react';
import { cartReducer } from './cartReducer';

interface CartContextType {
  state: CartState;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const refreshCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const items = await loadCart();
      dispatch({ type: 'SET_CART', payload: items });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const cartItem = await saveCartItem({
        productId: product.id,
        product,
        quantity,
        addedAt: new Date(),
      });
      dispatch({ type: 'ADD_ITEM', payload: cartItem });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
    }
  };

  const removeFromCart = async (itemId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await removeCartItem(itemId);
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await updateCartItem(itemId, quantity);
      dispatch({ type: 'UPDATE_ITEM_QUANTITY', payload: { id: itemId, quantity } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update item quantity' });
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await clearCartDB();
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const value: CartContextType = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
