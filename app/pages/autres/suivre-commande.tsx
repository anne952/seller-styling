import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

const commande = {
  image: require('../../../assets/images/0 (4).jpeg'), // Remplacez par le chemin réel
  nom: 'Chemise blanche',
  quantite: 2,
  etape: 1, // 0: Validation, 1: En cours de livraison, 2: Livrée
};

const etapes = [
  'Validation',
  'En cours',
  'Livrée',
];

export default function SuivreCommande() {
  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Suivi de la commande</Text>
      <Link href="/pages/autres/recu" style={styles.card}>
        <Image source={commande.image} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.nom}>{commande.nom}</Text>
          <Text style={styles.quantite}>Quantité : {commande.quantite}</Text>
        </View>
      </Link>
      
      <View style={styles.etapesContainer}>
        {etapes.map((etape, index) => (
          <View key={etape} style={styles.etapeItem}>
            <View
              style={[styles.circle, index <= commande.etape ? styles.active : styles.inactive]}
            />
            <Text style={index <= commande.etape ? styles.activeText : styles.inactiveText}>{etape}</Text>
            {index < etapes.length - 1 && <View style={styles.line} />}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFF',
    padding: 20,
    marginTop: 50,
  },
  titre: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  nom: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  quantite: {
    fontSize: 16,
    color: '#555',
  },
  etapesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  
  },
  etapeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    marginRight: 6,
  },
  active: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  inactive: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  activeText: {
    color: '#4F46E5',
    fontWeight: 'bold',
    marginRight: 10,
  },
  inactiveText: {
    color: '#aaa',
    marginRight: 10,
  },
  line: {
    width: 30,
    height: 2,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
});
