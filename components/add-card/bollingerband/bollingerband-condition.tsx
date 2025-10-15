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
import BollingerBandConditionContent from "./bollingerband-condition-content";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function BollingerBandConditionCard({
  onTempSave,
  initialValue,
}: {
  onTempSave: (id: string, getter: () => any[]) => void;
  initialValue?: {
    upper: boolean;
    lower: boolean;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCondition, setHasCondition] = useState(false);
  const [conditionData, setConditionData] = useState<{
    upper: boolean;
    lower: boolean;
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

  const handleConfirm = (data: { upper: boolean; lower: boolean }) => {
    console.log("볼린저밴드 조건 입력:", data);
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

      if (conditionData.upper) {
        list.push({
          indicator: "BOLLINGER_UPPER_TOUCH",
          threshold: null,
        });
      }

      if (conditionData.lower) {
        list.push({
          indicator: "BOLLINGER_LOWER_TOUCH",
          threshold: null,
        });
      }

      console.log("최종 볼린저밴드 payload:", list);
      return list;
    };

    onTempSave("bollinger", getCondition);
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
            <Text style={styles.title}>볼린저밴드</Text>
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
              {conditionData.upper && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    볼린저 밴드 강세 신호 경고
                  </Text>
                  <Text style={styles.desc}>상단 볼린저 밴드 (20, 2) 상회</Text>
                </View>
              )}
              {conditionData.lower && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    볼린저 밴드 약세 신호 경고
                  </Text>
                  <Text style={styles.desc}>하단 볼린저 밴드 (20, 2) 하회</Text>
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
        <BollingerBandConditionContent
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
});
