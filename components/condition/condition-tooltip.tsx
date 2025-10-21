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
      const tooltipWidth = 200;
      const padding = 20;
      
      // 항상 아이콘 오른쪽에 툴팁 표시
      const x = px + width + 8;
      
      // 아이콘 수직 중앙에 맞춰 Y 위치 조정
      const tooltipY = py - 12;
      
      setPosition({ x, y: tooltipY });
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
    maxWidth: 200,
  },
  tooltipArrowContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: -1,
    height: 40,
  },
  tooltipArrowLeft: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 10,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "#333",
  },
  tooltipContent: {
    backgroundColor: "#333",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 200,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Pretendard",
    textAlign: "left",
  },
});

