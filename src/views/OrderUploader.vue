<template>
  <div class="uploader-wrapper">
    <div v-if="!showCreator" class="list-container">
      <div class="header-bar">
        <div class="title-group">
          <h2 class="main-title">订单上传中心</h2>

          <div class="search-container">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="通过订单号/客户名检索..."
              class="styled-input"
            />
          </div>
        </div>

        <button class="primary-btn" @click="openForCreate">
          <span class="plus-icon">+</span> 创建订单
        </button>
      </div>

      <div class="table-card">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="120" @click="handleSort('orderstatus')" class="sortable">
                状态 {{ getSortIcon('orderstatus') }}
              </th>
              <th width="200" @click="handleSort('daYinRiqi')" class="sortable">
                提交时间 {{ getSortIcon('daYinRiqi') }}
              </th>
              <th width="150" @click="handleSort('order_id')" class="sortable">
                订单号 {{ getSortIcon('order_id') }}
              </th>
              <th @click="handleSort('customer')" class="sortable">
                客户 {{ getSortIcon('customer') }}
              </th>
              <th width="150" @click="handleSort('chuHuoRiqiRequired')" class="sortable">
                截止日期 {{ getSortIcon('chuHuoRiqiRequired') }}
              </th>
              <th width="100" style="text-align: center">操作</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="order in processedOrders" :key="order.order_id">
              <td>
                <span :class="['status-badge', order.orderstatus]">
                  {{ statusLabelMap[order.orderstatus] }}
                </span>
              </td>
              <td class="time-text">{{ order.daYinRiqi }}</td>
              <td class="bold-text">{{ order.order_id || '未分配' }}</td>
              <td class="customer-name">{{ order.customer }}</td>
              <td>{{ order.chuHuoRiqiRequired }}</td>
              <td class="action-cell">
                <button class="text-btn" @click="openForView(order)">管理</button>
              </td>
            </tr>

            <tr v-if="processedOrders.length === 0">
              <td colspan="6" class="empty-state">没有找到相关的订单记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <OrderInfo v-else :mode="activeMode" :initialOrder="selectedOrder" @close="handleClose" @submit="handleOrderUpload" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { OrderStatus, type IOrder } from '@/types/Order'
import request, { findAllOrders, FindOrdersBySales } from '@/stores/request'
import OrderInfo, { PageMode } from './OrderInfo.vue'

// --- 状态控制 ---
const showCreator = ref(false)
const activeMode = ref<PageMode>(PageMode.EDIT) // 控制弹窗模式
const searchQuery = ref<string>('')
const isUploading = ref(false)
const orders = ref<IOrder[]>([]) // 数据源
const selectedOrder = ref<IOrder | null>(null) // 当前选中的订单（用于查看/编辑）
//onMounted 会在组件加载完成、渲染到页面上时自动运行。
onMounted(async () => {
  console.log('订单上传页面初始化，正在获取 admin 的订单列表...')
  await fetchOrdersData()
})

/**
 * 获取订单列表的逻辑封装
 */
const fetchOrdersData = async () => {
  try {
    // 按文档定义：根据业务员姓名获取订单列表
    // 当前阶段固定使用 admin，表示“查看与 admin 这个业务员相关的所有订单”
    const data = await FindOrdersBySales('admin')

    // 将拿到的数组赋值给响应式变量 orders
    // processedOrders 会根据这个数据的变化自动重新计算过滤和排序
    orders.value = data

    console.log('订单加载成功:', data.length, '条记录')
  } catch (err) {
    console.error('获取列表失败:', err)
    // 实际项目中这里可以加个通知提示
  }
}

// --- 核心交互逻辑 ---

/**
 * 以编辑模式打开（创建新订单）
 */
const openForCreate = () => {
  selectedOrder.value = null // 清空选中，表示新建
  activeMode.value = PageMode.EDIT
  showCreator.value = true
}

/**
 * 以查看模式打开
 * @param order 选中的订单数据
 */
const openForView = (order: IOrder) => {
  console.log('查看订单详情:', order.order_id)
  selectedOrder.value = order // 传递订单数据
  activeMode.value = PageMode.VIEW
  showCreator.value = true
}

/**
 * 关闭订单详情弹窗
 */
const handleClose = () => {
  showCreator.value = false
  selectedOrder.value = null
  // 刷新列表以获取最新数据
  fetchOrdersData()
}

/**
 * 处理订单提交
 */
const handleOrderUpload = async (fd: FormData) => {
  if (isUploading.value) return
  isUploading.value = true
  try {
    await request.post('/orders/create', fd)
    alert('订单已成功提交审核！')
    showCreator.value = false
    // 提交成功后立刻刷新列表，确保新单可见
    await fetchOrdersData()
  } catch (err) {
    console.error('后端响应错误:', err)
    alert('发送失败，请检查网络或后端服务')
  } finally {
    isUploading.value = false
  }
}

// --- 列表排序与过滤逻辑 ---

type SortKey = 'orderstatus' | 'daYinRiqi' | 'order_id' | 'customer' | 'chuHuoRiqiRequired'
interface SortConfig {
  key: SortKey
  order: 'asc' | 'desc'
}

const sortConfig = ref<SortConfig>({ key: 'daYinRiqi', order: 'desc' })

const statusLabelMap: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: '草稿',
  [OrderStatus.PENDING_REVIEW]: '待审核',
  [OrderStatus.APPROVED]: '已通过',
  [OrderStatus.REJECTED]: '已驳回',
  [OrderStatus.IN_PRODUCTION]: '生产中',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消',
}

const processedOrders = computed<IOrder[]>(() => {
  const q = searchQuery.value.toLowerCase()
  const filtered = orders.value.filter(
    (o: IOrder) => o.order_id?.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q),
  )

  const { key, order } = sortConfig.value
  return filtered.sort((a, b) => {
    const valA = a[key] ?? ''
    const valB = b[key] ?? ''
    if (valA < valB) return order === 'asc' ? -1 : 1
    if (valA > valB) return order === 'asc' ? 1 : -1
    return 0
  })
})

const handleSort = (key: SortKey) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.order = sortConfig.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.order = 'asc'
  }
}

const getSortIcon = (key: SortKey) => {
  if (sortConfig.value.key !== key) return '↕️'
  return sortConfig.value.order === 'asc' ? '🔼' : '🔽'
}
</script>

<style scoped>
/* 样式部分保持不变，已包含在你的原始代码中 */
.uploader-wrapper {
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
}
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.title-group {
  display: flex;
  align-items: center;
  gap: 24px;
}
.main-title {
  font-size: 22px;
  color: #1e293b;
  font-weight: 700;
}
.styled-input {
  padding: 10px 12px 10px 36px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 280px;
}
.primary-btn {
  background-color: #0f172a;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}
.table-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.modern-table {
  width: 100%;
  border-collapse: collapse;
}
.modern-table th {
  background-color: #f1f5f9;
  padding: 14px;
  text-align: left;
  font-size: 13px;
  color: #475569;
}
.sortable {
  cursor: pointer;
  user-select: none;
}
.sortable:hover {
  background-color: #e2e8f0;
}
.modern-table td {
  padding: 14px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}
.time-text {
  font-family: 'Courier New', Courier, monospace;
  color: #64748b;
  font-size: 13px;
}
.bold-text {
  font-weight: 700;
}
.status-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}
.PENDING_REVIEW {
  background: #dbeafe;
  color: #1e40af;
}
.APPROVED {
  background: #dcfce7;
  color: #15803d;
}
.REJECTED {
  background: #fee2e2;
  color: #b91c1c;
}
.text-btn {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-weight: 500;
}
.empty-state {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}
</style>
