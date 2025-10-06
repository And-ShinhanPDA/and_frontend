import React, { useState } from "react";
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
import AddIcon from "../../assets/images/add.svg";
import EditIcon from "../../assets/images/edit.svg";
import ConditionBottomSheet from "../modals/condition-bottom-sheet";
import RSIConditionContent from "./rsi-condition-content";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function RSIConditionCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCondition, setHasCondition] = useState(false);
  const [conditionData, setConditionData] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);

  const handleConfirm = (data: any) => {
    setConditionData(data);
    setHasCondition(true);
    setIsOpen(false);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(true);
  };

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

              {/* RSI 목표 지수 도달 시 경고 */}
              {conditionData.rsiTargets?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    RSI 목표 지수 도달시 경고
                  </Text>
                  {conditionData.rsiTargets.map((item: any, idx: number) => (
                    <View key={idx} style={styles.row}>
                      <Text style={styles.label}>
                        RSI {item.comparison} {item.value}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* RSI 과매수 | 과매도 여부 */}
              {conditionData.rsiStates?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    RSI 과매수 / 과매도 여부
                  </Text>
                  {conditionData.rsiStates.map((item: any, idx: number) => (
                    <View key={idx} style={styles.row}>
                      <Text style={styles.label}>{item.state}</Text>
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
        ratio={0.55}
      >
        <RSIConditionContent onConfirm={handleConfirm} />
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
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
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
});
