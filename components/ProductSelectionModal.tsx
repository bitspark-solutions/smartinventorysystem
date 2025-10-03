import { Colors } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Product } from '@/types/inventory';
import React from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ProductSelectionModalProps {
  visible: boolean;
  products: Product[];
  ocrText: string;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  visible,
  products,
  ocrText,
  onClose,
  onSelectProduct,
}) => {
  const colorScheme = useColorScheme();
  const { addToCart } = useCart();

  const handleSelectProduct = async (product: Product) => {
    try {
      await addToCart(product);
      Alert.alert('Added to Cart', `Added ${product.name} to cart`);
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  const handleAddNewProduct = () => {
    // In a full implementation, this would navigate to add product screen
    Alert.alert(
      'Add New Product',
      `Would you like to add "${ocrText.replace(/"/g, '&quot;')}" as a new product?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Product',
          onPress: () => {
            // Navigate to inventory setup mode or show add product form
            Alert.alert('Feature Coming Soon', 'Add new product functionality will be available in the next update');
          }
        },
      ]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.productItem, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      onPress={() => handleSelectProduct(item)}
    >
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: Colors[colorScheme ?? 'light'].text }]}>
          {item.name}
        </Text>
        {item.description && (
          <Text style={[styles.productDescription, { color: Colors[colorScheme ?? 'light'].text }]}>
            {item.description}
          </Text>
        )}
        <View style={styles.productDetails}>
          {item.price && (
            <Text style={[styles.productPrice, { color: Colors[colorScheme ?? 'light'].text }]}>
              ${item.price.toFixed(2)}
            </Text>
          )}
          {item.quantity !== undefined && (
            <Text style={[styles.productQuantity, { color: Colors[colorScheme ?? 'light'].text }]}>
              Stock: {item.quantity}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.selectButton}>
        <Text style={[styles.selectButtonText, { color: Colors[colorScheme ?? 'light'].background }]}>
          Select
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Select Product
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: Colors[colorScheme ?? 'light'].tint }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ocrTextContainer}>
          <Text style={[styles.ocrTextLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
            Scanned Text:
          </Text>
          <Text style={[styles.ocrText, { color: Colors[colorScheme ?? 'light'].tint }]}>
            &ldquo;{ocrText}&rdquo;
          </Text>
        </View>

        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].text }]}>
                No matching products found
              </Text>
            </View>
          }
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.addNewButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={handleAddNewProduct}
          >
            <Text style={[styles.addNewButtonText, { color: Colors[colorScheme ?? 'light'].background }]}>
              Add as New Product
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  ocrTextContainer: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  ocrTextLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  ocrText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  listContainer: {
    padding: 20,
  },
  productItem: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: 'row',
    gap: 15,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  productQuantity: {
    fontSize: 16,
  },
  selectButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  addNewButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addNewButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
