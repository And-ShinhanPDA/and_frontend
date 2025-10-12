import ConditionDescription from "@/components/condition/condition-description";
import ConditionOrSeparator from "@/components/condition/condition-or-seperator";
import ConditionSwitch from "@/components/condition/condition-switch";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ConditionPlus from "../../assets/images/condition-plus.svg";
interface ConditionSectionProps<T> {
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  rows: T[];
  hasFilled: boolean;
  onAdd: () => void;
  renderRow: (row: T, idx: number) => React.ReactNode;
}

export default function ConditionSection<T>({
  title,
  description,
  value,
  onToggle,
  rows,
  hasFilled,
  onAdd,
  renderRow,
}: ConditionSectionProps<T>) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.label}>{title}</Text>
        <ConditionSwitch value={value} onToggle={onToggle} />
      </View>

      <ConditionDescription text={description} />

      {value &&
        rows.map((r, idx) => (
          <React.Fragment key={idx}>
            {renderRow(r, idx)}
            {idx < rows.length - 1 && <ConditionOrSeparator />}
          </React.Fragment>
        ))}

      {hasFilled && (
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <ConditionPlus width={20} height={20} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  addButton: {
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});
