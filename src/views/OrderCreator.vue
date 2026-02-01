<template>
  <div class="order-creator">
    <div class="toolbar-fixed">
      <div class="buttons">
        <button class="btn secondary" @click="handleSaveDraft">保存草稿</button>
        <button class="btn primary" @click="handleSubmitOrder">提交审核</button>
        <button class="btn ghost" @click="handleClose">关闭退出</button>
      </div>
    </div>

    <div class="form-content">
      <div class="order-sheet">
        <div class="pdf-title-display">订单信息单（生产）</div>

        <div class="form-pre-header">
          <div class="control-item">
            <input type="checkbox" id="cpc" v-model="orderData.cpcQueRen" />
            <label for="cpc">cpc确认</label>
          </div>
          <div class="control-item">
            <input type="checkbox" id="outsourcing" v-model="orderData.waixiaoFlag" />
            <label for="outsourcing">OutSourcing</label>
          </div>
          <div class="control-item">
            <input type="checkbox" id="cpsia" v-model="orderData.cpsiaYaoqiu" />
            <label for="cpsia">CPSIA</label>
          </div>
          <div class="control-item">
            <label>订纸备注</label>
            <input
              type="text"
              v-model="orderData.dingZhiBeiZhu"
              placeholder="填写备注..."
              class="inline-input"
            />
          </div>
          <div class="control-item">
            <label>业务员</label>
            <input type="text" v-model="salesman" placeholder="姓名" class="inline-input mini" />
          </div>
        </div>

        <div class="upload-section">
          <div class="upload-editor">
            <span class="section-label">添加上传文件</span>
            <div class="control-item">
              <input
                type="text"
                v-model="tempFile.category"
                placeholder="附件: 如订单信息pdf"
                class="inline-input medium"
              />
            </div>
            <div class="control-item">
              <input
                type="file"
                id="file-upload-input"
                class="hidden-input"
                @change="onFileBrowse"
              />
              <label for="file-upload-input" class="btn-mini secondary">浏览文件</label>
              <span class="file-name-hint" v-if="tempFile.fileName">{{ tempFile.fileName }}</span>
            </div>
            <button class="btn-mini primary" @click="handleCommitUpload" :disabled="!tempFile.file">
              上传
            </button>
          </div>

          <div
            class="attachment-display-area"
            v-if="orderData.attachments && orderData.attachments.length > 0"
          >
            <div
              v-for="(item, index) in orderData.attachments"
              :key="index"
              class="attachment-card"
            >
              <div class="card-info">
                <span class="card-category">[{{ item.category }}]</span>
                <span class="card-filename" :title="item.fileName">{{ item.fileName }}</span>
              </div>
              <button class="card-remove-btn" @click="removeAttachment(index)" title="删除附件">
                ×
              </button>
            </div>
          </div>
        </div>

        <table class="production-table">
          <thead>
            <tr>
              <th rowspan="2" colspan="4" class="header-section">产品基本信息,分类及安全要求</th>
              <th rowspan="2" colspan="4" class="header-section">订单数量及产品规格</th>
              <th colspan="4" class="header-section">排期信息及其他</th>
            </tr>
            <tr>
              <th colspan="2" class="sub-header"></th>
              <th class="sub-header">要求日期</th>
              <th class="sub-header">CPC承诺日期</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="label">客户</td>
              <td colspan="3"><input v-model="orderData.customer" class="cell-input" /></td>
              <td class="label">订单数量</td>
              <td>
                <input type="number" v-model="orderData.dingDanShuLiang" class="cell-input" />
              </td>
              <td class="label">出样数量</td>
              <td>
                <input type="number" v-model="orderData.chuYangShuLiang" class="cell-input" />
              </td>
              <td colspan="2" class="label">下资料袋日期</td>
              <td>
                <input
                  type="date"
                  v-model="orderData.xiaZiliaodaiRiqiRequired"
                  class="cell-input"
                />
              </td>
              <td>
                <input type="date" v-model="orderData.xiaZiliaodaiRiqiPromise" class="cell-input" />
              </td>
            </tr>
            <tr>
              <td rowspan="2" class="label">成品名称</td>
              <td colspan="3" rowspan="2">
                <textarea v-model="orderData.productName" class="cell-input" rows="2"></textarea>
              </td>
              <td class="label">超比例数量</td>
              <td>
                <input type="number" v-model="orderData.chaoBiLiShuLiang" class="cell-input" />
              </td>
              <td class="label">备品数量</td>
              <td><input type="number" v-model="orderData.beiPinShuLiang" class="cell-input" /></td>
              <td rowspan="2" colspan="2" class="label">印张日期</td>
              <td rowspan="2">
                <input type="date" v-model="orderData.yinzhangRiqiRequired" class="cell-input" />
              </td>
              <td rowspan="2">
                <input type="date" v-model="orderData.yinzhangRiqiPromise" class="cell-input" />
              </td>
            </tr>
            <tr>
              <td class="label">特殊留样张</td>
              <td>
                <input type="number" v-model="orderData.teShuLiuYangZhang" class="cell-input" />
              </td>
              <td class="label">特殊留书样</td>
              <td>
                <input type="number" v-model="orderData.teShuLiuShuYang" class="cell-input" />
              </td>
            </tr>
            <tr>
              <td class="label">订单号</td>
              <td colspan="3">
                <textarea v-model="orderData.order_id" class="cell-input"></textarea>
              </td>
              <td class="label">总数量</td>
              <td colspan="3">
                <input type="number" v-model="orderData.zongShuLiang" class="cell-input" />
              </td>
              <td colspan="2" class="label">折牌日期</td>
              <td>
                <input type="date" v-model="orderData.zhepaiRiqiRequired" class="cell-input" />
              </td>
              <td>
                <input type="date" v-model="orderData.zhepaiRiqiPromise" class="cell-input" />
              </td>
            </tr>
            <tr>
              <td class="label">旧编码</td>
              <td><textarea v-model="orderData.jiuBianMa" class="cell-input"></textarea></td>
              <td class="label">ISBN</td>
              <td><textarea v-model="orderData.isbn" class="cell-input"></textarea></td>
              <td class="label">出样说明</td>
              <td colspan="3">
                <textarea v-model="orderData.chuYangShuoMing" class="cell-input"></textarea>
              </td>
              <td colspan="2" class="label">出样日期</td>
              <td>
                <input type="date" v-model="orderData.chuyangRiqiRequired" class="cell-input" />
              </td>
              <td>
                <input type="date" v-model="orderData.chuyangRiqiPromise" class="cell-input" />
              </td>
            </tr>
            <tr>
              <td class="label">客户PO</td>
              <td><textarea v-model="orderData.customerPO" class="cell-input"></textarea></td>
              <td class="label">报价单号</td>
              <td><textarea v-model="orderData.baoJiaDanHao" class="cell-input"></textarea></td>
              <td class="label">装订方式</td>
              <td colspan="3">
                <textarea v-model="orderData.zhuangDingFangShi" class="cell-input"></textarea>
              </td>
              <td class="label">出货</td>
              <td><input type="number" v-model="orderData.chuHuoShuLiang" class="cell-input" /></td>
              <td>
                <input type="date" v-model="orderData.chuHuoRiqiRequired" class="cell-input" />
              </td>
              <td>
                <input type="date" v-model="orderData.chuHuoRiqiPromise" class="cell-input" />
              </td>
            </tr>
            <tr>
              <td class="label">系列单名</td>
              <td colspan="3"><input v-model="orderData.xiLieDanMing" class="cell-input" /></td>
              <td rowspan="3" class="label">成品规格</td>
              <td class="label">高</td>
              <td><input type="number" v-model="orderData.guigeGaoMm" class="cell-input" /></td>
              <td class="label">MM</td>
              <td rowspan="3" colspan="2" class="label">用途</td>
              <td rowspan="3" colspan="2">
                <textarea v-model="orderData.yongTu" class="cell-input" rows="3"></textarea>
              </td>
            </tr>
            <tr>
              <td class="label">其他识别</td>
              <td colspan="3"><input v-model="orderData.qiTaShiBie" class="cell-input" /></td>
              <td class="label">宽</td>
              <td><input type="number" v-model="orderData.guigeKuanMm" class="cell-input" /></td>
              <td class="label">MM</td>
            </tr>
            <tr>
              <td class="label">产品大类</td>
              <td><input v-model="orderData.chanPinDaLei" class="cell-input" /></td>
              <td class="label">子类型</td>
              <td><input v-model="orderData.ziLeiXing" class="cell-input" /></td>
              <td class="label">厚</td>
              <td><input type="number" v-model="orderData.guigeHouMm" class="cell-input" /></td>
              <td class="label">MM</td>
            </tr>
            <tr>
              <td colspan="2" class="label">FSC类型</td>
              <td colspan="2"><input v-model="orderData.fscType" class="cell-input" /></td>
              <!-- <td class="label">分版说明</td>
              <td><input v-model="orderData.fenBanShuoMing2" class="cell-input" /></td> -->
              <td class="label">跟色指示</td>
              <td colspan="3"><input v-model="orderData.genSeZhiShi" class="cell-input" /></td>
              <td colspan="2" class="label">客来信息</td>
              <td colspan="2"><input v-model="orderData.keLaiXinxi" class="cell-input" /></td>
            </tr>
            <tr>
              <td colspan="2" class="label">是否需要保留签色</td>
              <td colspan="10">
                <textarea v-model="orderData.baoLiuQianSe" class="cell-input"></textarea>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="detail-table-wrapper">
          <table class="production-table detail-table">
            <thead>
              <tr>
                <td colspan="14" class="label">产品明细</td>
              </tr>
              <tr class="sub-header-row">
                <td class="label">内文</td>
                <td class="label">报价用纸尺寸</td>
                <td class="label">厚度</td>
                <td class="label">克重</td>
                <td class="label">产地</td>
                <td class="label">品牌</td>
                <td class="label">纸类</td>
                <td class="label">FSC</td>
                <td class="label">页数</td>
                <td class="label">印色(正/反)</td>
                <td class="label">专色(正/反)</td>
                <td class="label">表面处理</td>
                <td class="label">装订工艺</td>
                <td class="label">备注</td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in orderData.chanPinMingXi" :key="index" class="dynamic-row">
                <td><input v-model="item.neiWen" class="cell-input" /></td>
                <td><input v-model="item.yongZhiChiCun" class="cell-input" /></td>
                <td><input v-model="item.houDu" class="cell-input" /></td>
                <td><input v-model="item.keZhong" class="cell-input" /></td>
                <td><input v-model="item.chanDi" class="cell-input" /></td>
                <td><input v-model="item.pinPai" class="cell-input" /></td>
                <td><input v-model="item.zhiLei" class="cell-input" /></td>
                <td><input v-model="item.fsc" class="cell-input" /></td>
                <td><input type="number" v-model="item.yeShu" class="cell-input" /></td>
                <td><input v-model="item.yinSe" class="cell-input" /></td>
                <td><input v-model="item.zhuanSe" class="cell-input" /></td>
                <td><input v-model="item.biaoMianChuLi" class="cell-input" /></td>
                <td><input v-model="item.zhuangDingGongYi" class="cell-input" /></td>
                <td>
                  <input v-model="item.beiZhu" class="cell-input" />
                  <button
                    class="row-delete-action"
                    @click="removeDetailRow(index)"
                    title="删除此行"
                  >
                    ×
                  </button>
                </td>
              </tr>
              <tr class="add-row-trigger-line">
                <td colspan="14" @click="addDetailRow">
                  <span class="add-icon">+</span> 点击此处添加新的一行产品明细
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <table class="production-table extra-info-table">
          <!-- <thead>

            <tr>

              <td colspan="2" class="label"></td>

            </tr>

          </thead> -->

          <tbody>
            <tr>
              <td class="label" width="100">辅料说明</td>
              <td><textarea v-model="orderData.fuLiaoShuoMing" class="cell-input"></textarea></td>
            </tr>
            <tr>
              <td class="label" width="100">产品明细特别说明</td>
              <td>
                <textarea
                  v-model="orderData.chanPinMingXiTeBieShuoMing"
                  class="cell-input"
                ></textarea>
              </td>
            </tr>
            <tr>
              <td class="label" width="100">分版说明</td>
              <td><textarea v-model="orderData.fenBanShuoMing" class="cell-input"></textarea></td>
            </tr>

            <tr>
              <td class="label" width="100">物料说明</td>

              <td><textarea v-model="orderData.wuLiaoShuoMing" class="cell-input"></textarea></td>
            </tr>

            <tr>
              <td class="label" width="100">印刷和跟色要求</td>

              <td>
                <textarea v-model="orderData.yinShuaGenSeYaoQiu" class="cell-input"></textarea>
              </td>
            </tr>

            <tr>
              <td class="label" width="100">装订/手工</td>

              <td>
                <textarea
                  v-model="orderData.zhuangDingShouGongYaoQiu"
                  class="cell-input"
                ></textarea>
              </td>
            </tr>

            <tr>
              <td class="label" width="100">其他</td>

              <td><textarea v-model="orderData.qiTa" class="cell-input"></textarea></td>
            </tr>

            <tr>
              <td class="label" width="100">质量要求</td>

              <td><textarea v-model="orderData.zhiLiangYaoQiu" class="cell-input"></textarea></td>
            </tr>

            <tr>
              <td class="label" width="100">客户反馈</td>

              <td><textarea v-model="orderData.keHuFanKui" class="cell-input"></textarea></td>
            </tr>

            <tr>
              <td class="label" width="100">特殊要求</td>

              <td><textarea v-model="orderData.teShuYaoQiu" class="cell-input"></textarea></td>
            </tr>

            <tr>
              <td class="label" width="100">控制方法</td>

              <td><textarea v-model="orderData.kongZhiFangFa" class="cell-input"></textarea></td>
            </tr>

            <tr>
              <td class="label" width="100">订单特别说明</td>

              <td>
                <textarea v-model="orderData.dingDanTeBieShuoMing" class="cell-input"></textarea>
              </td>
            </tr>

            <tr>
              <td class="label" width="100">样品评审信息</td>

              <td>
                <textarea v-model="orderData.yangPinPingShenXinXi" class="cell-input"></textarea>
              </td>
            </tr>

            <tr>
              <td class="label" width="100">订单评审信息</td>

              <td>
                <textarea v-model="orderData.dingDanPingShenXinXi" class="cell-input"></textarea>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  OrderStatus,
  type IOrder,
  type IAttachment,
  prepareOrderFormData,
  initializeAuditLog,
} from '@/types/Order'
import request from '@/stores/request'

const emit = defineEmits<{ (e: 'close'): void }>()
const salesman = ref('')

// --- 订单核心数据 ---
const orderData = reactive<Partial<IOrder>>({
  cpcQueRen: false,
  waixiaoFlag: false,
  cpsiaYaoqiu: false,
  dingZhiBeiZhu: '',
  orderstatus: OrderStatus.DRAFT,
  attachments: [], // 明确初始化为数组
  chanPinMingXi: [
    {
      neiWen: '',
      yongZhiChiCun: '',
      houDu: 0,
      keZhong: 0,
      chanDi: '',
      pinPai: '',
      zhiLei: '',
      fsc: '',
      yeShu: 0,
      yinSe: '',
      zhuanSe: '',
      biaoMianChuLi: '',
      zhuangDingGongYi: '',
      beiZhu: '',
    },
  ],
})

// --- 附件上传临时状态 ---
const tempFile = ref({
  category: '',
  fileName: '',
  file: null as File | null,
})

const onFileBrowse = (e: Event) => {
  const target = e.target as HTMLInputElement
  // 1. 获取选中的文件
  const selectedFile = target.files?.[0]

  // 2. 只有当 selectedFile 确实存在时才进行赋值
  if (selectedFile) {
    tempFile.value.file = selectedFile // 此时 selectedFile 的类型是 File，不再包含 null/undefined
    tempFile.value.fileName = selectedFile.name
  } else {
    // 可选：如果用户取消了选择，清空当前临时状态
    tempFile.value.file = null
    tempFile.value.fileName = ''
  }
}

const handleCommitUpload = () => {
  if (!tempFile.value.file || !tempFile.value.category) {
    alert('请填写附件类型并选择文件')
    return
  }

  const newAttr: IAttachment = {
    category: tempFile.value.category,
    fileName: tempFile.value.fileName,
    file: tempFile.value.file,
    url: URL.createObjectURL(tempFile.value.file), // 本地预览 URL
  }

  if (!orderData.attachments) orderData.attachments = []
  orderData.attachments.push(newAttr)

  // 重置状态
  tempFile.value = { category: '', fileName: '', file: null }
  const input = document.getElementById('file-upload-input') as HTMLInputElement
  if (input) input.value = ''
}

const removeAttachment = (index: number) => {
  const attr = orderData.attachments?.[index]
  if (attr?.url) {
    URL.revokeObjectURL(attr.url) // 释放内存
  }
  orderData.attachments?.splice(index, 1)
}

// --- 表格明细行操作 ---
const addDetailRow = () => {
  orderData.chanPinMingXi?.push({
    neiWen: '',
    yongZhiChiCun: '',
    houDu: 0,
    keZhong: 0,
    chanDi: '',
    pinPai: '',
    zhiLei: '',
    fsc: '',
    yeShu: 0,
    yinSe: '',
    zhuanSe: '',
    biaoMianChuLi: '',
    zhuangDingGongYi: '',
    beiZhu: '',
  })
}

const removeDetailRow = (index: number) => {
  if (orderData.chanPinMingXi && orderData.chanPinMingXi.length > 1) {
    orderData.chanPinMingXi.splice(index, 1)
  }
}

// --- 顶部按钮操作 ---
const handleSaveDraft = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    initializeAuditLog(orderData, salesman.value)
    const fd = prepareOrderFormData(orderData, salesman.value)
    // 增加 isDraft=true 参数
    await request.post('/orders/create?isDraft=true', fd)
    alert('草稿已成功保存！')
  } catch (err: any) {
    console.error('保存草稿失败:', err)
    alert('保存草稿失败: ' + (err.response?.data?.error || err.message))
  } finally {
    isSubmitting.value = false
  }
}

// 定义 loading 状态防止重复点击
const isSubmitting = ref(false)
const handleSubmitOrder = async () => {
  // 1. 校验
  if (!orderData.customer || !orderData.productName) {
    alert('请填写必要信息（客户、成品名称）')
    return
  }

  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    // 【第一步】生成审计日志和状态变更
    initializeAuditLog(orderData, salesman.value)

    // 【第二步】将包含日志的 orderData 打包成 FormData
    const fd = prepareOrderFormData(orderData, salesman.value)

    // 【第三步】发送到后端
    await request.post('/orders/create', fd)

    alert('订单已成功提交审核！')
    emit('close')
  } catch (err: any) {
    console.error('提交订单失败:', err)
    alert('提交订单失败: ' + (err.response?.data?.error || err.message))
  } finally {
    isSubmitting.value = false
  }
}
const handleClose = () => {
  if (confirm('确定退出？')) emit('close')
}
</script>

<style scoped>
.order-creator {
  background-color: #f1f5f9;
  min-height: 100vh;
}
.form-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.order-sheet {
  background: #fff;
  width: 100%;
  max-width: 1200px;
  padding: 40px 60px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* 1. 前置信息 & 上传区 */
.form-pre-header {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  padding: 0 10px;
  color: #475569;
}
.upload-section {
  margin: 10px 0 20px;
  padding: 15px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
}
.upload-editor {
  display: flex;
  align-items: center;
  gap: 15px;
}
.section-label {
  font-weight: 800;
  color: #1e293b;
  font-size: 13px;
  border-left: 4px solid #2563eb;
  padding-left: 10px;
}

.attachment-display-area {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}
.attachment-card {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #2563eb;
  padding: 4px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
}
.card-category {
  color: #2563eb;
  font-weight: 700;
  font-size: 12px;
  margin-right: 6px;
}
.card-filename {
  color: #334155;
  font-size: 12px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-remove-btn {
  border: none;
  background: none;
  color: #94a3b8;
  font-size: 16px;
  margin-left: 8px;
  cursor: pointer;
}
.card-remove-btn:hover {
  color: #ef4444;
}

/* 2. 表格基础样式 */
.production-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  margin-top: 10px;
}
.production-table td,
.production-table th {
  border: 1px solid #000;
  padding: 6px;
  font-size: 13px;
  position: relative;
  word-break: break-all;
}
.label {
  background-color: #f9fafb;
  font-weight: 600;
  text-align: center;
  color: #334155;
}
.cell-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  text-align: center;
  font-size: inherit;
}
textarea.cell-input {
  text-align: left;
  padding: 4px;
  resize: vertical;
  min-height: 40px;
}

/* 3. 附件 & 表格交互组件 */
.btn-mini {
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
}
.btn-mini.primary {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}
.btn-mini.primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}
.hidden-input {
  display: none;
}
.file-name-hint {
  font-size: 12px;
  color: #64748b;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.inline-input.medium {
  width: 180px;
}

/* 4. 明细行操作 */
.detail-table {
  font-size: 11px;
}
.add-row-trigger-line td {
  text-align: center;
  color: #2563eb;
  background-color: #f8fafc;
  cursor: pointer;
  font-weight: 600;
  height: 38px;
}
.row-delete-action {
  position: absolute;
  right: -30px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  background: #fff;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
  border-radius: 50%;
  opacity: 0;
  transition: 0.2s;
  cursor: pointer;
}
.dynamic-row:hover .row-delete-action {
  opacity: 1;
}

/* 5. 顶部工具栏 */
.toolbar-fixed {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 40px;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.pdf-title-display {
  font-size: 24px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 25px;
  border-bottom: 2px solid #000;
  padding-bottom: 10px;
}
.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  border: 1px solid transparent;
  margin-left: 10px;
}
.primary {
  background: #2563eb;
  color: #fff;
}
.secondary {
  background: #fff;
  border-color: #d1d5db;
  color: #475569;
}
.ghost {
  background: transparent;
  color: #94a3b8;
}
</style>
