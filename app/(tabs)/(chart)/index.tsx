import CustomHeader from "@/components/header/header";
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

  const companies = [
    {
      id: "1",
      name: "삼성전자",
      logo: require("@/assets/images/companies/logo_1_삼성전자.png"),
    },
    {
      id: "2",
      name: "하이닉스",
      logo: require("@/assets/images/companies/logo_2_하이닉스.png"),
    },
    {
      id: "3",
      name: "에너지솔루션",
      logo: require("@/assets/images/companies/logo_3_에너지솔루션.png"),
    },
    {
      id: "4",
      name: "한화에어로스페이스",
      logo: require("@/assets/images/companies/logo_4_한화에어로스페이스.png"),
    },
    {
      id: "5",
      name: "현대차",
      logo: require("@/assets/images/companies/logo_5_현대차.png"),
    },
    {
      id: "6",
      name: "KB",
      logo: require("@/assets/images/companies/logo_6_KB.png"),
    },
    {
      id: "7",
      name: "네이버",
      logo: require("@/assets/images/companies/logo_7_네이버.png"),
    },
    {
      id: "8",
      name: "HD현대중공업",
      logo: require("@/assets/images/companies/logo_8_HD현대중공업.png"),
    },
    {
      id: "9",
      name: "셀트리온",
      logo: require("@/assets/images/companies/logo_9_셀트리온.png"),
    },
    {
      id: "10",
      name: "두산",
      logo: require("@/assets/images/companies/logo_10_두산.png"),
    },
    {
      id: "11",
      name: "기아",
      logo: require("@/assets/images/companies/logo_11_기아.png"),
    },
    {
      id: "12",
      name: "신한금융그룹",
      logo: require("@/assets/images/companies/logo_12_신한금융그룹.png"),
    },
    {
      id: "13",
      name: "카카오",
      logo: require("@/assets/images/companies/logo_13_카카오.png"),
    },
    {
      id: "14",
      name: "하나금융지주",
      logo: require("@/assets/images/companies/logo_14_하나금융지주.png"),
    },
    {
      id: "15",
      name: "한국전력공사",
      logo: require("@/assets/images/companies/logo_15_한국전력공사.png"),
    },
    {
      id: "16",
      name: "포스코홀딩스",
      logo: require("@/assets/images/companies/logo_16_포스코홀딩스.png"),
    },
    {
      id: "17",
      name: "HMM",
      logo: require("@/assets/images/companies/logo_17_HMM.png"),
    },
    {
      id: "18",
      name: "메리츠금융지주",
      logo: require("@/assets/images/companies/logo_18_메리츠금융지주.png"),
    },
    {
      id: "19",
      name: "우리금융지주",
      logo: require("@/assets/images/companies/logo_19_우리금융지주.png"),
    },
    {
      id: "20",
      name: "고려아연",
      logo: require("@/assets/images/companies/logo_20_고려아연.png"),
    },
  ];

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const onSubmit = async () => {
    router.replace("/(tabs)");
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        router.push({
          pathname: `/(tabs)/(chart)/[chartId]`,
          params: { chartId: item.id, name: item.name },
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
      <CustomHeader title="차트" showBackButton={false} rightButtons="mypage" />

      {/* 검색 바 - 두번째 코드 스타일 적용 */}
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
