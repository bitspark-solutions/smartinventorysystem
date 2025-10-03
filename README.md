# Smart Inventory Scanner 📱

A React Native mobile app that allows shopkeepers to scan products using their phone camera and extract product names via OCR for inventory and cart management. This is the foundation for a complete POS system.

## ✨ Features

### 🔍 Camera Integration & OCR
- **Live camera preview** with real-time OCR text extraction
- **On-device OCR** using Google ML Kit for instant text recognition
- **Multi-language support** focused on Latin script (English product names)
- **Confidence-based filtering** for accurate text detection

### 📦 Inventory Management
- **Inventory Setup Mode**: Scan products to auto-populate product names
- **Manual editing**: Review and edit extracted product information before saving
- **Product database**: Local SQLite storage for offline functionality
- **Search & filter**: Quickly find products in your inventory

### 🛒 Shopping Cart & Checkout
- **Checkout Mode**: Scan items to instantly add to cart
- **Smart product matching**: Fuzzy matching for similar product names
- **Multiple match handling**: Modal selection for ambiguous matches
- **Cart management**: Quantity controls and item removal
- **Checkout process**: Complete transactions with total calculation

### 🎨 User Interface
- **Tabbed navigation**: Easy switching between Scan, Inventory, and Cart
- **Modal dialogs**: Product selection and confirmation modals
- **Dark/Light theme**: Automatic theme detection
- **Responsive design**: Optimized for various screen sizes

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (for development)
- **Expo CLI** (`npm install -g @expo/cli`)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development on macOS)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd smartinventoryscanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device**
   - **iOS**: Press `i` in the terminal or scan QR code with Camera app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal (limited functionality)

## 📖 Usage Guide

### Getting Started

1. **Grant Camera Permission**: The app will request camera access on first launch
2. **Choose Your Mode**:
   - **Scan Tab**: Switch between Inventory and Checkout modes
   - **Inventory Tab**: View and manage your product database
   - **Cart Tab**: Review items and complete purchases

### Inventory Setup Mode

1. Tap the **"Inventory Mode"** toggle in the camera view
2. Point your camera at product packaging
3. The app will automatically extract text using OCR
4. Review the extracted product name and add optional details:
   - Description
   - Price
   - Quantity
   - Barcode
5. Tap **"Add Product"** to save to inventory

### Checkout Mode

1. Ensure you're in **"Checkout Mode"** in the camera view
2. Point camera at a product you've already added to inventory
3. The app will:
   - **Exact match**: Automatically add to cart
   - **Multiple matches**: Show selection modal
   - **No match**: Prompt to add as new product
4. Review your cart and adjust quantities as needed
5. Complete checkout to finalize the transaction

### Managing Inventory

- **View Products**: All saved products appear in the Inventory tab
- **Edit Products**: Tap "Edit" to modify product details
- **Delete Products**: Tap "Delete" to remove products (with confirmation)
- **Search**: Use the product list to quickly find items

## 🔧 Technical Details

### OCR Integration

The app uses **react-native-vision-camera-text-recognition** for on-device OCR:

```typescript
// Real-time text extraction from camera frames
const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  const texts = scanTexts(frame);

  // Filter for high confidence, reasonable length text
  const textBlocks = texts.filter((block: TextBlock) =>
    block.confidence > 0.7 && block.text.length > 2 && block.text.length < 50
  );

  // Process the most confident text block
  if (textBlocks.length > 0) {
    const bestBlock = textBlocks.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );
    // Clean and process extracted text
    const cleanedText = cleanOcrText(bestBlock.text);
  }
}, []);
```

### Product Matching Algorithm

Smart matching handles various scenarios:

```typescript
// Fuzzy matching for product recognition
const findMatchingProducts = (ocrText: string, products: Product[]) => {
  // 1. Exact matches (case-insensitive)
  // 2. Partial matches (contains/substring)
  // 3. Fuzzy matching using Levenshtein distance
  // 4. Multiple match resolution
  // 5. No match handling with add-new option
};
```

### Database Schema

**Products Table:**
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price REAL,
  quantity INTEGER DEFAULT 0,
  barcode TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

**Cart Items Table:**
```sql
CREATE TABLE cart_items (
  id TEXT PRIMARY KEY,
  productId TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  addedAt TEXT NOT NULL,
  FOREIGN KEY (productId) REFERENCES products (id)
);
```

## 🏗️ Architecture

### State Management
- **React Context API** with useReducer for inventory and cart state
- **TypeScript interfaces** for type safety
- **Immutable state updates** for predictable behavior

### File Structure
```
app/
├── (tabs)/
│   ├── camera.tsx          # Camera scanning with OCR
│   ├── inventory.tsx       # Product management
│   ├── cart.tsx           # Shopping cart & checkout
│   └── _layout.tsx        # Tab navigation
├── components/
│   ├── ProductSelectionModal.tsx  # Multiple match resolution
│   ├── ConfirmationModal.tsx      # General confirmations
│   └── AddProductModal.tsx       # Add new products
├── contexts/
│   ├── InventoryContext.tsx      # Inventory state management
│   ├── CartContext.tsx          # Cart state management
│   └── inventoryReducer.ts      # State reducers
├── services/
│   ├── database.ts              # SQLite operations
│   └── productMatching.ts       # OCR matching logic
├── types/
│   └── inventory.ts             # TypeScript type definitions
└── utils/
    └── permissions.ts           # Camera permission handling
```

### Key Libraries

- **react-native-vision-camera**: Camera access and frame processing
- **react-native-vision-camera-text-recognition**: ML Kit OCR integration
- **react-native-sqlite-storage**: Local database storage
- **@react-navigation/native-stack**: Navigation between screens
- **expo-router**: File-based routing

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Tests cover:
- Product matching algorithms
- State management reducers
- Database operations
- Component interactions

## 🚀 Deployment

### Development Build
```bash
npx expo run:android    # Android development build
npx expo run:ios       # iOS development build
```

### Production Build
```bash
npx expo build:android  # Android APK/AAB
npx expo build:ios     # iOS IPA
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team** for the amazing development platform
- **Google ML Kit** for on-device OCR capabilities
- **React Native Vision Camera** for camera integration
- **React Navigation** for seamless navigation experience

## 📞 Support

For support, email [your-email@example.com] or join our Discord community.

---

**Made with ❤️ for shopkeepers and small business owners**
