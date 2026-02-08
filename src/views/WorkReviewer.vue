<template>
  <div class="uploader-wrapper">
    <div v-if="!selectedOrder" class="tab-header">
      <div
        :class="['tab-item', currentTab === 'PENDING' ? 'active' : '']"
        @click="currentTab = 'PENDING'"
      >
        进行中工单
        <span class="badge" v-if="pendingWorkSource.length">{{ pendingWorkSource.length }}</span>
      </div>

      <div
        :class="['tab-item', currentTab === 'REVIEWED' ? 'active' : '']"
        @click="currentTab = 'REVIEWED'"
      >
        已结束工单
      </div>
    </div>

    <div v-if="!selectedOrder" class="list-container">
      <div class="header-bar">
        <div class="title-group">
          <h2 class="main-title">{{ currentTab === 'PENDING' ? '工单待审池' : '工程审核历史' }}</h2>

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
      </div>

      <div class="table-card">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="120" @click="handleSort('workorderstatus')" class="sortable">
                状态 {{ getSortIcon('workorderstatus') }}
              </th>

              <th width="150" @click="handleSort('zhiDanShiJian')" class="sortable">
                制单时间 {{ getSortIcon('zhiDanShiJian') }}
              </th>

              <th width="150" @click="handleSort('work_id')" class="sortable">
                工单号 {{ getSortIcon('work_id') }}
              </th>

              <th width="100" @click="handleSort('work_clerk')" class="sortable">
                制单员 {{ getSortIcon('work_clerk') }}
              </th>

              <th @click="handleSort('customer')" class="sortable">
                客户 {{ getSortIcon('customer') }}
              </th>

              <th width="100" style="text-align: center">操作</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="work in processedWorks" :key="work.work_unique">
              <td>
                <span :class="['status-badge', work.workorderstatus]">
                  {{ work.workorderstatus }}
                </span>
              </td>

              <td class="time-text">{{ work.zhiDanShiJian }}</td>

              <td class="bold-text">
                {{ work.work_id }} <small class="ver-text">v{{ work.work_ver }}</small>
              </td>

              <td>{{ work.work_clerk || '-' }}</td>

              <td class="customer-name">{{ work.customer }}</td>

              <td class="action-cell">
                <button
                  :class="currentTab === 'PENDING' ? 'review-btn' : 'view-btn'"
                  @click="handleView(work)"
                >
                  {{ work.workorderstatus === WorkOrderStatus.PENDING_REVIEW ? '审核' : '查看' }}
                  <!-- {{ currentTab === 'PENDING' ? '审核' : '查看' }} -->
                </button>
              </td>
            </tr>

            <tr v-if="processedWorks.length === 0">
              <td :colspan="currentTab === 'REVIEWED' ? 6 : 5" class="empty-state">
                暂无待处理的工程指令单
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <WorkOrderInfo
      v-else
      :mode="activeMode"
      :initialData="selectedOrder"
      @close="selectedOrder = null"
      @approve="handleApprove"
      @reject="handleReject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { type IWorkOrder, WorkOrderStatus } from '@/types/WorkOrder'
import WorkOrderInfo, { PageMode } from './WorkOrderInfo.vue'
import { FindWorkOrdersWithStatus, ChangeWorkOrderStatusTo } from '@/stores/request'

// --- 状态定义 ---
const currentTab = ref<'PENDING' | 'REVIEWED'>('PENDING')
const searchQuery = ref<string>('')
const selectedOrder = ref<IWorkOrder | null>(null)
const isUploading = ref(false)
// 排序配置
type SortKey = keyof IWorkOrder
const sortConfig = ref<{ key: SortKey; order: 'asc' | 'desc' }>({
  key: 'zhiDanShiJian',
  order: 'desc',
})
const activeMode = ref<PageMode>(PageMode.VIEW)
// 数据源
const pendingWorkSource = ref<IWorkOrder[]>([])
const reviewedWorkSource = ref<IWorkOrder[]>([])

onMounted(async () => {
  await fetchWorksData()
})
// export enum WorkOrderStatus {
//   DRAFT = '草稿',
//   PENDING_REVIEW = '待审核',
//   APPROVED = '通过',
//   REJECTED = '驳回',
//   IN_PRODUCTION = '生产中',
//   COMPLETED = '完成',
//   CANCELLED = '取消',
// }
const fetchWorksData = async () => {
  try {
    // 1. 获取全厂待审核工单
    const [pendingData, approveData, productionData] = await Promise.all([
      FindWorkOrdersWithStatus(WorkOrderStatus.PENDING_REVIEW),
      FindWorkOrdersWithStatus(WorkOrderStatus.APPROVED),
      FindWorkOrdersWithStatus(WorkOrderStatus.IN_PRODUCTION),
    ])

    // 2. 将结果合并后赋值给待办池
    // 这样你的 pendingWorkSource 就会包含这两种状态的所有工单
    pendingWorkSource.value = [...pendingData, ...approveData, ...productionData]

    // 2. 获取已经结束
    const [completeData, cancelData] = await Promise.all([
      FindWorkOrdersWithStatus(WorkOrderStatus.COMPLETED),
      FindWorkOrdersWithStatus(WorkOrderStatus.CANCELLED),
    ])

    //const reviewedData = await FindWorkOrdersByAudit('admin')
    reviewedWorkSource.value = [...completeData, ...cancelData]
  } catch (err) {
    console.error('工单数据获取失败:', err)
  }
}

// --- 搜索与排序逻辑 ---
const processedWorks = computed<IWorkOrder[]>(() => {
  const source = currentTab.value === 'PENDING' ? pendingWorkSource.value : reviewedWorkSource.value

  const q = searchQuery.value.trim().toLowerCase()
  const filtered = source.filter((w) => {
    return w.work_id.toLowerCase().includes(q) || (w.customer?.toLowerCase().includes(q) ?? false)
  })

  const { key, order: direction } = sortConfig.value
  return [...filtered].sort((a, b) => {
    const valA = a[key] ?? ''
    const valB = b[key] ?? ''
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

const handleView = (work: IWorkOrder) => {
  selectedOrder.value = work

  let targetMode: PageMode

  if (work.workorderstatus === WorkOrderStatus.PENDING_REVIEW) {
    targetMode = PageMode.REVIEW
  } else if (work.workorderstatus === WorkOrderStatus.IN_PRODUCTION) {
    targetMode = PageMode.PRODUCTION
  } else {
    targetMode = PageMode.VIEW
  }

  // if (currentTab.value !== 'PENDING') {
  //   targetMode = PageMode.VIEW
  // } else if (work.workorderstatus === WorkOrderStatus.APPROVED) {
  //   targetMode = PageMode.PRODUCTION
  // } else {
  //   // 这里 currentTab 已经是 'PENDING' 了
  //   targetMode = PageMode.REVIEW
  // }

  // 2. 将计算结果赋给 ref
  activeMode.value = targetMode

  //activeMode.value = currentTab.value === 'PENDING' ? PageMode.REVIEW : PageMode.VIEW
  //showCreator.value = true
}

// /**
//  * 处理审核提交（通过/驳回）
//  */
// const handleAuditAction = async () => {
//   try {
//     // 这里调用审核接口，例如 /workOrders/audit
//     // await request.post('/workOrders/audit', fd)
//     alert('操作成功')
//     selectedOrder.value = null
//     await fetchWorksData() // 刷新列表
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   } catch (err) {
//     alert('提交审核结果失败')
//   }
// }
// const handleOrderUpload = async (fd: FormData) => {
//   if (isUploading.value) return
//   isUploading.value = true
//   try {
//     await request.post('/workOrders/create', fd)
//     alert('订单已成功提交审核！')
//     showCreator.value = false
//     fetchOrdersData() // 这里可以刷新列表
//   } catch (err) {
//     console.error('后端响应错误:', err)
//     alert('发送失败，请检查网络或后端服务')
//   } finally {
//     isUploading.value = false
//   }
// }
const handleApprove = async (wd: IWorkOrder) => {
  if (isUploading.value) return
  isUploading.value = true
  try {
    await ChangeWorkOrderStatusTo(wd.work_unique, WorkOrderStatus.IN_PRODUCTION)
    selectedOrder.value = null // 关闭详情弹窗
    await fetchWorksData()
  } catch (err) {
    console.error('后端响应错误:', err)
    alert('发送失败，请检查网络或后端服务')
  } finally {
    isUploading.value = false
  }
}
const handleReject = async (wd: IWorkOrder) => {
  if (isUploading.value) return
  isUploading.value = true
  try {
    await ChangeWorkOrderStatusTo(wd.work_unique, WorkOrderStatus.REJECTED)
    selectedOrder.value = null // 关闭详情弹窗
    await fetchWorksData()
  } catch (err) {
    console.error('后端响应错误:', err)
    alert('发送失败，请检查网络或后端服务')
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped>
/* 继承 OrderReviewer 的优雅风格 */
.uploader-wrapper {
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: sans-serif;
}
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
  margin: 0;
}

.styled-input {
  padding: 8px 12px 8px 32px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 280px;
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
}
.modern-table td {
  padding: 14px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  color: #334155;
}

.sortable {
  cursor: pointer;
  user-select: none;
}
.sortable:hover {
  background-color: #f1f5f9;
}

.time-text {
  font-family: 'JetBrains Mono', monospace;
  color: #64748b;
  font-weight: 600;
}
.bold-text {
  font-weight: 700;
  color: #0f172a;
}
.ver-text {
  color: #94a3b8;
  font-size: 12px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
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

.review-btn {
  background: #0f172a;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
}
.view-btn {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
}
.empty-state {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}
</style>
