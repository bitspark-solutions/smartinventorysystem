import { Product } from '@/types/inventory';

/**
 * Product matching utilities for OCR text recognition
 */

export interface MatchResult {
  type: 'exact' | 'multiple' | 'none';
  matches?: Product[];
  confidence?: number;
}

/**
 * Find matching products based on OCR text
 * Uses fuzzy matching for better results
 */
export const findMatchingProducts = (
  ocrText: string,
  products: Product[]
): MatchResult => {
  if (!ocrText.trim() || products.length === 0) {
    return { type: 'none' };
  }

  const searchText = ocrText.toLowerCase().trim();

  // Find exact matches first (case insensitive)
  const exactMatches = products.filter(product =>
    product.name.toLowerCase() === searchText ||
    product.name.toLowerCase().includes(searchText) ||
    searchText.includes(product.name.toLowerCase())
  );

  if (exactMatches.length === 1) {
    return {
      type: 'exact',
      matches: exactMatches,
      confidence: 1.0
    };
  }

  if (exactMatches.length > 1) {
    return {
      type: 'multiple',
      matches: exactMatches,
      confidence: 0.9
    };
  }

  // Find partial matches using fuzzy logic
  const partialMatches = products.filter(product => {
    const productName = product.name.toLowerCase();
    const searchWords = searchText.split(/\s+/);

    // Check if all search words are present in product name (partial match)
    return searchWords.every(word =>
      productName.includes(word) || word.includes(productName)
    );
  });

  if (partialMatches.length > 0) {
    return {
      type: 'multiple',
      matches: partialMatches,
      confidence: 0.7
    };
  }

  return { type: 'none' };
};

/**
 * Calculate similarity score between two strings
 * Uses Levenshtein distance for fuzzy matching
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

/**
 * Calculate Levenshtein distance between two strings
 */
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};

/**
 * Check if OCR confidence meets threshold for auto-add
 */
export const shouldAutoAdd = (confidence: number, threshold: number = 0.9): boolean => {
  return confidence >= threshold;
};

/**
 * Clean OCR text for better matching
 */
export const cleanOcrText = (text: string): string => {
  return text
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\s+/g, ' ') // Normalize whitespace
    .toLowerCase();
};
