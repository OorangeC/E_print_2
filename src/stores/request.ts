import type { IOrder, OrderStatus } from '@/types/Order'
import type { IWorkOrder, WorkOrderStatus } from '@/types/WorkOrder'
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
export const FindOrdersBySales = (salesName: string): Promise<IOrder[]> => {
  return service.get('/orders/findBySales', {
    params: { sales: salesName }, // 后端接收 string 的参数名
  })
}

export const FindOrdersByAudit = (auditName: string): Promise<IOrder[]> => {
  return service.get('/orders/findByAudit', {
    params: { audit: auditName }, // 后端接收 string 的参数名
  })
}

// 1. 根据 ID 查询单个订单
export const FindOrderByID = (orderId: string): Promise<IOrder> => {
  return service.get('/orders/findById', {
    params: { order_id: orderId },
  })
}

// 2. 根据状态查询订单列表 (如查询所有"待审核"的单子)
export const FindOrdersWithStatus = (status: OrderStatus): Promise<IOrder[]> => {
  return service.get('/orders/status', {  // 修复：改为 /orders/status
    params: { orderstatus: status },
  })
}

// 3. 修改订单状态 (审核通过、驳回)
export const ChangeOrderStatusTo = (orderunique: string, status: OrderStatus) => {
  return service.post('/orders/updateStatus', {
    order_unique: orderunique,
    orderstatus: status,
  })
}

//以下是工程单
export const FindWorkOrdersByClerk = (clerkName: string): Promise<IWorkOrder[]> => {
  return service.get('/workOrders/findByClerk', {
    params: { work_clerk: clerkName }, // 后端接收 string 的参数名
  })
}
export const FindWorkOrdersByAudit = (auditName: string): Promise<IWorkOrder[]> => {
  return service.get('/workOrders/findByAudit', {
    params: { work_audit: auditName }, // 后端接收 string 的参数名
  })
}

export const FindWorkOrderByID = (workunique: string): Promise<IWorkOrder> => {
  return service.get('/workOrders/findById', {
    params: { work_unique: workunique },
  })
}

// 5. 查询所有待处理的工单
export const FindWorkOrdersWithStatus = (status: WorkOrderStatus): Promise<IWorkOrder[]> => {
  return service.get('/workOrders/findWithStatus', {
    params: { workorderstatus: status },
  })
}

// 6. 修改工单状态
export const ChangeWorkOrderStatusTo = (workunique: string, status: WorkOrderStatus) => {
  return service.post('/workOrders/updateStatus', {
    work_unique: workunique,
    workorderstatus: status,
  })
}

// 7. 更新工序进度
export const UpdateProcess = (workId: string, process: number, note: string) => {
  return service.post('/workOrders/updateProcess', {
    work_id: workId,
    process: process, // 对应 int
    dangQianJinDu: note, // 对应 string
  })
}

export default service
