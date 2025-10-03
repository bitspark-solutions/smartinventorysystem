import { InventoryAction, InventoryState } from '@/types/inventory';

/**
 * Reducer for managing inventory state
 */
export const inventoryReducer = (state: InventoryState, action: InventoryAction): InventoryState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload],
        error: null,
        loading: false
      };

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id ? action.payload : product
        ),
        error: null,
        loading: false
      };

    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload),
        error: null,
        loading: false
      };

    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload,
        error: null,
        loading: false
      };

    default:
      return state;
  }
};

/**
 * Calculate cart total from items
 */
export const calculateCartTotal = (items: any[]): number => {
  return items.reduce((total, item) => {
    const price = item.product?.price || 0;
    return total + (price * item.quantity);
  }, 0);
};
