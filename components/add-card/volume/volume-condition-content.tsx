import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ConditionPlus from "../../../assets/images/condition-plus.svg";
import VolumeCurrentRow from "./volume-current-row";
import VolumeRecentRow from "./volume-recent-row";
import VolumeSpikeRow from "./volume-spike-row";

export default function VolumeConditionContent({ onConfirm }: any) {
  // 현재 거래량 대비 (%)
  const [currentRows, setCurrentRows] = useState<
    {
      id: number;
      filled: boolean;
      sign: "+" | "-";
      value: string;
      compare: "이상" | "이하";
    }[]
  >([{ id: 1, filled: false, sign: "+", value: "", compare: "이상" }]);

  const addCurrentRow = () =>
    setCurrentRows((prev) => [
      ...prev,
      { id: Date.now(), filled: false, sign: "+", value: "", compare: "이상" },
    ]);

  const removeCurrentRow = (id: number) =>
    setCurrentRows((prev) => prev.filter((r) => r.id !== id));

  const updateCurrentRow = (
    id: number,
    data: { sign: "+" | "-"; value: string; compare: "이상" | "이하" }
  ) =>
    setCurrentRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, ...data, filled: data.value.trim() !== "" } : r
      )
    );

  const resetCurrentRow = (id: number) =>
    setCurrentRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, filled: false, sign: "+", value: "", compare: "이상" }
          : r
      )
    );

  const hasCurrentFilled = currentRows.some((r) => r.filled);

  // 최신 거래량 대비 (%)
  const [recentRows, setRecentRows] = useState<
    {
      id: number;
      filled: boolean;
      sign: "+" | "-";
      value: string;
      compare: "이상" | "이하";
    }[]
  >([{ id: 1, filled: false, sign: "+", value: "", compare: "이상" }]);

  const addRecentRow = () =>
    setRecentRows((prev) => [
      ...prev,
      { id: Date.now(), filled: false, sign: "+", value: "", compare: "이상" },
    ]);

  const removeRecentRow = (id: number) =>
    setRecentRows((prev) => prev.filter((r) => r.id !== id));

  const updateRecentRow = (
    id: number,
    data: { sign: "+" | "-"; value: string; compare: "이상" | "이하" }
  ) =>
    setRecentRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, ...data, filled: data.value.trim() !== "" } : r
      )
    );

  const resetRecentRow = (id: number) =>
    setRecentRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, filled: false, sign: "+", value: "", compare: "이상" }
          : r
      )
    );

  const hasRecentFilled = recentRows.some((r) => r.filled);

  // 거래량 급증/감소 여부
  const [spikeRows, setSpikeRows] = useState<
    { id: number; type: "급증" | "감소" }[]
  >([]);

  const addSpikeRow = () =>
    setSpikeRows((prev) => [
      ...prev,
      { id: Date.now(), type: prev.length % 2 === 0 ? "급증" : "감소" },
    ]);

  const toggleSpikeType = (id: number) =>
    setSpikeRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, type: r.type === "급증" ? "감소" : "급증" } : r
      )
    );

  const removeSpikeRow = (id: number) =>
    setSpikeRows((prev) => prev.filter((r) => r.id !== id));

  const handleConfirm = () => {
    onConfirm({
      currentVolume: currentRows.filter((r) => r.value.trim() !== ""),
      recentVolume: recentRows.filter((r) => r.value.trim() !== ""),
      spikes: spikeRows,
    });
  };

  const handleReset = () => {
    setCurrentRows([
      { id: 1, filled: false, sign: "+", value: "", compare: "이상" },
    ]);
    setRecentRows([
      { id: 1, filled: false, sign: "+", value: "", compare: "이상" },
    ]);
    setSpikeRows([]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* 현재 거래량 대비 (%) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>현재 거래량 대비 (%)</Text>
        {currentRows.map((r) => (
          <VolumeCurrentRow
            key={r.id}
            onRemove={() => removeCurrentRow(r.id)}
            onReset={() => resetCurrentRow(r.id)}
            onValueChange={(data) => updateCurrentRow(r.id, data)}
            isSingleRow={currentRows.length === 1}
          />
        ))}

        {hasCurrentFilled && (
          <TouchableOpacity style={styles.addButton} onPress={addCurrentRow}>
            <ConditionPlus width={20} height={20} />
          </TouchableOpacity>
        )}
      </View>

      {/* 최신 거래량 대비 (%) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>최신 거래량 대비 (%)</Text>
        <Text style={styles.subText}>최신 거래량 기준: 20일</Text>

        {recentRows.map((r) => (
          <VolumeRecentRow
            key={r.id}
            onRemove={() => removeRecentRow(r.id)}
            onReset={() => resetRecentRow(r.id)}
            onValueChange={(data) => updateRecentRow(r.id, data)}
            isSingleRow={recentRows.length === 1}
          />
        ))}

        {hasRecentFilled && (
          <TouchableOpacity style={styles.addButton} onPress={addRecentRow}>
            <ConditionPlus width={20} height={20} />
          </TouchableOpacity>
        )}
      </View>

      {/* 거래량 급증/감소 여부 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>거래량 급증 | 감소 여부</Text>
        <Text style={styles.subText}>전날 대비 20%</Text>

        {spikeRows.map((r) => (
          <VolumeSpikeRow
            key={r.id}
            type={r.type}
            onToggle={() => toggleSpikeType(r.id)}
            onRemove={() => removeSpikeRow(r.id)}
          />
        ))}

        {/* 2개까지만 추가 가능 */}
        {spikeRows.length < 2 && (
          <TouchableOpacity style={styles.addButton} onPress={addSpikeRow}>
            <ConditionPlus width={20} height={20} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.reset} onPress={handleReset}>
          <Text style={styles.resetText}>초기화</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirm} onPress={handleConfirm}>
          <Text style={styles.confirmText}>확인</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 10 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 6 },
  subText: { fontSize: 12, color: "#777", marginBottom: 8 },
  addButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  footer: { flexDirection: "row", marginTop: 20 },
  reset: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
    marginRight: 8,
  },
  resetText: { fontSize: 15, color: "#333" },
  confirm: {
    flex: 1,
    backgroundColor: "#4CC439",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
  },
  confirmText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
