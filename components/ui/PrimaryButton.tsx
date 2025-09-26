import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { Typography } from "./Typography";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
};

export function PrimaryButton({ title, onPress, style }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        style,
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={styles.text}>
        <Typography weight="600" size={19}>
          {title}
        </Typography>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4CC439",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
  },
});
