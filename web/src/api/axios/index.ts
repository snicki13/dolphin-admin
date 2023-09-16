import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'

import router from '@/router'
import type { PageModel } from '@/types'

import { axiosConfig } from './config'
import { errorMessageMap, ResponseStatusCode } from './statusCode'

const { t } = i18n.global

const themeStore = useThemeStore()

const { message } = createDiscreteApi(['message'], {
  configProviderProps: {
    theme: themeStore.theme,
    locale: themeStore.locale,
    dateLocale: themeStore.dateLocale
  }
})

class Request {
  instance: AxiosInstance

  public constructor(config: AxiosRequestConfig) {
    axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'

    this.instance = axios.create(config)

    this.instance.interceptors.request.use(
      (req: InternalAxiosRequestConfig) => {
        // set up token
        const { url } = req
        if (
          AuthUtils.isAuthenticated() &&
          url?.startsWith(GlobalEnvConfig.BASE_API_PREFIX)
        ) {
          req.headers.Authorization = AuthUtils.getAuthorization()
        }

        // language setting
        req.headers.Language = LangUtils.getDefaultLang()
        return req
      },
      (err: AxiosError) => Promise.reject(err)
    )

    this.instance.interceptors.response.use(
      (res: AxiosResponse) => res.data,
      (err: AxiosError) => {
        const { response } = err
        const { data, status } = response || {}
        if (response) {
          Request.handleCode(status as number)
        }
        // Network error, jump to page 404
        if (!window.navigator.onLine) {
          router.replace('/404')
          message.error(t('Common.NetworkError'))
        }
        return Promise.reject(data)
      }
    )
  }

  /**
   * Processing response status code
   * @param code response status code
   * @description performs accordingly according to the response status code
   * -401 Unauthorized, remove Token and jump to the login page
   * -403 Forbidden access, TODO: Prompt that users have no right to access
   * -404 No found, TODO: Jump to page 404
   * -500 server error, todo: jump to pages 500
   * -Statuscode, prompt error information
   */
  static handleCode(code: number): void {
    const errorMessage = errorMessageMap.get(code) || 'Unknown Error!'
    switch (code) {
      case ResponseStatusCode.UNAUTHORIZED:
        AuthUtils.clearToken()
        message.error(t('Common.401'))
        if (router.currentRoute.value.path !== '/login') {
          if (router.currentRoute.value.path !== '/') {
            router.replace({
              path: '/login',
              query: {
                redirect: router.currentRoute.value.fullPath
              }
            })
          } else {
            router.replace('/login')
          }
        }
        break
      case ResponseStatusCode.FORBIDDEN:
        message.error(errorMessage)
        break
      case ResponseStatusCode.INTERNAL_SERVER_ERROR:
      case ResponseStatusCode.BAD_GATEWAY:
      case ResponseStatusCode.GATEWAY_TIMEOUT:
        message.error(t('Common.500'))
        if (router.currentRoute.value.path !== '/login') {
          router.replace('/error-pages/500')
        }
        break
      case ResponseStatusCode.BAD_REQUEST:
      case ResponseStatusCode.NOT_FOUND:
      case ResponseStatusCode.METHOD_NOT_ALLOWED:
      case ResponseStatusCode.CONFLICT:
      case ResponseStatusCode.TOO_MANY_REQUESTS:
      default:
    }
  }

  /**
   * GM request
   * @param config request configuration
   */
  request(config: AxiosRequestConfig) {
    return this.instance.request(config)
  }

  /**
   * Get request
   * @param url request address
   * @param Params request parameters
   * @param config request configuration
   */
  get<T>(
    url: string,
    params?: Record<string, unknown> | PageModel,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.get(url, { params, ...config })
  }

  /**
   * Post request
   * @param url request address
   * @param data Request Data
   * @param config request configuration
   */
  post<T>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.post(url, data, config)
  }

  /**
   * PUT request
   * @param url Request address
   * @param data Request data
   * @param config Request configuration
   */
  put<T>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.put(url, data, config)
  }

  /**
   * DELETE request
   * @param url Request address
   * @param params Request parameters
   * @param config Request configuration
   */
  delete<T>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.delete(url, { params, ...config })
  }

  /**
   * PATCH request
   * @param url Request address
   * @param data Request data
   * @param config Request configuration
   */
  patch<T>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.patch(url, data, config)
  }
}

export default new Request(axiosConfig)
