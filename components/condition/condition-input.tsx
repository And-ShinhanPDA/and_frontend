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
      {unit && <Text style={styles.unitOutside}>{unit}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: { 
    flex: 1, 
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputWithUnit: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: "#fff",
    fontFamily: "Pretendard",
    fontWeight: "500",
  },
  unitOutside: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Pretendard",
    fontWeight: "600",
    minWidth: 24,
  },
});
