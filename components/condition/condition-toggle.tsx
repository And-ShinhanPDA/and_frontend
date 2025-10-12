import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface ConditionToggleProps<T extends string> {
  value: T;

  options: [T, T];

  onToggle: (newValue: T) => void;

  colors?: {
    active1?: string;
    active2?: string;
    border1?: string;
    border2?: string;
  };
}

export default function ConditionToggle<T extends string>({
  value,
  options,
  onToggle,
  colors = {
    active1: "#4CC439",
    active2: "#FF3B30",
    border1: "#4CC439",
    border2: "#FF3B30",
  },
}: ConditionToggleProps<T>) {
  const [first, second] = options;
  const isFirst = value === first;

  const handleToggle = () => {
    onToggle(isFirst ? second : first);
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          borderColor: isFirst ? colors.border1 : colors.border2,
        },
      ]}
      onPress={handleToggle}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.text,
          { color: isFirst ? colors.active1 : colors.active2 },
        ]}
      >
        {value}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.3,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
  },
});
