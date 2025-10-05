import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ConditionPlus from "../../assets/images/condition-plus.svg";
import PriceChangeRow from "./price-change-row";
import PriceLimitRow from "./price-limit-row";
export default function PriceConditionContent() {
  // 가격 제한 조건 설정에 대해 값/이상,이하/드롭다운 표시 독립적인 상태 관리
  const [rows, setRows] = useState([{ id: 1, filled: false }]);

  const addRow = () =>
    setRows((prev) => [...prev, { id: Date.now(), filled: false }]);
  const removeRow = (id: number) =>
    setRows((prev) => prev.filter((r) => r.id !== id));
  const updateRowFilled = (id: number, hasValue: boolean) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, filled: hasValue } : r))
    );
  };
  const resetRow = (id: number) => {
    // 행이 하나뿐일 때 리셋 시 -> default 상태로 유지
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, filled: false } : r))
    );
  };

  const hasFilled = rows.some((r) => r.filled);

  const [priceLimitRows, setPriceLimitRows] = useState<
    {
      id: number;
      value: string;
      limitType: "이상" | "이하";
      dropdownVisible: boolean;
    }[]
  >([{ id: 1, value: "", limitType: "이상", dropdownVisible: false }]);

  // 가격 변경 조건에 설정에 대한 state 관리
  // 가격 변경 조건 상태
  const [priceChangeRows, setPriceChangeRows] = useState([
    { id: 1, filled: false },
  ]);

  const addPriceChangeRow = () =>
    setPriceChangeRows((prev) => [...prev, { id: Date.now(), filled: false }]);

  const removePriceChangeRow = (id: number) =>
    setPriceChangeRows((prev) => prev.filter((r) => r.id !== id));

  const resetPriceChangeRow = (id: number) =>
    setPriceChangeRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, filled: false } : r))
    );

  const updatePriceChangeFilled = (id: number, hasValue: boolean) =>
    setPriceChangeRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, filled: hasValue } : r))
    );

  const hasPriceChangeFilled = priceChangeRows.some((r) => r.filled);

  const addPriceLimitRow = () => {
    setPriceLimitRows((prev) => [
      ...prev,
      { id: Date.now(), value: "", limitType: "이상", dropdownVisible: false },
    ]);
  };

  const updatePriceLimitValue = (id: number, text: string) => {
    setPriceLimitRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, value: text } : r))
    );
  };

  const toggleDropdown = (id: number) => {
    setPriceLimitRows((prev) =>
      prev.map(
        (r) =>
          r.id === id
            ? { ...r, dropdownVisible: !r.dropdownVisible }
            : { ...r, dropdownVisible: false } // 다른 행은 닫기
      )
    );
  };

  const selectLimitType = (id: number, type: "이상" | "이하") => {
    setPriceLimitRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, limitType: type, dropdownVisible: false } : r
      )
    );
  };

  const closeAllDropdowns = () => {
    setPriceLimitRows((prev) =>
      prev.map((r) => ({ ...r, dropdownVisible: false }))
    );
  };

  const anyDropdownOpen = priceLimitRows.some((r) => r.dropdownVisible);

  const renderInputWithUnit = (
    placeholder: string,
    unit: string,
    value?: string,
    onChange?: (t: string) => void
  ) => (
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.inputWithUnit}
        placeholder={placeholder}
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
        placeholderTextColor="#A4A4A4"
      />
      <Text style={styles.unitInside}>{unit}</Text>
    </View>
  );

  const renderInputRow = (
    placeholder: string,
    unit: string,
    value?: string,
    onChange?: (text: string) => void
  ) => (
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.inputWithUnit}
        placeholder={placeholder}
        keyboardType="numeric"
        placeholderTextColor="#A4A4A4"
        value={value}
        onChangeText={onChange}
      />
      <Text style={styles.unitInside}>{unit}</Text>
    </View>
  );

  return (
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
            onValueChange={(v) => updateRowFilled(r.id, v)}
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
            onValueChange={(v) => updatePriceChangeFilled(r.id, v)}
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
        <View style={styles.row}>
          {renderInputRow("+, - 부호를 포함하여 입력해주세요", "%")}
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionText}>1일</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton}>
            <ConditionPlus width={20} height={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 후행 */}
      <Text style={styles.subSectionTitle}>후행</Text>

      <View style={styles.section}>
        <Text style={styles.label}>추적 가격(%)</Text>
        <View style={styles.row}>
          {renderInputRow("+, - 부호를 포함하여 입력해주세요", "%")}
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionText}>1일</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton}>
            <ConditionPlus width={20} height={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>추적 가격(원)</Text>
        <View style={styles.row}>
          {renderInputRow("+, - 부호를 포함하여 입력해주세요", "원")}
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionText}>1일</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton}>
            <ConditionPlus width={20} height={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton}>
          <Text style={styles.resetText}>초기화</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton}>
          <Text style={styles.confirmText}>확인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  dropdownTextSelected: { color: "#2CB463", fontWeight: "700" },
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
