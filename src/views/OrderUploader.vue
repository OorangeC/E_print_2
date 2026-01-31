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
        <button class="primary-btn" @click="showCreator = true">
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
              <td class="time-text">{{ formatDateTime(order.daYinRiqi) }}</td>
              <td class="bold-text">{{ order.order_id || '未分配' }}</td>
              <td class="customer-name">{{ order.customer }}</td>
              <td>{{ formatDate(order.chuHuoRiqiRequired) }}</td>
              <td class="action-cell">
                <button class="text-btn" @click="handleAction(order)">管理</button>
              </td>
            </tr>
            <tr v-if="processedOrders.length === 0">
              <td colspan="6" class="empty-state">没有找到相关的订单记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <OrderCreator v-else @close="showCreator = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { OrderStatus, type IOrder } from '@/types/Order' // 严格引用接口
import OrderCreator from './OrderCreator.vue' // 必须引入该组件以供切换

// 状态控制
const showCreator = ref(false)
const searchQuery = ref<string>('')

// 排序配置：默认按提交时间 (daYinRiqi) 倒序
type SortKey = 'orderstatus' | 'daYinRiqi' | 'order_id' | 'customer' | 'chuHuoRiqiRequired'
interface SortConfig {
  key: SortKey
  order: 'asc' | 'desc'
}
const sortConfig = ref<SortConfig>({ key: 'daYinRiqi', order: 'desc' })

// 状态映射
const statusLabelMap: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: '草稿',
  [OrderStatus.PENDING_REVIEW]: '待审核',
  [OrderStatus.APPROVED]: '已通过',
  [OrderStatus.REJECTED]: '已驳回',
  [OrderStatus.IN_PRODUCTION]: '生产中',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消',
}

// 模拟数据：加入 daYinRiqi (提交时间)
const orders = ref<IOrder[]>([
  {
    order_id: '25025769',
    customer: '当纳利亚洲印务有限公司',
    orderstatus: OrderStatus.PENDING_REVIEW,
    daYinRiqi: new Date('2025-10-30 08:02:12'),
    chuHuoRiqiRequired: new Date('2025-11-24'),
  },
  {
    order_id: '25025770',
    customer: '模拟客户A',
    orderstatus: OrderStatus.APPROVED,
    daYinRiqi: new Date('2025-10-31 10:20:00'),
    chuHuoRiqiRequired: new Date('2025-12-01'),
  },
  {
    order_id: '25025771',
    customer: '模拟客户B',
    orderstatus: OrderStatus.REJECTED,
    daYinRiqi: new Date('2025-10-29 14:15:30'),
    chuHuoRiqiRequired: new Date('2026-01-10'),
  },
])

// 核心处理逻辑：过滤 + 排序
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

// 排序交互
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

// 格式化函数
const formatDate = (date?: Date): string => {
  if (!date) return '-'
  const Y = date.getFullYear()
  const M = String(date.getMonth() + 1).padStart(2, '0')
  const D = String(date.getDate()).padStart(2, '0')
  return `${Y}-${M}-${D}`
}

const formatDateTime = (date?: Date): string => {
  if (!date) return '-'
  const Y = date.getFullYear()
  const M = String(date.getMonth() + 1).padStart(2, '0')
  const D = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${Y}-${M}-${D} ${h}:${m}:${s}`
}

const handleAction = (order: IOrder): void => console.log('管理订单:', order.order_id)
</script>

<style scoped>
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
