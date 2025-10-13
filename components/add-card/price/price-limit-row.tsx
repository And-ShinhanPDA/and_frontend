import ConditionDropdown from "@/components/condition/condition-dropdown";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ConditionMinus from "../../../assets/images/condition-minus.svg";
import ConditionInput from "../../condition/condition-input";
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
      <ConditionInput
        value={amount}
        placeholder="금액을 입력해주세요"
        unit="원"
        onChange={setAmount}
      />

      <ConditionDropdown
        value={comparison}
        options={["이상", "이하"]}
        onChange={setComparison}
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
