import { View } from "react-native";
import PressableIcon from "./PressableIcon";
import { useState } from "react";
import { LinkProps } from "@/.expo/types/router";
import { Link } from "expo-router";

interface IconNextProps {
    lien?: LinkProps["href"]; 
}

export default function IconNext({ lien }: IconNextProps) {
      const [liked, setLiked] = useState(false);
  return (
    lien &&(
    <Link href={lien} className="bg-blue-500 p-2 rounded-lg w-12 h-12">
      <PressableIcon 
      name="chevron-back-outline" 
      size={24} 
        active={liked}
        activeColor="gray"
        inactiveColor="white"
        onPress={() => setLiked(!liked)} 
      />
    </Link>
    )  );
}
