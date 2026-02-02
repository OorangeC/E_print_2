<template>
  <div class="uploader-wrapper">
    <div v-if="!selectedOrder" class="tab-header">
      <div
        :class="['tab-item', currentTab === 'PENDING' ? 'active' : '']"
        @click="currentTab = 'PENDING'"
      >
        未审核订单

        <span class="badge" v-if="pendingOrders.length">{{ pendingOrders.length }}</span>
      </div>

      <div
        :class="['tab-item', currentTab === 'REVIEWED' ? 'active' : '']"
        @click="currentTab = 'REVIEWED'"
      >
        已审核订单
      </div>
    </div>

    <div v-if="!selectedOrder" class="list-container">
      <div class="header-bar">
        <div class="title-group">
          <h2 class="main-title">{{ currentTab === 'PENDING' ? '待处理任务' : '审核记录' }}</h2>

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
      </div>

      <div class="table-card">
        <table class="modern-table">
          <thead>
            <tr>
              <th
                v-if="currentTab === 'REVIEWED'"
                width="120"
                @click="handleSort('orderstatus')"
                class="sortable"
              >
                状态 {{ getSortIcon('orderstatus') }}
              </th>

              <th width="180" @click="handleSort('submitTime')" class="sortable">
                提交时间 {{ getSortIcon('submitTime') }}
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
            <tr v-for="order in processedOrders" :key="order.order_id || Math.random().toString()">
              <td v-if="currentTab === 'REVIEWED'">
                <span :class="['status-badge', order.orderstatus]">
                  {{ order.orderstatus === OrderStatus.APPROVED ? '已通过' : '已驳回' }}
                </span>
              </td>

              <td class="time-text">{{ getFirstAuditTime(order) }}</td>

              <td class="bold-text">{{ order.order_id || '未分配' }}</td>

              <td class="customer-name">{{ order.customer }}</td>

              <td>{{ order.chuHuoRiqiRequired }}</td>

              <td class="action-cell">
                <button class="view-btn" @click="handleView(order)">审核/查看</button>
              </td>
            </tr>

            <tr v-if="processedOrders.length === 0">
              <td :colspan="currentTab === 'REVIEWED' ? 6 : 5" class="empty-state">
                没有找到相关的记录
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="detail-container">
      <div class="header-bar">
        <button class="back-link" @click="selectedOrder = null">← 返回列表</button>

        <h2 class="main-title">订单详情：{{ selectedOrder.order_id }}</h2>
      </div>

      <div class="table-card" style="padding: 24px">
        <p>这里是订单 [{{ selectedOrder.order_id }}] 的详细审核界面...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

import { type IOrder, OrderStatus } from '@/types/Order'
import { FindOrdersByAudit } from '@/stores/request'

// --- 状态定义 ---

const currentTab = ref<'PENDING' | 'REVIEWED'>('PENDING')

const searchQuery = ref<string>('')

const selectedOrder = ref<IOrder | null>(null)

type SortKey = 'submitTime' | 'order_id' | 'customer' | 'chuHuoRiqiRequired' | 'orderstatus'

const sortConfig = ref<{ key: SortKey; order: 'asc' | 'desc' }>({
  key: 'submitTime',

  order: 'desc',
})

const orders = ref<IOrder[]>([]) // 数据源
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
    // 文档接口：根据审核员姓名获取订单数组
    const data = await FindOrdersByAudit('admin')

    // 将拿到的数组赋值给响应式变量 orders
    // processedOrders 会根据这个数据的变化自动重新计算过滤和排序
    orders.value = data

    console.log('订单加载成功:', data.length, '条记录')
  } catch (err) {
    console.error('获取列表失败:', err)
    // 实际项目中这里可以加个通知提示
  }
}
// 分离未审核订单用于角标显示
// --- 核心逻辑 ---

const getFirstAuditTime = (order: IOrder): string => {
  const logs = order.auditLogs

  if (logs && logs.length > 0) {
    const firstLog = logs[0]

    if (firstLog) return firstLog.time
  }

  return '-'
}

const pendingOrders = computed(() =>
  orders.value.filter((o) => o.orderstatus === OrderStatus.PENDING_REVIEW),
)

const processedOrders = computed<IOrder[]>(() => {
  // 1. 按 Tab 过滤

  let result = orders.value.filter((o) => {
    if (currentTab.value === 'PENDING') {
      return o.orderstatus === OrderStatus.PENDING_REVIEW
    } else {
      return o.orderstatus === OrderStatus.APPROVED || o.orderstatus === OrderStatus.REJECTED
    }
  })

  // 2. 按 搜索词 过滤

  const q = searchQuery.value.toLowerCase()

  if (q) {
    result = result.filter(
      (o) =>
        (o.order_id?.toLowerCase().includes(q) ?? false) || o.customer.toLowerCase().includes(q),
    )
  }

  // 3. 排序

  const { key, order: direction } = sortConfig.value

  return result.slice().sort((a, b) => {
    let valA: string | number | Date = ''

    let valB: string | number | Date = ''

    if (key === 'submitTime') {
      valA = getFirstAuditTime(a)

      valB = getFirstAuditTime(b)
    } else {
      const k = key as keyof IOrder

      const rawA = a[k]

      const rawB = b[k]

      if (rawA instanceof Date || typeof rawA === 'string' || typeof rawA === 'number') valA = rawA

      if (rawB instanceof Date || typeof rawB === 'string' || typeof rawB === 'number') valB = rawB
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1

    if (valA > valB) return direction === 'asc' ? 1 : -1

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

const handleView = (order: IOrder) => {
  selectedOrder.value = order
}
</script>

<style scoped>
.uploader-wrapper {
  padding: 24px;

  background-color: #f8fafc;

  min-height: 100vh;

  font-family: sans-serif;
}

/* Tab 样式 */

.tab-header {
  display: flex;

  gap: 32px;

  margin-bottom: 24px;

  border-bottom: 1px solid #e2e8f0;
}

.tab-item {
  padding: 12px 4px;

  font-size: 16px;

  color: #64748b;

  cursor: pointer;

  position: relative;

  font-weight: 500;
}

.tab-item.active {
  color: #2563eb;

  font-weight: 700;
}

.tab-item.active::after {
  content: '';

  position: absolute;

  bottom: -1px;

  left: 0;

  width: 100%;

  height: 2px;

  background-color: #2563eb;
}

.badge {
  background: #ef4444;

  color: white;

  font-size: 11px;

  padding: 2px 6px;

  border-radius: 10px;

  margin-left: 4px;

  vertical-align: middle;
}

.header-bar {
  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 20px;
}

.title-group {
  display: flex;

  align-items: center;

  gap: 20px;
}

.main-title {
  font-size: 20px;

  color: #1e293b;
}

.styled-input {
  padding: 8px 12px 8px 32px;

  border: 1px solid #e2e8f0;

  border-radius: 6px;

  width: 280px;

  outline: none;
}

.search-container {
  position: relative;
}

.search-icon {
  position: absolute;

  left: 10px;

  top: 50%;

  transform: translateY(-50%);

  color: #94a3b8;
}

.table-card {
  background: white;

  border: 1px solid #e2e8f0;

  border-radius: 8px;

  overflow: hidden;

  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.modern-table {
  width: 100%;

  border-collapse: collapse;
}

.modern-table th {
  background-color: #f8fafc;

  padding: 14px;

  text-align: left;

  font-size: 13px;

  color: #64748b;

  cursor: pointer;
}

.modern-table td {
  padding: 14px;

  border-bottom: 1px solid #f1f5f9;

  font-size: 14px;

  color: #334155;
}

.time-text {
  font-family: 'Courier New', monospace;

  color: #64748b;

  font-weight: 600;
}

.bold-text {
  font-weight: 700;

  color: #0f172a;
}

/* 状态标签 */

.status-badge {
  padding: 4px 8px;

  border-radius: 4px;

  font-size: 12px;

  font-weight: 600;
}

.APPROVED {
  background: #dcfce7;

  color: #15803d;
}

.REJECTED {
  background: #fee2e2;

  color: #b91c1c;
}

.view-btn {
  background: #2563eb;

  color: white;

  border: none;

  padding: 6px 14px;

  border-radius: 4px;

  cursor: pointer;
}

.back-link {
  background: none;

  border: none;

  color: #2563eb;

  cursor: pointer;

  font-weight: 600;

  margin-bottom: 16px;
}

.empty-state {
  text-align: center;

  padding: 40px;

  color: #94a3b8;
}
</style>
