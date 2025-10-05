import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AddIcon from "../../assets/images/add.svg";
import EditIcon from "../../assets/images/edit.svg";
import ConditionBottomSheet from "../modals/condition-bottom-sheet";
import PriceConditionContent from "./price-condition-content";

export default function PriceConditionCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCondition, setHasCondition] = useState(false);

  return (
    <>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>가격</Text>
          <TouchableOpacity onPress={() => setIsOpen(true)}>
            {hasCondition ? (
              <EditIcon width={18} height={18} />
            ) : (
              <AddIcon width={18} height={18} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ConditionBottomSheet visible={isOpen} onClose={() => setIsOpen(false)}>
        <PriceConditionContent />
      </ConditionBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 15, fontWeight: "600" },
});
