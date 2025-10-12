import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ConditionDescriptionProps {
  text: string;
}

export default function ConditionDescription({
  text,
}: ConditionDescriptionProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 6,
  },
  text: {
    fontSize: 13,
    color: "#666",
  },
});
