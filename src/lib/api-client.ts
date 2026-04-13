/**
 * 공통 API 클라이언트
 *
 * 모든 서비스 파일에서 반복되는 fetch + 에러 처리 패턴을 통합.
 * 사용 예시:
 *   const data = await apiClient.get<{ reservations: Reservation[] }>('/api/reservations');
 *   const result = await apiClient.post<{ order: Order }>('/api/orders', body);
 */

// ===== API 에러 클래스 =====

/** 서버에서 반환한 에러를 담는 커스텀 에러 클래스 */
export class ApiError extends Error {
  constructor(
    /** HTTP 상태 코드 */
    public status: number,
    /** 서버 에러 메시지 */
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ===== 공통 응답 처리 =====

/**
 * fetch 응답을 검사하고 JSON으로 파싱
 * - 응답이 ok가 아닌 경우 서버 에러 메시지를 포함한 ApiError를 throw
 * - 204 No Content 등 빈 응답은 빈 객체 반환
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // 서버에서 보낸 에러 메시지 추출 시도
    let errorMessage = '요청에 실패했습니다';
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.error || errorMessage;
    } catch {
      // JSON 파싱 실패 시 기본 메시지 사용
    }
    throw new ApiError(response.status, errorMessage);
  }

  // 204 No Content 또는 빈 응답 처리
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T;
  }

  return response.json();
}

/**
 * JSON body를 포함하는 요청의 공통 옵션 생성
 */
function jsonRequestOptions(method: string, data?: unknown): RequestInit {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (data !== undefined) {
    options.body = JSON.stringify(data);
  }
  return options;
}

// ===== API 클라이언트 =====

export const apiClient = {
  /** GET 요청 — 데이터 조회 */
  async get<T>(url: string): Promise<T> {
    const response = await fetch(url);
    return handleResponse<T>(response);
  },

  /** POST 요청 — 데이터 생성 */
  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await fetch(url, jsonRequestOptions('POST', data));
    return handleResponse<T>(response);
  },

  /** PATCH 요청 — 데이터 부분 수정 */
  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await fetch(url, jsonRequestOptions('PATCH', data));
    return handleResponse<T>(response);
  },

  /** PUT 요청 — 데이터 전체 교체 */
  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await fetch(url, jsonRequestOptions('PUT', data));
    return handleResponse<T>(response);
  },

  /** DELETE 요청 — 데이터 삭제 */
  async delete(url: string): Promise<void> {
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) {
      let errorMessage = '삭제에 실패했습니다';
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.error || errorMessage;
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new ApiError(response.status, errorMessage);
    }
  },
};
