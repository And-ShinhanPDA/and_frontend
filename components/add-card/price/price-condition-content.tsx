import React, { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ConditionPlus from "../../../assets/images/condition-plus.svg";
import PriceChangeRow from "./price-change-row";
import PriceLimitRow from "./price-limit-row";
import PriceTrailingRow from "./price-trailing-row";
import PriceTrailingValueRow from "./price-trailing-value-row";
import PriceVariationRow from "./price-variation-row";
export default function PriceConditionContent({
  onConfirm,
}: {
  onConfirm: (data: any) => void;
}) {
  const handleConfirmPress = () => {
    console.log("!!!확인 버튼 클릭됨!!");

    const filledRows = rows.filter((r) => r.filled);
    console.log("!! 가격 제한 조건:");
    filledRows.forEach((r) => console.log(`- ${r.value}원 ${r.comparison}`));

    const filledChangeRows = priceChangeRows.filter((r) => r.filled);
    console.log("!! 가격 변경 조건:");
    filledChangeRows.forEach((r) => console.log(`- ${r.sign}${r.value}원`));

    const filledVariationRows = variationRows.filter((r) => r.filled);
    console.log("!! 변동률 조건:");
    filledVariationRows.forEach((r) =>
      console.log(`- ${r.sign}${r.value}% (${r.period})`)
    );

    const filledTrailingRows = trailingRows.filter((r) => r.filled);
    console.log("!! 후행 가격(%) 조건:");
    filledTrailingRows.forEach((r) => console.log(`- ${r.sign}${r.value}%`));

    const filledTrailingValueRows = trailingValueRows.filter((r) => r.filled);
    console.log("!! 후행 가격(원) 조건:");
    filledTrailingValueRows.forEach((r) =>
      console.log(`- ${r.sign}${r.value}원`)
    );

    onConfirm({
      priceLimits: filledRows.map((r) => ({
        value: r.value,
        comparison: r.comparison,
      })),
      priceChanges: filledChangeRows.map((r) => ({
        sign: r.sign,
        value: r.value,
      })),
      variations: filledVariationRows.map((r) => ({
        sign: r.sign,
        value: r.value,
        period: r.period,
      })),
      trailingPercents: filledTrailingRows.map((r) => ({
        sign: r.sign,
        value: r.value,
      })),
      trailingValues: filledTrailingValueRows.map((r) => ({
        sign: r.sign,
        value: r.value,
      })),
    });
  };

  // 가격 제한 조건 설정에 대해 값/이상,이하/드롭다운 표시 독립적인 상태 관리
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
  ) => {
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
  };

  const resetRow = (id: number) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, filled: false, value: "", comparison: "이상" } : r
      )
    );
  };

  const hasFilled = rows.some((r) => r.filled);

  // 가격 변경 조건에 설정에 대한 state 관리
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

  const resetPriceChangeRow = (id: number) =>
    setPriceChangeRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, filled: false, sign: "+", value: "" } : r
      )
    );

  const updatePriceChangeValue = (
    id: number,
    data: { sign: "+" | "-"; amount: string }
  ) => {
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
  };

  const hasPriceChangeFilled = priceChangeRows.some((r) => r.filled);

  // 변동률 조건에 설정에 대한 state 관리
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
  ) => {
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
  };

  const resetVariationRow = (id: number) =>
    setVariationRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, filled: false, sign: "+", value: "", period: "1일기준" }
          : r
      )
    );

  const hasVariationFilled = variationRows.some((r) => r.filled);

  // 후행 가격 (%) 조건 설정에 대한 state 관리
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
  ) => {
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
  };

  const resetTrailingRow = (id: number) =>
    setTrailingRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, filled: false, sign: "+", value: "" } : r
      )
    );

  const hasTrailingFilled = trailingRows.some((r) => r.filled);

  // 후행 가격 (원) 조건 설정에 대한 state 관리
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
  ) => {
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
  };

  const resetTrailingValueRow = (id: number) =>
    setTrailingValueRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, filled: false, sign: "+", value: "" } : r
      )
    );

  const hasTrailingValueFilled = trailingValueRows.some((r) => r.filled);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        extraScrollHeight={120} // 입력창 위로 여유공간
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>가격</Text>

          {/* 가격 제한 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>가격 제한</Text>

            {rows.map((r, index) => (
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
          </View>

          {/* 가격 변경 */}
          <View style={styles.section}>
            <Text style={styles.label}>가격 변경</Text>

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
          </View>

          {/* 변동률 */}
          <View style={styles.section}>
            <Text style={styles.label}>변동률(%)</Text>
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
          </View>

          {/* 후행 */}
          <Text style={styles.subSectionTitle}>후행</Text>

          <View style={styles.section}>
            <Text style={styles.label}>추적 가격(%)</Text>

            {trailingRows.map((r) => (
              <PriceTrailingRow
                key={r.id}
                onRemove={() => removeTrailingRow(r.id)}
                onReset={() => resetTrailingRow(r.id)}
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
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>추적 가격(원)</Text>

            {trailingValueRows.map((r) => (
              <PriceTrailingValueRow
                key={r.id}
                onRemove={() => removeTrailingValueRow(r.id)}
                onReset={() => resetTrailingValueRow(r.id)}
                onValueChange={(data) => updateTrailingValueValue(r.id, data)}
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
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton}>
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
  subSectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },
  section: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  rowRaised: { zIndex: 20, elevation: 20 },
  inputWrapper: { flex: 1, position: "relative" },
  inputWithUnit: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    paddingRight: 30,
    fontSize: 14,
  },
  unitInside: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -10.5 }],
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  dropdownWrapper: {
    marginLeft: 8,
    position: "relative",
  },
  dropdownButton: {
    minWidth: 48,
    justifyContent: "center",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  optionText: { fontSize: 13, color: "#333" },
  dropdown: {
    position: "absolute",
    top: 38,
    left: 0,
    width: 60,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    zIndex: 100,
  },
  dropdownAnchor: {
    marginLeft: 8,
    position: "relative",
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: 6,
    width: 70,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 22,
    zIndex: 22,
    overflow: "hidden",
  },
  dropdownItem: { paddingVertical: 8, alignItems: "center" },
  dropdownText: { fontSize: 13, color: "#333" },
  dropdownTextSelected: { color: "#4CC439", fontWeight: "700" },
  selectedText: {
    color: "#4CC439",
    fontWeight: "600",
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
