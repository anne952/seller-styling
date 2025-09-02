import { Text, View } from "react-native";
import PressableIcon from "./PressableIcon";
import { Link, LinkProps } from "expo-router";
import { useState } from "react";

interface IconNextProps {
  lien?: LinkProps["href"];
  name: string;
  title: string;
}

export default function ViewNext({ lien, name, title }: IconNextProps) {
  const [liked, setLiked] = useState(false);

  return (
    <View style={{ alignItems: "center", padding: 8 }}>
      {lien && (
        <Link href={lien} >
          {/* conteneur principal du bouton / ligne */}
          <View
            style={{
              width: 360,           // ajuste comme tu veux
              height: 72,
              borderRadius: 12,
              backgroundColor: "#fff",
              flexDirection: "row",
              alignItems: "center", // centre vertical
              paddingHorizontal: 12,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              elevation: 3,
            }}
          >
            {/* wrapper fixe pour l'icône : s'assure qu'elle est bien centrée */}
            <View style={{ width: 48, height: 48, justifyContent: "center", alignItems: "center" }}>
              <PressableIcon
                name={name as any}
                size={28}
                active={liked}
                activeColor="gray"
                inactiveColor="black"
                onPress={() => setLiked(!liked)}
              />
            </View>

            {/* texte sur la même ligne */}
            <Text style={{ fontSize: 16, marginLeft: 12, flexShrink: 1 }}>{title}</Text>
          </View>
        </Link>
      )}
    </View>
  );
}
