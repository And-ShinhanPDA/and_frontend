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
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>RSI 설정</Text>
        <Text style={styles.sectionSubtitle}>
          과매수/과매도 조건을 설정하세요
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.container}>
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
      </ScrollView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FAFAFA",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
    fontFamily: "Pretendard",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
    fontWeight: "400",
    fontFamily: "Pretendard",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  resetButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#FAFAFA",
  },
  resetText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
    fontFamily: "Pretendard",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#4CC439",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginLeft: 8,
  },
  confirmText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "700",
    fontFamily: "Pretendard",
  },
});
