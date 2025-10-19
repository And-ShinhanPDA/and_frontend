/**
 * API 오류 응답에서 사용자에게 표시할 메시지만 추출
 */
export function getErrorMessage(error: any): string {
  // axios 에러 응답에서 백엔드 메시지 추출
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // 네트워크 에러
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return '요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.';
  }

  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return '네트워크 연결을 확인해주세요.';
  }

  // HTTP 상태 코드별 기본 메시지
  const status = error.response?.status;
  if (status) {
    switch (status) {
      case 400:
        return '잘못된 요청입니다.';
      case 401:
        return '로그인이 필요합니다.';
      case 403:
        return '접근 권한이 없습니다.';
      case 404:
        return '요청하신 정보를 찾을 수 없습니다.';
      case 409:
        return '이미 존재하는 정보입니다.';
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:
        if (status >= 500) {
          return '서버 오류가 발생했습니다.';
        }
    }
  }

  // Error 객체의 메시지
  if (error.message) {
    return error.message;
  }

  // 기본 메시지
  return '오류가 발생했습니다. 다시 시도해주세요.';
}

