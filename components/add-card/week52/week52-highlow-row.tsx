import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ChevronDown from "../../../assets/images/ChevronDown.svg";
import ConditionMinus from "../../../assets/images/condition-minus.svg";
import ConditionPlus from "../../../assets/images/condition-plus.svg";

export default function Week52HighLowRow({
  onRemove,
  onAdd,
  onChange,
  isSingleRow,
}: {
  onRemove: () => void;
  onAdd: () => void;
  onChange: (data: { type: "최고가" | "최저가"; checked: boolean }) => void;
  isSingleRow: boolean;
}) {
  const [type, setType] = useState<"최고가" | "최저가">("최고가");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    onChange({ type, checked });
  }, [type, checked]);

  const toggleChecked = () => {
    setChecked((prev) => !prev);
  };

  const handleRemove = () => {
    if (isSingleRow) {
      setChecked(false);
      setType("최고가");
    } else {
      onRemove();
    }
  };

  return (
    <View style={styles.rowContainer}>
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Text style={styles.optionText}>{type}</Text>
          <ChevronDown width={12} height={12} />
        </TouchableOpacity>

        {dropdownVisible && (
          <View style={styles.dropdownMenu}>
            {["최고가", "최저가"].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.dropdownItem}
                onPress={() => {
                  setType(opt as "최고가" | "최저가");
                  setDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.checkbox, checked && styles.checkedBox]}
        onPress={toggleChecked}
      >
        {checked && <Text style={styles.checkMark}>✓</Text>}
      </TouchableOpacity>

      {checked && (
        <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
          <ConditionMinus width={18} height={18} />
        </TouchableOpacity>
      )}

      {checked && (
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <ConditionPlus width={20} height={20} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dropdownWrapper: { position: "relative", flex: 1 },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionText: { fontSize: 13, color: "#333", marginRight: 8 },
  dropdownMenu: {
    position: "absolute",
    top: 44,
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    zIndex: 20,
  },
  dropdownItem: {
    paddingVertical: 10,
    alignItems: "center",
  },
  dropdownText: { fontSize: 13, color: "#333" },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  checkedBox: {
    backgroundColor: "#4CC439",
    borderColor: "#4CC439",
  },
  checkMark: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  removeButton: { marginLeft: 8 },
  addButton: { marginLeft: 6 },
});
