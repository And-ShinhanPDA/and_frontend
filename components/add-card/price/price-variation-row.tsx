import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ConditionMinus from "../../../assets/images/condition-minus.svg";
import ConditionDropdown from "../../condition/condition-dropdown";
import ConditionInput from "../../condition/condition-input";
import SignToggle from "../../condition/sign-toggle";

export default function PriceVariationRow({
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
    period: "1일기준" | "현재기준";
  }) => void;
  isSingleRow: boolean;
}) {
  const [value, setValue] = useState("");
  const [sign, setSign] = useState<"+" | "-">("+");
  const [period, setPeriod] = useState<"1일기준" | "현재기준">("1일기준");

  useEffect(() => {
    onValueChange({ sign, value, period });
  }, [sign, value, period]);

  const handleRemove = () => {
    if (isSingleRow) {
      setValue("");
      setSign("+");
      setPeriod("1일기준");
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
        placeholder="변동률을 입력해주세요"
        unit="%"
        onChange={setValue}
      />

      <ConditionDropdown
        value={period}
        options={["1일기준", "현재기준"]}
        width={90}
        onChange={setPeriod}
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
  removeButton: {
    marginLeft: 8,
  },
});
