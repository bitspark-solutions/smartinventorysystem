import { Colors } from '@/constants/theme';
import { useInventory } from '@/contexts/InventoryContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AddProductModalProps {
  visible: boolean;
  initialName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  visible,
  initialName = '',
  onClose,
  onSuccess,
}) => {
  const colorScheme = useColorScheme();
  const { addProduct } = useInventory();

  const [formData, setFormData] = useState({
    name: initialName,
    description: '',
    price: '',
    quantity: '',
    barcode: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && initialName) {
      setFormData(prev => ({ ...prev, name: initialName }));
    }
  }, [visible, initialName]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
        barcode: formData.barcode.trim() || undefined,
      };

      await addProduct(productData);

      Alert.alert('Success', `Added ${productData.name} to inventory`);

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        quantity: '',
        barcode: '',
      });

      onSuccess?.();
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
            Add New Product
          </Text>
          <TouchableOpacity onPress={onClose} disabled={loading}>
            <Text style={[styles.closeButton, { color: Colors[colorScheme ?? 'light'].tint }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Product Name *
            </Text>
            <TextInput
              style={[styles.textInput, { borderColor: Colors[colorScheme ?? 'light'].text, color: Colors[colorScheme ?? 'light'].text }]}
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              placeholder="Enter product name"
              placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.textInput,
                styles.textArea,
                { borderColor: Colors[colorScheme ?? 'light'].text, color: Colors[colorScheme ?? 'light'].text }
              ]}
              value={formData.description}
              onChangeText={(text) => updateField('description', text)}
              placeholder="Enter product description (optional)"
              placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroupHalf}>
              <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                Price
              </Text>
              <TextInput
                style={[styles.textInput, { borderColor: Colors[colorScheme ?? 'light'].text, color: Colors[colorScheme ?? 'light'].text }]}
                value={formData.price}
                onChangeText={(text) => updateField('price', text)}
                placeholder="0.00"
                placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroupHalf}>
              <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                Quantity
              </Text>
              <TextInput
                style={[styles.textInput, { borderColor: Colors[colorScheme ?? 'light'].text, color: Colors[colorScheme ?? 'light'].text }]}
                value={formData.quantity}
                onChangeText={(text) => updateField('quantity', text)}
                placeholder="0"
                placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Barcode
            </Text>
            <TextInput
              style={[styles.textInput, { borderColor: Colors[colorScheme ?? 'light'].text, color: Colors[colorScheme ?? 'light'].text }]}
              value={formData.barcode}
              onChangeText={(text) => updateField('barcode', text)}
              placeholder="Enter barcode (optional)"
              placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={[styles.submitButtonText, { color: Colors[colorScheme ?? 'light'].background }]}>
              Add Product
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
  content: {
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
  label: {
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  submitButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
