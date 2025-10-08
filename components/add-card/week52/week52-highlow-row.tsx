import Checkbox from "@/components/condition/checkbox";
import ConditionDropdown from "@/components/condition/condition-dropdown";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ConditionMinus from "../../../assets/images/condition-minus.svg";
export default function Week52HighLowRow({
  onRemove,
  onAdd,
  onChange,
  isSingleRow,
}: {
  onRemove: () => void;
  onAdd: () => void;
  onChange: (data: { type: "최고가" | "최저가"; checked: boolean }) => void;
  isSingleRow: boolean;
}) {
  const [type, setType] = useState<"최고가" | "최저가">("최고가");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    onChange({ type, checked });
  }, [type, checked]);

  const handleRemove = () => {
    if (isSingleRow) {
      setChecked(false);
      setType("최고가");
    } else {
      onRemove();
    }
  };

  return (
    <View style={styles.rowContainer}>
      <View>
        <ConditionDropdown
          value={type}
          options={["최고가", "최저가"]}
          onChange={(val) => setType(val)}
          width={80}
        />
      </View>

      <Checkbox checked={checked} onToggle={() => setChecked(!checked)} />

      {checked && (
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
