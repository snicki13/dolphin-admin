import type { BaseResponse } from '@/types'

import Request from '../axios'
import type { LoginModel, SignupModel, UserTokenResponse } from './types'

export class AuthAPI {
  private static AUTH_API_PREFIX = `${GlobalEnvConfig.BASE_API_PREFIX}/auth`

  /**
   * Log in
   */
  static login(data: LoginModel) {
    return Request.post<BaseResponse<UserTokenResponse>>(
      `${this.AUTH_API_PREFIX}/login`,
      { ...data }
    )
  }

  /**
   * register
   */
  static signup(data: SignupModel) {
    return Request.post<BaseResponse<UserTokenResponse>>(
      `${this.AUTH_API_PREFIX}/signup`,
      { ...data }
    )
  }

  /**
   * GitHub Log in
   */
  static loginWithGitHub(code: string) {
    return Request.post<BaseResponse<UserTokenResponse>>(
      `${this.AUTH_API_PREFIX}/login/github`,
      { code }
    )
  }

  /**
   * Google Log in
   */
  static loginWithGoogle(code: string) {
    return Request.post<BaseResponse<UserTokenResponse>>(
      `${this.AUTH_API_PREFIX}/login/google`,
      { code }
    )
  }
}
