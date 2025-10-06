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

type Period = "5일" | "10일" | "20일" | "30일" | "50일" | "100일" | "200일";

export default function SMATargetRow({
  value: initialValue,
  period: initialPeriod,
  onRemove,
  onReset,
  onValueChange,
  isSingleRow,
}: {
  value: string;
  period: Period;
  onRemove: () => void;
  onReset: () => void;
  onValueChange: (data: { value: string; period: Period }) => void;
  isSingleRow: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    onValueChange({ value, period });
  }, [value, period]);

  const handleRemove = () => {
    if (isSingleRow) {
      setValue("");
      setPeriod("5일");
      onReset();
    } else {
      onRemove();
    }
  };

  const hasValue = value.trim() !== "";
  const [dropdownAbove, setDropdownAbove] = useState(false);

  useEffect(() => {
    setDropdownAbove(false); // 기본값
  }, []);

  return (
    <View style={[styles.rowContainer, dropdownVisible && styles.rowRaised]}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.inputWithUnit}
          value={value}
          onChangeText={setValue}
          placeholder="목표가를 입력해주세요"
          keyboardType="numeric"
        />
        <Text style={styles.unitInside}>원</Text>
      </View>

      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownVisible((v) => !v)}
        >
          <Text style={styles.optionText}>{period}</Text>
          <ChevronDown width={12} height={12} />
        </TouchableOpacity>

        {dropdownVisible && (
          <View
            style={[
              styles.dropdownMenu,

              {
                top: dropdownAbove ? "auto" : 38,
                bottom: dropdownAbove ? 38 : "auto",
              },
            ]}
          >
            {["5일", "10일", "20일", "30일", "50일", "100일", "200일"].map(
              (opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setPeriod(opt as Period);
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
              )
            )}
          </View>
        )}
      </View>

      {hasValue && (
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
    position: "relative",
  },
  rowRaised: { zIndex: 20, elevation: 20 },

  inputWrapper: { flex: 1, position: "relative" },
  inputWithUnit: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    paddingRight: 30,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  unitInside: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -8 }],
    fontSize: 13,
    color: "#555",
  },

  dropdownWrapper: { position: "relative", marginLeft: 8 },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  optionText: { fontSize: 13, color: "#333", marginRight: 4 },
  dropdownMenu: {
    position: "absolute",
    top: 38,
    right: 0,
    width: 90,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 6,
    zIndex: 999,
    elevation: 16,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  dropdownText: { fontSize: 13, color: "#333" },
  selectedText: { color: "#4CC439", fontWeight: "600" },

  removeButton: { marginLeft: 8 },
});
