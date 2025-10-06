// 조건 설정을 위한 기본 모달 디자인 정의
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface ConditionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number | string;
  ratio?: number;
}

export default function ConditionBottomSheet({
  visible,
  onClose,
  children,
  height,
  ratio,
}: ConditionBottomSheetProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get("window").height;
  const sheetHeight =
    typeof height === "number" ? height : ratio ? screenHeight * ratio : 700;
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => translateY.setValue(0));
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120) onClose();
        else
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
      },
    })
  ).current;

  const slideUp = {
    transform: [
      {
        translateY: Animated.add(
          slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [400, 0],
          }),
          translateY
        ),
      },
    ],
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {" "}
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.dimmed} onPress={onClose} />
          <Animated.View
            style={[styles.bottomSheet, { minHeight: sheetHeight }, slideUp]}
            {...panResponder.panHandlers}
          >
            <View style={styles.handleBar} />
            {children}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  dimmed: { flex: 1 },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  handleBar: {
    width: 45,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#C4C4C4",
    alignSelf: "center",
    marginVertical: 8,
  },
});
