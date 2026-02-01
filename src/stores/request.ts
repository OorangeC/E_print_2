import axios from 'axios'

// 1. 创建实例
const service = axios.create({
  baseURL: 'http://localhost:3000/api', // 指向本地后端
  timeout: 10000, // 10秒超时
})

// 2. 请求拦截器 (发包裹前检查一下)
service.interceptors.request.use(
  (config) => {
    console.log('🚀 发送请求:', config.method?.toUpperCase(), config.url, config.data)
    return config
  },
  (error) => Promise.reject(error),
)

// 3. 响应拦截器 (拆包裹前检查一下)
service.interceptors.response.use(
  (response) => {
    // 如果后端返回的状态码是 200，直接给数据
    return response.data
  },
  (error) => {
    // 在这里统一处理错误：比如弹出通知栏提示“服务器冒烟了”
    console.error('网络请求出错:', error)
    return Promise.reject(error)
  },
)

export default service
