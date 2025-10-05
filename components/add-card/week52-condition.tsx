import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AddIcon from "../../assets/images/add.svg";
import EditIcon from "../../assets/images/edit.svg";
import ConditionBottomSheet from "../modals/condition-bottom-sheet";
import Week52ConditionContent from "./week52-condition-content";

export default function Week52ConditionCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [conditions, setConditions] = useState<any | null>(null);

  const handleConfirm = (data: any) => {
    console.log("52주 조건:", data);
    setConditions(data);
    setIsOpen(false);
    setExpanded(true);
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>52주</Text>
            <TouchableOpacity onPress={() => setIsOpen(true)}>
              {conditions ? (
                <EditIcon width={18} height={18} />
              ) : (
                <AddIcon width={30} height={30} />
              )}
            </TouchableOpacity>
          </View>

          {expanded && conditions && (
            <View style={styles.content}>
              <Text style={styles.subTitle}>52주 기준 고저 여부</Text>
              {conditions.highLow?.map((c: any, idx: number) => (
                <View key={idx} style={styles.row}>
                  <Text style={styles.label}>{c.type}</Text>
                  <Text style={styles.value}>{c.value}</Text>
                </View>
              ))}

              {conditions.proximity?.length > 0 && (
                <>
                  <Text style={[styles.subTitle, { marginTop: 8 }]}>
                    52주 근접 여부
                  </Text>
                  {conditions.proximity.map((c: any, idx: number) => (
                    <View key={idx} style={styles.row}>
                      <Text style={styles.label}>
                        {c.type} ({c.direction})
                      </Text>
                      <Text style={styles.value}>{c.value}</Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>

      <ConditionBottomSheet visible={isOpen} onClose={() => setIsOpen(false)}>
        <Week52ConditionContent onConfirm={handleConfirm} />
      </ConditionBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "600" },
  content: { marginTop: 10 },
  subTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: { fontSize: 14, color: "#333" },
  value: { fontSize: 14, color: "#000" },
});
