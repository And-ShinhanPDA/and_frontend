import ConditionSection from "@/components/condition/condition-section";
import { SMA_SECTION_DESCRIPTIONS } from "@/components/condition/constants";
import useConditionRows from "@/hooks/use-condition-rows";
import React, { useState } from "react";
import {
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SMATargetRow from "./sma-target-row";

export default function SMAConditionContent({
  onConfirm,
}: {
  onConfirm: (data: any) => void;
}) {
  const [toggles, setToggles] = useState({
    target: false,
    shortCross: false,
    longCross: false,
  });

  const toggle = (key: keyof typeof toggles) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const targetRows = useConditionRows<
    { id: number; filled: boolean; value: string; period: string },
    { value: string; period: string }
  >({
    initial: { filled: false, value: "", period: "5일" },
    updateFn: (prev, data) => ({
      ...prev,
      filled: data.value.trim() !== "",
      value: data.value,
      period: data.period,
    }),
  });

  const handleConfirmPress = () => {
    onConfirm({
      target: toggles.target ? targetRows.rows.filter((r) => r.filled) : [],
      shortCross: toggles.shortCross,
      longCross: toggles.longCross,
    });
  };

  return (
    <ScrollView style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>SMA</Text>

        <ConditionSection
          title="SMA 목표 가격 알림"
          description={SMA_SECTION_DESCRIPTIONS.TARGET}
          value={toggles.target}
          onToggle={() => toggle("target")}
          rows={targetRows.rows}
          hasFilled={targetRows.hasFilled}
          onAdd={targetRows.addRow}
          renderRow={(r) => (
            <SMATargetRow
              key={r.id}
              onRemove={() => targetRows.removeRow(r.id)}
              onReset={() => targetRows.resetRow(r.id)}
              onValueChange={(data) => targetRows.updateRow(r.id, data)}
              isSingleRow={targetRows.rows.length === 1}
            />
          )}
        />

        <ConditionSection
          title="단기선이 장기선을 돌파"
          description={SMA_SECTION_DESCRIPTIONS.SHORTCROSS}
          value={toggles.shortCross}
          onToggle={() => toggle("shortCross")}
          rows={[]}
          hasFilled={false}
          onAdd={() => {}}
          renderRow={() => null}
        />

        <ConditionSection
          title="장기선이 단기선을 누름"
          description={SMA_SECTION_DESCRIPTIONS.LONGCROSS}
          value={toggles.longCross}
          onToggle={() => toggle("longCross")}
          rows={[]}
          hasFilled={false}
          onAdd={() => {}}
          renderRow={() => null}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() =>
            setToggles({ target: false, shortCross: false, longCross: false })
          }
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
  footer: {
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
