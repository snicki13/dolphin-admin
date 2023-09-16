import type { BaseResponse } from '@/types'

import Request from '../axios'
import type { UploadOptions, UploadResponse } from './types'

export class UploadAPI {
  private static UPLOAD_API_PREFIX = `${GlobalEnvConfig.BASE_API_PREFIX}/upload`

  private static headers = { 'Content-Type': 'multipart/form-data' }

  /**
   * upload files
   * @param data File data
   * @param options Upload configuration
   *
   * @todo progress bar function has not been realized yet
   */
  static uploadFile(data: any, options?: UploadOptions) {
    return Request.post<BaseResponse<UploadResponse>>(
      this.UPLOAD_API_PREFIX,
      data,
      {
        headers: this.headers,
        onUploadProgress: options?.onUploadProgress
          ? options.onUploadProgress
          : () => {}
      }
    )
  }

  /**
   * Batch upload file
   * @param data file data
   * @param Options upload configuration
   *
   * @todo progress bar function has not been realized yet
   */
  static uploadFiles(data: any) {
    return Request.post(`${this.UPLOAD_API_PREFIX}/batch`, data, {
      headers: this.headers
    })
  }
}
