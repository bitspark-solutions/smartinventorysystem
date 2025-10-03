import { Colors } from '@/constants/theme';
import { useInventory } from '@/contexts/InventoryContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Product } from '@/types/inventory';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function InventoryScreen() {
  const colorScheme = useColorScheme();
  const { state, updateProduct, deleteProduct } = useInventory();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: product.price?.toString() || '',
      quantity: product.quantity?.toString() || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    try {
      const updatedProduct: Product = {
        ...editingProduct,
        name: editForm.name,
        description: editForm.description,
        price: editForm.price ? parseFloat(editForm.price) : undefined,
        quantity: editForm.quantity ? parseInt(editForm.quantity) : undefined,
        updatedAt: new Date(),
      };

      await updateProduct(updatedProduct);
      setEditingProduct(null);
      Alert.alert('Success', 'Product updated successfully');
    } catch {
      Alert.alert('Error', 'Failed to update product');
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProduct(product.id)
        },
      ]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={[styles.productCard, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
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
              Qty: {item.quantity}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Text style={[styles.actionButtonText, { color: Colors[colorScheme ?? 'light'].background }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (state.loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
          Loading inventory...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Inventory
        </Text>
        <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          {state.products.length} products
        </Text>
      </View>

      {state.products.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].text }]}>
            No products in inventory
          </Text>
          <Text style={[styles.emptySubtext, { color: Colors[colorScheme ?? 'light'].text }]}>
            Use the camera to scan and add products
          </Text>
        </View>
      ) : (
        <FlatList
          data={state.products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Edit Modal */}
      <Modal
        visible={!!editingProduct}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditingProduct(null)}
      >
        <View style={[styles.modalContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Edit Product
            </Text>
            <TouchableOpacity onPress={() => setEditingProduct(null)}>
              <Text style={[styles.modalClose, { color: Colors[colorScheme ?? 'light'].tint }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                Product Name
              </Text>
              <TextInput
                style={[styles.textInput, { borderColor: Colors[colorScheme ?? 'light'].text, color: Colors[colorScheme ?? 'light'].text }]}
                value={editForm.name}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                placeholder="Enter product name"
                placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                Description
              </Text>
              <TextInput
                style={[styles.textInput, { borderColor: Colors[colorScheme ?? 'light'].text, color: Colors[colorScheme ?? 'light'].text }]}
                value={editForm.description}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, description: text }))}
                placeholder="Enter description (optional)"
                placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
                multiline
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroupHalf}>
                <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Price
                </Text>
                <TextInput
                  style={[styles.textInput, { borderColor: Colors[colorScheme ?? 'light'].text, color: Colors[colorScheme ?? 'light'].text }]}
                  value={editForm.price}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, price: text }))}
                  placeholder="0.00"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroupHalf}>
                <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Quantity
                </Text>
                <TextInput
                  style={[styles.textInput, { borderColor: Colors[colorScheme ?? 'light'].text, color: Colors[colorScheme ?? 'light'].text }]}
                  value={editForm.quantity}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, quantity: text }))}
                  placeholder="0"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
              <Text style={[styles.saveButtonText, { color: Colors[colorScheme ?? 'light'].background }]}>
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  listContainer: {
    padding: 20,
  },
  productCard: {
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
  productActions: {
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: Colors.light.tint,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.light.background,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalClose: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputGroupHalf: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: Colors.light.tint,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
