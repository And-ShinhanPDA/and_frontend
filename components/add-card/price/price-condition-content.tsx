import ConditionSection from "@/components/condition/condition-section";
import { PRICE_SECTION_DESCRIPTIONS } from "@/components/condition/constants";
import useConditionRows from "@/hooks/use-condition-rows";
import React, { useState } from "react";
import {
  Keyboard,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import PriceChangeCurrentRow from "./price-change-current-row"; // 가격 변경(현재가)
import PriceChangeOpenRow from "./price-change-open-row"; // 가격 변경(시가)
import PriceLimitRow from "./price-limit-row"; // 가격 제한
import PriceTrailingRow from "./price-trailing-row"; // 후행가격(%)
import PriceTrailingValueRow from "./price-trailing-value-row"; //후행가격(원)
import PriceVariationRow from "./price-variation-row"; // 변동률
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PriceConditionContent({
  onConfirm,
}: {
  onConfirm: (data: any) => void;
}) {
  // 상태 관리
  const [sectionToggles, setSectionToggles] = useState({
    limit: false,
    changeOpen: false,
    changeCurrent: false,
    variation: false,
    trailingPercent: false,
    trailingValue: false,
  });

  const toggleSection = (key: keyof typeof sectionToggles) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSectionToggles((prev) => {
      const newVal = !prev[key];
      if (!newVal) resetSectionState(key);
      return { ...prev, [key]: newVal };
    });
  };

  const resetSectionState = (key: keyof typeof sectionToggles) => {
    switch (key) {
      case "limit":
        limitRows.resetRow();
        break;
      case "changeOpen":
        openChangeRows.resetRow();
        break;
      case "changeCurrent":
        currentChangeRows.resetRow();
        break;
      case "variation":
        variationRows.resetRow();
        break;
      case "trailingPercent":
        trailingRows.resetRow();
        break;
      case "trailingValue":
        trailingValueRows.resetRow();
        break;
    }
  };

  const handleConfirmPress = () => {
    onConfirm({
      priceLimits: sectionToggles.limit
        ? limitRows.rows
            .filter((r) => r.filled)
            .map((r) => ({
              value: r.value,
              comparison: r.comparison,
            }))
        : [],
      openChanges: sectionToggles.changeOpen
        ? openChangeRows.rows
            .filter((r) => r.filled)
            .map((r) => ({
              sign: r.sign,
              value: r.value,
            }))
        : [],
      currentChanges: sectionToggles.changeCurrent
        ? currentChangeRows.rows
            .filter((r) => r.filled)
            .map((r) => ({
              sign: r.sign,
              value: r.value,
            }))
        : [],
      variations: sectionToggles.variation
        ? variationRows.rows
            .filter((r) => r.filled)
            .map((r) => ({
              sign: r.sign,
              value: r.value,
              period: r.period,
            }))
        : [],
      trailingPercents: sectionToggles.trailingPercent
        ? trailingRows.rows
            .filter((r) => r.filled)
            .map((r) => ({
              sign: r.sign,
              value: r.value,
            }))
        : [],
      trailingValues: sectionToggles.trailingValue
        ? trailingValueRows.rows
            .filter((r) => r.filled)
            .map((r) => ({
              sign: r.sign,
              value: r.value,
            }))
        : [],
    });
  };

  // 가격 제한
  const limitRows = useConditionRows<
    { id: number; filled: boolean; value: string; comparison: "이상" | "이하" },
    { amount: string; comparison: "이상" | "이하" }
  >({
    initial: { filled: false, value: "", comparison: "이상" },
    updateFn: (prev, data) => ({
      ...prev,
      filled: data.amount.trim() !== "",
      value: data.amount,
      comparison: data.comparison,
    }),
  });

  // 가격 변경 (시가 기준)
  const openChangeRows = useConditionRows<
    { id: number; filled: boolean; sign: "+" | "-"; value: string },
    { sign: "+" | "-"; amount: string }
  >({
    initial: { filled: false, sign: "+", value: "" },
    updateFn: (prev, data) => ({
      ...prev,
      filled: data.amount.trim() !== "",
      value: data.amount,
      sign: data.sign,
    }),
  });

  // 가격 변경 (현재가 기준)
  const currentChangeRows = useConditionRows<
    { id: number; filled: boolean; sign: "+" | "-"; value: string },
    { sign: "+" | "-"; amount: string }
  >({
    initial: { filled: false, sign: "+", value: "" },
    updateFn: (prev, data) => ({
      ...prev,
      filled: data.amount.trim() !== "",
      value: data.amount,
      sign: data.sign,
    }),
  });

  // 변동률
  const variationRows = useConditionRows<
    {
      id: number;
      filled: boolean;
      sign: "+" | "-";
      value: string;
      period: "1일기준" | "현재기준";
    },
    { sign: "+" | "-"; value: string; period: "1일기준" | "현재기준" }
  >({
    initial: { filled: false, sign: "+", value: "", period: "1일기준" },
    updateFn: (prev, data) => ({
      ...prev,
      filled: data.value.trim() !== "",
      value: data.value,
      sign: data.sign,
      period: data.period,
    }),
  });

  // 후행 (%)
  const trailingRows = useConditionRows<
    { id: number; filled: boolean; sign: "+" | "-"; value: string },
    { sign: "+" | "-"; value: string }
  >({
    initial: { filled: false, sign: "+", value: "" },
    updateFn: (prev, data) => ({
      ...prev,
      filled: data.value.trim() !== "",
      sign: data.sign,
      value: data.value,
    }),
  });

  // 후행 (원)
  const trailingValueRows = useConditionRows<
    { id: number; filled: boolean; sign: "+" | "-"; value: string },
    { sign: "+" | "-"; value: string }
  >({
    initial: { filled: false, sign: "+", value: "" },
    updateFn: (prev, data) => ({
      ...prev,
      filled: data.value.trim() !== "",
      sign: data.sign,
      value: data.value,
    }),
  });

  return (
    <View style={styles.wrapper}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAwareScrollView
          style={{ backgroundColor: "#fff" }}
          contentContainerStyle={styles.scrollContent}
          extraScrollHeight={120}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.sectionTitle}>가격</Text>

            {/* 가격 제한 */}
            <ConditionSection
              title="가격 제한"
              description={PRICE_SECTION_DESCRIPTIONS.LIMIT}
              value={sectionToggles.limit}
              onToggle={() => toggleSection("limit")}
              rows={limitRows.rows}
              hasFilled={limitRows.hasFilled}
              onAdd={limitRows.addRow}
              renderRow={(r, idx) => (
                <PriceLimitRow
                  key={r.id}
                  onRemove={() => limitRows.removeRow(r.id)}
                  onReset={() => limitRows.resetRow(r.id)}
                  onValueChange={(data) => limitRows.updateRow(r.id, data)}
                  isSingleRow={limitRows.rows.length === 1}
                />
              )}
            />

            {/* 가격 변경 (시가 기준) */}
            <ConditionSection
              title="가격 변경 (시가)"
              description={PRICE_SECTION_DESCRIPTIONS.CHANGE_OPEN}
              value={sectionToggles.changeOpen}
              onToggle={() => toggleSection("changeOpen")}
              rows={openChangeRows.rows}
              hasFilled={openChangeRows.hasFilled}
              onAdd={openChangeRows.addRow}
              renderRow={(r, idx) => (
                <PriceChangeOpenRow
                  key={r.id}
                  onRemove={() => openChangeRows.removeRow(r.id)}
                  onReset={() => openChangeRows.resetRow(r.id)}
                  onValueChange={(data) => openChangeRows.updateRow(r.id, data)}
                  isSingleRow={openChangeRows.rows.length === 1}
                />
              )}
            />

            {/* 가격 변경 (현재가 기준) */}
            <ConditionSection
              title="가격 변경 (현재가)"
              description={PRICE_SECTION_DESCRIPTIONS.CHANGE_CURRENT}
              value={sectionToggles.changeCurrent}
              onToggle={() => toggleSection("changeCurrent")}
              rows={currentChangeRows.rows}
              hasFilled={currentChangeRows.hasFilled}
              onAdd={currentChangeRows.addRow}
              renderRow={(r, idx) => (
                <PriceChangeCurrentRow
                  key={r.id}
                  onRemove={() => currentChangeRows.removeRow(r.id)}
                  onReset={() => currentChangeRows.resetRow(r.id)}
                  onValueChange={(data) =>
                    currentChangeRows.updateRow(r.id, data)
                  }
                  isSingleRow={currentChangeRows.rows.length === 1}
                />
              )}
            />

            {/* 변동률 */}
            <ConditionSection
              title="변동률"
              description={PRICE_SECTION_DESCRIPTIONS.VARIATION}
              value={sectionToggles.variation}
              onToggle={() => toggleSection("variation")}
              rows={variationRows.rows}
              hasFilled={variationRows.hasFilled}
              onAdd={variationRows.addRow}
              renderRow={(r, idx) => (
                <PriceVariationRow
                  key={r.id}
                  onRemove={() => variationRows.removeRow(r.id)}
                  onReset={() => variationRows.resetRow(r.id)}
                  onValueChange={(data) => variationRows.updateRow(r.id, data)}
                  isSingleRow={variationRows.rows.length === 1}
                />
              )}
            />
            {/* 후행 (%) */}
            <ConditionSection
              title="후행 가격 (%)"
              description={PRICE_SECTION_DESCRIPTIONS.TRAILING_PERCENT}
              value={sectionToggles.trailingPercent}
              onToggle={() => toggleSection("trailingPercent")}
              rows={trailingRows.rows}
              hasFilled={trailingRows.hasFilled}
              onAdd={trailingRows.addRow}
              renderRow={(r, idx) => (
                <PriceTrailingRow
                  key={r.id}
                  onRemove={() => trailingRows.removeRow(r.id)}
                  onReset={() => trailingRows.resetRow(r.id)}
                  onValueChange={(data) => trailingRows.updateRow(r.id, data)}
                  isSingleRow={trailingRows.rows.length === 1}
                />
              )}
            />

            {/* 후행 (원) */}
            <ConditionSection
              title="후행 가격 (원)"
              description={PRICE_SECTION_DESCRIPTIONS.TRAILING_VALUE}
              value={sectionToggles.trailingValue}
              onToggle={() => toggleSection("trailingValue")}
              rows={trailingValueRows.rows}
              hasFilled={trailingValueRows.hasFilled}
              onAdd={trailingValueRows.addRow}
              renderRow={(r, idx) => (
                <PriceTrailingValueRow
                  key={r.id}
                  onRemove={() => trailingValueRows.removeRow(r.id)}
                  onReset={() => trailingValueRows.resetRow(r.id)}
                  onValueChange={(data) =>
                    trailingValueRows.updateRow(r.id, data)
                  }
                  isSingleRow={trailingValueRows.rows.length === 1}
                />
              )}
            />
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>

      {/* 하단 버튼 */}
      <View style={styles.footerFixed}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            Object.keys(sectionToggles).forEach((k) =>
              resetSectionState(k as keyof typeof sectionToggles)
            );
            setSectionToggles({
              limit: false,
              changeOpen: false,
              changeCurrent: false,
              variation: false,
              trailingPercent: false,
              trailingValue: false,
            });
          }}
        >
          <Text style={styles.resetText}>초기화</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmPress}
        >
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30, // footer 영역 안 가리게
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: "#000",
  },
  section: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
    paddingBottom: 16,
  },
  toggleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  desc: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  orWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  orLine: {
    flex: 1,
    height: 0.7,
    backgroundColor: "#DADADA",
    marginHorizontal: 8,
  },
  orText: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 12,
    color: "#000000",
    letterSpacing: 0.3,
  },
  addButton: {
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  footerFixed: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
  },
  resetButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginRight: 8,
  },
  resetText: { fontSize: 15, color: "#333", fontWeight: "500" },
  confirmButton: {
    flex: 1,
    backgroundColor: "#4CC439",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginLeft: 8,
  },
  confirmText: { fontSize: 15, color: "#fff", fontWeight: "600" },
});
