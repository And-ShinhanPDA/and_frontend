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
  onValueChange: (hasValue: boolean) => void;
  isSingleRow: boolean;
}) {
  const [amount, setAmount] = useState("");
  const [comparison, setComparison] = useState<"이상" | "이하">("이상");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    onValueChange(amount.trim() !== "");
  }, [amount]);

  const handleRemove = () => {
    if (isSingleRow) {
      // 행이 1개 남았다면 행 삭제가 아닌 default 값으로 초기화
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
                <Text style={styles.dropdownText}>{opt}</Text>
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
  dropdownWrapper: { position: "relative", marginLeft: 8 },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dropdownMenu: {
    position: "absolute",
    top: 36,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 6,
    zIndex: 10,
  },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 8 },
  dropdownText: { fontSize: 13, color: "#333" },
  optionText: { fontSize: 13, color: "#333", marginRight: 4 },
  removeButton: { marginLeft: 8 },
});
