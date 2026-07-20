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
// 1. 認證與使用者相關型別 (Auth & User Types)
// ============================================================================

/** 一般登入請求物件 */
export interface LoginRequest {
  UserName: string
  Password: string
}

/** AD 登入請求物件 */
export interface AdLoginRequest {
  UserName: string
  Password: string
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
  PhoneNumber?: string | null
  AvatarUrl?: string | null
  RoleNames?: string[] | null
  IsActive?: boolean
}

/** 更新使用者資料的請求 DTO */
export interface UpdateUserRequest {
  EmployeeName?: string | null
  Email?: string | null
  PhoneNumber?: string | null
  IsActive?: boolean
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
  UserName?: string | null
  EmployeeName?: string | null
  Email?: string | null
  LastLoginAt?: string | null
}

/** 使用者分頁查詢結果包裝物件 */
export interface UserResponsePagedResult {
  Items?: UserResponse[] | null
  TotalCount?: number
}

// ============================================================================
// 3. API Endpoint Catalog
// ============================================================================

export const apiEndpoints = {
  /** 認證與使用者相關端點 */
  auth: {
    /** 一般登入，驗證成功後會回傳 JWT access token 和 refresh token */
    login(body: LoginRequest) {
      return {
        path: '/Auth/Login',
        options: {
          method: HttpMethod.POST,
          body
        }
      }
    },

    /** AD 登入，驗證成功後會自動建立使用者資料，並回傳 JWT AccessToken 和 RefreshToken */
    adLogin(body: AdLoginRequest) {
      return {
        path: '/Auth/AdLogin',
        options: {
          method: HttpMethod.POST,
          body
        }
      }
    },

    /** 取得使用者個人資料，包含姓名、Email、角色等資訊 */
    getUserProfile() {
      return {
        path: '/Auth/UserProfile',
        options: {
          method: HttpMethod.GET
        }
      }
    },

    /** 使用 Refresh Token 換發新的 Access Token */
    refreshToken(body: RefreshTokenRequest) {
      return {
        path: '/Auth/RefreshToken',
        options: {
          method: HttpMethod.POST,
          body
        }
      }
    }
  },

  /** 業務資料處理相關端點 */
  data: {
    /** 取得指定的 Table1 資料 */
    getTable1(table1Id: number) {
      return {
        path: `/Data/GetTable1/${table1Id}`,
        options: {
          method: HttpMethod.GET
        }
      }
    },

    /** 儲存單筆 Table1 資料 */
    table1SingleSave(body: Table1Request) {
      return {
        path: '/Data/Table1SingleSave',
        options: {
          method: HttpMethod.POST,
          body
        }
      }
    },

    /** 儲存多筆 Table1 資料 */
    table1MultipleSave(body: Table1Request[]) {
      return {
        path: '/Data/Table1MutipleSave',
        options: {
          method: HttpMethod.POST,
          body
        }
      }
    },

    /** 刪除指定的 Table1 資料 */
    deleteTable1Data(table1Id: number) {
      return {
        path: '/Data/DeleteTable1Data',
        options: {
          method: HttpMethod.DELETE,
          query: { table1Id }
        }
      }
    },

    /** 取得所有 Table1 資料 */
    getTable1s() {
      return {
        path: '/Data/GetTable1s',
        options: {
          method: HttpMethod.GET
        }
      }
    },

    /** 分頁查詢 Table1 資料 */
    findTable1(
      currentPage: number,
      pageSize: number,
      querySearch?: string
    ) {
      return {
        path: `/Data/FindTable1/${currentPage}/${pageSize}`,
        options: {
          method: HttpMethod.GET,
          query: querySearch ? { querySearch } : undefined
        }
      }
    }
  },

  /** 使用者管理相關端點 */
  user: {
    /** 分頁查詢使用者資料 */
    findUsers(
      currentPage: number,
      pageSize: number,
      querySearch?: string
    ) {
      return {
        path: `/User/FindUsers/${currentPage}/${pageSize}`,
        options: {
          method: HttpMethod.GET,
          query: querySearch ? { querySearch } : undefined
        }
      }
    },

    /** 更新使用者資料 */
    updateUser(userId: string, body: UpdateUserRequest) {
      return {
        path: `/User/UpdateUser/${userId}`,
        options: {
          method: HttpMethod.PUT,
          body
        }
      }
    },

    /** 上傳使用者大頭貼 (multipart/form-data)，回傳新的相對路徑 */
    uploadAvatar(userId: string, file: File) {
      const formData = new FormData()
      formData.append('file', file)
      return {
        path: `/User/UploadAvatar/${userId}`,
        options: {
          method: HttpMethod.POST,
          body: formData
        }
      }
    }
  }
}
