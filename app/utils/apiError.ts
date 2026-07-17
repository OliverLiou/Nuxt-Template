interface ApiErrorOptions {
  statusCode: number
  message: string
  data?: unknown
  cause?: unknown
}

export class ApiError extends Error {
  readonly statusCode: number
  readonly data?: unknown
  override readonly cause?: unknown

  constructor(options: ApiErrorOptions) {
    super(options.message)
    this.name = 'ApiError'
    this.statusCode = options.statusCode
    this.data = options.data
    this.cause = options.cause
  }
}

function getResponseMessage(data: unknown) {
  if (!data || typeof data !== 'object') {
    return undefined
  }

  const responseData = data as Record<string, unknown>
  const message = responseData.Message ?? responseData.message

  return typeof message === 'string' && message.trim()
    ? message
    : undefined
}

export function normalizeApiError(
  error: unknown,
  fallbackMessage = '系統發生未知錯誤'
) {
  if (error instanceof ApiError) {
    return error
  }

  const fetchError = error as {
    statusCode?: number
    status?: number
    data?: unknown
    response?: {
      status?: number
      statusText?: string
      _data?: unknown
    }
  }
  const data = fetchError?.data ?? fetchError?.response?._data
  const originalMessage = error instanceof Error ? error.message : undefined

  return new ApiError({
    statusCode:
      fetchError?.statusCode
      ?? fetchError?.status
      ?? fetchError?.response?.status
      ?? 0,
    message:
      getResponseMessage(data)
      ?? originalMessage
      ?? fetchError?.response?.statusText
      ?? fallbackMessage,
    data,
    cause: error
  })
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  return normalizeApiError(error, fallbackMessage).message
}
