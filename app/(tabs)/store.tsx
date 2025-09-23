import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  X, 
  Heart,
  Share2,
  ArrowLeft,
  Filter
} from 'lucide-react-native';
import { router } from 'expo-router';
import type { NFTProduct, StoreFilters } from '@/types';

const { width } = Dimensions.get('window');
const itemWidth = (width - 60) / 2; // 2 columns with padding

export default function StoreScreen() {
  const [filters, setFilters] = useState<StoreFilters>({
    category: 'all',
    sortBy: 'latest',
    searchQuery: '',
  });
  const [showSortModal, setShowSortModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<NFTProduct | null>(null);
  const [likedProducts, setLikedProducts] = useState<string[]>([]);

  // Sample NFT Products Data
  const nftProducts: NFTProduct[] = [
    {
      id: '1',
      name: 'Aries',
      category: 'zodiac',
      price: 12,
      image: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'The Ram - Bold, ambitious, and energetic. Aries are natural leaders who love to take charge and pioneer new paths.',
      symbol: '♈',
      dateRange: 'March 21 - April 19',
      traits: ['Leadership', 'Courage', 'Determination', 'Confidence'],
      rarity: 'rare',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Leo',
      category: 'zodiac',
      price: 15,
      image: 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'The Lion - Charismatic, creative, and generous. Leos are natural performers who love to be in the spotlight.',
      symbol: '♌',
      dateRange: 'July 23 - August 22',
      traits: ['Creativity', 'Generosity', 'Warmth', 'Loyalty'],
      rarity: 'epic',
      createdAt: '2024-01-20',
    },
    {
      id: '3',
      name: 'Dragon',
      category: 'horoscope',
      price: 25,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'The Dragon - Powerful, wise, and ambitious. Dragons are natural leaders with great strength and intelligence.',
      year: '2024, 2012, 2000, 1988',
      traits: ['Power', 'Wisdom', 'Ambition', 'Intelligence'],
      rarity: 'legendary',
      createdAt: '2024-01-10',
    },
    {
      id: '4',
      name: 'Rabbit',
      category: 'horoscope',
      price: 18,
      image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'The Rabbit - Gentle, quiet, and elegant. Rabbits are known for their kindness and artistic nature.',
      year: '2023, 2011, 1999, 1987',
      traits: ['Gentleness', 'Elegance', 'Kindness', 'Artistic'],
      rarity: 'rare',
      createdAt: '2024-01-25',
    },
    {
      id: '5',
      name: 'Scorpio',
      category: 'zodiac',
      price: 20,
      image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'The Scorpion - Intense, passionate, and mysterious. Scorpios are known for their depth and transformative power.',
      symbol: '♏',
      dateRange: 'October 23 - November 21',
      traits: ['Intensity', 'Passion', 'Mystery', 'Transformation'],
      rarity: 'epic',
      createdAt: '2024-01-30',
    },
    {
      id: '6',
      name: 'Tiger',
      category: 'horoscope',
      price: 22,
      image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'The Tiger - Brave, competitive, and unpredictable. Tigers are natural leaders with great courage.',
      year: '2022, 2010, 1998, 1986',
      traits: ['Bravery', 'Competition', 'Leadership', 'Courage'],
      rarity: 'legendary',
      createdAt: '2024-02-01',
    },
  ];

  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  const chineseZodiac = [
    'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
    'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
  ];

  const sortOptions = [
    { key: 'latest', label: 'Latest' },
    { key: 'alphabetical', label: 'A-Z' },
    { key: 'price-low', label: 'Price: Low to High' },
    { key: 'price-high', label: 'Price: High to Low' },
  ];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = nftProducts;

    // Filter by search query
    if (filters.searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Sort products
    switch (filters.sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'latest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return filtered;
  }, [filters, nftProducts]);

  const toggleLike = (productId: string) => {
    setLikedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const shareProduct = (product: NFTProduct) => {
    Alert.alert('Share Product', `Share ${product.name} with friends?`);
  };

  const buyProduct = (product: NFTProduct) => {
    Alert.alert(
      'Purchase NFT',
      `Buy ${product.name} for $${product.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Buy Now', onPress: () => Alert.alert('Success', 'NFT purchased successfully!') },
      ]
    );
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9333EA';
      case 'rare': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const renderProduct = (product: NFTProduct) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      onPress={() => setSelectedProduct(product)}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => toggleLike(product.id)}
        >
          <Heart
            size={16}
            color={likedProducts.includes(product.id) ? '#EF4444' : '#64748B'}
            fill={likedProducts.includes(product.id) ? '#EF4444' : 'transparent'}
          />
        </TouchableOpacity>
        <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(product.rarity) }]}>
          <Text style={styles.rarityText}>{product.rarity}</Text>
        </View>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productCategory}>{product.category}</Text>
        <Text style={styles.productPrice}>${product.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.categoryModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <ArrowLeft size={24} color="#1e293b" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter: Category</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.categoryContent}>
            <Text style={styles.categorySection}>Zodiac</Text>
            <View style={styles.categoryGrid}>
              {zodiacSigns.map((sign) => (
                <TouchableOpacity
                  key={sign}
                  style={[
                    styles.categoryChip,
                    filters.selectedZodiac === sign && styles.selectedCategoryChip
                  ]}
                  onPress={() => setFilters(prev => ({
                    ...prev,
                    selectedZodiac: prev.selectedZodiac === sign ? undefined : sign,
                    category: 'zodiac'
                  }))}
                >
                  <Text style={[
                    styles.categoryChipText,
                    filters.selectedZodiac === sign && styles.selectedCategoryChipText
                  ]}>
                    {sign}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.categorySection}>Horoscope</Text>
            <View style={styles.categoryGrid}>
              {chineseZodiac.map((animal) => (
                <TouchableOpacity
                  key={animal}
                  style={[
                    styles.categoryChip,
                    filters.selectedHoroscope === animal && styles.selectedCategoryChip
                  ]}
                  onPress={() => setFilters(prev => ({
                    ...prev,
                    selectedHoroscope: prev.selectedHoroscope === animal ? undefined : animal,
                    category: 'horoscope'
                  }))}
                >
                  <Text style={[
                    styles.categoryChipText,
                    filters.selectedHoroscope === animal && styles.selectedCategoryChipText
                  ]}>
                    {animal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => setFilters(prev => ({
                ...prev,
                category: 'all',
                selectedZodiac: undefined,
                selectedHoroscope: undefined
              }))}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderProductDetail = () => (
    <Modal
      visible={!!selectedProduct}
      transparent
      animationType="slide"
      onRequestClose={() => setSelectedProduct(null)}
    >
      {selectedProduct && (
        <View style={styles.modalOverlay}>
          <View style={styles.productDetailModal}>
            <View style={styles.productDetailHeader}>
              <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                <ArrowLeft size={24} color="#1e293b" />
              </TouchableOpacity>
              <View style={styles.productDetailActions}>
                <TouchableOpacity
                  style={styles.detailActionButton}
                  onPress={() => toggleLike(selectedProduct.id)}
                >
                  <Heart
                    size={24}
                    color={likedProducts.includes(selectedProduct.id) ? '#EF4444' : '#64748B'}
                    fill={likedProducts.includes(selectedProduct.id) ? '#EF4444' : 'transparent'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.detailActionButton}
                  onPress={() => shareProduct(selectedProduct)}
                >
                  <Share2 size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.productDetailContent}>
              <Image source={{ uri: selectedProduct.image }} style={styles.productDetailImage} />
              
              <View style={styles.productDetailInfo}>
                <Text style={styles.productDetailCategory}>{selectedProduct.category}</Text>
                <Text style={styles.productDetailName}>{selectedProduct.name}</Text>
                
                {selectedProduct.symbol && (
                  <Text style={styles.productDetailSymbol}>{selectedProduct.symbol}</Text>
                )}
                
                {selectedProduct.dateRange && (
                  <Text style={styles.productDetailDate}>{selectedProduct.dateRange}</Text>
                )}
                
                {selectedProduct.year && (
                  <Text style={styles.productDetailYear}>Years: {selectedProduct.year}</Text>
                )}

                <Text style={styles.productDetailDescription}>
                  {selectedProduct.description}
                </Text>

                <View style={styles.traitsContainer}>
                  <Text style={styles.traitsTitle}>Traits:</Text>
                  <View style={styles.traitsGrid}>
                    {selectedProduct.traits.map((trait, index) => (
                      <View key={index} style={styles.traitChip}>
                        <Text style={styles.traitText}>{trait}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.productDetailFooter}>
              <TouchableOpacity
                style={styles.buyButton}
                onPress={() => buyProduct(selectedProduct)}
              >
                <Text style={styles.buyButtonText}>Proceed to Buy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Store</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search NFTs..."
          value={filters.searchQuery}
          onChangeText={(text) => setFilters(prev => ({ ...prev, searchQuery: text }))}
        />
      </View>

      {/* Filter Controls */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowSortModal(true)}
        >
          <ArrowUpDown size={16} color="#64748B" />
          <Text style={styles.filterButtonText}>Sort By</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowCategoryModal(true)}
        >
          <Filter size={16} color="#64748B" />
          <Text style={styles.filterButtonText}>Category</Text>
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      <ScrollView style={styles.productsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.productsGrid}>
          {filteredProducts.map(renderProduct)}
        </View>
      </ScrollView>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.sortModal}>
            <Text style={styles.sortModalTitle}>Sort By</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortOption,
                  filters.sortBy === option.key && styles.selectedSortOption
                ]}
                onPress={() => {
                  setFilters(prev => ({ ...prev, sortBy: option.key as any }));
                  setShowSortModal(false);
                }}
              >
                <Text style={[
                  styles.sortOptionText,
                  filters.sortBy === option.key && styles.selectedSortOptionText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {renderCategoryModal()}
      {renderProductDetail()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  productCard: {
    width: itemWidth,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  likeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rarityBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#206E56',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    minWidth: 200,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedSortOption: {
    backgroundColor: '#206E56',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#1e293b',
    textAlign: 'center',
  },
  selectedSortOptionText: {
    color: 'white',
  },
  categoryModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  categoryContent: {
    padding: 20,
  },
  categorySection: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    marginTop: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  selectedCategoryChip: {
    backgroundColor: '#206E56',
    borderColor: '#206E56',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748B',
  },
  selectedCategoryChipText: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#206E56',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#206E56',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#206E56',
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  productDetailModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    maxHeight: '90%',
    width: '90%',
  },
  productDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  productDetailActions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetailContent: {
    flex: 1,
  },
  productDetailImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  productDetailInfo: {
    padding: 20,
  },
  productDetailCategory: {
    fontSize: 14,
    color: '#64748B',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  productDetailName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  productDetailSymbol: {
    fontSize: 24,
    marginBottom: 8,
  },
  productDetailDate: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  productDetailYear: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  productDetailDescription: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 24,
  },
  productDetailFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  buyButton: {
    backgroundColor: '#206E56',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});