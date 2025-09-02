import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const ColorSelector = () => {
  // Définition des 36 couleurs
  const colors = [
    '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF',
    '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41',
    '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40', '#FF5722', '#795548',
    '#9E9E9E', '#607D8B', '#000000', '#FFFFFF', '#F44336', '#E91E63',
    '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
    '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107'
  ];

  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const toggleColorSelection = (color: string) => {
    if (selectedColors.includes(color)) {
      // Désélectionner la couleur
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else {
      // Sélectionner la couleur
      setSelectedColors([...selectedColors, color]);
    }
  };

  return (
    <View style={styles.container}>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        style={styles.scrollView}
        contentContainerStyle={styles.colorsContainer}
      >
        {colors.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.colorCircle,
              { backgroundColor: color },
              selectedColors.includes(color) && styles.selectedColor
            ]}
            onPress={() => toggleColorSelection(color)}
          >
            {selectedColors.includes(color) && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.selectedContainer}>
        <Text style={styles.selectedTitle}>Couleurs sélectionnées:</Text>
        <View style={styles.selectedColorsList}>
          {selectedColors.length > 0 ? (
            selectedColors.map((color, index) => (
              <View 
                key={index} 
                style={[styles.selectedColorChip, { backgroundColor: color }]}
              />
            ))
          ) : (
            <Text style={styles.noSelection}>Aucune couleur sélectionnée</Text>
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
    maxHeight: 80,
  },
  colorsContainer: {
    alignItems: 'center',
    paddingRight: 16,
  },
  colorCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#2196F3',
    transform: [{ scale: 1.1 }],
  },
  checkmark: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
  selectedColorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    minHeight: 40,
  },
  selectedColorChip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  noSelection: {
    fontStyle: 'italic',
    color: '#999',
  },
});

export default ColorSelector;