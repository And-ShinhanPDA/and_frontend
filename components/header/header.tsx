import Arrow from "@/assets/images/arrow.svg";
import { Typography } from "@/components/ui/Typography";
import { useRouter } from "expo-router";
import React, { ReactNode } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type RightButtonType =
  | "mypage"
  | "preset-small"
  | "preset-large"
  | "modify"
  | "preset-and-mypage"
  | "preset-and-modify";

type CustomHeaderProps = {
  // 왼쪽 영역
  leftContent?: "title" | "custom";
  title?: string | ReactNode;
  customLeft?: ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  centerTitle?: boolean;

  // 오른쪽 영역
  rightButtons?: RightButtonType;
  onMyPagePress?: () => void;
  onPresetPress?: () => void;
  onModifyPress?: () => void;
  customRight?: ReactNode;
};

export default function CustomHeader({
  leftContent = "title",
  title = "",
  customLeft,
  showBackButton = true,
  onBackPress,
  centerTitle = false,
  rightButtons,
  onMyPagePress,
  onPresetPress,
  onModifyPress,
  customRight,
}: CustomHeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const renderRightButtons = () => {
    if (customRight) {
      return customRight;
    }

    switch (rightButtons) {
      case "mypage":
        return (
          <Pressable
            onPress={onMyPagePress || (() => console.log("마이페이지 이동"))}
          >
            <Image
              source={require("@/assets/images/mypage.png")}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          </Pressable>
        );

      case "preset-small":
        return (
          <Pressable
            onPress={onPresetPress || (() => console.log("프리셋 버튼"))}
            style={styles.presetSmallButton}
          >
            <Image
              source={require("@/assets/images/preset.png")}
              style={{ width: 12, height: 12, marginRight: 3 }}
              resizeMode="contain"
            />
            <Typography weight="400" size={12} style={{ color: "#4CC53A" }}>
              프리셋
            </Typography>
          </Pressable>
        );

      case "preset-large":
        return (
          <Pressable
            onPress={onPresetPress || (() => console.log("프리셋으로 추가"))}
            style={styles.presetLargeButton}
          >
            <Image
              source={require("@/assets/images/preset.png")}
              style={{ width: 12, height: 12, marginRight: 3 }}
              resizeMode="contain"
            />
            <Typography weight="400" size={12} style={{ color: "#4CC53A" }}>
              프리셋으로 추가
            </Typography>
          </Pressable>
        );

      case "modify":
        return (
          <Pressable
            onPress={onModifyPress || (() => console.log("수정 버튼"))}
            style={styles.modifyButton}
          >
            <Image
              source={require("@/assets/images/alert/modify.png")}
              style={{ width: 19, height: 19 }}
            />
          </Pressable>
        );

      case "preset-and-mypage":
        return (
          <>
            <Pressable
              onPress={onPresetPress || (() => console.log("프리셋 버튼"))}
              style={styles.presetSmallButton}
            >
              <Image
                source={require("@/assets/images/preset.png")}
                style={{ width: 12, height: 12, marginRight: 3 }}
                resizeMode="contain"
              />
              <Typography weight="400" size={12} style={{ color: "#4CC53A" }}>
                프리셋
              </Typography>
            </Pressable>
            <Pressable
              onPress={onMyPagePress || (() => console.log("마이페이지 이동"))}
            >
              <Image
                source={require("@/assets/images/mypage.png")}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            </Pressable>
          </>
        );

      case "preset-and-modify":
        return (
          <>
            <Pressable
              onPress={onPresetPress || (() => console.log("프리셋으로 추가"))}
              style={styles.presetLargeButton}
            >
              <Image
                source={require("@/assets/images/preset.png")}
                style={{ width: 12, height: 12, marginRight: 3 }}
                resizeMode="contain"
              />
              <Typography weight="400" size={12} style={{ color: "#4CC53A" }}>
                프리셋으로 추가
              </Typography>
            </Pressable>
            <Pressable
              onPress={onModifyPress || (() => console.log("수정 버튼"))}
              style={styles.modifyButton}
            >
              <Image
                source={require("@/assets/images/alert/modify.png")}
                style={{ width: 19, height: 19 }}
              />
            </Pressable>
          </>
        );

      default:
        return null;
    }
  };

  if (centerTitle) {
    // 중앙 정렬 레이아웃
    return (
      <View style={styles.header}>
        {/* 왼쪽 영역 */}
        <View style={styles.leftSide}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Arrow width={22} height={22} />
            </TouchableOpacity>
          )}
        </View>

        {/* 중앙 타이틀 */}
        <View style={styles.centerTitle}>
          {typeof title === "string" ? (
            <Text style={styles.centerTitleText} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            title
          )}
        </View>

        {/* 오른쪽 영역 */}
        <View style={styles.rightSide}>{renderRightButtons()}</View>
      </View>
    );
  }

  // 기존 왼쪽 정렬 레이아웃
  return (
    <View style={styles.header}>
      {/* 왼쪽 영역 */}
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Arrow width={22} height={22} />
          </TouchableOpacity>
        )}

        {leftContent === "title" ? (
          typeof title === "string" ? (
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            title
          )
        ) : (
          customLeft
        )}
      </View>

      {/* 오른쪽 영역 */}
      <View style={styles.rightSection}>{renderRightButtons()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 70,
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
    marginLeft: 10,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginRight: 4,
  },
  // 중앙 정렬용 스타일
  leftSide: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  centerTitle: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  centerTitleText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
  },
  rightSide: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  presetSmallButton: {
    backgroundColor: "rgba(76, 197, 58, 0.15)",
    borderRadius: 7,
    width: 62,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  presetLargeButton: {
    backgroundColor: "rgba(76, 197, 58, 0.15)",
    borderRadius: 7,
    paddingHorizontal: 10,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  modifyButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
