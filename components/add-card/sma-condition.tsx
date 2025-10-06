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
import SMAConditionContent from "./sma-condition-content";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SMAConditionCard() {
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
            <Text style={styles.title}>SMA</Text>
            <TouchableOpacity onPress={() => setIsOpen(true)}>
              {hasCondition ? (
                <EditIcon width={18} height={18} />
              ) : (
                <AddIcon width={30} height={30} />
              )}
            </TouchableOpacity>
          </View>

          {expanded && hasCondition && conditionData && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SMA 목표 가격 도달 여부</Text>
                {conditionData.targets && conditionData.targets.length > 0 ? (
                  conditionData.targets.map((t: any, idx: number) => (
                    <View key={idx} style={styles.row}>
                      <Text style={styles.label}>{t.period}</Text>
                      <Text style={styles.value}>
                        {t.value ? `${t.value}원` : "미입력"}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>
                    조건이 설정되지 않았습니다.
                  </Text>
                )}
              </View>
            </>
          )}
        </View>
      </Pressable>

      <ConditionBottomSheet
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        ratio={0.6}
      >
        <SMAConditionContent onConfirm={handleConfirm} />
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
    marginBottom: 4,
  },
  label: { fontSize: 13, color: "#333" },
  value: { fontSize: 13, fontWeight: "500" },
  emptyText: { fontSize: 13, color: "#888", marginTop: 2 },
});
