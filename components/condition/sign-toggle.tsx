import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface SignToggleProps {
  sign: "+" | "-";
  onToggle: () => void;
}

// + - 부호 토글 컴포넌트
export default function SignToggle({ sign, onToggle }: SignToggleProps) {
  return (
    <TouchableOpacity
      style={[
        styles.signToggle,
        sign === "+" ? styles.plusBorder : styles.minusBorder,
      ]}
      onPress={onToggle}
    >
      <Text style={sign === "+" ? styles.plusText : styles.minusText}>
        {sign}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  signToggle: {
    width: 34,
    height: 34,
    borderWidth: 1.3,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  plusBorder: { borderColor: "#4CC439" },
  minusBorder: { borderColor: "#FF3B30" },
  plusText: { color: "#4CC439", fontSize: 16, fontWeight: "700" },
  minusText: { color: "#FF3B30", fontSize: 16, fontWeight: "700" },
});
