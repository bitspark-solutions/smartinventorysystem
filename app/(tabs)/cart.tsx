import { Colors } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CartItem } from '@/types/inventory';
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

export default function CartScreen() {
  const colorScheme = useColorScheme();
  const { state, removeFromCart, updateQuantity, clearCart } = useCart();
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [newQuantity, setNewQuantity] = useState('');

  const handleQuantityEdit = (item: CartItem) => {
    setEditingItem(item);
    setNewQuantity(item.quantity.toString());
    setShowQuantityModal(true);
  };

  const handleSaveQuantity = async () => {
    if (!editingItem || !newQuantity.trim()) return;

    const quantity = parseInt(newQuantity);
    if (quantity < 1) {
      Alert.alert('Error', 'Quantity must be at least 1');
      return;
    }

    try {
      await updateQuantity(editingItem.id, quantity);
      setShowQuantityModal(false);
      setEditingItem(null);
      setNewQuantity('');
    } catch {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const handleRemoveItem = (item: CartItem) => {
    Alert.alert(
      'Remove Item',
      `Remove ${item.product.name} from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromCart(item.id)
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear all items from the cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearCart
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (state.items.length === 0) {
      Alert.alert('Empty Cart', 'Add items to cart before checkout');
      return;
    }

    Alert.alert(
      'Checkout',
      `Complete purchase for $${state.total.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Checkout',
          onPress: () => {
            // In a real app, this would process payment and update inventory
            Alert.alert('Success', 'Purchase completed!');
            clearCart();
          }
        },
      ]
    );
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={[styles.cartItem, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: Colors[colorScheme ?? 'light'].text }]}>
          {item.product.name}
        </Text>
        {item.product.description && (
          <Text style={[styles.itemDescription, { color: Colors[colorScheme ?? 'light'].text }]}>
            {item.product.description}
          </Text>
        )}
        <Text style={[styles.itemPrice, { color: Colors[colorScheme ?? 'light'].text }]}>
          ${item.product.price?.toFixed(2) || '0.00'} each
        </Text>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleQuantityEdit(item)}
        >
          <Text style={[styles.quantityText, { color: Colors[colorScheme ?? 'light'].tint }]}>
            Qty: {item.quantity}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.itemTotal, { color: Colors[colorScheme ?? 'light'].text }]}>
          ${(item.product.price ? item.product.price * item.quantity : 0).toFixed(2)}
        </Text>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item)}
        >
          <Text style={[styles.removeButtonText, { color: Colors[colorScheme ?? 'light'].background }]}>
            Remove
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
          Loading cart...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Shopping Cart
        </Text>
        {state.items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={[styles.clearButton, { color: '#ff4444' }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {state.items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Your cart is empty
          </Text>
          <Text style={[styles.emptySubtext, { color: Colors[colorScheme ?? 'light'].text }]}>
            Use the camera to scan products and add them to your cart
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={state.items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          <View style={[styles.footer, { borderTopColor: Colors[colorScheme ?? 'light'].text + '20' }]}>
            <View style={styles.totalContainer}>
              <Text style={[styles.totalLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                Total:
              </Text>
              <Text style={[styles.totalAmount, { color: Colors[colorScheme ?? 'light'].text }]}>
                ${state.total.toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.checkoutButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
              onPress={handleCheckout}
            >
              <Text style={[styles.checkoutButtonText, { color: Colors[colorScheme ?? 'light'].background }]}>
                Checkout
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Quantity Edit Modal */}
      <Modal
        visible={showQuantityModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowQuantityModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Edit Quantity
            </Text>
            <TouchableOpacity onPress={() => setShowQuantityModal(false)}>
              <Text style={[styles.modalClose, { color: Colors[colorScheme ?? 'light'].tint }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {editingItem && (
              <>
                <Text style={[styles.modalItemName, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {editingItem.product.name}
                </Text>

                <View style={styles.quantityInputContainer}>
                  <Text style={[styles.quantityLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Quantity:
                  </Text>
                  <TextInput
                    style={[styles.quantityInput, { borderColor: Colors[colorScheme ?? 'light'].text, color: Colors[colorScheme ?? 'light'].text }]}
                    value={newQuantity}
                    onChangeText={setNewQuantity}
                    keyboardType="number-pad"
                    placeholder="Enter quantity"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
                  />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSaveQuantity}>
                  <Text style={[styles.saveButtonText, { color: Colors[colorScheme ?? 'light'].background }]}>
                    Update Quantity
                  </Text>
                </TouchableOpacity>
              </>
            )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  clearButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 120, // Space for footer
  },
  cartItem: {
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
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    opacity: 0.7,
  },
  itemActions: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 8,
  },
  quantityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  removeButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 5,
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    padding: 20,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  checkoutButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
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
  modalItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  quantityInputContainer: {
    marginBottom: 30,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  quantityInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: Colors.light.tint,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
