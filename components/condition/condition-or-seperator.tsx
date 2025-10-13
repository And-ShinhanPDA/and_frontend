import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ConditionOrSeparator() {
  return (
    <View style={styles.orWrapper}>
      <View style={styles.orLine} />
      <Text style={styles.orText}>OR</Text>
      <View style={styles.orLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  orWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  orLine: {
    flex: 1,
    height: 0.7,
    backgroundColor: "#DADADA",
    marginHorizontal: 8,
  },
  orText: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 12,
    color: "#000000",
    letterSpacing: 0.3,
  },
});
