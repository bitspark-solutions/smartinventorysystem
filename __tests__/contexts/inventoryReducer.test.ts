import { calculateCartTotal, inventoryReducer } from '@/contexts/inventoryReducer';
import { InventoryState, Product } from '@/types/inventory';

describe('Inventory Reducer', () => {
  const initialState: InventoryState = {
    products: [],
    loading: false,
    error: null,
  };

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    price: 10.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('SET_LOADING', () => {
    it('should set loading state', () => {
      const action = { type: 'SET_LOADING' as const, payload: true };
      const newState = inventoryReducer(initialState, action);

      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });
  });

  describe('SET_ERROR', () => {
    it('should set error and clear loading', () => {
      const loadingState = { ...initialState, loading: true };
      const action = { type: 'SET_ERROR' as const, payload: 'Test error' };
      const newState = inventoryReducer(loadingState, action);

      expect(newState.error).toBe('Test error');
      expect(newState.loading).toBe(false);
    });
  });

  describe('ADD_PRODUCT', () => {
    it('should add product to state', () => {
      const action = { type: 'ADD_PRODUCT' as const, payload: mockProduct };
      const newState = inventoryReducer(initialState, action);

      expect(newState.products).toHaveLength(1);
      expect(newState.products[0]).toEqual(mockProduct);
      expect(newState.error).toBeNull();
      expect(newState.loading).toBe(false);
    });
  });

  describe('UPDATE_PRODUCT', () => {
    it('should update existing product', () => {
      const stateWithProduct = {
        ...initialState,
        products: [mockProduct],
      };

      const updatedProduct = {
        ...mockProduct,
        name: 'Updated Product',
      };

      const action = { type: 'UPDATE_PRODUCT' as const, payload: updatedProduct };
      const newState = inventoryReducer(stateWithProduct, action);

      expect(newState.products).toHaveLength(1);
      expect(newState.products[0].name).toBe('Updated Product');
    });
  });

  describe('DELETE_PRODUCT', () => {
    it('should remove product from state', () => {
      const stateWithProduct = {
        ...initialState,
        products: [mockProduct],
      };

      const action = { type: 'DELETE_PRODUCT' as const, payload: '1' };
      const newState = inventoryReducer(stateWithProduct, action);

      expect(newState.products).toHaveLength(0);
      expect(newState.error).toBeNull();
      expect(newState.loading).toBe(false);
    });
  });

  describe('SET_PRODUCTS', () => {
    it('should replace all products', () => {
      const stateWithProduct = {
        ...initialState,
        products: [mockProduct],
      };

      const newProducts = [
        { ...mockProduct, id: '2', name: 'New Product' },
      ];

      const action = { type: 'SET_PRODUCTS' as const, payload: newProducts };
      const newState = inventoryReducer(stateWithProduct, action);

      expect(newState.products).toHaveLength(1);
      expect(newState.products[0].name).toBe('New Product');
      expect(newState.error).toBeNull();
      expect(newState.loading).toBe(false);
    });
  });
});

describe('calculateCartTotal', () => {
  it('should calculate total correctly', () => {
    const items = [
      { product: { price: 10 }, quantity: 2 },
      { product: { price: 5 }, quantity: 3 },
      { product: { price: 0 }, quantity: 1 },
    ];

    const total = calculateCartTotal(items);
    expect(total).toBe(35); // (10*2) + (5*3) + (0*1)
  });

  it('should handle empty array', () => {
    const total = calculateCartTotal([]);
    expect(total).toBe(0);
  });

  it('should handle items without price', () => {
    const items = [
      { product: {}, quantity: 2 },
    ];

    const total = calculateCartTotal(items);
    expect(total).toBe(0);
  });
});
