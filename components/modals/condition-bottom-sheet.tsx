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
    TouchableWithoutFeedback,
    View
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
  
  // 최대 높이를 화면의 90%로 제한
  const maxHeight = screenHeight * 0.9;
  const sheetHeight =
    typeof height === "number" 
      ? Math.min(height, maxHeight)
      : ratio 
      ? Math.min(screenHeight * ratio, maxHeight)
      : Math.min(700, maxHeight);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => translateY.setValue(0));
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 세로 스와이프가 가로 스와이프보다 클 때만 활성화
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  const slideUp = {
    transform: [
      {
        translateY: Animated.add(
          slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [sheetHeight, 0],
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
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.dimmed} />
        </TouchableWithoutFeedback>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={0}
        >
          <Animated.View
            style={[
              styles.bottomSheet,
              { height: sheetHeight },
              slideUp,
            ]}
          >
            <View style={styles.handleBarContainer} {...panResponder.panHandlers}>
              <View style={styles.handleBar} />
            </View>
            {children}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  dimmed: { 
    flex: 1,
  },
  keyboardAvoidingView: {
    width: "100%",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  handleBarContainer: {
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: -20,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D1D6",
  },
});
