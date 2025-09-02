import React, { useState } from "react";
import Positionnement from "@/components/positionnement";
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager, StyleSheet } from "react-native";

// Activer l’animation sur Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Accordion = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpand} style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
      </TouchableOpacity>
      {expanded && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  header: {
    padding: 15,
    backgroundColor: "#f2f2f2",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    padding: 15,
    backgroundColor: "#fff",
  },
});

export default function App() {
  return (
    <Positionnement>
      <View style={{ flex: 1, padding: 20 }}>
        <Accordion title="Section 1">
          <Text>Contenu de la section 1</Text>
        </Accordion>
        <Accordion title="Section 2">
          <Text>Contenu de la section 2</Text>
        </Accordion>
      </View>
    </Positionnement>
  );
}
