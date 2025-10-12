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

              {/* 촤고가 경보 */}
              {conditionData.highAlert && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>52주 최고가 경보</Text>
                  <Text style={styles.desc}>최고가 갱신</Text>
                </View>
              )}

              {/* 최고가 근접 여부 */}
              {conditionData.highProximity?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>52주 최고가 근접 여부</Text>
                  {conditionData.highProximity.map((item: any, idx: number) => (
                    <View key={idx} style={styles.row}>
                      <Text style={styles.label}>근접 기준</Text>
                      <Text style={styles.value}>{item.value}%</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 최저가 경보 */}
              {conditionData.lowAlert && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>52주 최저가 경보</Text>
                  <Text style={styles.desc}>최저가 갱신</Text>
                </View>
              )}

              {/*최저가 근접 여부 */}
              {conditionData.lowProximity?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>52주 최저가 근접 여부</Text>
                  {conditionData.lowProximity.map((item: any, idx: number) => (
                    <View key={idx} style={styles.row}>
                      <Text style={styles.label}>근접 기준</Text>
                      <Text style={styles.value}>{item.value}%</Text>
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
        ratio={0.7}
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
  desc: { fontSize: 13, color: "#666", marginLeft: 4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: { fontSize: 13, color: "#333" },
  value: { fontSize: 13, color: "#000", fontWeight: "500" },
});
