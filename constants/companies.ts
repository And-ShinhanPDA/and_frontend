import { ImageSourcePropType } from "react-native";
export type CompanyItem = {
  id: string;
  name: string;
  code: string;
  logo: ImageSourcePropType;
};

export const COMPANIES: CompanyItem[] = [
  {
    id: "1",
    name: "삼성전자",
    code: "005930",
    logo: require("@/assets/images/companies/logo_1_삼성전자.png"),
  },
  {
    id: "2",
    name: "SK하이닉스",
    code: "000660",
    logo: require("@/assets/images/companies/logo_2_하이닉스.png"),
  },
  {
    id: "3",
    name: "LG에너지솔루션",
    code: "373220",
    logo: require("@/assets/images/companies/logo_3_에너지솔루션.png"),
  },
  {
    id: "4",
    name: "한화에어로스페이스",
    code: "012450",
    logo: require("@/assets/images/companies/logo_4_한화에어로스페이스.png"),
  },
  {
    id: "5",
    name: "현대차",
    code: "005380",
    logo: require("@/assets/images/companies/logo_5_현대차.png"),
  },
  {
    id: "6",
    name: "KB금융",
    code: "105560",
    logo: require("@/assets/images/companies/logo_6_KB.png"),
  },
  {
    id: "7",
    name: "NAVER",
    code: "035420",
    logo: require("@/assets/images/companies/logo_7_네이버.png"),
  },
  {
    id: "8",
    name: "HD현대중공업",
    code: "329180",
    logo: require("@/assets/images/companies/logo_8_HD현대중공업.png"),
  },
  {
    id: "9",
    name: "셀트리온",
    code: "068270",
    logo: require("@/assets/images/companies/logo_9_셀트리온.png"),
  },
  {
    id: "10",
    name: "두산에너빌리티",
    code: "034020",
    logo: require("@/assets/images/companies/logo_10_두산.png"),
  },
  {
    id: "11",
    name: "기아",
    code: "000270",
    logo: require("@/assets/images/companies/logo_11_기아.png"),
  },
  {
    id: "12",
    name: "신한지주",
    code: "055550",
    logo: require("@/assets/images/companies/logo_12_신한금융그룹.png"),
  },
  {
    id: "13",
    name: "카카오",
    code: "035720",
    logo: require("@/assets/images/companies/logo_13_카카오.png"),
  },
  {
    id: "14",
    name: "하나금융지주",
    code: "086790",
    logo: require("@/assets/images/companies/logo_14_하나금융지주.png"),
  },
  {
    id: "15",
    name: "한국전력",
    code: "015760",
    logo: require("@/assets/images/companies/logo_15_한국전력공사.png"),
  },
  {
    id: "16",
    name: "POSCO홀딩스",
    code: "005490",
    logo: require("@/assets/images/companies/logo_16_포스코홀딩스.png"),
  },
  {
    id: "17",
    name: "HMM",
    code: "011200",
    logo: require("@/assets/images/companies/logo_17_HMM.png"),
  },
  {
    id: "18",
    name: "메리츠금융지주",
    code: "138040",
    logo: require("@/assets/images/companies/logo_18_메리츠금융지주.png"),
  },
  {
    id: "19",
    name: "우리금융지주",
    code: "316140",
    logo: require("@/assets/images/companies/logo_19_우리금융지주.png"),
  },
  {
    id: "20",
    name: "고려아연",
    code: "010130",
    logo: require("@/assets/images/companies/logo_20_고려아연.png"),
  },
];
