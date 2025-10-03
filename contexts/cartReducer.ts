import { CartAction, CartItem, CartState } from '@/types/inventory';
import { calculateCartTotal } from './inventoryReducer';

/**
 * Reducer for managing cart state
 */
export const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.payload.productId
      );

      let updatedItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Add new item
        updatedItems = [...state.items, action.payload];
      }

      return {
        ...state,
        items: updatedItems,
        total: calculateCartTotal(updatedItems),
        error: null,
        loading: false
      };

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        total: calculateCartTotal(filteredItems),
        error: null,
        loading: false
      };

    case 'UPDATE_ITEM_QUANTITY':
      const updatedQuantityItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: updatedQuantityItems,
        total: calculateCartTotal(updatedQuantityItems),
        error: null,
        loading: false
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        error: null,
        loading: false
      };

    case 'SET_CART':
      return {
        ...state,
        items: action.payload,
        total: calculateCartTotal(action.payload),
        error: null,
        loading: false
      };

    default:
      return state;
  }
};
