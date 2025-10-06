import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ChevronDown from "../../assets/images/ChevronDown.svg";
import ConditionMinus from "../../assets/images/condition-minus.svg";

export default function RSITargetRow({
  onRemove,
  onReset,
  onValueChange,
  isSingleRow,
}: {
  onRemove: () => void;
  onReset: () => void;
  onValueChange: (data: { value: string; comparison: "이상" | "이하" }) => void;
  isSingleRow: boolean;
}) {
  const [value, setValue] = useState("");
  const [comparison, setComparison] = useState<"이상" | "이하">("이상");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    onValueChange({ value, comparison });
  }, [value, comparison]);

  const handleRemove = () => {
    if (isSingleRow) {
      setValue("");
      setComparison("이상");
      onReset();
    } else {
      onRemove();
    }
  };

  return (
    <View style={styles.rowContainer}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.inputWithUnit}
          value={value}
          onChangeText={setValue}
          placeholder="RSI 값을 입력해주세요"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Text style={styles.optionText}>{comparison}</Text>
          <ChevronDown width={12} height={12} />
        </TouchableOpacity>

        {dropdownVisible && (
          <View style={styles.dropdownMenu}>
            {["이상", "이하"].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.dropdownItem}
                onPress={() => {
                  setComparison(opt as "이상" | "이하");
                  setDropdownVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    comparison === opt && styles.dropdownTextSelected,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {value.trim() !== "" && (
        <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
          <ConditionMinus width={18} height={18} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  inputWrapper: { flex: 1, position: "relative" },
  inputWithUnit: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  dropdownWrapper: { marginLeft: 8, position: "relative" },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: 72,
    justifyContent: "center",
  },
  optionText: { fontSize: 13, color: "#333", marginRight: 6 },
  dropdownMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    width: 72,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    zIndex: 20,
  },
  dropdownItem: { paddingVertical: 8, alignItems: "center" },
  dropdownText: { fontSize: 13, color: "#333" },
  dropdownTextSelected: { color: "#2CB463", fontWeight: "600" },
  removeButton: { marginLeft: 8 },
});
