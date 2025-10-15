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
import RSIConditionContent from "./rsi-condition-content";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function RSIConditionCard({
  onTempSave,
  initialValue,
}: {
  onTempSave: (id: string, getter: () => any[]) => void;
  initialValue?: {
    overbought: boolean;
    oversold: boolean;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCondition, setHasCondition] = useState(false);
  const [conditionData, setConditionData] = useState<{
    overbought: boolean;
    oversold: boolean;
  } | null>(initialValue || null);
  const [expanded, setExpanded] = useState(false);

  // initialValue가 있으면 초기 설정
  useEffect(() => {
    if (initialValue) {
      setConditionData(initialValue);
      setHasCondition(true);
      setExpanded(true);
    }
  }, [initialValue]);

  const handleConfirm = (data: { overbought: boolean; oversold: boolean }) => {
    console.log("RSI 조건 입력:", data);
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
      if (conditionData.overbought)
        list.push({
          indicator: "RSI_OVER",
          threshold: 70,
          threshold2: null,
        });
      if (conditionData.oversold)
        list.push({
          indicator: "RSI_UNDER",
          threshold: 30,
          threshold2: null,
        });
      return list;
    };
    onTempSave("rsi", getCondition);
  }, [conditionData, onTempSave]);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <>
      <Pressable onPress={hasCondition ? toggleExpand : undefined}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>RSI</Text>
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

              {/* 과매수 */}
              {conditionData.overbought && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>RSI 과매수 경고</Text>
                  <Text style={styles.desc}>RSI ≥ 70</Text>
                </View>
              )}

              {/* 과매도 */}
              {conditionData.oversold && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>RSI 과매도 경고</Text>
                  <Text style={styles.desc}>RSI ≤ 30</Text>
                </View>
              )}
            </>
          )}
        </View>
      </Pressable>

      <ConditionBottomSheet
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        ratio={0.45}
      >
        <RSIConditionContent
          onConfirm={handleConfirm}
          initialValue={conditionData}
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
    paddingVertical: 10,
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
  desc: { fontSize: 13, color: "#666", marginLeft: 4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: { fontSize: 13, color: "#333" },
});
