import ConditionSection from "@/components/condition/condition-section";
import { RSI_SECTION_DESCRIPTIONS } from "@/components/condition/constants";
import React, { useEffect, useState } from "react";
import {
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RSIConditionContent({
  onConfirm,
  initialValue,
}: {
  onConfirm: (data: any) => void;
  initialValue?: { overbought: boolean; oversold: boolean } | null;
}) {
  const [toggles, setToggles] = useState({
    overbought: false,
    oversold: false,
  });

  useEffect(() => {
    if (initialValue) {
      setToggles({
        overbought: !!initialValue.overbought,
        oversold: !!initialValue.oversold,
      });
    } else {
      setToggles({ overbought: false, oversold: false });
    }
  }, [initialValue]);

  const toggle = (key: keyof typeof toggles) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirmPress = () => {
    onConfirm({ ...toggles });
  };

  return (
    <ScrollView style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>RSI</Text>

        {/* RSI 과매수 */}
        <ConditionSection
          title="RSI 과매수 경고"
          description={RSI_SECTION_DESCRIPTIONS.OVERBOUGHT}
          value={toggles.overbought}
          onToggle={() => toggle("overbought")}
          rows={[]}
          hasFilled={false}
          onAdd={() => {}}
          renderRow={() => null}
        />

        {/* RSI 과매도 */}
        <ConditionSection
          title="RSI 과매도 경고"
          description={RSI_SECTION_DESCRIPTIONS.OVERSOLD}
          value={toggles.oversold}
          onToggle={() => toggle("oversold")}
          rows={[]}
          hasFilled={false}
          onAdd={() => {}}
          renderRow={() => null}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            setToggles({ overbought: false, oversold: false });
          }}
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
