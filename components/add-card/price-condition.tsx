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
import PriceConditionContent from "./price-condition-content";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PriceConditionCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCondition, setHasCondition] = useState(false);
  const [conditionData, setConditionData] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);

  const handleConfirm = (data: any) => {
    console.log("사용자가 입력한 조건:", data);
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
            <Text style={styles.title}>가격</Text>
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

              {/* 가격 제한 */}
              {conditionData.priceLimits?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>가격 제한</Text>
                  {conditionData.priceLimits.map((item: any, idx: number) => (
                    <View key={idx} style={styles.row}>
                      <Text style={styles.label}>{item.comparison}인 경우</Text>
                      <Text style={styles.value}>
                        {parseInt(item.value).toLocaleString()}원
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 가격 변경 */}
              {conditionData.priceChanges?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>가격 변경</Text>
                  {conditionData.priceChanges.map((item: any, idx: number) => (
                    <View key={idx} style={styles.row}>
                      <Text style={styles.label}>현재가</Text>
                      <Text style={styles.value}>
                        {item.sign}
                        {parseInt(item.value).toLocaleString()}원
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 변동률 */}
              {conditionData.variations?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>변동률</Text>
                  {conditionData.variations.map((item: any, idx: number) => (
                    <View key={idx} style={styles.row}>
                      <Text style={styles.label}>{item.period}</Text>
                      <Text style={styles.value}>
                        {item.sign}
                        {item.value}%
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 후행 (%) */}
              {conditionData.trailingPercents?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>후행 (%)</Text>
                  {conditionData.trailingPercents.map(
                    (item: any, idx: number) => (
                      <View key={idx} style={styles.row}>
                        <Text style={styles.label}>추적률</Text>
                        <Text style={styles.value}>
                          {item.sign}
                          {item.value}%
                        </Text>
                      </View>
                    )
                  )}
                </View>
              )}

              {/* 후행 (원) */}
              {conditionData.trailingValues?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>후행 (원)</Text>
                  {conditionData.trailingValues.map(
                    (item: any, idx: number) => (
                      <View key={idx} style={styles.row}>
                        <Text style={styles.label}>추적가</Text>
                        <Text style={styles.value}>
                          {item.sign}
                          {parseInt(item.value).toLocaleString()}원
                        </Text>
                      </View>
                    )
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </Pressable>

      <ConditionBottomSheet visible={isOpen} onClose={() => setIsOpen(false)}>
        <PriceConditionContent onConfirm={handleConfirm} />
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
  value: { fontSize: 13, color: "#000", fontWeight: "500" },
});
