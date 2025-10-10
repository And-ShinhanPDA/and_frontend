import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// SVG 아이콘들
import Logo_10 from "@/assets/images/companies/logo_10_두산.svg";
import Logo_11 from "@/assets/images/companies/logo_11_기아.svg";
import Logo_12 from "@/assets/images/companies/logo_12_신한금융그룹.svg";
import Logo_1 from "@/assets/images/companies/logo_1_삼성전자.svg";
import Logo_2 from "@/assets/images/companies/logo_2_하이닉스.svg";
import Logo_3 from "@/assets/images/companies/logo_3_에너지솔루션.svg";
import Logo_4 from "@/assets/images/companies/logo_4_한화에어로스페이스.svg";
import Logo_5 from "@/assets/images/companies/logo_5_현대차.svg";
import Logo_6 from "@/assets/images/companies/logo_6_KB.svg";
import Logo_7 from "@/assets/images/companies/logo_7_네이버.svg";
import Logo_8 from "@/assets/images/companies/logo_8_HD현대중공업.svg";
import Logo_9 from "@/assets/images/companies/logo_9_셀트리온.svg";

export default function ChartList() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const companies = [
    { id: "1", name: "삼성전자", logo: Logo_1 },
    { id: "2", name: "하이닉스", logo: Logo_2 },
    { id: "3", name: "에너지솔루션", logo: Logo_3 },
    { id: "4", name: "한화에어로스페이스", logo: Logo_4 },
    { id: "5", name: "현대차", logo: Logo_5 },
    { id: "6", name: "KB", logo: Logo_6 },
    { id: "7", name: "네이버", logo: Logo_7 },
    { id: "8", name: "HD현대중공업", logo: Logo_8 },
    { id: "9", name: "셀트리온", logo: Logo_9 },
    { id: "10", name: "두산", logo: Logo_10 },
    { id: "11", name: "기아", logo: Logo_11 },
    { id: "12", name: "신한금융그룹", logo: Logo_12 },
  ];

  const filtered = companies.filter((c) => c.name.includes(search));

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        router.push({
          pathname: `/chart/[chartId]`,
          params: { chartId: item.id, name: item.name },
        })
      }
    >
      <item.logo width={48} height={48} />
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="기업을 검색해보세요"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={4}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  searchBar: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
  item: {
    flex: 1,
    alignItems: "center",
  },
  name: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
  },
});
