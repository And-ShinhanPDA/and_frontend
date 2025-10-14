import ConditionSection from "@/components/condition/condition-section";
import { SMA_SECTION_DESCRIPTIONS } from "@/components/condition/constants";
import React, { useEffect, useRef, useState } from "react";
import {
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ChevronDown from "../../../assets/images/ChevronDown.svg";

type Compare = "이상" | "이하";
type UIState = { value: string; period: string; compare: Compare };
type APIState = { indicator: string; threshold: number };

const DEFAULT_UI: UIState = { value: "", period: "5일", compare: "이상" };

function fromIndicator(
  indicator?: string
): Pick<UIState, "period" | "compare"> {
  const m = indicator?.match(/^SMA_(\d+)_((UP|DOWN))$/);
  if (!m) return { period: "5일", compare: "이상" };
  return { period: `${m[1]}일`, compare: m[2] === "UP" ? "이상" : "이하" };
}

function toApiState(ui: UIState): APIState | null {
  const v = Number((ui.value ?? "").toString().replace(/,/g, ""));
  if (!Number.isFinite(v) || v <= 0) return null;
  const periodNum = (ui.period ?? "5일").replace(/\D/g, "") || "5";
  const suffix = ui.compare === "이상" ? "UP" : "DOWN";
  return { indicator: `SMA_${periodNum}_${suffix}`, threshold: v };
}

export default function SMAConditionContent({
  onConfirm,
  initialValue,
}: {
  onConfirm: (data: any) => void;
  initialValue?: any;
}) {
  const [toggles, setToggles] = useState({
    target: false,
    shortCross: false,
    longCross: false,
  });

  const [target, setTarget] = useState<UIState>(DEFAULT_UI);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const initedRef = useRef(false);
  useEffect(() => {
    const hasInitValue = initialValue && Object.keys(initialValue).length > 0;

    if (!initedRef.current) {
      if (hasInitValue) {
        setToggles({
          target: !!initialValue?.target,
          shortCross: !!initialValue?.shortCross,
          longCross: !!initialValue?.longCross,
        });

        if (initialValue?.target) {
          const parsed = fromIndicator(initialValue.target.indicator);
          setTarget({
            value: String(initialValue.target.threshold ?? ""),
            period: parsed.period,
            compare: parsed.compare,
          });
        } else {
          setTarget(DEFAULT_UI);
        }
      } else {
        setToggles({ target: false, shortCross: false, longCross: false });
        setTarget(DEFAULT_UI);
      }
      initedRef.current = true;
    }
  }, [initialValue]);

  const toggle = (key: keyof typeof toggles) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirmPress = () => {
    const apiTarget = toggles.target ? toApiState(target) : null;
    onConfirm({
      target: apiTarget,
      shortCross: toggles.shortCross,
      longCross: toggles.longCross,
    });
  };

  const handleReset = () => {
    setToggles({ target: false, shortCross: false, longCross: false });
    setTarget(DEFAULT_UI);
  };

  return (
    <ScrollView style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>SMA</Text>

        {/* SMA 목표 가격 알림 */}
        <ConditionSection
          title="SMA 목표 가격 알림"
          description={SMA_SECTION_DESCRIPTIONS.TARGET}
          value={toggles.target}
          onToggle={() => toggle("target")}
          rows={[{}]}
          hasFilled={!!target?.value?.trim?.()}
          onAdd={() => {}}
          renderRow={() =>
            toggles.target && (
              <View style={styles.rowContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={target.value}
                    onChangeText={(v) => setTarget((t) => ({ ...t, value: v }))}
                    placeholder="목표가를 입력해주세요"
                    keyboardType="numeric"
                  />
                  <Text style={styles.unit}>원</Text>
                </View>

                <View style={styles.dropdownWrapper}>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setDropdownVisible((v) => !v)}
                  >
                    <Text style={styles.optionText}>{target.period}</Text>
                    <ChevronDown width={12} height={12} />
                  </TouchableOpacity>

                  {dropdownVisible && (
                    <View style={styles.dropdownMenu}>
                      {[
                        "5일",
                        "10일",
                        "20일",
                        "30일",
                        "50일",
                        "100일",
                        "200일",
                      ].map((opt) => (
                        <TouchableOpacity
                          key={opt}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setTarget((t) => ({ ...t, period: opt }));
                            setDropdownVisible(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownText,
                              opt === target.period && styles.selectedText,
                            ]}
                          >
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.compareButton}
                  onPress={() =>
                    setTarget((t) => ({
                      ...t,
                      compare: t.compare === "이상" ? "이하" : "이상",
                    }))
                  }
                >
                  <Text style={styles.compareText}>{target.compare}</Text>
                </TouchableOpacity>
              </View>
            )
          }
        />

        {/* 단기선이 장기선을 돌파 */}
        <ConditionSection
          title="단기선이 장기선을 돌파"
          description={SMA_SECTION_DESCRIPTIONS.SHORTCROSS}
          value={toggles.shortCross}
          onToggle={() => toggle("shortCross")}
          rows={[]}
          hasFilled={false}
          onAdd={() => {}}
          renderRow={() => null}
        />

        {/* 장기선이 단기선을 누름 */}
        <ConditionSection
          title="장기선이 단기선을 누름"
          description={SMA_SECTION_DESCRIPTIONS.LONGCROSS}
          value={toggles.longCross}
          onToggle={() => toggle("longCross")}
          rows={[]}
          hasFilled={false}
          onAdd={() => {}}
          renderRow={() => null}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>초기화</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmPress}
        >
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
  inputWrapper: { flex: 1, position: "relative" },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  unit: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -8 }],
    fontSize: 13,
    color: "#555",
  },
  dropdownWrapper: { position: "relative", marginLeft: 8 },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  optionText: { fontSize: 13, color: "#333", marginRight: 4 },
  dropdownMenu: {
    position: "absolute",
    top: 38,
    right: 0,
    width: 90,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 6,
    zIndex: 999,
    elevation: 16,
    overflow: "hidden",
  },
  dropdownItem: { paddingHorizontal: 10, paddingVertical: 8 },
  dropdownText: { fontSize: 13, color: "#333" },
  selectedText: { color: "#4CC439", fontWeight: "600" },
  compareButton: {
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  compareText: { fontSize: 13, color: "#333" },
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
