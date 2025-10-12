import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
}

export default function Checkbox({ checked, onToggle }: CheckboxProps) {
  return (
    <TouchableOpacity
      style={[styles.checkbox, checked && styles.checkedBox]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      {checked && <Text style={styles.checkMark}>✓</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  checkedBox: {
    backgroundColor: "#4CC439",
    borderColor: "#4CC439",
  },
  checkMark: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
