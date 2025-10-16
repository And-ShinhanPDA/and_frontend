import Arrow from "@/assets/images/arrow.svg";
import LogoutModal from "@/components/modals/logout";
import { Typography } from "@/components/ui/Typography";
import { useRouter } from "expo-router";
import React, { ReactNode, useState } from "react";
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

  // 콜백들
  onMyPagePress?: () => void; // ⬅️ 기존: 원하는 동작이 있으면 여기로
  onPresetPress?: () => void;
  onModifyPress?: () => void;

  // 로그아웃 모달용
  userName?: string;
  onLogoutConfirm?: () => void; // ⬅️ 확인 버튼 콜백(우선순위 가장 높음)
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
  userName = "사용자",
  onLogoutConfirm,
}: CustomHeaderProps) {
  const router = useRouter();
  const [logoutVisible, setLogoutVisible] = useState(false);

  const handleBackPress = () => {
    if (onBackPress) onBackPress();
    else router.back();
  };

  // 로그아웃 모달 확인 시 실제 동작
  const handleLogoutConfirm = () => {
    setLogoutVisible(false);
    // 우선순위: onLogoutConfirm → onMyPagePress → fallback
    if (onLogoutConfirm) return onLogoutConfirm();
    if (onMyPagePress) return onMyPagePress();
    // 기본 동작(예시): 로그인 화면으로
    // 필요 시 프로젝트의 logout() 호출 등으로 교체
    console.log("로그아웃 확인");
  };

  const renderRightButtons = () => {
    if (customRight) return customRight;

    switch (rightButtons) {
      case "mypage":
        return (
          <Pressable onPress={() => setLogoutVisible(true)}>
            <Image
              source={require("@/assets/images/logOut.png")}
              style={{ width: 24, height: 24, marginRight: 5 }}
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

            {/* 마이페이지(로그아웃) 아이콘 → 모달 오픈 */}
            <Pressable onPress={() => setLogoutVisible(true)}>
              <Image
                source={require("@/assets/images/logOut.png")}
                style={{ width: 24, height: 24, marginRight: 5 }}
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

  const headerView = (
    <View style={styles.header}>
      {/* 왼쪽 영역 */}
      <View style={centerTitle ? styles.leftSide : styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Arrow width={22} height={22} />
          </TouchableOpacity>
        )}

        {!centerTitle &&
          (leftContent === "title" ? (
            typeof title === "string" ? (
              <Text style={styles.headerTitle} numberOfLines={1}>
                {title}
              </Text>
            ) : (
              title
            )
          ) : (
            customLeft
          ))}
      </View>

      {/* 중앙 타이틀 */}
      {centerTitle && (
        <View style={styles.centerTitle}>
          {typeof title === "string" ? (
            <Text style={styles.centerTitleText} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            title
          )}
        </View>
      )}

      {/* 오른쪽 영역 */}
      <View style={centerTitle ? styles.rightSide : styles.rightSection}>
        {renderRightButtons()}
      </View>
    </View>
  );

  return (
    <>
      {headerView}

      {/* 로그아웃 모달 */}
      <LogoutModal
        visible={logoutVisible}
        userName={userName}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 70,
    marginBottom: 8,
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
