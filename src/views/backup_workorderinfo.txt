<template>
  <div class="creator-wrapper">
    <div class="top-nav">
      <div class="left-panel">
        <!-- <div class="staff-info">
          <span class="label">制单员：</span>
          <input v-model="WorkOrderData.work_clerk" type="text" class="underline-input" />
        </div> -->

        <div class="attachment-manager">
          <div class="manager-header">
            <span class="label">相关附件</span>
            <button class="add-file-btn" @click="addFileRow">+ 添加文件</button>
          </div>

          <table class="standard-table mini-table" v-if="WorkOrderData.attachments?.length">
            <thead>
              <tr class="bg-gray">
                <th width="100">分类</th>
                <th>文件名 (点击按钮选择)</th>
                <th width="40">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(attr, idx) in WorkOrderData.attachments" :key="idx">
                <td>
                  <input v-model="attr.category" placeholder="类型" class="cell-input" />
                </td>
                <td class="file-cell">
                  <div class="file-trigger-wrapper">
                    <input
                      type="file"
                      :id="'file-input-' + idx"
                      style="display: none"
                      @change="onFileSelected($event, idx)"
                    />
                    <button class="btn-browse" @click="triggerRowFile(idx)">
                      {{ attr.fileName ? '更换' : '浏览' }}
                    </button>
                    <span class="file-name-text">{{ attr.fileName || '未选择' }}</span>
                  </div>
                </td>
                <td class="align-center">
                  <button class="remove-btn" @click="WorkOrderData.attachments?.splice(idx, 1)">
                    ×
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="button-group">
        <button class="btn btn-secondary" @click="$emit('close')">返回列表</button>
        <button class="btn btn-primary" @click="handleSubmitOrder">提交工单</button>
      </div>
    </div>

    <header class="doc-header">
      <h1 class="main-title">印刷工程单</h1>
      <div class="version-badge">版本：{{ WorkOrderData.work_ver }}</div>
    </header>

    <hr class="heavy-divider" />

    <section class="table-section">
      <fieldset :disabled="props.mode !== PageMode.EDIT">
        <table class="standard-table">
          <tbody>
            <tr>
              <td colspan="2" class="bg-gray">工单类型</td>
              <td><input v-model="WorkOrderData.gongDanLeiXing" /></td>
              <td class="bg-gray">材料</td>
              <td><input v-model="WorkOrderData.caiLiao" /></td>
              <td class="bg-gray">产品类型</td>
              <td><input v-model="WorkOrderData.chanPinLeiXing" /></td>
              <td class="bg-gray">制单时间</td>
              <td colspan="2"><input type="date" v-model="WorkOrderData.zhiDanShiJian" /></td>
            </tr>
            <tr class="bg-gray align-center">
              <td>客户</td>
              <td>客户PO</td>
              <td>成品名称</td>
              <td>产品规格</td>
              <td>订单数量</td>
              <td>出样数</td>
              <td>超比例数</td>
              <td>本厂放损</td>
              <td>出样日期</td>
              <td>出货日期</td>
            </tr>
            <tr>
              <td><textarea v-model="WorkOrderData.customer"></textarea></td>
              <td><textarea v-model="WorkOrderData.customerPO"></textarea></td>
              <td><textarea v-model="WorkOrderData.productName"></textarea></td>
              <td><textarea v-model="WorkOrderData.chanPinGuiGe"></textarea></td>
              <td><input type="number" v-model.number="WorkOrderData.dingDanShuLiang" /></td>
              <td><input type="number" v-model.number="WorkOrderData.chuYangShuLiang" /></td>
              <td><input type="number" v-model.number="WorkOrderData.chaoBiLiShuLiang" /></td>
              <td><input type="number" v-model.number="WorkOrderData.benChangFangSun" /></td>
              <td><input type="date" v-model="WorkOrderData.chuYangRiqiRequired" /></td>
              <td><input type="date" v-model="WorkOrderData.chuHuoRiqiRequired" /></td>
            </tr>
          </tbody>
        </table>
      </fieldset>
      <div class="table-scroll-container">
        <fieldset :disabled="props.mode !== PageMode.EDIT">
          <table class="standard-table">
            <thead>
              <tr class="bg-gray">
                <th>序号</th>
                <th>部件名称</th>
                <th>印刷颜色</th>
                <th>物料名称</th>
                <th>品牌</th>
                <th>规格</th>
                <th>FSC</th>
                <th>开数</th>
                <th>上机尺寸</th>
                <th>排版模数</th>
                <th>印出数</th>
                <th>印损</th>
                <th>领料数</th>
                <th>表面处理</th>
                <th>印刷板数</th>
                <th>生产路径</th>
                <th>排版方式</th>
                <th width="40">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in WorkOrderData.intermedia" :key="index">
                <td class="align-center">{{ index + 1 }}</td>

                <td><input v-model="item.buJianMingCheng" /></td>
                <td><input v-model="item.yinShuaYanSe" /></td>
                <td><input v-model="item.wuLiaoMingCheng" /></td>
                <td><input v-model="item.pinPai" /></td>
                <td><input v-model="item.caiLiaoGuiGe" /></td>
                <td><input v-model="item.FSC" /></td>
                <td><input v-model.number="item.kaiShu" type="number" /></td>
                <td><input v-model="item.shangJiChiCun" /></td>
                <td><input v-model.number="item.paiBanMuShu" type="number" /></td>
                <td><input v-model.number="item.yinChuShu" type="number" /></td>
                <td><input v-model.number="item.yinSun" type="number" /></td>
                <td><input v-model.number="item.lingLiaoShu" type="number" /></td>
                <td><input v-model="item.biaoMianChuLi" /></td>
                <td><input v-model.number="item.yinShuaBanShu" type="number" /></td>
                <td><input v-model="item.shengChanLuJing" /></td>
                <td><input v-model="item.paiBanFangShi" /></td>

                <td class="align-center">
                  <button class="remove-btn" @click="removeRow(index)" title="删除此行">×</button>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="18" class="add-row-container">
                  <button class="add-row-full-btn" @click="addNewRow">+ 点击添加新的物料行</button>
                </td>
              </tr>
            </tfoot>
          </table>
        </fieldset>
      </div>

      <div class="auditlog-related">
        <td>制单员:</td>
        <td><input v-model="WorkOrderData.work_clerk" class="cell-input" /></td>
        <td>时间：</td>
        <td><input type="date" v-model="WorkOrderData.zhiDanShiJian" class="cell-input" /></td>
      </div>
      <fieldset :disabled="props.mode !== PageMode.REVIEW" class="auditlog-related">
        <td>审核员:</td>
        <td><input v-model="WorkOrderData.work_audit" class="cell-input" /></td>
        <td>时间：</td>
        <td><input type="date" class="cell-input" /></td>
      </fieldset>
    </section>
  </div>
</template>

<!-- <script setup>
export enum WorkOrderPageMode {
  CLERK = '制单',
  VIEW = '查看',
  AUDIT = '审核',
  PROCESS = '工序',
}
</script> -->

<script lang="ts">
export enum PageMode {
  EDIT = 'edit',
  VIEW = 'view',
  REVIEW = 'review',
  PRODUCTION = 'production',
}
</script>
<script setup lang="ts">
import { reactive, watch } from 'vue'
import {
  type IWorkOrder,
  WorkOrderStatus,
  formatYMD,
  initializeAuditLog,
  prepareWorkOrderForSubmit,
} from '@/types/WorkOrder'

// const M_PageMode = ref<WorkOrderPageMode>(WorkOrderPageMode.CLERK)

const emit = defineEmits(['close', 'submit'])

const props = defineProps<{
  mode: PageMode
  initialData?: IWorkOrder | null // 必须加上这一行！
}>()

/**
 * 创建一个完整的、带有默认初始值的工单对象
 */
const createEmptyWorkOrder = (): Partial<IWorkOrder> => ({
  work_id: '',
  work_ver: '1.0',
  work_unique: '',
  work_clerk: '',
  work_audit: '',
  gongDanLeiXing: '',
  caiLiao: '',
  chanPinLeiXing: '',
  zhiDanShiJian: formatYMD(new Date()), // 默认今天，格式 yyyy-mm-dd
  customer: '',
  customerPO: '',
  productName: '',
  chanPinGuiGe: '',

  // 数值类型默认给 0 或 undefined (根据你输入框的需求)
  dingDanShuLiang: 0,
  chuYangShuLiang: 0,
  chaoBiLiShuLiang: 0,
  benChangFangSun: '',
  chuYangRiqiRequired: '',
  chuHuoRiqiRequired: '',

  // 直接在这里写死第一行物料的默认值
  intermedia: [
    {
      buJianMingCheng: '',
      yinShuaYanSe: '',
      wuLiaoMingCheng: '',
      pinPai: '',
      caiLiaoGuiGe: '',
      FSC: '',
      kaiShu: undefined,
      shangJiChiCun: '',
      paiBanMuShu: undefined,
      yinChuShu: undefined,
      yinSun: undefined,
      lingLiaoShu: undefined,
      biaoMianChuLi: '',
      yinShuaBanShu: undefined,
      shengChanLuJing: '',
      paiBanFangShi: '',
      dangQianJinDu: '未开始',
    },
  ],

  workorderstatus: WorkOrderStatus.DRAFT,
  auditLogs: [],
  attachments: [],
})

const WorkOrderData = reactive<IWorkOrder>(createEmptyWorkOrder() as IWorkOrder)

// 3. 彻底重写的重置函数
const resetToDefault = () => {
  console.log('--- 🧹 正在执行全量重置 ---')
  const empty = createEmptyWorkOrder()
  Object.assign(WorkOrderData, empty)
  // 额外手动处理一下明细数组，确保引用彻底刷新
  WorkOrderData.intermedia = [...(empty.intermedia || [])]
  WorkOrderData.attachments = []
}
watch(
  () => props.initialData,
  (newVal) => {
    if (newVal) {
      console.log('--- 🚀 开始填充数据 ---')

      // 1. 克隆数据
      const rawData = JSON.parse(JSON.stringify(newVal)) as IWorkOrder

      // 2. 直接遍历赋值，不使用 hasOwnProperty 检查
      ;(Object.keys(rawData) as Array<keyof IWorkOrder>).forEach((key) => {
        try {
          const k = key as keyof IWorkOrder
          // 打印每一个字段的读取情况，方便寻找“醉酒”
          console.log(`[读取] 字段: ${String(k).padEnd(25)} | 值:`, rawData[k])
          // 直接赋值，确保 orderData 接收到数据
          ;(WorkOrderData as Record<keyof IWorkOrder, unknown>)[k] = rawData[k]
        } catch (err) {
          console.error(`❌ 填充字段 [${key}] 失败:`, err)
        }
      })

      // 3. 处理独立字段
      //salesman.value = rawData.sales || 'admin'
    } else {
      resetToDefault()
      //salesman.value = 'admin'
    }
  },
  { immediate: true, deep: true },
)

// 删除行逻辑
const removeRow = (index: number) => {
  if (WorkOrderData.intermedia && WorkOrderData.intermedia.length > 1) {
    WorkOrderData.intermedia.splice(index, 1)
  } else {
    alert('至少保留一行物料数据')
  }
}

// 确保 addNewRow 包含你新增的字段
const addNewRow = () => {
  WorkOrderData.intermedia?.push({})
}
// 添加一个空的附件行
const addFileRow = () => {
  if (!WorkOrderData.attachments) WorkOrderData.attachments = []
  WorkOrderData.attachments.push({
    category: '',
    fileName: '',
    file: undefined,
  })
}

// 触发特定行的文件选择
const triggerRowFile = (index: number) => {
  const el = document.getElementById(`file-input-${index}`) as HTMLInputElement
  el?.click()
}

// 处理文件选择并绑定到该行
const onFileSelected = (e: Event, index: number) => {
  const target = e.target as HTMLInputElement

  // 1. 确保有文件被选中
  if (target.files && target.files[0]) {
    const file = target.files[0]

    // 2. 检查数组是否存在，且该索引位置的对象也存在
    const attachment = WorkOrderData.attachments?.[index]

    if (attachment) {
      attachment.file = file
      attachment.fileName = file.name
    }
  }
}
const handleSubmitOrder = async () => {
  // 基础校验
  if (!WorkOrderData.customer || !WorkOrderData.productName) {
    alert('请填写必要信息')
    return
  }

  try {
    const finalPayload = JSON.parse(JSON.stringify(WorkOrderData)) as IWorkOrder

    console.log(
      '%c--- 📤 提交数据全字段预览 ---',
      'background: #2563eb; color: #fff; padding: 4px 8px; border-radius: 4px;',
    )

    // 打印一个表格，清晰查看所有字段
    const allKeys = Object.keys(finalPayload).sort() as Array<keyof IWorkOrder>
    console.table(
      allKeys.map((key) => ({
        字段名: key,
        提交值: finalPayload[key],
        类型: typeof finalPayload[key],
      })),
    )
    //定义唯一索引
    WorkOrderData.work_unique = WorkOrderData.work_id + '_' + WorkOrderData.work_ver
    // 依然在子组件完成日志初始化和数据封装，因为子组件最清楚表单结构
    initializeAuditLog(WorkOrderData)
    const fd = prepareWorkOrderForSubmit(WorkOrderData)

    // 发射给父组件
    emit('submit', fd)
  } catch (err) {
    console.error('数据准备失败', err)
  }
}
</script>

<style scoped>
/* 核心：标准框线表格 */
.standard-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  font-size: 12px;
}

.standard-table th,
.standard-table td {
  border: 1px solid #000;
  height: 32px;
  padding: 0;
}

.standard-table input,
.standard-table textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  padding: 4px;
  box-sizing: border-box;
  text-align: center;
  background: transparent;
  display: block;
}

/* 辅助样式 */
.bg-gray {
  background-color: #f1f5f9;
  font-weight: bold;
  text-align: center;
}
.align-center {
  text-align: center;
}
.creator-wrapper {
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}
.top-nav {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.underline-input {
  border: none;
  border-bottom: 1px solid #000;
  outline: none;
  width: 150px;
}
.btn {
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.btn-primary {
  background: #0f172a;
  color: #fff;
  border: none;
}
.main-title {
  text-align: center;
  font-size: 28px;
  margin: 0;
}
.version-badge {
  text-align: right;
  font-size: 12px;
}
.heavy-divider {
  border-top: 2px solid #000;
  margin: 10px 0 20px 0;
}
.section-header {
  display: flex;
  justify-content: space-between;
  margin: 20px 0 10px;
}
.table-scroll-container {
  overflow-x: auto;
}
.attachment-manager {
  margin-top: 15px;
  max-width: 500px; /* 限制宽度，不占满全屏 */
}

.section-header-mini {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.add-file-btn {
  background: none;
  border: 1px dashed #000;
  padding: 2px 8px;
  cursor: pointer;
  font-size: 12px;
}

.mini-table {
  font-size: 11px; /* 附件表稍微小一点，不抢主表戏 */
}

.file-cell {
  padding: 0 4px !important;
}

.file-trigger-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.btn-browse {
  border: 1px solid #ccc;
  background: #fff;
  font-size: 11px;
  padding: 2px 6px;
  cursor: pointer;
  white-space: nowrap;
}

.file-name-text {
  color: #666;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* 重置 fieldset 样式，去除黑边、边距和补白 */
fieldset {
  border: none;
  margin: 0;
  padding: 0;
  min-width: 0; /* 修复某些浏览器下 fieldset 默认的最小宽度问题 */
  display: contents; /* 关键：让 fieldset 不参与布局，内部元素直接按原样排版 */
}

/* 如果你希望在禁用状态下，输入框有统一的视觉反馈，可以加这一条 */
fieldset:disabled input,
fieldset:disabled textarea {
  background-color: #f8fafc !important; /* 淡淡的灰色背景表示只读 */
  color: #64748b;
  cursor: not-allowed;
}
/* 复用你之前的 remove-btn 样式即可 */
</style>
