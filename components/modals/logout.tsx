import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LogoutModalProps {
  visible: boolean;
  userName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutModal({
  visible,
  userName = "사용자",
  onConfirm,
  onCancel,
}: LogoutModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.message}>
            <Text style={styles.userName}>{userName}</Text> 님{"\n"}
            로그아웃 하시겠습니까?
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>아니오</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>예</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    maxWidth: 320,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  message: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: "Pretendard",
  },
  userName: {
    fontWeight: "600",
    color: "#111",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  confirmButton: {
    backgroundColor: "#4CC53A",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
    fontFamily: "Pretendard",
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Pretendard",
  },
});
