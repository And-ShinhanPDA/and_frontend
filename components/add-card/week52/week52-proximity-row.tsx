import ConditionInput from "@/components/condition/condition-input";
import ConditionToggle from "@/components/condition/condition-toggle";
import SignToggle from "@/components/condition/sign-toggle";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ConditionMinus from "../../../assets/images/condition-minus.svg";

export default function Week52ProximityRow({
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
    target?: string;
  }) => void;

  isSingleRow: boolean;
}) {
  const [sign, setSign] = useState<"+" | "-">("+");
  const [value, setValue] = useState("");
  const [target, setTarget] = useState<"최고가" | "최저가">("최고가");

  useEffect(() => {
    onValueChange({ sign, value, target });
  }, [sign, value, target]);

  const handleRemove = () => {
    if (isSingleRow) {
      setSign("+");
      setValue("");
      setTarget("최고가");
      onReset();
    } else {
      onRemove();
    }
  };

  const filled = value.trim() !== "";

  return (
    <View style={styles.rowContainer}>
      <SignToggle
        sign={sign}
        onToggle={() => setSign(sign === "+" ? "-" : "+")}
      />

      <ConditionInput
        value={value}
        placeholder="근접 비율 입력"
        unit="%"
        onChange={setValue}
      />

      <ConditionToggle
        value={target}
        options={["최고가", "최저가"]}
        onToggle={setTarget}
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
