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
import AddIcon from "../../../assets/images/add.svg";
import EditIcon from "../../../assets/images/edit.svg";
import ConditionBottomSheet from "../../modals/condition-bottom-sheet";
import Week52ConditionContent from "./week52-condition-content";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Week52ConditionCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCondition, setHasCondition] = useState(false);
  const [conditionData, setConditionData] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);

  const handleConfirm = (data: any) => {
    console.log("52주 조건 입력:", data);
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
            <Text style={styles.title}>52주</Text>
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

              {/* 최고가/최저가 여부 */}
              {conditionData.highLow?.some((item: any) => item.checked) && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    최근 52주 기준 최고가 | 최저가 여부
                  </Text>

                  {conditionData.highLow
                    .filter((item: any) => item.checked)
                    .map((item: any, idx: number) => (
                      <View key={idx} style={styles.row}>
                        <Text style={styles.label}>{item.type}</Text>
                      </View>
                    ))}
                </View>
              )}

              {/* 최고가/최저가 근접 여부 */}
              {conditionData.proximity?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    최근 52주 기준 최고가 | 최저가 근접 여부
                  </Text>
                  {conditionData.proximity.map((item: any, idx: number) => (
                    <View key={idx} style={styles.row}>
                      <Text style={styles.label}>{item.type}</Text>
                      <Text style={styles.value}>
                        {item.sign}
                        {item.value}%
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
        ratio={0.4}
      >
        <Week52ConditionContent onConfirm={handleConfirm} />
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: { fontSize: 13, color: "#333" },
  value: { fontSize: 13, color: "#000", fontWeight: "500" },
});
