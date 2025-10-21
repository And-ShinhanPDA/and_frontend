import { CONDITION_DESCRIPTIONS } from "@/constants/conditionDescriptions";
import React, { useEffect, useState } from "react";
import {
    LayoutAnimation,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";
import AddIcon from "../../../assets/images/add.svg";
import EditIcon from "../../../assets/images/edit.svg";
import ConditionTooltip from "../../condition/condition-tooltip";
import ConditionBottomSheet from "../../modals/condition-bottom-sheet";
import TrailingConditionContent, {
    TrailingConditionData,
} from "./trailing-condition-content";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TrailingConditionCard({
  onTempSave,
  initialValue,
}: {
  onTempSave: (id: string, getter: () => any[]) => void;
  initialValue?: TrailingConditionData;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCondition, setHasCondition] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [conditionData, setConditionData] =
    useState<TrailingConditionData | null>(initialValue || null);

  // initialValue가 있으면 초기 설정
  useEffect(() => {
    if (initialValue) {
      setConditionData(initialValue);
      setHasCondition(true);
      setExpanded(true);
    }
  }, [initialValue]);

  const handleConfirm = (data: TrailingConditionData) => {
    setConditionData(data);
    setHasCondition(true);
    setIsOpen(false);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(true);
  };

  useEffect(() => {
    const getCondition = () => {
      if (!conditionData) return [];

      const list: any[] = [];

      // 손절매 (하락)
      if (String(conditionData.stopPrice).trim() !== "")
        list.push({
          indicator: "TRAILING_STOP_PRICE",
          threshold: Number(conditionData.stopPrice),
        });
      if (String(conditionData.stopPercent).trim() !== "")
        list.push({
          indicator: "TRAILING_STOP_PERCENT",
          threshold: Number(conditionData.stopPercent),
        });

      // 매수 (상승)
      if (String(conditionData.buyPrice).trim() !== "")
        list.push({
          indicator: "TRAILING_BUY_PRICE",
          threshold: Number(conditionData.buyPrice),
        });
      if (String(conditionData.buyPercent).trim() !== "")
        list.push({
          indicator: "TRAILING_BUY_PERCENT",
          threshold: Number(conditionData.buyPercent),
        });

      console.log("최종 TRAILING payload:", list);
      return list;
    };

    onTempSave("trailing", getCondition);
  }, [conditionData, onTempSave]);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((p) => !p);
  };

  return (
    <>
      <Pressable onPress={hasCondition ? toggleExpand : undefined}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>후행</Text>
              <ConditionTooltip description={CONDITION_DESCRIPTIONS.trailing} />
            </View>
            <TouchableOpacity onPress={() => setIsOpen(true)}>
              {hasCondition ? (
                <EditIcon width={18} height={18} />
              ) : (
                <AddIcon width={30} height={30} />
              )}
            </TouchableOpacity>
          </View>

          {expanded && conditionData && 
           (conditionData.stopPrice || conditionData.stopPercent || 
            conditionData.risePrice || conditionData.risePercent) && (
            <>
              <View style={styles.divider} />

              {/* 하락 조건 */}
              {(conditionData.stopPrice || conditionData.stopPercent) && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>추적 손절매 (하락)</Text>
                  {conditionData.stopPrice && (
                    <View style={styles.row}>
                      <Text style={styles.label}>최근 고가 대비 하락 금액</Text>
                      <Text style={styles.value}>
                        {conditionData.stopPrice}원
                      </Text>
                    </View>
                  )}
                  {conditionData.stopPercent && (
                    <View style={styles.row}>
                      <Text style={styles.label}>최근 고가 대비 하락 비율</Text>
                      <Text style={styles.value}>
                        {conditionData.stopPercent}%
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* 상승 조건 */}
              {(conditionData.buyPrice || conditionData.buyPercent) && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>추적 매수 (상승)</Text>
                  {conditionData.buyPrice && (
                    <View style={styles.row}>
                      <Text style={styles.label}>최근 고가 대비 상승 금액</Text>
                      <Text style={styles.value}>
                        {conditionData.buyPrice}원
                      </Text>
                    </View>
                  )}
                  {conditionData.buyPercent && (
                    <View style={styles.row}>
                      <Text style={styles.label}>최근 고가 대비 상승 비율</Text>
                      <Text style={styles.value}>
                        {conditionData.buyPercent}%
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </Pressable>

      <ConditionBottomSheet
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        ratio={0.65}
      >
        <TrailingConditionContent
          onConfirm={handleConfirm}
          initialValue={conditionData || undefined}
        />
      </ConditionBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: { 
    fontSize: 17, 
    fontWeight: "700",
    color: "#111",
    fontFamily: "Pretendard",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginTop: 12,
    marginBottom: 10,
    marginHorizontal: -16,
  },
  section: { 
    marginBottom: 12,
    paddingVertical: 6,
  },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: "600", 
    marginBottom: 8,
    color: "#666",
    fontFamily: "Pretendard",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    paddingVertical: 4,
  },
  label: { 
    fontSize: 13, 
    color: "#555",
    fontFamily: "Pretendard",
  },
  value: { 
    fontSize: 14, 
    color: "#111", 
    fontWeight: "600",
    fontFamily: "Pretendard",
  },
});
