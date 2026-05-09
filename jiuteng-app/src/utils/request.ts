// API 基础配置
const BASE_URL = 'https://api.wjecen.vip'

// 请求拦截器
interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  showLoading?: boolean
}

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 获取存储的 token
const getToken = (): string => {
  return uni.getStorageSync('token') || ''
}

// 请求封装
export const request = <T = any>(options: RequestOptions): Promise<ApiResponse<T>> => {
  const { url, method = 'GET', data, header = {}, showLoading = true } = options
  
  if (showLoading) {
    uni.showLoading({ title: '加载中...' })
  }
  
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
        ...header
      },
      success: (res: any) => {
        if (showLoading) {
          uni.hideLoading()
        }
        
        if (res.statusCode === 200) {
          if (res.data.code === 0 || res.data.code === 200) {
            resolve(res.data)
          } else if (res.data.code === 401) {
            // token 过期，跳转登录
            uni.removeStorageSync('token')
            uni.reLaunch({ url: '/pages/login/index' })
            reject(new Error('登录已过期'))
          } else {
            uni.showToast({ title: res.data.message || '请求失败', icon: 'none' })
            reject(new Error(res.data.message))
          }
        } else {
          uni.showToast({ title: '网络错误', icon: 'none' })
          reject(new Error('网络错误'))
        }
      },
      fail: (err) => {
        if (showLoading) {
          uni.hideLoading()
        }
        uni.showToast({ title: '网络连接失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

// GET 请求
export const get = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) => {
  return request<T>({ url, method: 'GET', data, ...options })
}

// POST 请求
export const post = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) => {
  return request<T>({ url, method: 'POST', data, ...options })
}

// PUT 请求
export const put = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) => {
  return request<T>({ url, method: 'PUT', data, ...options })
}

// DELETE 请求
export const del = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) => {
  return request<T>({ url, method: 'DELETE', data, ...options })
}