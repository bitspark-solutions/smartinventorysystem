import { CartItem, Product } from '@/types/inventory';
import SQLite from 'react-native-sqlite-storage';

// Enable SQLite debugging in development
SQLite.DEBUG(true);
SQLite.enablePromise(true);

// Initialize database
const initializeDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const db = await SQLite.openDatabase({
      name: 'SmartInventoryScanner.db',
      location: 'default',
    });

    await createTables(db);
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
};

// Create database tables
const createTables = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  try {
    // Products table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL,
        quantity INTEGER DEFAULT 0,
        barcode TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // Cart items table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY,
        productId TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        addedAt TEXT NOT NULL,
        FOREIGN KEY (productId) REFERENCES products (id) ON DELETE CASCADE
      );
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

// Product CRUD operations
export const saveProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  const db = await initializeDatabase();

  const id = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const product: Product = {
    id,
    ...productData,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };

  try {
    await db.executeSql(
      `INSERT INTO products (id, name, description, price, quantity, barcode, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [product.id, product.name, product.description || '', product.price || 0, product.quantity || 0, product.barcode || '', now, now]
    );

    return product;
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
};

export const loadProducts = async (): Promise<Product[]> => {
  const db = await initializeDatabase();

  try {
    const [results] = await db.executeSql('SELECT * FROM products ORDER BY createdAt DESC;');

    const products: Product[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      products.push({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        quantity: row.quantity,
        barcode: row.barcode,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      });
    }

    return products;
  } catch (error) {
    console.error('Error loading products:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<void> => {
  const db = await initializeDatabase();

  try {
    const updateFields = Object.keys(productData)
      .filter(key => key !== 'id' && key !== 'createdAt')
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(productData)
      .filter((_, index) => {
        const key = Object.keys(productData)[index];
        return key !== 'id' && key !== 'createdAt';
      });

    values.push(new Date().toISOString()); // updatedAt
    values.push(id); // WHERE clause

    await db.executeSql(
      `UPDATE products SET ${updateFields}, updatedAt = ? WHERE id = ?;`,
      values
    );
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  const db = await initializeDatabase();

  try {
    await db.executeSql('DELETE FROM products WHERE id = ?;', [id]);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Cart CRUD operations
export const saveCartItem = async (cartItemData: Omit<CartItem, 'id'>): Promise<CartItem> => {
  const db = await initializeDatabase();

  const id = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const cartItem: CartItem = {
    id,
    ...cartItemData,
  };

  try {
    await db.executeSql(
      `INSERT INTO cart_items (id, productId, quantity, addedAt)
       VALUES (?, ?, ?, ?);`,
      [cartItem.id, cartItem.productId, cartItem.quantity, cartItem.addedAt.toISOString()]
    );

    return cartItem;
  } catch (error) {
    console.error('Error saving cart item:', error);
    throw error;
  }
};

export const loadCart = async (): Promise<CartItem[]> => {
  const db = await initializeDatabase();

  try {
    const [results] = await db.executeSql(`
      SELECT ci.*, p.name, p.description, p.price, p.quantity as productQuantity, p.barcode
      FROM cart_items ci
      INNER JOIN products p ON ci.productId = p.id
      ORDER BY ci.addedAt DESC;
    `);

    const cartItems: CartItem[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      cartItems.push({
        id: row.id,
        productId: row.productId,
        product: {
          id: row.productId,
          name: row.name,
          description: row.description,
          price: row.price,
          quantity: row.productQuantity,
          barcode: row.barcode,
          createdAt: new Date(row.createdAt),
          updatedAt: new Date(row.updatedAt),
        },
        quantity: row.quantity,
        addedAt: new Date(row.addedAt),
      });
    }

    return cartItems;
  } catch (error) {
    console.error('Error loading cart:', error);
    throw error;
  }
};

export const removeCartItem = async (id: string): Promise<void> => {
  const db = await initializeDatabase();

  try {
    await db.executeSql('DELETE FROM cart_items WHERE id = ?;', [id]);
  } catch (error) {
    console.error('Error removing cart item:', error);
    throw error;
  }
};

export const updateCartItem = async (id: string, quantity: number): Promise<void> => {
  const db = await initializeDatabase();

  try {
    await db.executeSql('UPDATE cart_items SET quantity = ? WHERE id = ?;', [quantity, id]);
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const clearCart = async (): Promise<void> => {
  const db = await initializeDatabase();

  try {
    await db.executeSql('DELETE FROM cart_items;');
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};
