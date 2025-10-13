import React from "react";
import { StyleSheet, Switch, View } from "react-native";

interface ConditionSwitchProps {
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function ConditionSwitch({
  value,
  onToggle,
  disabled = false,
}: ConditionSwitchProps) {
  return (
    <View style={styles.wrapper}>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: "#E5E5E5", true: "#4CC439" }}
        thumbColor={value ? "#fff" : "#f4f3f4"}
        ios_backgroundColor="#E5E5E5"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
