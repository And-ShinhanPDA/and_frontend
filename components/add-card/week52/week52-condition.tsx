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
import Week52ConditionContent from "./week52-condition-content";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Week52ConditionCard({
  onTempSave,
  initialValue,
}: {
  onTempSave: (id: string, getter: () => any[]) => void;
  initialValue?: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCondition, setHasCondition] = useState(false);
  const [conditionData, setConditionData] = useState<any>(initialValue || null);
  const [expanded, setExpanded] = useState(false);

  // initialValue가 있으면 초기 설정
  useEffect(() => {
    if (initialValue) {
      setConditionData(initialValue);
      setHasCondition(true);
      setExpanded(true);
    }
  }, [initialValue]);

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

  useEffect(() => {
    const getCondition = () => {
      if (!conditionData) return [];

      const list: any[] = [];

      // 52주 최고가 이상
      if (conditionData.highAlert) {
        list.push({
          indicator: "HIGH_52W",
          threshold: null,
        });
      }

      // 52주 최저가 이하
      if (conditionData.lowAlert) {
        list.push({
          indicator: "LOW_52W",
          threshold: null,
        });
      }

      // 52주 최고가 근접 (설정값 존재 시)
      if (
        conditionData.highProximity &&
        !isNaN(Number(conditionData.highProximity.value))
      ) {
        list.push({
          indicator: "NEAR_HIGH_52W",
          threshold: Number(conditionData.highProximity.value),
        });
      }

      // 52주 최저가 근접 (설정값 존재 시)
      if (
        conditionData.lowProximity &&
        !isNaN(Number(conditionData.lowProximity.value))
      ) {
        list.push({
          indicator: "NEAR_LOW_52W",
          threshold: Number(conditionData.lowProximity.value),
        });
      }

      console.log("최종 52주 payload:", list);
      return list;
    };

    onTempSave("week52", getCondition);
  }, [conditionData, onTempSave]);

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

          {expanded && conditionData && 
           (conditionData.highAlert || conditionData.highProximity?.value || 
            conditionData.lowAlert || conditionData.lowProximity?.value) && (
            <>
              <View style={styles.divider} />

              {/* 최고가 경보 */}
              {conditionData.highAlert && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>52주 최고가 경보</Text>
                  <Text style={styles.desc}>최고가 갱신</Text>
                </View>
              )}

              {/* 최고가 근접 */}
              {conditionData.highProximity?.value && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>52주 최고가 근접</Text>
                  <Text style={styles.desc}>
                    근접 기준 {conditionData.highProximity.value}%
                  </Text>
                </View>
              )}

              {/* 최저가 경보 */}
              {conditionData.lowAlert && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>52주 최저가 경보</Text>
                  <Text style={styles.desc}>최저가 갱신</Text>
                </View>
              )}

              {/* 최저가 근접 */}
              {conditionData.lowProximity?.value && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>52주 최저가 근접</Text>
                  <Text style={styles.desc}>
                    근접 기준 {conditionData.lowProximity.value}%
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
        ratio={0.7}
      >
        <Week52ConditionContent
          onConfirm={handleConfirm}
          initialValue={conditionData || null}
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
  desc: { 
    fontSize: 13, 
    color: "#555",
    marginLeft: 4,
    fontFamily: "Pretendard",
  },
});
