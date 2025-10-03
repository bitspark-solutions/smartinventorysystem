import { ProductSelectionModal } from '@/components/ProductSelectionModal';
import { Colors } from '@/constants/theme';
import { useCart as useCartContext } from '@/contexts/CartContext';
import { useInventory as useInventoryContext } from '@/contexts/InventoryContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { findMatchingProducts } from '@/services/productMatching';
import { Product } from '@/types/inventory';
import { requestCameraPermission } from '@/utils/permissions';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';

type ScanMode = 'inventory' | 'checkout';

export default function CameraScreen() {
  const colorScheme = useColorScheme();
  const isFocused = useIsFocused();
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = Object.values(devices).find(d => d !== undefined) || null;

  const [mode, setMode] = useState<ScanMode>('inventory');
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [detectedText, setDetectedText] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalProducts, setModalProducts] = useState<Product[]>([]);
  const [currentOcrText, setCurrentOcrText] = useState<string>('');

  const { addProduct } = useInventoryContext();
  const { addToCart } = useCartContext();
  const { state: inventoryState } = useInventoryContext();

  // Request camera permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const granted = await requestCameraPermission();
      setPermissionGranted(granted);
    };

    if (isFocused) {
      checkPermission();
    }
  }, [isFocused]);

  const handleScanResult = async (scannedText: string) => {
    if (processing || !scannedText.trim()) return;

    setDetectedText(scannedText.trim());
    setProcessing(true);

    try {
      if (mode === 'inventory') {
        // Inventory setup mode - add new product
        await addProduct({
          name: scannedText.trim(),
          description: 'Scanned product',
        });
        Alert.alert('Success', `Added product: ${scannedText.trim()}`);
      } else {
        // Checkout mode - use improved product matching
        const matchResult = findMatchingProducts(scannedText, inventoryState.products);

        switch (matchResult.type) {
          case 'exact':
            if (matchResult.matches && matchResult.matches.length === 1) {
              const product = matchResult.matches[0];
              await addToCart(product);
              Alert.alert('Added to Cart', `Added ${product.name} to cart`);
            }
            break;

          case 'multiple':
            if (matchResult.matches) {
              // Show modal for user to select
              setModalProducts(matchResult.matches);
              setCurrentOcrText(scannedText);
              setShowProductModal(true);
            }
            break;

          case 'none':
            // No match found - prompt to add new product
            Alert.alert(
              'No Match Found',
              `No product found for "${scannedText}". Would you like to add it as a new product?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Add Product',
                  onPress: async () => {
                    // Switch to inventory mode and add the product
                    setMode('inventory');
                    await addProduct({
                      name: scannedText.trim(),
                      description: 'Scanned product',
                    });
                    Alert.alert('Success', `Added product: ${scannedText.trim()}`);
                    // Switch back to checkout mode
                    setMode('checkout');
                  }
                },
              ]
            );
            break;
        }
      }
    } catch {
      Alert.alert('Error', 'Failed to process scan result');
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectProduct = async (product: Product) => {
    try {
      await addToCart(product);
      Alert.alert('Added to Cart', `Added ${product.name} to cart`);
      setShowProductModal(false);
    } catch {
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'inventory' ? 'checkout' : 'inventory');
  };

  if (!device) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={[styles.text, { color: Colors[colorScheme ?? 'light'].text }]}>
          No camera device found
        </Text>
      </View>
    );
  }

  if (permissionGranted === null) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <Text style={[styles.text, { color: Colors[colorScheme ?? 'light'].text }]}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (permissionGranted === false) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={[styles.text, { color: Colors[colorScheme ?? 'light'].text }]}>
          Camera permission denied
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={isFocused}
      />

      {/* Mode Toggle */}
      <TouchableOpacity style={styles.modeToggle} onPress={toggleMode}>
        <Text style={[styles.modeText, { color: Colors[colorScheme ?? 'light'].background }]}>
          {mode === 'inventory' ? 'Inventory Mode' : 'Checkout Mode'}
        </Text>
      </TouchableOpacity>

      {/* Detected Text Overlay */}
      {detectedText && (
        <View style={styles.textOverlay}>
          <Text style={[styles.detectedText, { color: Colors[colorScheme ?? 'light'].background }]}>
            {detectedText}
          </Text>
        </View>
      )}

      {/* Scan Button */}
      <TouchableOpacity
        style={[styles.scanButton, processing && styles.scanButtonDisabled]}
        onPress={() => handleScanResult(detectedText)}
        disabled={processing}
      >
        {processing ? (
          <ActivityIndicator color={Colors[colorScheme ?? 'light'].background} />
        ) : (
          <Text style={[styles.scanButtonText, { color: Colors[colorScheme ?? 'light'].background }]}>
            {mode === 'inventory' ? 'Add Product' : 'Add to Cart'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={[styles.instructionText, { color: Colors[colorScheme ?? 'light'].text }]}>
          {mode === 'inventory'
            ? 'Point camera at product packaging to extract text and add to inventory'
            : 'Point camera at product to add to cart'
          }
        </Text>
      </View>

      {/* Product Selection Modal */}
      <ProductSelectionModal
        visible={showProductModal}
        products={modalProducts}
        ocrText={currentOcrText}
        onClose={() => setShowProductModal(false)}
        onSelectProduct={handleSelectProduct}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modeToggle: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  textOverlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  detectedText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scanButton: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: Colors.light.tint,
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  buttonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructions: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
