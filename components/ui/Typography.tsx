import { Text as RNText, TextProps } from "react-native";

/**
 * 공통 Pretendard Text 컴포넌트
 * - weight에 따라 fontFamily 매핑
 * - size props로 글자 크기 제어
 */
type TypographyProps = TextProps & {
  weight?: "200" | "400" | "500" | "600" | "700" | "900";
  size?: number;
};

// weight → fontFamily 매핑
const fontMap: Record<NonNullable<TypographyProps["weight"]>, string> = {
  "200": "Pretendard200",
  "400": "Pretendard400",
  "500": "Pretendard500",
  "600": "Pretendard600",
  "700": "Pretendard700",
  "900": "Pretendard900",
};

export function Typography({
  children,
  style,
  weight = "400",
  size = 16,
  ...rest
}: TypographyProps) {
  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: fontMap[weight],
          fontSize: size,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
