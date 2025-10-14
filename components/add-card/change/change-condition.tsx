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
}: {
  onTempSave: (id: string, getter: () => any[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCondition, setHasCondition] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [conditionData, setConditionData] =
    useState<ChangeConditionData | null>(null);

  const handleConfirm = (data: ChangeConditionData) => {
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
  }, [conditionData]);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((p) => !p);
  };

  return (
    <>
      <Pressable onPress={hasCondition ? toggleExpand : undefined}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>변동률</Text>
            <TouchableOpacity onPress={() => setIsOpen(true)}>
              {hasCondition ? (
                <EditIcon width={18} height={18} />
              ) : (
                <AddIcon width={30} height={30} />
              )}
            </TouchableOpacity>
          </View>

          {expanded && conditionData && (
            <>
              <View style={styles.divider} />

              {/* 오늘 시가 기준 */}
              {!!conditionData.dailyChanges?.length && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>오늘 시가 기준</Text>
                  {conditionData.dailyChanges.map((r, i) => (
                    <View key={`daily-${i}`} style={styles.row}>
                      <Text style={styles.label}>
                        오늘 시가 대비 {r.direction === "+" ? "상승" : "하락"}률
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
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "600" },
  divider: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginTop: 8,
    marginBottom: 6,
    marginHorizontal: -12,
  },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: { fontSize: 13, color: "#333" },
  value: { fontSize: 13, color: "#000", fontWeight: "500" },
});
