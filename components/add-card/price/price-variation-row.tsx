import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ChevronDown from "../../../assets/images/ChevronDown.svg";
import ConditionMinus from "../../../assets/images/condition-minus.svg";

export default function PriceVariationRow({
  onRemove,
  onReset,
  onValueChange,
  isSingleRow,
}: {
  onRemove: () => void;
  onReset: () => void;
  onValueChange: (data: {
    sign: "+" | "-";
    value: string;
    period: "1일기준" | "현재기준";
  }) => void;

  isSingleRow: boolean;
}) {
  const [variation, setVariation] = useState("");
  const [sign, setSign] = useState<"+" | "-">("+");
  const [period, setPeriod] = useState<"1일기준" | "현재기준">("1일기준");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    onValueChange({ sign, value: variation, period });
  }, [sign, variation, period]);

  const handleRemove = () => {
    if (isSingleRow) {
      setVariation("");
      setSign("+");
      setPeriod("1일기준");
      onReset();
    } else {
      onRemove();
    }
  };
  const toggleSign = () => {
    setSign((prev) => (prev === "+" ? "-" : "+"));
  };

  return (
    <View style={styles.rowContainer}>
      <TouchableOpacity style={styles.signButton} onPress={toggleSign}>
        <Text style={styles.signText}>{sign}</Text>
      </TouchableOpacity>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.inputWithUnit}
          value={variation}
          onChangeText={setVariation}
          placeholder="변동률을 입력해주세요"
          keyboardType="numeric"
        />
        <Text style={styles.unitInside}>%</Text>
      </View>

      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Text style={styles.optionText}>{period}</Text>
          <ChevronDown width={12} height={12} style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        {dropdownVisible && (
          <View style={styles.dropdownMenu}>
            {["1일기준", "현재기준"].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.dropdownItem}
                onPress={() => {
                  setPeriod(opt as "1일기준" | "현재기준");
                  setDropdownVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    opt === period && styles.selectedText,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {variation.trim() !== "" && (
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
  signButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  signText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },

  inputWrapper: { flex: 1, position: "relative" },
  inputWithUnit: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    paddingRight: 30,
    fontSize: 14,
  },
  unitInside: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -8 }],
    fontSize: 13,
    color: "#555",
  },
  dropdownWrapper: {
    position: "relative",
    marginLeft: 8,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 90,
  },
  optionText: {
    fontSize: 13,
    color: "#333",
    textAlign: "center",
    marginRight: 4,
  },

  dropdownMenu: {
    position: "absolute",
    top: 36,
    right: 0,
    width: 90,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 6,
    zIndex: 10,
  },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 8 },
  dropdownText: { fontSize: 13, color: "#333" },
  selectedText: { color: "#4CC439", fontWeight: "600" },
  removeButton: { marginLeft: 8 },
});
