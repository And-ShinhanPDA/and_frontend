import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { Typography } from "./Typography";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
};

export function PrimaryButton({ title, onPress, style, disabled = false }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        style,
        disabled && styles.disabled,
        pressed && !disabled && { opacity: 0.8 },
      ]}
    >
      <Text style={[styles.text, disabled && styles.disabledText]}>
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
  disabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  text: {
    color: "white",
  },
  disabledText: {
    color: "#888888",
  },
});
