import React, { useState } from "react";
import {
  Keyboard,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ConditionPlus from "../../../assets/images/condition-plus.svg";
import PriceChangeRow from "./price-change-row";
import PriceLimitRow from "./price-limit-row";
import PriceTrailingRow from "./price-trailing-row";
import PriceTrailingValueRow from "./price-trailing-value-row";
import PriceVariationRow from "./price-variation-row";

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
  /** 상태 관리 */
  const [sectionToggles, setSectionToggles] = useState({
    limit: false,
    change: false,
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
        setRows([{ id: 1, filled: false, value: "", comparison: "이상" }]);
        break;
      case "change":
        setPriceChangeRows([{ id: 1, filled: false, sign: "+", value: "" }]);
        break;
      case "variation":
        setVariationRows([
          { id: 1, filled: false, sign: "+", value: "", period: "1일기준" },
        ]);
        break;
      case "trailingPercent":
        setTrailingRows([{ id: 1, filled: false, sign: "+", value: "" }]);
        break;
      case "trailingValue":
        setTrailingValueRows([{ id: 1, filled: false, sign: "+", value: "" }]);
        break;
    }
  };

  const handleConfirmPress = () => {
    onConfirm({
      priceLimits: sectionToggles.limit
        ? rows
            .filter((r) => r.filled)
            .map((r) => ({
              value: r.value,
              comparison: r.comparison,
            }))
        : [],
      priceChanges: sectionToggles.change
        ? priceChangeRows
            .filter((r) => r.filled)
            .map((r) => ({
              sign: r.sign,
              value: r.value,
            }))
        : [],
      variations: sectionToggles.variation
        ? variationRows
            .filter((r) => r.filled)
            .map((r) => ({
              sign: r.sign,
              value: r.value,
              period: r.period,
            }))
        : [],
      trailingPercents: sectionToggles.trailingPercent
        ? trailingRows
            .filter((r) => r.filled)
            .map((r) => ({
              sign: r.sign,
              value: r.value,
            }))
        : [],
      trailingValues: sectionToggles.trailingValue
        ? trailingValueRows
            .filter((r) => r.filled)
            .map((r) => ({
              sign: r.sign,
              value: r.value,
            }))
        : [],
    });
  };

  // 가격 제한 조건 상태 관리
  const [rows, setRows] = useState<
    {
      id: number;
      filled: boolean;
      value: string;
      comparison: "이상" | "이하";
    }[]
  >([{ id: 1, filled: false, value: "", comparison: "이상" }]);

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { id: Date.now(), filled: false, value: "", comparison: "이상" },
    ]);

  const removeRow = (id: number) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const updateRowValue = (
    id: number,
    data: { amount: string; comparison: "이상" | "이하" }
  ) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              filled: data.amount.trim() !== "",
              value: data.amount,
              comparison: data.comparison,
            }
          : r
      )
    );

  const resetRow = (id: number) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, filled: false, value: "", comparison: "이상" } : r
      )
    );

  const hasFilled = rows.some((r) => r.filled);

  // 가격 변경
  const [priceChangeRows, setPriceChangeRows] = useState<
    { id: number; filled: boolean; sign: "+" | "-"; value: string }[]
  >([{ id: 1, filled: false, sign: "+", value: "" }]);

  const addPriceChangeRow = () =>
    setPriceChangeRows((prev) => [
      ...prev,
      { id: Date.now(), filled: false, sign: "+", value: "" },
    ]);

  const removePriceChangeRow = (id: number) =>
    setPriceChangeRows((prev) => prev.filter((r) => r.id !== id));

  const updatePriceChangeValue = (
    id: number,
    data: { sign: "+" | "-"; amount: string }
  ) =>
    setPriceChangeRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              filled: data.amount.trim() !== "",
              value: data.amount,
              sign: data.sign,
            }
          : r
      )
    );

  const resetPriceChangeRow = (id: number) =>
    setPriceChangeRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, filled: false, sign: "+", value: "" } : r
      )
    );

  const hasPriceChangeFilled = priceChangeRows.some((r) => r.filled);

  // 변동률
  const [variationRows, setVariationRows] = useState<
    {
      id: number;
      filled: boolean;
      sign: "+" | "-";
      value: string;
      period: "1일기준" | "현재기준";
    }[]
  >([{ id: 1, filled: false, sign: "+", value: "", period: "1일기준" }]);

  const addVariationRow = () =>
    setVariationRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        filled: false,
        sign: "+",
        value: "",
        period: "1일기준",
      },
    ]);

  const removeVariationRow = (id: number) =>
    setVariationRows((prev) => prev.filter((r) => r.id !== id));

  const updateVariationValue = (
    id: number,
    data: { sign: "+" | "-"; value: string; period: "1일기준" | "현재기준" }
  ) =>
    setVariationRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              filled: data.value.trim() !== "",
              value: data.value,
              sign: data.sign,
              period: data.period,
            }
          : r
      )
    );

  const resetVariationRow = (id: number) =>
    setVariationRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, filled: false, sign: "+", value: "", period: "1일기준" }
          : r
      )
    );

  const hasVariationFilled = variationRows.some((r) => r.filled);

  // 후행 (%)
  const [trailingRows, setTrailingRows] = useState<
    { id: number; filled: boolean; sign: "+" | "-"; value: string }[]
  >([{ id: 1, filled: false, sign: "+", value: "" }]);

  const addTrailingRow = () =>
    setTrailingRows((prev) => [
      ...prev,
      { id: Date.now(), filled: false, sign: "+", value: "" },
    ]);

  const removeTrailingRow = (id: number) =>
    setTrailingRows((prev) => prev.filter((r) => r.id !== id));

  const updateTrailingValue = (
    id: number,
    data: { sign: "+" | "-"; value: string }
  ) =>
    setTrailingRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              filled: data.value.trim() !== "",
              sign: data.sign,
              value: data.value,
            }
          : r
      )
    );

  const hasTrailingFilled = trailingRows.some((r) => r.filled);

  // 후행 (원)
  const [trailingValueRows, setTrailingValueRows] = useState<
    { id: number; filled: boolean; sign: "+" | "-"; value: string }[]
  >([{ id: 1, filled: false, sign: "+", value: "" }]);

  const addTrailingValueRow = () =>
    setTrailingValueRows((prev) => [
      ...prev,
      { id: Date.now(), filled: false, sign: "+", value: "" },
    ]);

  const removeTrailingValueRow = (id: number) =>
    setTrailingValueRows((prev) => prev.filter((r) => r.id !== id));

  const updateTrailingValueValue = (
    id: number,
    data: { sign: "+" | "-"; value: string }
  ) =>
    setTrailingValueRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              filled: data.value.trim() !== "",
              sign: data.sign,
              value: data.value,
            }
          : r
      )
    );

  const hasTrailingValueFilled = trailingValueRows.some((r) => r.filled);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        extraScrollHeight={120}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>가격</Text>

          {/* 가격 제한 */}
          <View style={styles.section}>
            <View style={styles.toggleHeader}>
              <Text style={styles.label}>가격 제한</Text>
              <Switch
                value={sectionToggles.limit}
                onValueChange={() => toggleSection("limit")}
                trackColor={{ false: "#E5E5E5", true: "#4CC439" }}
              />
            </View>
            <Text style={styles.desc}>
              시가 기준으로 얼마 이상일 때 알림을 드릴게요
            </Text>
            {sectionToggles.limit && (
              <>
                {rows.map((r) => (
                  <PriceLimitRow
                    key={r.id}
                    onRemove={() => removeRow(r.id)}
                    onReset={() => resetRow(r.id)}
                    onValueChange={(data) => updateRowValue(r.id, data)}
                    isSingleRow={rows.length === 1}
                  />
                ))}
                {hasFilled && (
                  <TouchableOpacity style={styles.addButton} onPress={addRow}>
                    <ConditionPlus width={20} height={20} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* 가격 변경 */}
          <View style={styles.section}>
            <View style={styles.toggleHeader}>
              <Text style={styles.label}>가격 변경 (시가)</Text>
              <Switch
                value={sectionToggles.change}
                onValueChange={() => toggleSection("change")}
                trackColor={{ false: "#E5E5E5", true: "#4CC439" }}
              />
            </View>
            <Text style={styles.desc}>
              시가 기준으로 얼마 이상일 때 알림을 드릴게요
            </Text>
            {sectionToggles.change && (
              <>
                {priceChangeRows.map((r) => (
                  <PriceChangeRow
                    key={r.id}
                    onRemove={() => removePriceChangeRow(r.id)}
                    onReset={() => resetPriceChangeRow(r.id)}
                    onValueChange={(data) => updatePriceChangeValue(r.id, data)}
                    isSingleRow={priceChangeRows.length === 1}
                  />
                ))}
                {hasPriceChangeFilled && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={addPriceChangeRow}
                  >
                    <ConditionPlus width={20} height={20} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* 가격 변경 (현재가 기준) */}
          <View style={styles.section}>
            <View style={styles.toggleHeader}>
              <Text style={styles.label}>가격 변경 (현재가)</Text>
              <Switch
                value={sectionToggles.variation}
                onValueChange={() => toggleSection("variation")}
                trackColor={{ false: "#E5E5E5", true: "#4CC439" }}
              />
            </View>
            <Text style={styles.desc}>
              현재가 기준으로 얼마 이상일 때 알림을 드릴게요
            </Text>
            {sectionToggles.variation && (
              <>
                {variationRows.map((r) => (
                  <PriceVariationRow
                    key={r.id}
                    onRemove={() => removeVariationRow(r.id)}
                    onReset={() => resetVariationRow(r.id)}
                    onValueChange={(data) => updateVariationValue(r.id, data)}
                    isSingleRow={variationRows.length === 1}
                  />
                ))}
                {hasVariationFilled && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={addVariationRow}
                  >
                    <ConditionPlus width={20} height={20} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* 후행 (%) */}
          <View style={styles.section}>
            <View style={styles.toggleHeader}>
              <Text style={styles.label}>후행 가격 (%)</Text>
              <Switch
                value={sectionToggles.trailingPercent}
                onValueChange={() => toggleSection("trailingPercent")}
                trackColor={{ false: "#E5E5E5", true: "#4CC439" }}
              />
            </View>
            <Text style={styles.desc}>
              특정 변동률을 기준으로 후행 가격을 알려드릴게요
            </Text>
            {sectionToggles.trailingPercent && (
              <>
                {trailingRows.map((r) => (
                  <PriceTrailingRow
                    key={r.id}
                    onRemove={() => removeTrailingRow(r.id)}
                    onReset={() => {}}
                    onValueChange={(data) => updateTrailingValue(r.id, data)}
                    isSingleRow={trailingRows.length === 1}
                  />
                ))}
                {hasTrailingFilled && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={addTrailingRow}
                  >
                    <ConditionPlus width={20} height={20} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* 후행 (원) */}
          <View style={styles.section}>
            <View style={styles.toggleHeader}>
              <Text style={styles.label}>후행 가격 (원)</Text>
              <Switch
                value={sectionToggles.trailingValue}
                onValueChange={() => toggleSection("trailingValue")}
                trackColor={{ false: "#E5E5E5", true: "#4CC439" }}
              />
            </View>
            <Text style={styles.desc}>
              특정 금액을 기준으로 후행 가격을 알려드릴게요
            </Text>
            {sectionToggles.trailingValue && (
              <>
                {trailingValueRows.map((r) => (
                  <PriceTrailingValueRow
                    key={r.id}
                    onRemove={() => removeTrailingValueRow(r.id)}
                    onReset={() => {}}
                    onValueChange={(data) =>
                      updateTrailingValueValue(r.id, data)
                    }
                    isSingleRow={trailingValueRows.length === 1}
                  />
                ))}
                {hasTrailingValueFilled && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={addTrailingValueRow}
                  >
                    <ConditionPlus width={20} height={20} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* 하단 버튼 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                Object.keys(sectionToggles).forEach((k) =>
                  resetSectionState(k as keyof typeof sectionToggles)
                );
                setSectionToggles({
                  limit: false,
                  change: false,
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
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  container: { paddingBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  section: { marginBottom: 20 },
  toggleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontSize: 14, fontWeight: "600", color: "#222" },
  desc: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  addButton: {
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
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
