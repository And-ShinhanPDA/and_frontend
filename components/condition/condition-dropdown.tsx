import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ChevronDown from "../../assets/images/ChevronDown.svg";

interface ConditionDropdownProps<T extends string> {
  value: T;
  options: T[]; // 옵션 목록 ("이상", "이하") / ("1일기준", "현재기준") 등
  width?: number;
  onChange: (val: T) => void;
}

// 드롭다운 컴포넌트
export default function ConditionDropdown<T extends string>({
  value,
  options,
  width = 72,
  onChange,
}: ConditionDropdownProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.wrapper, { width }]}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setOpen((prev) => !prev)}
      >
        <Text style={styles.optionText}>{value}</Text>
        <ChevronDown width={12} height={12} />
      </TouchableOpacity>

      {open && (
        <View style={[styles.dropdownMenu, { width }]}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.dropdownItem}
              onPress={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  value === opt && styles.dropdownTextSelected,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: "relative", marginLeft: 8 },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  optionText: { fontSize: 13, color: "#333", marginRight: 8 },
  dropdownMenu: {
    position: "absolute",
    top: 44,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    zIndex: 20,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownText: { fontSize: 13, color: "#333" },
  dropdownTextSelected: { color: "#2CB463", fontWeight: "600" },
});
