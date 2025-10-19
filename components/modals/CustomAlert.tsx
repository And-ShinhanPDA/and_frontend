import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CustomAlertProps {
  visible: boolean;
  title?: string;
  message: string;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }>;
  onClose?: () => void;
}

export default function CustomAlert({
  visible,
  title,
  message,
  buttons = [{ text: "확인" }],
  onClose,
}: CustomAlertProps) {
  const handleButtonPress = (onPress?: () => void) => {
    onPress?.();
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>

          <View
            style={[
              styles.buttonContainer,
              buttons.length === 1 && styles.buttonContainerSingle,
            ]}
          >
            {buttons.map((button, index) => {
              const isDestructive = button.style === "destructive";
              const isCancel = button.style === "cancel";
              const isPrimary = !isDestructive && !isCancel;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    buttons.length === 1 && styles.buttonSingle,
                    isDestructive && styles.destructiveButton,
                    isCancel && styles.cancelButton,
                    isPrimary && styles.primaryButton,
                  ]}
                  onPress={() => handleButtonPress(button.onPress)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isDestructive && styles.destructiveText,
                      isCancel && styles.cancelText,
                      isPrimary && styles.primaryText,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "Pretendard",
  },
  message: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    fontFamily: "Pretendard",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  buttonContainerSingle: {
    flexDirection: "column",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSingle: {
    flex: 0,
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#4CC53A",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  destructiveButton: {
    backgroundColor: "#EF4444",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Pretendard",
  },
  primaryText: {
    color: "#fff",
  },
  cancelText: {
    color: "#666",
  },
  destructiveText: {
    color: "#fff",
  },
});

