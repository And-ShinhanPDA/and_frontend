# 🔐 토큰 자동 갱신 시스템 마이그레이션 완료

## ✅ 완료된 작업

### 1. 글로벌 API 클라이언트 생성 (`services/api-client.ts`)

- ✅ Request Interceptor: 모든 요청에 자동으로 `Authorization: Bearer {token}` 추가
- ✅ Response Interceptor: 401 에러 발생 시 자동 토큰 갱신 후 재시도
- ✅ 동시 요청 처리: 여러 API가 동시에 401을 받아도 리프레시는 한 번만 실행
- ✅ 리프레시 실패 시 자동 로그아웃

### 2. 서비스 파일 마이그레이션 완료

#### ✅ alert-service.ts (17개 함수)

- `createAlert` - 알림 등록
- `getUserAlerts` - 사용자 보유 알림 조회
- `getAlert` - 알림 상세 조회
- `toggleAlertActive` - 알림 ON/OFF
- `toggleCompanyAlerts` - 기업 알림 ON/OFF
- `deleteCompanyAlerts` - 기업 알림 삭제
- `getTriggeredAlerts` - 조건 충족 알림 조회
- `updateAlert` - 알림 수정
- `deleteAlert` - 알림 삭제
- `getConditionSearchResults` - 조건 검색 결과 조회
- `getTriggeredConditionAlerts` - 조건 충족 알림 조회
- `getTodayAlerts` - 오늘의 알림 조회
- `getAlertHeatmap` - 히트맵 데이터 조회
- `getPriceOnOffStatus` - 가격 알림 ON/OFF 상태 조회
- `updatePriceOnOffStatus` - 가격 알림 ON/OFF 업데이트

#### ✅ preset-service.ts (5개 함수)

- `getPresetList` - 전체 프리셋 조회
- `getPresetById` - 프리셋 상세 조회
- `createPreset` - 프리셋 생성
- `updatePreset` - 프리셋 수정
- `deletePreset` - 프리셋 삭제

#### ✅ current-data-service.ts (7개 함수)

- `getCurrentData` - 현재 시점 데이터 조회
- `getCurrentPrice` - 현재가 조회
- `getSMAValues` - SMA 값 조회
- `getRSIValue` - RSI 값 조회
- `getBollingerBandValues` - 볼린저밴드 값 조회
- `get52WeekValues` - 52주 값 조회
- `getVolumeAnalysis` - 거래량 분석 조회

#### ✅ chart-service.ts (3개 함수)

- `getDailyCandles` - 일봉 차트 데이터 조회
- `getMinuteCandles` - 분봉 차트 데이터 조회
- `getCurrentPrice` - 현재가 조회

#### ℹ️ auth-service.ts (변경 없음)

- `signUp` - 회원가입 (토큰 없음)
- `signIn` - 로그인 (토큰 없음)
- `refresh` - 토큰 갱신 (api-client interceptor에서 자동 처리)

#### ℹ️ widgetShare.ts (변경 없음)

- API 호출 없음 (로컬 데이터 저장만 처리)

## 🎯 동작 흐름

```
사용자가 API 호출 (예: alertService.getUserAlerts(accessToken))
  ↓
apiClient.get("/api/alerts")
  ↓
[Request Interceptor] SecureStore에서 토큰 읽어서 자동 추가
  ↓
Authorization: Bearer {token} 헤더와 함께 요청 전송
  ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
토큰이 만료된 경우
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ↓
401 Unauthorized 응답
  ↓
[Response Interceptor] 401 에러 감지
  ↓
🔄 자동으로 /api/auth/refresh 호출
  ↓
새 accessToken 받아서 SecureStore에 저장
  ↓
원래 요청을 새 토큰으로 재시도
  ↓
✅ 성공 응답 반환
  ↓
사용자는 토큰 만료를 전혀 인지하지 못함
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
리프레시도 실패한 경우
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ↓
SecureStore에서 모든 토큰 삭제
  ↓
AuthContext에서 자동 로그아웃 처리
  ↓
로그인 화면으로 리다이렉트
```

## 📋 변경 사항 요약

### Before (기존)

```typescript
// services/alert-service.ts
import axios from "axios";

async getUserAlerts(accessToken: string) {
  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
}
```

### After (변경 후)

```typescript
// services/alert-service.ts
import { apiClient } from "./api-client";

async getUserAlerts(accessToken: string) {
  const res = await apiClient.get(url);
  return res.data;
}
```

## ✅ 검증 완료

- ✅ 모든 서비스 파일에서 axios → apiClient 변경 완료
- ✅ Authorization 헤더 수동 추가 코드 제거
- ✅ Content-Type 헤더 제거 (apiClient 기본값 사용)
- ✅ 린트 에러 없음
- ✅ TypeScript 타입 에러 없음

## 🚀 사용 방법

이제 앱을 실행하면:

1. **모든 API 호출에 자동으로 토큰이 추가됩니다**
2. **토큰이 만료되면 자동으로 갱신되고 재시도됩니다**
3. **사용자는 토큰 만료를 인지하지 못합니다**
4. **리프레시도 실패하면 자동으로 로그아웃됩니다**

## 📝 주의사항

- `auth-service.ts`의 `signUp`, `signIn`은 토큰이 없는 상태에서 호출하므로 axios를 그대로 사용합니다.
- `auth-service.ts`의 `refresh` 함수는 `api-client.ts`의 interceptor에서 자동 호출되므로 직접 호출할 필요가 없습니다.
- 모든 다른 API는 `apiClient`를 사용하여 자동 토큰 관리가 적용됩니다.

## 🎉 완료!

이제 앱을 빌드하고 테스트하시면 됩니다!
