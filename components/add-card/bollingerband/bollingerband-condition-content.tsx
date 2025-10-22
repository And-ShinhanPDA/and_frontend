import ConditionSection from "@/components/condition/condition-section";
import { BOLLINGER_SECTION_DESCRIPTIONS } from "@/components/condition/constants";
import React, { useEffect, useState } from "react";
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
  initialValue,
}: {
  onConfirm: (data: any) => void;
  initialValue?: { upper: boolean; lower: boolean } | null;
}) {
  const [toggles, setToggles] = useState({
    upper: false,
    lower: false,
  });

  useEffect(() => {
    if (initialValue) {
      setToggles({
        upper: !!initialValue.upper,
        lower: !!initialValue.lower,
      });
    } else {
      setToggles({ upper: false, lower: false });
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
        <Text style={styles.sectionTitle}>볼린저밴드 설정</Text>
        <Text style={styles.sectionSubtitle}>
          볼린저밴드 상/하단 접촉 조건을 설정하세요
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
      </ScrollView>

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
