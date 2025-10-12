import ConditionBottomSheet from "@/components/modals/condition-bottom-sheet";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AddIcon from "../../../assets/images/add.svg";
import EditIcon from "../../../assets/images/edit.svg";
import PriceConditionSimpleContent from "./price-simple-content";

export default function PriceConditionSimpleCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCondition, setHasCondition] = useState(false);
  const [conditionData, setConditionData] = useState<{
    sign: "+" | "-";
    value: string;
    period: "1일기준" | "현재기준";
  } | null>(null);

  const handleConfirm = (data: {
    sign: "+" | "-";
    value: string;
    period: "1일기준" | "현재기준";
  }) => {
    setConditionData(data);
    setHasCondition(true);
    setIsOpen(false);
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>가격</Text>
          <TouchableOpacity onPress={() => setIsOpen(true)}>
            {hasCondition ? (
              <EditIcon width={18} height={18} />
            ) : (
              <AddIcon width={30} height={30} />
            )}
          </TouchableOpacity>
        </View>

        {hasCondition && (
          <>
            <View style={styles.divider} />
            <Text style={styles.desc}>
              {conditionData?.period} 기준 {conditionData?.sign}
              {conditionData?.value}% 변동 시 알림
            </Text>
          </>
        )}
      </View>

      <ConditionBottomSheet
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        ratio={0.38}
      >
        <PriceConditionSimpleContent onConfirm={handleConfirm} />
      </ConditionBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "600" },
  divider: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginTop: 8,
    marginBottom: 6,
    marginHorizontal: -14,
  },
  desc: {
    fontSize: 13,
    color: "#555",
  },
});
