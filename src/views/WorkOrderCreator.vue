<template>
  <div class="creator-wrapper">
    <div class="top-nav">
      <div class="left-panel">
        <div class="staff-info">
          <span class="label">制单员：</span>
          <input v-model="workOrder.zhiDanYuan" type="text" class="underline-input" />
        </div>

        <div class="attachment-manager">
          <div class="manager-header">
            <span class="label">相关附件</span>
            <button class="add-file-btn" @click="addFileRow">+ 添加文件</button>
          </div>

          <table class="standard-table mini-table" v-if="workOrder.attachments?.length">
            <thead>
              <tr class="bg-gray">
                <th width="100">分类</th>
                <th>文件名 (点击按钮选择)</th>
                <th width="40">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(attr, idx) in workOrder.attachments" :key="idx">
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
                  <button class="remove-btn" @click="workOrder.attachments?.splice(idx, 1)">
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
        <button class="btn btn-primary" @click="submitWorkOrder">提交工单</button>
      </div>
    </div>

    <header class="doc-header">
      <h1 class="main-title">印刷工程单</h1>
      <div class="version-badge">版本：{{ workOrder.work_ver }}</div>
    </header>

    <hr class="heavy-divider" />

    <section class="table-section">
      <table class="standard-table">
        <tbody>
          <tr>
            <td colspan="2" class="bg-gray">工单类型</td>
            <td><input v-model="workOrder.gongDanLeiXing" /></td>
            <td class="bg-gray">材料</td>
            <td><input v-model="workOrder.caiLiao" /></td>
            <td class="bg-gray">产品类型</td>
            <td><input v-model="workOrder.chanPinLeiXing" /></td>
            <td class="bg-gray">制单时间</td>
            <td colspan="2"><input type="date" v-model="workOrder.zhiDanShiJian" /></td>
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
            <td><textarea v-model="workOrder.customer"></textarea></td>
            <td><textarea v-model="workOrder.customerPO"></textarea></td>
            <td><textarea v-model="workOrder.productName"></textarea></td>
            <td><textarea v-model="workOrder.chanPinGuiGe"></textarea></td>
            <td><input type="number" v-model.number="workOrder.dingDanShuLiang" /></td>
            <td><input type="number" v-model.number="workOrder.chuYangShuLiang" /></td>
            <td><input type="number" v-model.number="workOrder.chaoBiLiShuLiang" /></td>
            <td><input type="number" v-model.number="workOrder.benChangFangSun" /></td>
            <td><input type="date" v-model="workOrder.chuYangRiqiRequired" /></td>
            <td><input type="date" v-model="workOrder.chuHuoRiqiRequired" /></td>
          </tr>
        </tbody>
      </table>

      <div class="table-scroll-container">
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
            <tr v-for="(item, index) in workOrder.intermedia" :key="index">
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
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { type IWorkOrder, OrderStatus, prepareWorkOrderForSubmit } from '@/types/WorkOrder'
import service from '@/stores/request'

const emit = defineEmits(['close', 'submit'])

const workOrder = reactive<Partial<IWorkOrder> & { zhiDanYuan: string }>({
  zhiDanYuan: '',
  work_ver: '1.0',
  orderStatus: OrderStatus.DRAFT,
  intermedia: [{}],
})

// 删除行逻辑
const removeRow = (index: number) => {
  if (workOrder.intermedia && workOrder.intermedia.length > 1) {
    workOrder.intermedia.splice(index, 1)
  } else {
    alert('至少保留一行物料数据')
  }
}

// 确保 addNewRow 包含你新增的字段
const addNewRow = () => {
  workOrder.intermedia?.push({})
}
// 添加一个空的附件行
const addFileRow = () => {
  if (!workOrder.attachments) workOrder.attachments = []
  workOrder.attachments.push({
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
    const attachment = workOrder.attachments?.[index]

    if (attachment) {
      attachment.file = file
      attachment.fileName = file.name
    }
  }
}
const submitWorkOrder = async () => {
  // 1. 校验逻辑
  if (!workOrder.zhiDanYuan) {
    return alert('请填写制单员')
  }

  // 2. 打包逻辑：让 WorkOrder 自己封装 (核心逻辑)
  // 调用封装函数，得到准备好的 FormData
  const payload = prepareWorkOrderForSubmit(workOrder)

  // 3. 发送逻辑：使用 request 发货
  try {
    // 假设后端接口路径是 /api/work-order
    await service.post('/work-orders', payload)

    alert('工单及附件提交成功！')
    emit('submit')
    emit('close')
  } catch (error) {
    // 错误处理已在 request.ts 的拦截器中统一处理
    // 这里可以处理组件特有的 loading 状态关闭等
    console.error('提交失败', error)
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

/* 复用你之前的 remove-btn 样式即可 */
</style>
