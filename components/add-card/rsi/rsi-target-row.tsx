import ConditionDropdown from "@/components/condition/condition-dropdown";
import ConditionInput from "@/components/condition/condition-input";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ConditionMinus from "../../../assets/images/condition-minus.svg";

type Comparison = "이상" | "이하";

export default function RSITargetRow({
  onRemove,
  onReset,
  onValueChange,
  isSingleRow,
}: {
  onRemove: () => void;
  onReset: () => void;
  onValueChange: (data: { value: string; comparison: Comparison }) => void;
  isSingleRow: boolean;
}) {
  const [value, setValue] = useState("");
  const [comparison, setComparison] = useState<Comparison>("이상");

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

  const filled = String(value).trim() !== "";

  return (
    <View style={styles.rowContainer}>
      <ConditionInput
        value={value}
        placeholder="RSI 목표 값을 입력해주세요"
        unit=""
        onChange={setValue}
      />

      <ConditionDropdown
        options={["이상", "이하"]}
        value={comparison}
        onChange={setComparison}
      />

      {filled && (
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
