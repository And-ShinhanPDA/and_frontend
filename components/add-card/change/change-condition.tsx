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
import ChevronDown from "../../../assets/images/ChevronDown.svg";
import EditIcon from "../../../assets/images/edit.svg";
import ConditionTooltip from "../../condition/condition-tooltip";
import ConditionBottomSheet from "../../modals/condition-bottom-sheet";
import ChangeConditionContent, {
  ChangeConditionData,
} from "./change-condition-content";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ChangeConditionCard({
  onTempSave,
  initialValue,
}: {
  onTempSave: (id: string, getter: () => any[]) => void;
  initialValue?: ChangeConditionData;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCondition, setHasCondition] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [conditionData, setConditionData] =
    useState<ChangeConditionData | null>(initialValue || null);

  // initialValue가 있으면 초기 설정
  useEffect(() => {
    if (initialValue) {
      setConditionData(initialValue);
      setHasCondition(true);
      setExpanded(true);
    }
  }, [initialValue]);

  const handleConfirm = (data: ChangeConditionData) => {
    setConditionData(data);

    // 데이터가 비어있는지 확인 (문자열로 변환 후 trim 확인)
    const hasData =
      (data.dailyChanges &&
        data.dailyChanges.some((c) => String(c.amount).trim() !== "")) ||
      (data.baseChanges &&
        data.baseChanges.some((c) => String(c.amount).trim() !== ""));

    setHasCondition(hasData);
    setIsOpen(false);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(hasData);
  };

  useEffect(() => {
    const getCondition = () => {
      if (!conditionData) return [];

      const list: any[] = [];

      // 오늘 시가 기준
      conditionData.dailyChanges.forEach((c) => {
        const amount = Number(c.amount);
        if (!isNaN(amount) && amount > 0) {
          list.push({
            indicator:
              c.direction === "+"
                ? "PRICE_RATE_DAILY_UP"
                : "PRICE_RATE_DAILY_DOWN",
            threshold: amount,
          });
        }
      });

      // 현재가 기준
      conditionData.baseChanges.forEach((c) => {
        const amount = Number(c.amount);
        if (!isNaN(amount) && amount > 0) {
          list.push({
            indicator:
              c.direction === "+"
                ? "PRICE_RATE_BASE_UP"
                : "PRICE_RATE_BASE_DOWN",
            threshold: amount,
          });
        }
      });

      console.log("최종 변동률 payload:", list);
      return list;
    };

    onTempSave("changeRate", getCondition);
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
              <Text style={styles.title}>변동률</Text>
              <ConditionTooltip description={CONDITION_DESCRIPTIONS.change} />
            </View>
            <View style={styles.rightButtons}>
              {hasCondition && (
                <View
                  style={[
                    styles.chevronWrapper,
                    expanded && { transform: [{ rotate: "180deg" }] },
                  ]}
                >
                  <ChevronDown width={18} height={18} />
                </View>
              )}
              <TouchableOpacity onPress={() => setIsOpen(true)}>
                {hasCondition ? (
                  <EditIcon width={18} height={18} />
                ) : (
                  <AddIcon width={30} height={30} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {expanded &&
            conditionData &&
            (conditionData.dailyChanges?.length > 0 ||
              conditionData.baseChanges?.length > 0) && (
              <>
                <View style={styles.divider} />

                {/* 오늘 시가 기준 */}
                {!!conditionData.dailyChanges?.length && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>오늘 시가 기준</Text>
                    {conditionData.dailyChanges.map((r, i) => (
                      <View key={`daily-${i}`} style={styles.row}>
                        <Text style={styles.label}>
                          시가 대비 {r.direction === "+" ? "상승" : "하락"}률
                          이상
                        </Text>
                        <Text style={styles.value}>
                          {r.amount ? `${r.amount}%` : "-"}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* 현재가 기준 */}
                {!!conditionData.baseChanges?.length && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>현재가 기준</Text>
                    {conditionData.baseChanges.map((r, i) => (
                      <View key={`base-${i}`} style={styles.row}>
                        <Text style={styles.label}>
                          현재가 대비 {r.direction === "+" ? "상승" : "하락"}률
                          이상
                        </Text>
                        <Text style={styles.value}>
                          {r.amount ? `${r.amount}%` : "-"}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
        </View>
      </Pressable>

      <ConditionBottomSheet
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        ratio={0.6}
      >
        <ChangeConditionContent
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
  rightButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  chevronWrapper: {
    justifyContent: "center",
    alignItems: "center",
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
