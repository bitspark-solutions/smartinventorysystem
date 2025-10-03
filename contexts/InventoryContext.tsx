import { deleteProduct as deleteProductDB, loadProducts, saveProduct, updateProduct as updateProductDB } from '@/services/database';
import { InventoryState, Product } from '@/types/inventory';
import React, { ReactNode, createContext, useContext, useEffect, useReducer } from 'react';
import { inventoryReducer } from './inventoryReducer';

interface InventoryContextType {
  state: InventoryState;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const initialState: InventoryState = {
  products: [],
  loading: false,
  error: null,
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  const refreshProducts = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const products = await loadProducts();
      dispatch({ type: 'SET_PRODUCTS', payload: products });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load products' });
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const product = await saveProduct(productData);
      dispatch({ type: 'ADD_PRODUCT', payload: product });
      return product;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add product' });
      throw error;
    }
  };

  const updateProduct = async (product: Product) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await updateProductDB(product.id, product);
      dispatch({ type: 'UPDATE_PRODUCT', payload: product });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update product' });
    }
  };

  const deleteProduct = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await deleteProductDB(id);
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete product' });
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const value: InventoryContextType = {
    state,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
