import ConditionInput from "@/components/condition/condition-input";

import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ConditionMinus from "../../../assets/images/condition-minus.svg";

export default function Week52HighProximityRow({
  onRemove,
  onReset,
  onValueChange,
  isSingleRow,
}: {
  onRemove: () => void;
  onReset: () => void;
  onValueChange: (data: { value: string }) => void;
  isSingleRow: boolean;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    onValueChange({ value });
  }, [value]);

  const handleRemove = () => {
    if (isSingleRow) {
      setValue("");
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
        placeholder="근접 비율을 입력해주세요"
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
