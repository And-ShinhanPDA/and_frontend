import ConditionInput from "@/components/condition/condition-input";
import SignToggle from "@/components/condition/sign-toggle";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ConditionMinus from "../../../assets/images/condition-minus.svg";

export default function VolumeChangeAvgRow({
  onRemove,
  onReset,
  onValueChange,
  isSingleRow,
}: {
  onRemove: () => void;
  onReset: () => void;
  onValueChange: (data: { sign: "+" | "-"; value: string }) => void;
  isSingleRow: boolean;
}) {
  const [sign, setSign] = useState<"+" | "-">("+");
  const [value, setValue] = useState("");

  useEffect(() => {
    onValueChange({ sign, value });
  }, [sign, value]);

  const handleRemove = () => {
    if (isSingleRow) {
      setSign("+");
      setValue("");
      onReset();
    } else {
      onRemove();
    }
  };

  const filled = String(value).trim() !== "";

  return (
    <View style={styles.rowContainer}>
      <SignToggle
        sign={sign}
        onToggle={() => setSign(sign === "+" ? "-" : "+")}
      />

      <ConditionInput
        value={value}
        placeholder="백분율을 입력해주세요"
        unit="%"
        onChange={setValue}
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
