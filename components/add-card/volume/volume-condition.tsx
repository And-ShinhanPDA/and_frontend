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
import VolumeConditionContent from "./volume-condition-content";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function VolumeConditionCard({
  onTempSave,
}: {
  onTempSave: (id: string, getter: () => any[]) => void;
}) {
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

  useEffect(() => {
    const getCondition = () => {
      if (!conditionData) return [];

      const list: any[] = [];

      // 평균 거래량 대비 상승
      if (conditionData.avgRise) {
        list.push({
          indicator: "VOLUME_AVG_DEV_UP",
          threshold: Number(conditionData.avgRise),
        });
      }

      // 평균 거래량 대비 하락
      if (conditionData.avgDrop) {
        list.push({
          indicator: "VOLUME_AVG_DEV_DOWN",
          threshold: Number(conditionData.avgDrop),
        });
      }

      // 전일 대비 거래량 급증
      if (conditionData.spike) {
        list.push({
          indicator: "VOLUME_CHANGE_PERCENT_UP",
          threshold: 20,
        });
      }

      // 전일 대비 거래량 감소
      if (conditionData.drop) {
        list.push({
          indicator: "VOLUME_CHANGE_PERCENT_DOWN",
          threshold: 20,
        });
      }

      console.log("최종 거래량 payload:", list);
      return list;
    };

    onTempSave("volume", getCondition);
  }, [conditionData]);

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

              {/* 평균 거래량 대비 상승 */}
              {conditionData.avgRise && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>평균 거래량 대비 상승</Text>
                  <Text style={styles.desc}>
                    평균 대비 +{conditionData.avgRise}% 이상
                  </Text>
                </View>
              )}

              {/* 평균 거래량 대비 하락 */}
              {conditionData.avgDrop && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>평균 거래량 대비 하락</Text>
                  <Text style={styles.desc}>
                    평균 대비 -{conditionData.avgDrop}% 이하
                  </Text>
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
        ratio={0.7}
      >
        <VolumeConditionContent
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
});
