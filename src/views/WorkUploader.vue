<template>
  <div class="uploader-wrapper">
    <div v-if="!showCreator" class="list-container">
      <div class="header-bar">
        <div class="title-group">
          <h2 class="main-title">工程指令中心</h2>
          <div class="search-container">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="通过工单号/客户名检索..."
              class="styled-input"
            />
          </div>
        </div>
        <button class="primary-btn" @click="showCreator = true">
          <span class="plus-icon">+</span> 创建工单
        </button>
      </div>

      <div class="table-card">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="150" @click="handleSort('orderStatus')" class="sortable">
                状态码 {{ getSortIcon('orderStatus') }}
              </th>
              <th width="180" @click="handleSort('zhiDanShiJian')" class="sortable">
                制单时间 {{ getSortIcon('zhiDanShiJian') }}
              </th>
              <th width="150" @click="handleSort('work_id')" class="sortable">
                工单号 {{ getSortIcon('work_id') }}
              </th>
              <th width="150" @click="handleSort('gongDanLeiXing')" class="sortable">
                工单类型 {{ getSortIcon('gongDanLeiXing') }}
              </th>
              <th @click="handleSort('customer')" class="sortable">
                客户 {{ getSortIcon('customer') }}
              </th>
              <th width="100" style="text-align: center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="work in processedOrders" :key="work.work_id + work.work_ver">
              <td>
                <span :class="['status-badge', work.orderStatus]">
                  {{ work.orderStatus }}
                </span>
              </td>
              <td class="time-text">{{ work.zhiDanShiJian }}</td>
              <td class="bold-text">
                {{ work.work_id }} <small class="ver-text">v{{ work.work_ver }}</small>
              </td>
              <td>{{ work.gongDanLeiXing || '-' }}</td>
              <td class="customer-name">{{ work.customer }}</td>
              <td class="action-cell">
                <button class="text-btn" @click="handleAction(work)">管理</button>
              </td>
            </tr>
            <tr v-if="processedOrders.length === 0">
              <td colspan="6" class="empty-state">没有找到相关的工程记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <WorkOrderCreator v-else @close="showCreator = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { type IWorkOrder } from '@/types/WorkOrder'
// 核心：导入你的创建器组件
import WorkOrderCreator from './WorkOrderCreator.vue'

const showCreator = ref(false)
const searchQuery = ref<string>('')

onMounted(async () => {
  console.log('订单上传页面初始化...')

  try {
    // 向后端请求该页面专属的数据
    // const res = await request.get('/orders/list')
    // orders.value = res.data
  } catch (err) {
    console.error('获取列表失败', err)
  }
})
type SortKey = keyof IWorkOrder
const sortConfig = ref<{ key: SortKey; order: 'asc' | 'desc' }>({
  key: 'zhiDanShiJian',
  order: 'desc',
})
const workOrders = ref<IWorkOrder[]>([])

// 搜索过滤与排序逻辑
const processedOrders = computed(() => {
  const q = searchQuery.value.toLowerCase()
  const filtered = workOrders.value.filter(
    (w) => w.work_id.toLowerCase().includes(q) || (w.customer?.toLowerCase().includes(q) ?? false),
  )

  const { key, order } = sortConfig.value
  return [...filtered].sort((a, b) => {
    const valA = (a[key] instanceof Date ? (a[key] as Date).getTime() : a[key]) ?? ''
    const valB = (b[key] instanceof Date ? (b[key] as Date).getTime() : b[key]) ?? ''
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

const handleAction = (work: IWorkOrder): void => console.log('Action:', work.work_id)
</script>

<style scoped>
/* 保持你原本的 CSS 样式 */
.uploader-wrapper {
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: sans-serif;
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
  margin: 0;
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
  color: #334155;
}
.time-text {
  font-family: 'Courier New', Courier, monospace;
  color: #64748b;
}
.bold-text {
  font-weight: 700;
  color: #1e293b;
}
.ver-text {
  color: #94a3b8;
  font-weight: 400;
  font-size: 12px;
}
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
}
.IN_PRODUCTION {
  background: #fef9c3;
  color: #854d0e;
}
.PENDING_REVIEW {
  background: #dbeafe;
  color: #1e40af;
}
.APPROVED {
  background: #dcfce7;
  color: #15803d;
}
.DRAFT {
  background: #f1f5f9;
  color: #475569;
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
