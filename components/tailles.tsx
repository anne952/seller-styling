import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const SizeSelector = () => {
  // Définition des tailles standard
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '36', '38', '40', '42', '44', '46'];
  
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const toggleSizeSelection = (size: string) => {
    if (selectedSizes.includes(size)) {
      // Désélectionner la taille
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      // Sélectionner la taille
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sélectionnez une ou plusieurs tailles</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        style={styles.scrollView}
        contentContainerStyle={styles.sizesContainer}
      >
        {sizes.map((size, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.sizeButton,
              selectedSizes.includes(size) && styles.selectedSize
            ]}
            onPress={() => toggleSizeSelection(size)}
          >
            <Text style={[
              styles.sizeText,
              selectedSizes.includes(size) && styles.selectedSizeText
            ]}>
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.selectedContainer}>
        <Text style={styles.selectedTitle}>Tailles sélectionnées:</Text>
        <View style={styles.selectedSizesList}>
          {selectedSizes.length > 0 ? (
            selectedSizes.map((size, index) => (
              <View key={index} style={styles.selectedSizeChip}>
                <Text style={styles.selectedSizeText}>{size}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noSelection}>Aucune taille sélectionnée</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 60,
  },
  sizesContainer: {
    alignItems: 'center',
    paddingRight: 16,
  },
  sizeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedSize: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
    transform: [{ scale: 1.1 }],
  },
  sizeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedSizeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  selectedSizesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    minHeight: 40,
  },
  selectedSizeChip: {
    backgroundColor: '#2196F3',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  noSelection: {
    fontStyle: 'italic',
    color: '#999',
  },
});

export default SizeSelector;