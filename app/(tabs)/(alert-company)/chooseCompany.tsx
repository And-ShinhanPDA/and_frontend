import { CustomBottomTab } from "@/components/bottom/bottom";
import CustomHeader from "@/components/header/header";
import { COMPANIES } from "@/constants/companies";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AlertAdditional() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { signOut, user } = useAuth();

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await signOut();
      console.log("로그아웃 성공");
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const filtered = COMPANIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        router.push({
          pathname: "/(tabs)/(alert-company)/(alert-company-additional)/[id]",
          params: { id: item.code, name: item.name },
        })
      }
      activeOpacity={0.7}
    >
      <Image source={item.logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <CustomHeader
        title="기업 선택"
        showBackButton={true}
        rightButtons="mypage"
        userName={user?.name || "사용자"}
        onLogoutConfirm={handleLogout}
      />

      {/* 검색 바 */}
      <View style={styles.searchWrapper}>
        <Image
          source={require("@/assets/images/alert/search.png")}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="기업을 검색해보세요"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* 회사 리스트 */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={4}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <CustomBottomTab activeTab="기업 알림" />
    </View>
  );
}

export const options = {
  title: "알림 추가",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
    height: 40,
    margin: 22,
  },
  searchBar: {
    flex: 1,
    marginLeft: 6,
    fontFamily: "Pretendard",
  },
  searchIcon: {
    width: 15,
    height: 15,
    resizeMode: "contain",
    marginBottom: 2,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 22,
  },
  item: {
    flex: 1,
    alignItems: "center",
    padding: 8,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  name: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    color: "#333",
    fontFamily: "Pretendard",
  },
  listContent: {
    paddingBottom: 50,
  },
});
