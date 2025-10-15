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

export type ChangeConditionData = {
  dailyChanges: { direction: "+" | "-"; amount: string }[];
  baseChanges: { direction: "+" | "-"; amount: string }[];
};

export default function ChangeConditionContent({
  onConfirm,
  initialValue,
}: {
  onConfirm: (data: ChangeConditionData) => void;
  initialValue?: ChangeConditionData | null;
}) {
  const [toggles, setToggles] = useState({
    daily: false,
    base: false,
  });

  const [dailyChanges, setDailyChanges] = useState([
    { id: 1, direction: "+" as "+" | "-", amount: "" },
    { id: 2, direction: "-" as "+" | "-", amount: "" },
  ]);

  const [baseChanges, setBaseChanges] = useState([
    { id: 1, direction: "+" as "+" | "-", amount: "" },
    { id: 2, direction: "-" as "+" | "-", amount: "" },
  ]);

  const inited = useRef(false);
  useEffect(() => {
    if (inited.current) return;
    if (initialValue) {
      // dailyChanges 처리
      if (initialValue.dailyChanges && initialValue.dailyChanges.length > 0) {
        const newDailyChanges = [
          { id: 1, direction: "+" as "+" | "-", amount: "" },
          { id: 2, direction: "-" as "+" | "-", amount: "" },
        ];

        initialValue.dailyChanges.forEach((change) => {
          if (change.direction === "+") {
            newDailyChanges[0].amount = String(change.amount ?? "");
          } else {
            newDailyChanges[1].amount = String(change.amount ?? "");
          }
        });

        setDailyChanges(newDailyChanges);
        setToggles((prev) => ({ ...prev, daily: true }));
      }

      // baseChanges 처리
      if (initialValue.baseChanges && initialValue.baseChanges.length > 0) {
        const newBaseChanges = [
          { id: 1, direction: "+" as "+" | "-", amount: "" },
          { id: 2, direction: "-" as "+" | "-", amount: "" },
        ];

        initialValue.baseChanges.forEach((change) => {
          if (change.direction === "+") {
            newBaseChanges[0].amount = String(change.amount ?? "");
          } else {
            newBaseChanges[1].amount = String(change.amount ?? "");
          }
        });

        setBaseChanges(newBaseChanges);
        setToggles((prev) => ({ ...prev, base: true }));
      }
    }
    inited.current = true;
  }, [initialValue]);

  const toggle = (key: keyof typeof toggles) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setToggles((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleConfirm = () => {
    onConfirm({
      dailyChanges: toggles.daily
        ? dailyChanges.map(({ direction, amount }) => ({ direction, amount }))
        : [],
      baseChanges: toggles.base
        ? baseChanges.map(({ direction, amount }) => ({ direction, amount }))
        : [],
    });
  };

  const handleReset = () => {
    setDailyChanges([
      { id: 1, direction: "+", amount: "" },
      { id: 2, direction: "-", amount: "" },
    ]);
    setBaseChanges([
      { id: 1, direction: "+", amount: "" },
      { id: 2, direction: "-", amount: "" },
    ]);
    setToggles({ daily: false, base: false });
  };

  return (
    <ScrollView style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>변동률 (%)</Text>

        {/* 시가 기준 */}
        <ConditionSection
          title="시가 기준 변동률"
          description="시가 대비 상승 / 하락 시 알림"
          value={toggles.daily}
          onToggle={() => toggle("daily")}
          rows={dailyChanges}
          hasFilled={dailyChanges.some((v) => String(v.amount).trim() !== "")}
          onAdd={() => {}}
          renderRow={(r) =>
            toggles.daily && (
              <View key={r.id} style={styles.rowContainer}>
                <Text
                  style={[
                    styles.compareBadge,
                    r.direction === "+" ? styles.plusBadge : styles.minusBadge,
                  ]}
                >
                  {r.direction}
                </Text>
                <ConditionInput
                  value={r.amount}
                  placeholder={`시가 대비 ${
                    r.direction === "+" ? "상승" : "하락"
                  }률`}
                  unit="%"
                  onChange={(v) =>
                    setDailyChanges((prev) =>
                      prev.map((p) => (p.id === r.id ? { ...p, amount: v } : p))
                    )
                  }
                />
                {String(r.amount).trim() !== "" && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() =>
                      setDailyChanges((prev) =>
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
          title="현재가 기준 변동률"
          description="현재가 대비 상승 / 하락 시 알림"
          value={toggles.base}
          onToggle={() => toggle("base")}
          rows={baseChanges}
          hasFilled={baseChanges.some((v) => String(v.amount).trim() !== "")}
          onAdd={() => {}}
          renderRow={(r) =>
            toggles.base && (
              <View key={r.id} style={styles.rowContainer}>
                <Text
                  style={[
                    styles.compareBadge,
                    r.direction === "+" ? styles.plusBadge : styles.minusBadge,
                  ]}
                >
                  {r.direction}
                </Text>
                <ConditionInput
                  value={r.amount}
                  placeholder={`현재가 대비 ${
                    r.direction === "+" ? "상승" : "하락"
                  }률`}
                  unit="%"
                  onChange={(v) =>
                    setBaseChanges((prev) =>
                      prev.map((p) => (p.id === r.id ? { ...p, amount: v } : p))
                    )
                  }
                />
                {String(r.amount).trim() !== "" && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() =>
                      setBaseChanges((prev) =>
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

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>초기화</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmText}>확인</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#fff" },
  container: { paddingHorizontal: 16, paddingVertical: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 10 },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  compareBadge: {
    marginLeft: 8,
    marginRight: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1.3,
    fontSize: 13,
    fontWeight: "600",
  },
  plusBadge: {
    color: "#4CC439",
    borderColor: "#4CC439",
  },
  minusBadge: {
    color: "#FF3B30",
    borderColor: "#FF3B30",
  },
  removeButton: { marginLeft: 8 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
    marginTop: 10,
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
