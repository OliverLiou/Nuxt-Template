import type { UseFetchOptions } from '#app'

// ============================================================================
// 0. HTTP 方法列舉 (HTTP Methods Enum)
// ============================================================================

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

// ============================================================================
// 1. 認證相關型別 (Auth Types)
// ============================================================================

/** 一般登入請求物件 */
export interface LoginRequest {
  UserName?: string | null
  Password?: string | null
}

/** AD 登入請求物件 */
export interface AdLoginRequest {
  UserName: string
  Password?: string
}

/** 登入與換發 Token 回應物件 */
export interface AuthResponse {
  AccessToken?: string | null
  RefreshToken?: string | null
}

/** 換發 Token 請求物件 */
export interface RefreshTokenRequest {
  AccessToken: string
  RefreshToken: string
}

/** 使用者個人資料 DTO */
export interface UserInfoDto {
  Id?: string | null
  UserName?: string | null
  EmployeeName?: string | null
  Email?: string | null
  Picture?: string | null
  RoleNames?: string[] | null
}

// ============================================================================
// 2. 資料相關型別 (Data Types)
// ============================================================================

/** Table1 資料儲存請求物件 */
export interface Table1Request {
  Table1Id?: number | null
  Column1?: string | null
}

/** Table1 資料回應物件 */
export interface Table1Response {
  Table1Id: number
  Column1?: string | null
}

/** 分頁查詢結果包裝物件 */
export interface Table1ResponsePagedResult {
  Items?: Table1Response[] | null
  TotalCount?: number
}

/** 使用者回應物件 */
export interface UserResponse {
  Id?: string | null
  UserName?: string | null
  EmployeeName?: string | null
  Email?: string | null
  Picture?: string | null
  RoleNames?: string[] | null
}

/** 使用者分頁查詢結果包裝物件 */
export interface UserResponsePagedResult {
  Items?: UserResponse[] | null
  TotalCount?: number
}

// ============================================================================
// 3. API Repository 實作
// ============================================================================

export const apiRepository = {
  /** 認證與使用者相關端點 */
  auth: {
    /** 一般登入，驗證成功後會回傳 JWT access token 和 refresh token */
    login(body: LoginRequest, options?: UseFetchOptions<AuthResponse>) {
      return useAPI<AuthResponse>('/Auth/Login', {
        method: HttpMethod.POST,
        body,
        ...options,
      })
    },

    /** AD 登入，驗證成功後會自動建立使用者資料，並回傳 JWT AccessToken 和 RefreshToken */
    adLogin(body: AdLoginRequest, options?: UseFetchOptions<AuthResponse>) {
      return useAPI<AuthResponse>('/Auth/AdLogin', {
        method: HttpMethod.POST,
        body,
        ...options,
      })
    },

    /** 取得使用者個人資料，包含姓名、Email、角色等資訊 */
    getUserProfile(options?: UseFetchOptions<UserInfoDto>) {
      return useAPI<UserInfoDto>('/Auth/UserProfile', {
        method: HttpMethod.GET,
        ...options,
      })
    },

    /** 使用 Refresh Token 換發新的 Access Token */
    refreshToken(body: RefreshTokenRequest, options?: UseFetchOptions<AuthResponse>) {
      return useAPI<AuthResponse>('/Auth/RefreshToken', {
        method: HttpMethod.POST,
        body,
        ...options,
      })
    }
  },

  /** 業務資料處理相關端點 */
  data: {
    /** 取得指定的 Table1 資料 */
    getTable1(table1Id: number, options?: UseFetchOptions<any>) {
      return useAPI<any>(`/Data/GetTable1/${table1Id}`, {
        method: HttpMethod.GET,
        ...options,
      })
    },

    /** 儲存單筆 Table1 資料 */
    table1SingleSave(body: Table1Request, options?: UseFetchOptions<any>) {
      return useAPI<any>('/Data/Table1SingleSave', {
        method: HttpMethod.POST,
        body,
        ...options,
      })
    },

    /** 儲存多筆 Table1 資料 */
    table1MultipleSave(body: Table1Request[], options?: UseFetchOptions<any>) {
      return useAPI<any>('/Data/Table1MutipleSave', {
        method: HttpMethod.POST,
        body,
        ...options,
      })
    },

    /** 刪除指定的 Table1 資料 */
    deleteTable1Data(table1Id: number, options?: UseFetchOptions<any>) {
      return useAPI<any>('/Data/DeleteTable1Data', {
        method: HttpMethod.DELETE,
        query: { table1Id },
        ...options,
      })
    },

    /** 取得所有 Table1 資料 */
    getTable1s(options?: UseFetchOptions<Table1Response[]>) {
      return useAPI<Table1Response[]>('/Data/GetTable1s', {
        method: HttpMethod.GET,
        ...options,
      })
    },

    /** 分頁查詢 Table1 資料 */
    findTable1(
      currentPage: number,
      pageSize: number,
      querySearch?: string,
      options?: UseFetchOptions<Table1ResponsePagedResult>
    ) {
      return useAPI<Table1ResponsePagedResult>(`/Data/FindTable1/${currentPage}/${pageSize}`, {
        method: HttpMethod.GET,
        query: querySearch ? { querySearch } : undefined,
        ...options,
      })
    },

    /** 分頁查詢使用者資料 */
    findUsers(
      currentPage: number,
      pageSize: number,
      querySearch?: string,
      options?: UseFetchOptions<UserResponsePagedResult>
    ) {
      return useAPI<UserResponsePagedResult>(`/Data/FindUsers/${currentPage}/${pageSize}`, {
        method: HttpMethod.GET,
        query: querySearch ? { querySearch } : undefined,
        ...options,
      })
    }
  }
}
