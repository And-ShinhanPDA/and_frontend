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
import VolumeConditionContent from "./volume-condition-content";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function VolumeConditionCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCondition, setHasCondition] = useState(false);
  const [conditionData, setConditionData] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);

  const handleConfirm = (data: any) => {
    console.log("거래량 조건 입력:", data);
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
            <Text style={styles.title}>거래량</Text>
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

              {/* 전일 거래량 대비 */}
              {conditionData.prevChange?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>전일 거래량 대비</Text>
                  {conditionData.prevChange.map((item: any, idx: number) => (
                    <View key={idx} style={styles.row}>
                      <Text style={styles.label}>변동 기준</Text>
                      <Text style={styles.value}>
                        {item.sign}
                        {item.value}%
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 평균 거래량 대비 */}
              {conditionData.avgChange?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>평균 거래량 대비</Text>
                  {conditionData.avgChange.map((item: any, idx: number) => (
                    <View key={idx} style={styles.row}>
                      <Text style={styles.label}>변동 기준</Text>
                      <Text style={styles.value}>
                        {item.sign}
                        {item.value}%
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 거래량 급증 경고 */}
              {conditionData.spike && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>거래량 급증 경고</Text>
                  <Text style={styles.desc}>
                    전일 대비 거래량이 20% 이상 증가 시 알림
                  </Text>
                </View>
              )}

              {/* 거래량 감소 경고 */}
              {conditionData.drop && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>거래량 감소 경고</Text>
                  <Text style={styles.desc}>
                    전일 대비 거래량이 20% 이상 감소 시 알림
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </Pressable>

      <ConditionBottomSheet
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        ratio={0.75}
      >
        <VolumeConditionContent onConfirm={handleConfirm} />
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
