// 가격 제한 조건 설정
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

export default function PriceLimitRow({
  onRemove,
  onReset,
  onValueChange,
  isSingleRow,
}: {
  onRemove: () => void;
  onReset: () => void;
  onValueChange: (value: {
    amount: string;
    comparison: "이상" | "이하";
  }) => void;
  isSingleRow: boolean;
}) {
  const [amount, setAmount] = useState("");
  const [comparison, setComparison] = useState<"이상" | "이하">("이상");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    onValueChange({ amount, comparison });
  }, [amount, comparison]);

  const handleRemove = () => {
    if (isSingleRow) {
      setAmount("");
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
          value={amount}
          onChangeText={setAmount}
          placeholder="금액을 입력해주세요"
          keyboardType="numeric"
        />
        <Text style={styles.unitInside}>원</Text>
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
          <View style={[styles.dropdownMenu, { width: 72 }]}>
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

      {/* 사용자가 값을 입력할 경우 행 삭제 가능 */}
      {amount.trim() !== "" && (
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
    paddingRight: 30,
    fontSize: 12,
  },
  unitInside: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -6 }],
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: 72,
  },

  dropdownMenu: {
    position: "absolute",
    top: 44, // 버튼 바로 아래
    right: 0,
    width: "100%", // 버튼과 동일한 폭으로 맞춤
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    zIndex: 20,
    overflow: "hidden",
  },

  dropdownItem: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  dropdownText: {
    fontSize: 13,
    color: "#333",
  },
  dropdownTextSelected: {
    color: "#2CB463",
    fontWeight: "600",
  },

  optionText: { fontSize: 13, color: "#333", marginRight: 8 },
  removeButton: { marginLeft: 8 },
});
