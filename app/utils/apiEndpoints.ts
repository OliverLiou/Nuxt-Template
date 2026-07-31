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
  UserName: string | null
  Password: string | null
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

/** 角色資料回應物件 */
export interface RoleResponse {
  Id: string | null
  RoleDesc: string | null
}

/** 使用者個人資料 DTO */
export interface UserInfoDto {
  Id?: string | null
  EmployeeName?: string | null
  PhoneNumber?: string | null
  Email?: string | null
  AvatarUrl?: string | null
  CreatedAt?: string | null
  RoleDescs?: string[] | null
}

/** 使用者列表單筆資料 DTO */
export interface UserListItemDto {
  Id?: string | null
  UserName: string | null
  EmployeeName?: string | null
  Email?: string | null
  AvatarUrl?: string | null
  PhoneNumber?: string | null
  IsActive?: boolean
  CreatedAt?: string | null
  LastLoginAt?: string | null
  Roles?: RoleResponse[] | null
}

/** 更新目前登入使用者個人資料的請求 DTO */
export interface UpdateMyProfileRequest {
  EmployeeName: string
  PhoneNumber?: string | null
}

/** 管理員更新使用者資料的請求 DTO */
export interface AdminUpdateUserRequest {
  EmployeeName: string
  Email: string | null
  PhoneNumber: string | null
  IsActive: boolean
  Roles: string[]
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

/** 使用者分頁查詢結果包裝物件 */
export interface UserListItemDtoPagedResult {
  Items?: UserListItemDto[] | null
  TotalCount?: number
}

// ============================================================================
// 3. API Endpoint Catalog
// ============================================================================

export const apiEndpoints = {
  /** 認證相關端點 */
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
    /** 取得使用者個人資料，包含姓名、Email、角色等資訊 */
    getUserProfile() {
      return {
        path: '/User/UserProfile',
        options: {
          method: HttpMethod.GET
        }
      }
    },
    
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

    /** 更新目前登入使用者的個人資料 */
    updateMyProfile(body: UpdateMyProfileRequest) {
      return {
        path: '/User/UpdateMyProfile',
        options: {
          method: HttpMethod.PUT,
          body
        }
      }
    },

    /** 管理員更新指定使用者的資料與角色權限 */
    updateUserByAdmin(userId: string, body: AdminUpdateUserRequest) {
      return {
        path: `/User/UpdateUserByAdmin/${userId}`,
        options: {
          method: HttpMethod.PUT,
          body
        }
      }
    },

    /** 上傳使用者大頭貼 (multipart/form-data)，後端轉檔為 WebP 並儲存 */
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
    },

    /** 取得所有角色資料 */
    getRoles() {
      return {
        path: `/User/GetRoles`,
        options: {
          method: HttpMethod.GET
        }
      }
    }
  }
}
