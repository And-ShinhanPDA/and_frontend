import ConditionInput from "@/components/condition/condition-input";
import SignToggle from "@/components/condition/sign-toggle";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ConditionMinus from "../../../assets/images/condition-minus.svg";

export default function PriceChangeCurrentRow({
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
      <SignToggle
        sign={sign}
        onToggle={() => setSign(sign === "+" ? "-" : "+")}
      />

      <ConditionInput
        value={amount}
        placeholder="금액을 입력해주세요"
        unit="원"
        onChange={setAmount}
      />

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
  removeButton: { marginLeft: 8 },
});
