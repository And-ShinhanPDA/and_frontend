import ConditionSection from "@/components/condition/condition-section";
import { BOLLINGER_SECTION_DESCRIPTIONS } from "@/components/condition/constants";
import React, { useState } from "react";
import {
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BollingerBandConditionContent({
  onConfirm,
}: {
  onConfirm: (data: any) => void;
}) {
  const [toggles, setToggles] = useState({
    upper: false,
    lower: false,
  });

  const toggle = (key: keyof typeof toggles) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirmPress = () => {
    onConfirm({
      upper: toggles.upper,
      lower: toggles.lower,
    });
  };

  return (
    <ScrollView style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>볼린저밴드</Text>

        <ConditionSection
          title="볼린저 밴드 강세 신호 경고"
          description={BOLLINGER_SECTION_DESCRIPTIONS.UPPER}
          value={toggles.upper}
          onToggle={() => toggle("upper")}
          rows={[]}
          hasFilled={false}
          onAdd={() => {}}
          renderRow={() => null}
        />

        <ConditionSection
          title="볼린저 밴드 하락 신호 경고"
          description={BOLLINGER_SECTION_DESCRIPTIONS.LOWER}
          value={toggles.lower}
          onToggle={() => toggle("lower")}
          rows={[]}
          hasFilled={false}
          onAdd={() => {}}
          renderRow={() => null}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => setToggles({ upper: false, lower: false })}
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
