import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface ConditionInputProps {
  value: string;
  placeholder?: string;
  unit?: string;
  onChange: (value: string) => void;
}
// textInput 컴포넌트
export default function ConditionInput({
  value,
  placeholder,
  unit,
  onChange,
}: ConditionInputProps) {
  return (
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.inputWithUnit}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType="numeric"
      />
      {unit && <Text style={styles.unitInside}>{unit}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: { flex: 1, position: "relative" },
  inputWithUnit: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingRight: 30,
    fontSize: 13,
  },
  unitInside: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -7 }],
    fontSize: 13,
    color: "#555",
  },
});
