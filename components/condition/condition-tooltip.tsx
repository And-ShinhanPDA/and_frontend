import React, { useRef, useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ConditionTooltipProps {
  description: string;
}

export default function ConditionTooltip({ description }: ConditionTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const iconRef = useRef<View>(null);

  const handlePress = () => {
    iconRef.current?.measure((fx, fy, width, height, px, py) => {
      const tooltipWidth = 250;
      const padding = 20;
      
      // 아이콘 오른쪽에 툴팁 표시
      let x = px + width + 10;
      
      // 화면 오른쪽 경계를 벗어나면 왼쪽에 표시
      if (x + tooltipWidth + padding > SCREEN_WIDTH) {
        x = px - tooltipWidth - 10;
      }
      
      // 왼쪽 경계도 체크
      if (x < padding) {
        x = padding;
      }
      
      setPosition({ x, y: py });
      setVisible(true);
    });
  };

  return (
    <>
      <View ref={iconRef} collapsable={false}>
        <TouchableOpacity
          onPress={handlePress}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            source={require("@/assets/images/tooltip.png")}
            style={styles.tooltipIcon}
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <View style={[styles.tooltipContainer, { top: position.y, left: position.x }]}>
            <View style={styles.tooltipArrowContainer}>
              <View style={styles.tooltipArrowLeft} />
            </View>
            <View style={styles.tooltipContent}>
              <Text style={styles.tooltipText}>{description}</Text>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    marginLeft: 6,
    padding: 2,
  },
  tooltipIcon: {
    width: 16,
    height: 16,
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  tooltipContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 250,
  },
  tooltipArrowContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: -1,
  },
  tooltipArrowLeft: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 8,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "#333",
  },
  tooltipContent: {
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Pretendard",
    textAlign: "center",
  },
});

