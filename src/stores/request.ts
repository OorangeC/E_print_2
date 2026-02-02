import type { IOrder } from '@/types/Order'
import type { IWorkOrder } from '@/types/WorkOrder'
import axios from 'axios'

// 1. 创建实例
const service = axios.create({
  baseURL: 'http://localhost:3000/api', // 这里换成你后端的真实地址
  timeout: 10000, // 10秒超时
})

// 2. 请求拦截器 (发包裹前检查一下)
service.interceptors.request.use(
  (config) => {
    // 比如：如果本地有 Token，就带上
    // config.headers['Authorization'] = 'Bearer ' + token
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

/**
 * 通过业务员姓名获取订单列表
 * @param salesName 业务员名字
 */
export const findOrdersBySales = (salesName: string): Promise<IOrder[]> => {
  return service.get('/orders/findBySales', {
    params: { sales: salesName }, // 后端接收 string 的参数名
  })
}

export const findOrdersByAudit = (auditName: string): Promise<IOrder[]> => {
  return service.get('/orders/findByAudit', {
    params: { audit: auditName }, // 后端接收 string 的参数名
  })
}
export const findWorkOrdersByClerk = (clerkName: string): Promise<IWorkOrder[]> => {
  return service.get('/workOrders/findByClerk', {
    params: { sales: clerkName }, // 后端接收 string 的参数名
  })
}
export const findWorkOrdersByAudit = (auditName: string): Promise<IWorkOrder[]> => {
  return service.get('/workOrders/findByAudit', {
    params: { audit: auditName }, // 后端接收 string 的参数名
  })
}

export default service
