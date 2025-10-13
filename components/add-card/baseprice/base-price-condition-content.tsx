import ConditionSection from "@/components/condition/condition-section";
import { BASE_SECTION_DESCRIPTIONS } from "@/components/condition/constants";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BasePriceConditionContent({
  onConfirm,
}: {
  onConfirm: (data: any) => void;
}) {
  const [toggles, setToggles] = useState({
    open: false,
    close: false,
  });

  const toggleSection = (key: keyof typeof toggles) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleConfirmPress = () => {
    onConfirm(toggles);
  };

  return (
    <ScrollView style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>기준가</Text>

        {/* 시가 */}
        <ConditionSection
          title="시가"
          description={BASE_SECTION_DESCRIPTIONS.OPEN}
          value={toggles.open}
          onToggle={() => toggleSection("open")}
          rows={[]}
          hasFilled={false}
          onAdd={() => {}}
          renderRow={() => null}
        />

        {/* 종가 */}
        <ConditionSection
          title="종가"
          description={BASE_SECTION_DESCRIPTIONS.CLOSE}
          value={toggles.close}
          onToggle={() => toggleSection("close")}
          rows={[]}
          hasFilled={false}
          onAdd={() => {}}
          renderRow={() => null}
        />
      </View>

      <View style={styles.footerFixed}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => setToggles({ open: false, close: false })}
        >
          <Text style={styles.resetText}>초기화</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmPress}
        >
          <Text style={styles.confirmText}>확인</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#fff" },
  container: { paddingHorizontal: 16, paddingVertical: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 10 },
  footerFixed: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
    marginTop: 10,
  },
  resetButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginRight: 8,
  },
  resetText: { fontSize: 15, color: "#333", fontWeight: "500" },
  confirmButton: {
    flex: 1,
    backgroundColor: "#4CC439",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginLeft: 8,
  },
  confirmText: { fontSize: 15, color: "#fff", fontWeight: "600" },
});
