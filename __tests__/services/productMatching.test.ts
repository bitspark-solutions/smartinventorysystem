import { calculateSimilarity, cleanOcrText, findMatchingProducts } from '@/services/productMatching';
import { Product } from '@/types/inventory';

describe('Product Matching Service', () => {
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Coca Cola',
      description: 'Soft drink',
      price: 2.50,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Pepsi',
      description: 'Soft drink',
      price: 2.25,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Kit Kat',
      description: 'Chocolate bar',
      price: 1.50,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  describe('findMatchingProducts', () => {
    it('should return exact match for identical text', () => {
      const result = findMatchingProducts('Coca Cola', mockProducts);

      expect(result.type).toBe('exact');
      expect(result.matches).toHaveLength(1);
      expect(result.matches?.[0].name).toBe('Coca Cola');
    });

    it('should return exact match for case insensitive match', () => {
      const result = findMatchingProducts('coca cola', mockProducts);

      expect(result.type).toBe('exact');
      expect(result.matches).toHaveLength(1);
      expect(result.matches?.[0].name).toBe('Coca Cola');
    });

    it('should return exact match for substring matches', () => {
      const result = findMatchingProducts('Cola', mockProducts);

      expect(result.type).toBe('exact');
      expect(result.matches).toHaveLength(1);
      expect(result.matches?.[0].name).toBe('Coca Cola');
    });

    it('should return no match for non-existent product', () => {
      const result = findMatchingProducts('Sprite', mockProducts);

      expect(result.type).toBe('none');
      expect(result.matches).toBeUndefined();
    });

    it('should handle empty input', () => {
      const result = findMatchingProducts('', mockProducts);

      expect(result.type).toBe('none');
    });

    it('should handle empty products array', () => {
      const result = findMatchingProducts('Coca Cola', []);

      expect(result.type).toBe('none');
    });
  });

  describe('calculateSimilarity', () => {
    it('should return 1.0 for identical strings', () => {
      const similarity = calculateSimilarity('test', 'test');
      expect(similarity).toBe(1.0);
    });

    it('should return 0.0 for completely different strings', () => {
      const similarity = calculateSimilarity('abc', 'xyz');
      expect(similarity).toBe(0.0);
    });

    it('should return correct similarity for similar strings', () => {
      const similarity = calculateSimilarity('kitten', 'sitting');
      expect(similarity).toBeGreaterThan(0.5);
      expect(similarity).toBeLessThan(1.0);
    });
  });

  describe('cleanOcrText', () => {
    it('should remove special characters', () => {
      const cleaned = cleanOcrText('Coca-Cola!');
      expect(cleaned).toBe('coca-cola');
    });

    it('should normalize whitespace', () => {
      const cleaned = cleanOcrText('  Coca   Cola  ');
      expect(cleaned).toBe('coca cola');
    });

    it('should convert to lowercase', () => {
      const cleaned = cleanOcrText('COCA COLA');
      expect(cleaned).toBe('coca cola');
    });

    it('should handle empty string', () => {
      const cleaned = cleanOcrText('');
      expect(cleaned).toBe('');
    });
  });
});
