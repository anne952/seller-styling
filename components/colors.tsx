import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


type Color = { id: number; nom: string; hex?: string };

const extractHexFromNom = (nom: string): string | null => {
  const match = nom.match(/#([0-9A-Fa-f]{6})/);
  return match ? match[0] : null;
};
type ColorSelectorProps = {
  colors: Color[];
  selectedColorIds?: number[];
  onChangeSelectedColorIds?: (ids: number[]) => void;
  single?: boolean;
};


const ColorSelector = ({ colors, selectedColorIds: controlledSelected, onChangeSelectedColorIds, single = false }: ColorSelectorProps) => {
  const [uncontrolledSelected, setUncontrolledSelected] = useState<number[]>([]);
  const selectedColorIds = controlledSelected ?? uncontrolledSelected;

  const toggleColorSelection = (id: number) => {
    const exists = selectedColorIds.includes(id);
    const next = single
      ? exists ? [] : [id]
      : exists ? selectedColorIds.filter(c => c !== id) : [...selectedColorIds, id];
    if (onChangeSelectedColorIds) onChangeSelectedColorIds(next);
    if (!controlledSelected) setUncontrolledSelected(next);
  };

  return (
    <View style={styles.container}>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        style={styles.scrollView}
        contentContainerStyle={styles.colorsContainer}
      >
        {colors.map((color) => (
          <TouchableOpacity
            key={color.id}
            style={[
              styles.colorCircle,
              { backgroundColor: color.hex || extractHexFromNom(color.nom) || color.nom },
              selectedColorIds.includes(color.id) && styles.selectedColor
            ]}
            onPress={() => toggleColorSelection(color.id)}
          >
            {selectedColorIds.includes(color.id) && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.selectedContainer}>
        <Text style={styles.selectedTitle}>Couleurs sélectionnées:</Text>
        <View style={styles.selectedColorsList}>
          {selectedColorIds.length > 0 ? (
            selectedColorIds.map((id) => {
              const color = colors.find(c => c.id === id);
              if (!color) return null;
              return (
                <View
                  key={id}
                  style={[styles.selectedColorChip, { backgroundColor: color.hex || extractHexFromNom(color.nom) || color.nom }]}
                />
              );
            })
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
