import 'ofetch'

declare module 'ofetch' {
  interface FetchOptions<R extends ResponseType = ResponseType, T = any> {
    authMode?: 'protected' | 'public' | 'refresh'
    authRequestToken?: string
    authRetryAttempted?: boolean
  }
}
