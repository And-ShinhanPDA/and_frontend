import ConditionDropdown from "@/components/condition/condition-dropdown";
import ConditionInput from "@/components/condition/condition-input";
import SignToggle from "@/components/condition/sign-toggle";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PriceConditionSimpleContent({
  onConfirm,
}: {
  onConfirm: (data: {
    sign: "+" | "-";
    value: string;
    period: "1일기준" | "현재기준";
  }) => void;
}) {
  const [sign, setSign] = useState<"+" | "-">("+");
  const [value, setValue] = useState("");
  const [period, setPeriod] = useState<"1일기준" | "현재기준">("1일기준");

  const filled = value.trim() !== "";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>변동률 조건 설정</Text>

      <View style={styles.rowContainer}>
        {/* + / - 토글 */}
        <SignToggle
          sign={sign}
          onToggle={() => setSign(sign === "+" ? "-" : "+")}
        />

        {/* 숫자 입력 */}
        <ConditionInput
          value={value}
          placeholder="변동률을 입력해주세요"
          unit="%"
          onChange={setValue}
        />

        {/* 기준 선택 */}
        <ConditionDropdown
          value={period}
          options={["1일기준", "현재기준"]}
          width={90}
          onChange={setPeriod}
        />
      </View>

      {/* 확인 버튼 */}
      <TouchableOpacity
        style={[styles.confirmButton, !filled && { opacity: 0.6 }]}
        disabled={!filled}
        onPress={() => onConfirm({ sign, value, period })}
      >
        <Text style={styles.confirmText}>확인</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 12,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: "#4CC439",
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
