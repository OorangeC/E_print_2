<template>
  <div class="order-creator">
    <div class="toolbar-fixed">
      <div class="buttons">
        <button v-if="props.mode === PageMode.EDIT" class="btn secondary" @click="handleSaveDraft">
          保存草稿
        </button>

        <button v-if="props.mode === PageMode.EDIT" class="btn primary" @click="handleSubmitOrder">
          提交审核
        </button>

        <button class="btn ghost" @click="handleClose">关闭退出</button>
      </div>
    </div>

    <div class="form-content">
      <div class="order-sheet">
        <div class="pdf-title-display">订单信息单（生产）</div>

        <fieldset :disabled="props.mode !== PageMode.EDIT" class="form-pre-header">
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

          <div class="control-item">
            <label>版本</label>
            <input
              type="text"
              v-model="orderData.order_ver"
              placeholder="版本号"
              class="inline-input mini"
            />
          </div>
        </fieldset>

        <fieldset :disabled="props.mode !== PageMode.EDIT" class="upload-section">
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
        </fieldset>

        <fieldset :disabled="props.mode !== PageMode.EDIT">
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
                  <input
                    type="number"
                    v-model.number="orderData.dingDanShuLiang"
                    class="cell-input"
                  />
                </td>

                <td class="label">出样数量</td>

                <td>
                  <input
                    type="number"
                    v-model.number="orderData.chuYangShuLiang"
                    class="cell-input"
                  />
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
                  <input
                    type="date"
                    v-model="orderData.xiaZiliaodaiRiqiPromise"
                    class="cell-input"
                  />
                </td>
              </tr>

              <tr>
                <td rowspan="2" class="label">成品名称</td>

                <td colspan="3" rowspan="2">
                  <textarea v-model="orderData.productName" class="cell-input" rows="2"></textarea>
                </td>

                <td class="label">超比例数量</td>

                <td>
                  <input
                    type="number"
                    v-model.number="orderData.chaoBiLiShuLiang"
                    class="cell-input"
                  />
                </td>

                <td class="label">备品数量</td>

                <td>
                  <input
                    type="number"
                    v-model.number="orderData.beiPinShuLiang"
                    class="cell-input"
                  />
                </td>

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
                  <input
                    type="number"
                    v-model.number="orderData.teShuLiuYangZhang"
                    class="cell-input"
                  />
                </td>

                <td class="label">特殊留书样</td>

                <td>
                  <input
                    type="number"
                    v-model.number="orderData.teShuLiuShuYang"
                    class="cell-input"
                  />
                </td>
              </tr>

              <tr>
                <td class="label">订单号</td>

                <td colspan="3">
                  <textarea v-model="orderData.order_id" class="cell-input"></textarea>
                </td>

                <td class="label">总数量</td>

                <td colspan="3">
                  <input type="number" v-model.number="orderData.zongShuLiang" class="cell-input" />
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

                <td>
                  <input
                    type="number"
                    v-model.number="orderData.chuHuoShuLiang"
                    class="cell-input"
                  />
                </td>

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

                <td>
                  <input type="number" v-model.number="orderData.guigeGaoMm" class="cell-input" />
                </td>

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

                <td>
                  <input type="number" v-model.number="orderData.guigeKuanMm" class="cell-input" />
                </td>

                <td class="label">MM</td>
              </tr>

              <tr>
                <td class="label">产品大类</td>

                <td><input v-model="orderData.chanPinDaLei" class="cell-input" /></td>

                <td class="label">子类型</td>

                <td><input v-model="orderData.ziLeiXing" class="cell-input" /></td>

                <td class="label">厚</td>

                <td>
                  <input type="number" v-model.number="orderData.guigeHouMm" class="cell-input" />
                </td>

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
        </fieldset>

        <fieldset :disabled="props.mode !== PageMode.EDIT" class="detail-table-wrapper">
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

                <td><input v-model="item.FSC" class="cell-input" /></td>

                <td><input type="number" v-model.number="item.yeShu" class="cell-input" /></td>

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
        </fieldset>

        <fieldset :disabled="props.mode !== PageMode.EDIT">
          <table class="production-table extra-info-table">
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
        </fieldset>

        <div class="triple-grid-container">
          <fieldset :disabled="props.mode !== PageMode.EDIT" class="mini-form-group">
            <div class="form-row">
              <div>业务代表:</div>
              <div><input v-model="orderData.sales" class="cell-input" /></div>
            </div>
            <div class="form-row">
              <div>日期:</div>
              <div><input type="date" class="cell-input" /></div>
            </div>
          </fieldset>

          <fieldset :disabled="props.mode !== PageMode.REVIEW" class="mini-form-group">
            <div class="form-row">
              <div>审核人:</div>
              <div><input v-model="orderData.audit" class="cell-input" /></div>
            </div>
            <div class="form-row">
              <div>日期:</div>
              <div><input type="date" class="cell-input" /></div>
            </div>
          </fieldset>
          <table class="mini-form-table">
            <tbody>
              <tr>
                <td>打印人:</td>
                <td><input class="cell-input" /></td>
              </tr>
              <tr>
                <td>日期:</td>
                <td><input type="date" class="cell-input" /></td>
              </tr>
            </tbody>
          </table>
          <!-- <div class="mini-form-group">
            <div class="form-row">
              <td>打印人:</td>
              <td><input class="cell-input" /></td>
            </div>
            <div class="form-row">
              <td>日期:</td>
              <td><input type="date" class="cell-input" /></td>
            </div>
          </div> -->
        </div>

        <fieldset
          :disabled="props.mode !== PageMode.REVIEW"
          v-if="props.mode !== PageMode.EDIT"
          class="audit-section"
        >
          <div class="section-label" style="margin-bottom: 10px">审核决策</div>
          <table class="production-table audit-table">
            <tbody>
              <tr>
                <td class="label" width="100">审核意见</td>
                <td>
                  <textarea
                    v-model="auditRemark"
                    class="cell-input audit-textarea"
                    placeholder="请输入审核处理意见（如拒绝原因等）..."
                  ></textarea>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="audit-actions">
            <button class="btn-audit approve" @click="handleAudit(true)">
              <span class="icon">通过</span>
            </button>
            <button class="btn-audit reject" @click="handleAudit(false)">
              <span class="icon">驳回</span>
            </button>
          </div>
        </fieldset>
      </div>
    </div>

    <!-- <OrderInfo
      :mode="currentTab === 'PENDING' ? 'audit' : 'view'"
      :initialData="selectedOrder"
      @close="selectedOrder = null"
      @submit="handleAuditSubmit"
    /> -->
  </div>
</template>

<script lang="ts">
export enum PageMode {
  EDIT = 'edit',
  VIEW = 'view',
  REVIEW = 'review',
}
</script>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

import {
  OrderStatus,
  type IOrder,
  type IAttachment,
  prepareOrderFormData,
  addAuditLog,
  formatFullTime,
} from '@/types/Order'
import { prepareWorkOrderForSubmit, WorkOrderStatus, type IWorkOrder } from '@/types/WorkOrder'

// --- 审核意见---
const auditRemark = ref('')

// 这里的 props.mode 就是那个“会被外部更改”的唯一变量
// 修改这一段
const props = defineProps<{
  mode: PageMode
  initialData?: IOrder | null // 必须加上这一行！
}>()

const salesman = ref('admin')

// 一个简单的重置函数，防止新建订单时残留上一次的数据
// 定义一个符合 IOrder 接口的完整空模板
const createEmptyOrder = (): Partial<IOrder> => ({
  // 基础信息
  order_id: '',
  customer: '',
  sales: 'admin',
  cpcQueRen: false,
  waixiaoFlag: false,
  cpsiaYaoqiu: false,
  dingZhiBeiZhu: '',

  // 产品基本信息
  productName: '',
  jiuBianMa: '',
  isbn: '',
  customerPO: '',
  baoJiaDanHao: '',
  xiLieDanMing: '',
  qiTaShiBie: '',
  chanPinDaLei: '',
  ziLeiXing: '',
  fscType: '',
  fenBanShuoMing: '',
  baoLiuQianSe: '',

  // 数量与规格
  dingDanShuLiang: 0,
  chuYangShuLiang: 0,
  chaoBiLiShuLiang: 0,
  teShuLiuYangZhang: 0,
  beiPinShuLiang: 0,
  teShuLiuShuYang: 0,
  zongShuLiang: 0,
  chuYangShuoMing: 0,
  zhuangDingFangShi: '',
  guigeGaoMm: 0,
  guigeKuanMm: 0,
  guigeHouMm: 0,
  genSeZhiShi: '',
  yongTu: '', // 👈 你的“醉酒”坑位在这里！
  keLaiXinxi: '',

  // 排期信息 (全部初始化为空字符串，方便 date input 绑定)
  xiaZiliaodaiRiqiRequired: '',
  xiaZiliaodaiRiqiPromise: '',
  yinzhangRiqiRequired: '',
  yinzhangRiqiPromise: '',
  zhepaiRiqiRequired: '',
  zhepaiRiqiPromise: '',
  chuyangRiqiRequired: '',
  chuyangRiqiPromise: '',
  chuHuoRiqiRequired: '',
  chuHuoRiqiPromise: '',
  chuHuoShuLiang: 0,

  // 明细与备注
  chanPinMingXi: [
    {
      neiWen: '',
      yongZhiChiCun: '',
      houDu: 0,
      keZhong: 0,
      chanDi: '',
      pinPai: '',
      zhiLei: '',
      FSC: '',
      yeShu: 0,
      yinSe: '',
      zhuanSe: '',
      biaoMianChuLi: '',
      zhuangDingGongYi: '',
      beiZhu: '',
    },
  ],
  fuLiaoShuoMing: '',
  chanPinMingXiTeBieShuoMing: '',
  wuLiaoShuoMing: '',
  yinShuaGenSeYaoQiu: '',
  zhuangDingShouGongYaoQiu: '',
  qiTa: '',
  zhiLiangYaoQiu: '',
  keHuFanKui: '',
  teShuYaoQiu: '',
  kongZhiFangFa: '',
  dingDanTeBieShuoMing: '',
  yangPinPingShenXinXi: '',
  dingDanPingShenXinXi: '',

  // 状态与附件
  orderstatus: OrderStatus.DRAFT,
  attachments: [],
  auditLogs: [],
})

/**
 * 一步到位创建完整的工单初始对象
 * 消除嵌套函数调用，直接声明所有默认值
 */
const createWorkOrderFromOrder = (sourceOrder: IOrder): IWorkOrder => ({
  // 1. 系统索引与基础信息

  work_id: sourceOrder.order_id + '_W',
  work_ver: sourceOrder.order_ver || '',
  work_unique: sourceOrder.order_id + '_W_' + sourceOrder.order_ver,
  work_clerk: 'admin',
  work_audit: '',
  gongDanLeiXing: '',
  caiLiao: '',
  chanPinLeiXing: '',
  zhiDanShiJian: formatFullTime(new Date()),
  customer: sourceOrder.customer || '',
  customerPO: sourceOrder.customerPO || '',
  productName: sourceOrder.productName || '',
  chanPinGuiGe: '',

  // 2. 从订单过继的数值字段
  dingDanShuLiang: sourceOrder.dingDanShuLiang || 0,
  chuYangShuLiang: sourceOrder.chuYangShuLiang || 0,
  chaoBiLiShuLiang: sourceOrder.chaoBiLiShuLiang || 0,
  benChangFangSun: 0,
  chuYangRiqiRequired: sourceOrder.chuyangRiqiRequired || '',
  chuHuoRiqiRequired: sourceOrder.chuHuoRiqiRequired || '',

  // 3. 直接初始化中间物料详单的第一行（一步到位）
  intermedia: [
    {
      buJianMingCheng: '',
      yinShuaYanSe: '',
      wuLiaoMingCheng: '',
      pinPai: '',
      caiLiaoGuiGe: '',
      FSC: '',
      kaiShu: 0,
      shangJiChiCun: '',
      paiBanMuShu: 0,
      yinChuShu: 0,
      yinSun: 0,
      lingLiaoShu: 0,
      biaoMianChuLi: '',
      yinShuaBanShu: 0,
      shengChanLuJing: '',
      paiBanFangShi: '',
      kaiShiRiQi: '',
      yuQiJieShu: '',
      dangQianJinDu: 0,
    },
  ],

  // 4. 状态与日志
  workorderstatus: WorkOrderStatus.DRAFT,
  auditLogs: [],
  attachments: [],
})

// 2. 初始化 reactive
const orderData = reactive<IOrder>(createEmptyOrder() as IOrder)

// 3. 彻底重写的重置函数
const resetToDefault = () => {
  console.log('--- 🧹 正在执行全量重置 ---')
  const empty = createEmptyOrder()
  Object.assign(orderData, empty)
  // 额外手动处理一下明细数组，确保引用彻底刷新
  orderData.chanPinMingXi = [...(empty.chanPinMingXi || [])]
  orderData.attachments = []
}
watch(
  () => props.initialData,
  (newVal) => {
    if (newVal) {
      console.log('--- 🚀 开始填充数据 ---')

      // 1. 克隆数据
      const rawData = JSON.parse(JSON.stringify(newVal)) as IOrder

      // 2. 直接遍历赋值，不使用 hasOwnProperty 检查
      ;(Object.keys(rawData) as Array<keyof IOrder>).forEach((key) => {
        try {
          const k = key as keyof IOrder
          // 打印每一个字段的读取情况，方便寻找“醉酒”
          console.log(`[读取] 字段: ${String(k).padEnd(25)} | 值:`, rawData[k])
          // 直接赋值，确保 orderData 接收到数据
          ;(orderData as Record<keyof IOrder, unknown>)[k] = rawData[k]
        } catch (err) {
          console.error(`❌ 填充字段 [${key}] 失败:`, err)
        }
      })

      // 3. 处理独立字段
      salesman.value = rawData.sales || 'admin'
    } else {
      resetToDefault()
      salesman.value = 'admin'
    }
  },
  { immediate: true, deep: true },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', fd: FormData): void // 提交 FormData 给父组件
  (e: 'approve', fd: FormData): void
  (e: 'reject'): void
}>()

//提交订单
const handleSubmitOrder = async () => {
  // 基础校验
  if (!orderData.customer || !orderData.productName) {
    alert('请填写必要信息')
    return
  }

  try {
    const finalPayload = JSON.parse(JSON.stringify(orderData)) as IOrder

    console.log(
      '%c--- 📤 提交数据全字段预览 ---',
      'background: #2563eb; color: #fff; padding: 4px 8px; border-radius: 4px;',
    )

    // 打印一个表格，清晰查看所有字段
    const allKeys = Object.keys(finalPayload).sort() as Array<keyof IOrder>
    console.table(
      allKeys.map((key) => ({
        字段名: key,
        提交值: finalPayload[key],
        类型: typeof finalPayload[key],
      })),
    )
    //定义唯一索引
    orderData.order_unique = orderData.order_id + '_' + orderData.order_ver
    orderData.orderstatus = OrderStatus.PENDING_REVIEW
    // 依然在子组件完成日志初始化和数据封装，因为子组件最清楚表单结构
    addAuditLog(orderData, salesman.value)
    const fd = prepareOrderFormData(orderData, salesman.value)

    // 发射给父组件
    emit('submit', fd)
  } catch (err) {
    console.error('数据准备失败', err)
  }
}

// 审核通过或者拒绝
const handleAudit = async (isPass: boolean) => {
  if (!auditRemark.value.trim()) {
    alert('请填写审核意见')
    return
  }

  const actionText = isPass ? '通过' : '驳回'
  if (!confirm(`确定要${actionText}该订单吗？`)) return

  try {
    // 构造审核数据
    const auditPayload = {
      orderId: orderData.order_id,
      passed: isPass,
      remark: auditRemark.value,
      auditor: salesman.value, // 或者当前登录用户
    }

    // 调用后端接口（示例路径）
    // await request.post('/orders/audit', auditPayload)

    console.log('提交审核结果:', auditPayload)
    alert(`订单已${actionText}`)

    if (isPass) {
      const newWorkOrder = reactive<IWorkOrder>(createWorkOrderFromOrder(orderData) as IWorkOrder)
      orderData.orderstatus = OrderStatus.APPROVED
      addAuditLog(orderData, salesman.value)
      const fd = prepareWorkOrderForSubmit(newWorkOrder)
      emit('approve', fd)
    } else {
      emit('reject')
    }
    emit('close')
  } catch (err) {
    console.error('审核操作失败', err)
    alert('操作失败，请重试')
  }
}
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
    FSC: '',
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

// const loadOrderData = (existingOrder: IOrder) => {

//   // 1. 基础字段拷贝

//   Object.assign(orderData, existingOrder)

//   // 2. 特殊处理附件：确保旧附件能够显示

//   if (existingOrder.attachments) {

//     orderData.attachments = existingOrder.attachments.map((attr) => ({

//       ...attr,

//       // 如果是后端传来的，通常已有 url；如果是本地新加的，会有 file 对象

//       // 这里确保如果是服务器文件，url 是完整的路径

//       url: attr.url || (attr.fileName ? `/api/download/${attr.fileName}` : ''),

//     }))

//   }

//   // 3. 处理日期字符串 (input type="date" 只识别 YYYY-MM-DD)

//   const dateFields = [

//     'xiaZiliaodaiRiqiRequired',

//     'xiaZiliaodaiRiqiPromise',

//     'yinzhangRiqiRequired',

//     'yinzhangRiqiPromise',

//     'zhepaiRiqiRequired',

//     'zhepaiRiqiPromise',

//     'chuyangRiqiRequired',

//     'chuyangRiqiPromise',

//     'chuHuoRiqiRequired',

//     'chuHuoRiqiPromise',

//   ] as const

//   dateFields.forEach((field) => {

//     if (orderData[field]) {

//       // 这里的逻辑是将 Date 对象或 ISO 字符串转换为 YYYY-MM-DD

//       const dateVal = new Date(orderData[field] as any)

//       if (!isNaN(dateVal.getTime())) {

//         ;(orderData[field] as any) = dateVal.toISOString().split('T')[0]

//       }

//     }

//   })

// }

// --- 顶部按钮操作 ---

const handleSaveDraft = () => console.log('保存草稿', orderData)

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

.order-sheet-fieldset {
  border: none;
  margin: 0;
  padding: 0;
  min-width: 0; /* 解决 fieldset 在 flex 布局下的宽度溢出问题 */
  width: 100%;
  display: flex;
  justify-content: center;
}

fieldset {
  border: none; /* 去掉黑色方框 */
  margin: 0; /* 去掉外边距 */
  padding: 0; /* 去掉内边距 */
  min-width: 0; /* 修复 fieldset 在某些浏览器下溢出的 bug */
}

legend {
  padding: 0;
  display: block; /* 让标题像普通文本一样排列 */
  width: 100%;
}

/* 隐藏边框的表格容器 */
.no-border-section {
  border: none !important;
  margin-top: 10px;
}

.no-border-table {
  border: none !important;
  table-layout: fixed; /* 开启固定布局以确保 6 列等宽 */
  width: 100%;
}

/* 去掉所有单元格的边框 */
.no-border-table td {
  border: none !important;
  padding: 8px 4px;
}

/* 如果你希望 label 依然有底色背景但没框线，保留下面的；否则可以去掉背景 */
.no-border-table .label {
  background-color: #f8fafc; /* 浅灰色背景，不想要可以改为 transparent */
  text-align: right;
  font-weight: bold;
  width: 12%; /* 调整 label 宽度占比 */
}

/* 单元格内的输入框样式微调 */
.no-border-table .cell-input {
  border: 1px solid #e2e8f0; /* 给输入框保留一个浅色边框，否则用户找不到在哪填 */
  border-radius: 4px;
  background: white;
}

/* 针对那个无边框表格的基数列（第1, 3, 5列） */
.no-border-table td:nth-child(odd) {
  text-align: right; /* 文字靠右 */
  padding-right: 12px; /* 增加一点间距，别让文字贴着输入框 */
  color: #475569; /* 建议深灰色，更显专业 */
  font-weight: 600; /* 稍微加粗 */
  width: 10%; /* 根据需要调整标签列的宽度 */
}

/* 针对偶数列（第2, 4, 6列，即输入框所在列） */
.no-border-table td:nth-child(even) {
  text-align: left;
  width: 23%; /* 输入框所在列分宽一点 */
}

/* 外层容器：平分三列 */
.triple-grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 平分三等份 */
  gap: 20px; /* 三个表格之间的间距 */
  margin-top: 15px;
  padding: 10px;
}

/* 每个 2x2 组的容器 */
.mini-form-group {
  display: flex;
  flex-direction: column;
  gap: 8px; /* 行间距 */
}

/* 每一行的布局 */
.form-row {
  display: grid;
  grid-template-columns: 100px 1fr; /* 标签固定100px，输入框占满剩余 */
  align-items: center;
}

/* 左侧标签：靠右对齐 */
.label-cell {
  text-align: right;
  padding-right: 12px;
  font-size: 13px;
  color: #666;
  white-space: nowrap; /* 防止标签换行 */
}

/* 右侧输入框：靠左对齐 */
.input-cell {
  text-align: left;
}

/* 输入框基础样式 */
.cell-input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
