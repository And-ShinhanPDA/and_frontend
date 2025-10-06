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

              {/* 현재 거래량 대비 */}
              {conditionData.currentVolume?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>현재 거래량 대비</Text>
                  {conditionData.currentVolume.map((item: any, idx: number) => (
                    <Text key={idx} style={styles.value}>
                      {item.value}% {item.compare}
                    </Text>
                  ))}
                </View>
              )}

              {/* 최신 거래량 대비 */}
              {conditionData.recentVolume?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>최신 거래량 대비</Text>
                  {conditionData.recentVolume.map((item: any, idx: number) => (
                    <Text key={idx} style={styles.value}>
                      {item.value}% {item.compare}
                    </Text>
                  ))}
                </View>
              )}

              {/* 급증 감소 여부 */}
              {conditionData.spikes?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>거래량 급증·감소 여부</Text>
                  {conditionData.spikes.map((item: any, idx: number) => (
                    <Text key={idx} style={styles.value}>
                      {item.type}
                    </Text>
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
  divider: { height: 1, backgroundColor: "#EAEAEA", marginVertical: 8 },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  value: { fontSize: 13, color: "#333", marginLeft: 4 },
});
