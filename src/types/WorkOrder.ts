export interface IWorkOrder {
  work_id: string //工程单号，order审核通过的时候自动创建,order_id+"_W"
  work_ver: string //版本号，order审核通过的时候自动创建,和order_ver相同
  work_unique: string //唯一索引，order审核通过的时候自动创建，work_id+"_"+work_ver
  work_clerk?: string //制单员名称或者工号
  work_audit?: string //工程单审核员名称或者工号
  gongDanLeiXing?: string //工单类型
  caiLiao?: string //普通材料
  chanPinLeiXing?: string //产品类型
  zhiDanShiJian?: string //制单时间
  customer?: string //客户
  customerPO?: string //客户PO
  productName?: string //成品名称
  chanPinGuiGe?: string //产品规格：似乎是页面大小

  //似乎都可以从Order.ts里直接过继过来
  dingDanShuLiang?: number //订单数量
  chuYangShuLiang?: number //出样数量
  chaoBiLiShuLiang?: number //超比例数量
  benChangFangSun?: string //本厂放损
  chuYangRiqiRequired?: string //出样日期要求
  chuHuoRiqiRequired?: string //出货日期要求
  intermedia: IIM[] //中间物料详单

  //表格上没有的
  workorderstatus: WorkOrderStatus //订单状态
  auditLogs?: IAuditLog[] // 审批日志：记录“单子是怎么过的” (用于查看审核记录), OrderState不是Audit的时候不再更新
  attachments?: IAttachment[] //创建订单时上传的附件
}

export enum WorkOrderStatus {
  TBD = '未创建',
  DRAFT = '草稿',
  PENDING_REVIEW = '待审核',
  APPROVED = '通过',
  REJECTED = '驳回',
  IN_PRODUCTION = '生产中',
  COMPLETED = '完成',
  CANCELLED = '取消',
}

//intermediate material
export interface IIM {
  buJianMingCheng?: string //部件名称
  yinShuaYanSe?: string //印刷颜色
  wuLiaoMingCheng?: string //物料名称
  pinPai?: string //品牌
  caiLiaoGuiGe?: string //材料规格
  FSC?: string //FSC
  kaiShu?: number //开数
  shangJiChiCun?: string //上机尺寸
  paiBanMuShu?: number //排版模数
  yinChuShu?: number //印出数
  yinSun?: number //印损
  lingLiaoShu?: number //领料数（张）
  biaoMianChuLi?: string //表面处理
  yinShuaBanShu?: number //印刷版数目
  shengChanLuJing?: string //生产路径
  paiBanFangShi?: string //排版方式

  //表格上没有的
  kaiShiRiQi?: string //工序开始日期
  yuQiJieShu?: string //工序预期结束日期
  dangQianJinDu?: string //工序当前进度，由技工手动输入
}

/** 附件条目接口 */
export interface IAttachment {
  category: string // 附件分类
  fileName: string // 文件名
  file?: File // 可选：用于本地上传阶段的 File 对象
  url?: string // 可选：用于查看阶段的服务器下载链接
}
//审核记录
export interface IAuditLog {
  time: string
  operator: string //业务员或者审核人，后期以工号替代
  action: string
  comment?: string
}
/**
 * 将工单数据和附件封装为 FormData 格式
 * @param rawOrder 页面上的响应式数据对象
 * @returns 准备好发送给后端的 FormData
 */

/** 统一日期处理：返回 yyyy-mm-dd */
export function formatYMD(date: Date | string | number | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** 格式化完整时间：yyyy-mm-dd HH:mm:ss */
export function formatFullTime(date: Date): string {
  const ymd = formatYMD(date)
  const hms = [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((v) => String(v).padStart(2, '0'))
    .join(':')
  return `${ymd} ${hms}`
}

// ============ 业务逻辑 ============

export function initializeAuditLog(orderData: Partial<IWorkOrder>, operatorName: string): void {
  const firstLog: IAuditLog = {
    time: formatFullTime(new Date()),
    operator: operatorName || '未知业务员',
    action: 'submit',
    comment: '业务员提交订单，发起审核流程',
  }
  orderData.auditLogs = orderData.auditLogs || []
  orderData.auditLogs.push(firstLog)
  orderData.workorderstatus = WorkOrderStatus.PENDING_REVIEW
}

/**
 * 将工单数据和附件封装为 FormData 格式（严格类型版）
 */
export const prepareWorkOrderForSubmit = (rawOrder: Partial<IWorkOrder>): FormData => {
  const formData = new FormData()

  // 1. 处理文件附件
  rawOrder.attachments?.forEach((attr) => {
    if (attr.file) {
      // 将文件加入 FormData，后端通常通过 'files' 键接收
      formData.append('files', attr.file)
    }
  })

  // 2. 深度克隆业务数据（为了不修改 UI 层的数据）
  const orderCopy = JSON.parse(JSON.stringify(rawOrder)) as IWorkOrder

  // 3. 清洗数据：移除附件中的 File 对象（因为 File 不能被序列化为 JSON）
  if (orderCopy.attachments) {
    orderCopy.attachments = orderCopy.attachments.map((attr) => ({
      category: attr.category,
      fileName: attr.fileName,
      url: attr.url, // 保留已有的 URL，去掉 file 实体
    }))
  }

  // 4. 清洗中间物料详单 (过滤掉空行)
  if (orderCopy.intermedia && Array.isArray(orderCopy.intermedia)) {
    orderCopy.intermedia = orderCopy.intermedia.filter((item: IIM): boolean => {
      const hasComponent = !!(item.buJianMingCheng && item.buJianMingCheng.trim())
      const hasMaterial = !!(item.wuLiaoMingCheng && item.wuLiaoMingCheng.trim())
      return hasComponent || hasMaterial
    })
  }

  // 5. 将清洗后的 JSON 数据塞进 FormData
  // 后端接口明确要求字段名为 'workOrderJson'
  formData.append('workOrderJson', JSON.stringify(orderCopy))

  return formData
}
