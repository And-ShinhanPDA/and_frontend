import ConditionInput from "@/components/condition/condition-input";
import ConditionSection from "@/components/condition/condition-section";
import React, { useEffect, useRef, useState } from "react";
import {
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";
import ConditionMinus from "../../../assets/images/condition-minus.svg";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type PriceConditionData = {
  limits: { comparison: "이상" | "이하"; amount: string }[];
  openChanges: { direction: "+" | "-"; amount: string }[];
  currentChanges: { direction: "+" | "-"; amount: string }[];
};

export default function PriceConditionContent({
  onConfirm,
  initialValue,
}: {
  onConfirm: (data: PriceConditionData) => void;
  initialValue?: PriceConditionData | null;
}) {
  const [toggles, setToggles] = useState({
    limit: false,
    open: false,
    current: false,
  });

  const [limits, setLimits] = useState([
    { id: 1, comparison: "이상" as "이상" | "이하", amount: "" },
    { id: 2, comparison: "이하" as "이상" | "이하", amount: "" },
  ]);

  const [openChanges, setOpenChanges] = useState([
    { id: 1, direction: "+" as "+" | "-", amount: "" },
    { id: 2, direction: "-" as "+" | "-", amount: "" },
  ]);

  const [currentChanges, setCurrentChanges] = useState([
    { id: 1, direction: "+" as "+" | "-", amount: "" },
    { id: 2, direction: "-" as "+" | "-", amount: "" },
  ]);

  const inited = useRef(false);
  useEffect(() => {
    if (inited.current) return;
    if (initialValue) {
      // limits 처리
      if (initialValue.limits && initialValue.limits.length > 0) {
        const newLimits = [
          { id: 1, comparison: "이상" as "이상" | "이하", amount: "" },
          { id: 2, comparison: "이하" as "이상" | "이하", amount: "" },
        ];

        initialValue.limits.forEach((limit) => {
          if (limit.comparison === "이상") {
            newLimits[0].amount = String(limit.amount ?? "");
          } else {
            newLimits[1].amount = String(limit.amount ?? "");
          }
        });

        setLimits(newLimits);
        setToggles((prev) => ({ ...prev, limit: true }));
      }

      // openChanges 처리
      if (initialValue.openChanges && initialValue.openChanges.length > 0) {
        const newOpenChanges = [
          { id: 1, direction: "+" as "+" | "-", amount: "" },
          { id: 2, direction: "-" as "+" | "-", amount: "" },
        ];

        initialValue.openChanges.forEach((change) => {
          if (change.direction === "+") {
            newOpenChanges[0].amount = String(change.amount ?? "");
          } else {
            newOpenChanges[1].amount = String(change.amount ?? "");
          }
        });

        setOpenChanges(newOpenChanges);
        setToggles((prev) => ({ ...prev, open: true }));
      }

      // currentChanges 처리
      if (
        initialValue.currentChanges &&
        initialValue.currentChanges.length > 0
      ) {
        const newCurrentChanges = [
          { id: 1, direction: "+" as "+" | "-", amount: "" },
          { id: 2, direction: "-" as "+" | "-", amount: "" },
        ];

        initialValue.currentChanges.forEach((change) => {
          if (change.direction === "+") {
            newCurrentChanges[0].amount = String(change.amount ?? "");
          } else {
            newCurrentChanges[1].amount = String(change.amount ?? "");
          }
        });

        setCurrentChanges(newCurrentChanges);
        setToggles((prev) => ({ ...prev, current: true }));
      }
    }
    inited.current = true;
  }, [initialValue]);

  const toggle = (key: keyof typeof toggles) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setToggles((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleConfirm = () => {
    // 실제 값이 있는지 확인 (토글 상태와 무관하게)
    const hasLimitData = limits.some((v) => String(v.amount).trim() !== "");
    const hasOpenData = openChanges.some((v) => String(v.amount).trim() !== "");
    const hasCurrentData = currentChanges.some(
      (v) => String(v.amount).trim() !== ""
    );

    // 값이 있으면 토글 자동으로 켜기 (모든 경우에)
    setToggles({
      limit: hasLimitData,
      open: hasOpenData,
      current: hasCurrentData,
    });

    onConfirm({
      limits: hasLimitData
        ? limits.map(({ comparison, amount }) => ({ comparison, amount }))
        : [],
      openChanges: hasOpenData
        ? openChanges.map(({ direction, amount }) => ({ direction, amount }))
        : [],
      currentChanges: hasCurrentData
        ? currentChanges.map(({ direction, amount }) => ({ direction, amount }))
        : [],
    });
  };

  const handleReset = () => {
    setLimits([
      { id: 1, comparison: "이상", amount: "" },
      { id: 2, comparison: "이하", amount: "" },
    ]);
    setOpenChanges([
      { id: 1, direction: "+", amount: "" },
      { id: 2, direction: "-", amount: "" },
    ]);
    setCurrentChanges([
      { id: 1, direction: "+", amount: "" },
      { id: 2, direction: "-", amount: "" },
    ]);
    setToggles({ limit: false, open: false, current: false });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>가격 설정</Text>
        <Text style={styles.sectionSubtitle}>
          목표 가격 및 변동 조건을 설정하세요
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.container}>
          {/* 가격 제한 */}
          <ConditionSection
            title="가격 제한"
            description="특정 금액 이상 / 이하일 때 알림"
            value={toggles.limit}
            onToggle={() => toggle("limit")}
            rows={limits}
            hasFilled={limits.some((v) => String(v.amount).trim() !== "")}
            onAdd={() => {}}
            renderRow={(r) =>
              toggles.limit && (
                <View key={r.id} style={styles.rowContainer}>
                  <Text
                    style={[
                      styles.compareBadge,
                      r.comparison === "이상"
                        ? styles.plusBadge
                        : styles.minusBadge,
                    ]}
                  >
                    {r.comparison}
                  </Text>
                  <ConditionInput
                    value={r.amount}
                    placeholder="금액 입력"
                    unit="원"
                    onChange={(v) =>
                      setLimits((prev) =>
                        prev.map((p) =>
                          p.id === r.id ? { ...p, amount: v } : p
                        )
                      )
                    }
                  />
                  {String(r.amount).trim() !== "" && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() =>
                        setLimits((prev) =>
                          prev.map((p) =>
                            p.id === r.id ? { ...p, amount: "" } : p
                          )
                        )
                      }
                    >
                      <ConditionMinus width={18} height={18} />
                    </TouchableOpacity>
                  )}
                </View>
              )
            }
          />

          {/* 시가 기준 */}
          <ConditionSection
            title="가격 변경 (시가)"
            description="시가 대비 상승 / 하락 시 알림"
            value={toggles.open}
            onToggle={() => toggle("open")}
            rows={openChanges}
            hasFilled={openChanges.some((v) => String(v.amount).trim() !== "")}
            onAdd={() => {}}
            renderRow={(r) =>
              toggles.open && (
                <View key={r.id} style={styles.rowContainer}>
                  <Text
                    style={[
                      styles.compareBadgePM,
                      r.direction === "+"
                        ? styles.plusBadge
                        : styles.minusBadge,
                    ]}
                  >
                    {r.direction}
                  </Text>
                  <ConditionInput
                    value={r.amount}
                    placeholder="금액 입력"
                    unit="원"
                    onChange={(v) =>
                      setOpenChanges((prev) =>
                        prev.map((p) =>
                          p.id === r.id ? { ...p, amount: v } : p
                        )
                      )
                    }
                  />
                  {String(r.amount).trim() !== "" && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() =>
                        setOpenChanges((prev) =>
                          prev.map((p) =>
                            p.id === r.id ? { ...p, amount: "" } : p
                          )
                        )
                      }
                    >
                      <ConditionMinus width={18} height={18} />
                    </TouchableOpacity>
                  )}
                </View>
              )
            }
          />

          {/* 현재가 기준 */}
          <ConditionSection
            title="가격 변경 (현재가)"
            description="현재가 대비 상승 / 하락 시 알림"
            value={toggles.current}
            onToggle={() => toggle("current")}
            rows={currentChanges}
            hasFilled={currentChanges.some(
              (v) => String(v.amount).trim() !== ""
            )}
            onAdd={() => {}}
            renderRow={(r) =>
              toggles.current && (
                <View key={r.id} style={styles.rowContainer}>
                  <Text
                    style={[
                      styles.compareBadgePM,
                      r.direction === "+"
                        ? styles.plusBadge
                        : styles.minusBadge,
                    ]}
                  >
                    {r.direction}
                  </Text>
                  <ConditionInput
                    value={r.amount}
                    placeholder="금액 입력"
                    unit="원"
                    onChange={(v) =>
                      setCurrentChanges((prev) =>
                        prev.map((p) =>
                          p.id === r.id ? { ...p, amount: v } : p
                        )
                      )
                    }
                  />
                  {String(r.amount).trim() !== "" && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() =>
                        setCurrentChanges((prev) =>
                          prev.map((p) =>
                            p.id === r.id ? { ...p, amount: "" } : p
                          )
                        )
                      }
                    >
                      <ConditionMinus width={18} height={18} />
                    </TouchableOpacity>
                  )}
                </View>
              )
            }
          />
        </View>
      </ScrollView>

      {/* 하단 버튼 - 고정 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>초기화</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmText}>확인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FAFAFA",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
    fontFamily: "Pretendard",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
    fontWeight: "400",
    fontFamily: "Pretendard",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },

  compareBadge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "Pretendard",
    minWidth: 50,
    textAlign: "center",
  },
  compareBadgePM: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "Pretendard",
    minWidth: 36,
    textAlign: "center",
  },
  plusBadge: {
    color: "#4CC439",
    borderColor: "#4CC439",
    backgroundColor: "#F0FDF4",
  },
  minusBadge: {
    color: "#FF3B30",
    borderColor: "#FF3B30",
    backgroundColor: "#FEF2F2",
  },

  removeButton: {
    marginLeft: 10,
    padding: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  resetButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#FAFAFA",
  },
  resetText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
    fontFamily: "Pretendard",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#4CC439",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginLeft: 8,
  },
  confirmText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "700",
    fontFamily: "Pretendard",
  },
});
