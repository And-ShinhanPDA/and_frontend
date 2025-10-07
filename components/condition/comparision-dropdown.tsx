import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ChevronDown from "../../assets/images/ChevronDown.svg";

interface ComparisonDropdownProps {
  value: "이상" | "이하";
  onChange: (val: "이상" | "이하") => void;
}
// 이상, 이하 드롭다운 컴포넌트
export default function ComparisonDropdown({
  value,
  onChange,
}: ComparisonDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setOpen((prev) => !prev)}
      >
        <Text style={styles.optionText}>{value}</Text>
        <ChevronDown width={12} height={12} />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownMenu}>
          {["이상", "이하"].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.dropdownItem}
              onPress={() => {
                onChange(opt as "이상" | "이하");
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
    width: 72,
  },
  optionText: { fontSize: 13, color: "#333", marginRight: 8 },
  dropdownMenu: {
    position: "absolute",
    top: 44,
    right: 0,
    width: 72,
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
    backgroundColor: "#fff",
  },
  dropdownText: { fontSize: 13, color: "#333" },
  dropdownTextSelected: { color: "#2CB463", fontWeight: "600" },
});
