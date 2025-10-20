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
import ConditionBottomSheet from "../../modals/condition-bottom-sheet";
import PriceConditionContent, {
    PriceConditionData,
} from "./price-condition-content";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PriceConditionCard({
  onTempSave,
  initialValue,
}: {
  onTempSave: (id: string, getter: () => any[]) => void;
  initialValue?: PriceConditionData;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCondition, setHasCondition] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [conditionData, setConditionData] = useState<PriceConditionData | null>(
    initialValue || null
  );

  // initialValue가 있으면 초기 설정
  useEffect(() => {
    if (initialValue) {
      setConditionData(initialValue);
      setHasCondition(true);
      setExpanded(true);
    }
  }, [initialValue]);

  const handleConfirm = (data: PriceConditionData) => {
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

      // --- 가격 제한 ---
      conditionData.limits.forEach((limit) => {
        const amount = Number(limit.amount);
        if (!isNaN(amount) && amount > 0) {
          list.push({
            indicator:
              limit.comparison === "이상" ? "PRICE_ABOVE" : "PRICE_BELOW",
            threshold: amount,
          });
        }
      });

      // --- 시가 기준 (+ / -) ---
      conditionData.openChanges.forEach((change) => {
        const amount = Number(change.amount);
        if (!isNaN(amount) && amount > 0) {
          list.push({
            indicator:
              change.direction === "+"
                ? "PRICE_CHANGE_DAILY_UP"
                : "PRICE_CHANGE_DAILY_DOWN",
            threshold: amount,
          });
        }
      });

      // --- 현재가 기준 (+ / -) ---
      conditionData.currentChanges.forEach((change) => {
        const amount = Number(change.amount);
        if (!isNaN(amount) && amount > 0) {
          list.push({
            indicator:
              change.direction === "+"
                ? "PRICE_CHANGE_BASE_UP"
                : "PRICE_CHANGE_BASE_DOWN",
            threshold: amount,
          });
        }
      });

      console.log("최종 PRICE payload:", list);
      return list;
    };

    onTempSave("price", getCondition);
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
            <Text style={styles.title}>가격</Text>
            <TouchableOpacity onPress={() => setIsOpen(true)}>
              {hasCondition ? (
                <EditIcon width={18} height={18} />
              ) : (
                <AddIcon width={30} height={30} />
              )}
            </TouchableOpacity>
          </View>

          {expanded && conditionData && 
           (conditionData.limits?.length > 0 || conditionData.changes?.length > 0) && (
            <>
              <View style={styles.divider} />

              {/* 가격 제한 */}
              {!!conditionData.limits?.length && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>가격 제한</Text>
                  {conditionData.limits.map((r, i) => (
                    <View key={`limit-${i}`} style={styles.row}>
                      <Text style={styles.label}>
                        현재가 {r.comparison}일 때
                      </Text>
                      <Text style={styles.value}>
                        {r.amount ? `${r.amount}원` : "-"}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 시가 기준 */}
              {!!conditionData.openChanges?.length && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>가격 변경 (시가)</Text>
                  {conditionData.openChanges.map((r, i) => (
                    <View key={`open-${i}`} style={styles.row}>
                      <Text style={styles.label}>
                        시가 대비 {r.direction === "+" ? "상승" : "하락"} 금액
                        이상
                      </Text>
                      <Text style={styles.value}>
                        {r.amount ? `${r.amount}원` : "-"}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 현재가 기준 */}
              {!!conditionData.currentChanges?.length && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>가격 변경 (현재가)</Text>
                  {conditionData.currentChanges.map((r, i) => (
                    <View key={`curr-${i}`} style={styles.row}>
                      <Text style={styles.label}>
                        현재가 기준 {r.direction === "+" ? "상승" : "하락"} 금액
                        이상
                      </Text>
                      <Text style={styles.value}>
                        {r.amount ? `${r.amount}원` : "-"}
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
        ratio={0.65}
      >
        <PriceConditionContent
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
