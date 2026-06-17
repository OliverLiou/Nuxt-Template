/**
 * 檢查 JWT Token 是否已經過期
 * @param token JWT 字串
 * @returns 是否過期。無 Token、無效 Token 或解析失敗均視為已過期
 */
export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true

    const payloadStr = parts[1]
    if (!payloadStr) return true

    // 解碼 Base64Url
    const payloadBase64 = payloadStr.replace(/-/g, '+').replace(/_/g, '/')
    const payloadDecoded = atob(payloadBase64)
    const payload = JSON.parse(payloadDecoded)

    if (typeof payload.exp !== 'number') {
      return false // 沒有 exp 屬性時，預設視為未過期
    }

    // 取得當前 UNIX 時間（秒）
    const now = Math.floor(Date.now() / 1000)

    // 保留 5 秒緩衝時間，避免請求發送的瞬間剛好過期
    return payload.exp - 5 < now
  } catch (error) {
    console.error('JWT 解析失敗:', error)
    return true
  }
}
