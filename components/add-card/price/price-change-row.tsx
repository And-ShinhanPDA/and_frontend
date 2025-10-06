import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ConditionMinus from "../../assets/images/condition-minus.svg";

export default function PriceChangeRow({
  onRemove,
  onReset,
  onValueChange,
  isSingleRow,
}: {
  onRemove: () => void;
  onReset: () => void;
  onValueChange: (data: { sign: "+" | "-"; amount: string }) => void;
  isSingleRow: boolean;
}) {
  const [sign, setSign] = useState<"+" | "-">("+");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    onValueChange({ sign, amount });
  }, [sign, amount]);

  const handleRemove = () => {
    if (isSingleRow) {
      setAmount("");
      setSign("+");
      onReset();
    } else {
      onRemove();
    }
  };

  return (
    <View style={styles.rowContainer}>
      <TouchableOpacity
        style={[
          styles.signToggle,
          sign === "+" ? styles.plusBorder : styles.minusBorder,
        ]}
        onPress={() => setSign(sign === "+" ? "-" : "+")}
      >
        <Text style={[sign === "+" ? styles.plusText : styles.minusText]}>
          {sign}
        </Text>
      </TouchableOpacity>

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

  inputWrapper: { flex: 1, position: "relative" },
  inputWithUnit: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
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
  removeButton: { marginLeft: 8 },
});
