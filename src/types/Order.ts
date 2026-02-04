export interface IOrder {
  // 必填字段
  order_id?: string //订单号
  order_ver?: string //订单版本
  order_unique?: string //唯一索引，在提交order报审核的时候创建，是order_id+"_"+order_ver.
  customer: string // 客户名称: 创建草稿时唯一需要明确的，这样就可以开始保存草稿了
  sales: string //业务员名称或者工号
  salesDate?: string //订单提交日期
  audit?: string //审单员名称或者工号
  auditDate?: string //订单过审日期
  // 外销与CPSIA
  cpcQueRen?: boolean //cpc确认
  waixiaoFlag?: boolean //是否外销
  cpsiaYaoqiu?: boolean //cpsia要求
  dingZhiBeiZhu?: string //订纸备注

  // 产品基本信息,分类及安全要求
  productName?: string //成品名称
  jiuBianMa?: string //旧编码
  isbn?: string //ISBN
  customerPO?: string //客户PO？
  baoJiaDanHao?: string //报价单号
  xiLieDanMing?: string //系列单名
  qiTaShiBie?: string //其他识别
  chanPinDaLei?: string //产品大类
  ziLeiXing?: string //子类型
  fscType?: string //FSC类型
  fenBanShuoMing?: string //分版说明
  baoLiuQianSe?: string //是否要保留签色

  // 订单数量及产品规格
  dingDanShuLiang?: number //订单数量
  chuYangShuLiang?: number //出样数量
  chaoBiLiShuLiang?: number //超比例数量
  teShuLiuYangZhang?: number //特殊留样张
  beiPinShuLiang?: number //备品数量
  teShuLiuShuYang?: number //特殊留书样
  zongShuLiang?: number //总数量
  chuYangShuoMing?: number //出样说明
  zhuangDingFangShi?: string //装订方式
  guigeGaoMm?: number //规格：高
  guigeKuanMm?: number //规格:宽
  guigeHouMm?: number //规格：厚
  genSeZhiShi?: string //跟色指示

  // 排期信息和其他
  xiaZiliaodaiRiqiRequired?: string //下资料袋要求
  xiaZiliaodaiRiqiPromise?: string //下资料袋承诺
  yinzhangRiqiRequired?: string //印章日期要求
  yinzhangRiqiPromise?: string //印章日期承诺
  zhepaiRiqiRequired?: string //折牌日期要求
  zhepaiRiqiPromise?: string //折牌日期承诺
  chuyangRiqiRequired?: string //出样日期要求
  chuyangRiqiPromise?: string //出样日期承诺
  chuHuoShuLiang?: number //出货数量
  chuHuoRiqiRequired?: string //出货日期要求
  chuHuoRiqiPromise?: string //出货日期承诺
  yongTu?: string //用途
  keLaiXinxi?: string //客来信息

  //产品明细
  chanPinMingXi?: IProduct[] //产品明细
  fuLiaoShuoMing?: string //辅料说明
  chanPinMingXiTeBieShuoMing?: string //产品明细特别说明
  fenBanShuoMing2?: string //分版说明
  wuLiaoShuoMing?: string //物料说明
  yinShuaGenSeYaoQiu?: string //印刷和跟色要求
  zhuangDingShouGongYaoQiu?: string //装订/手工
  qiTa?: string //其他
  zhiLiangYaoQiu?: string //质量要求
  keHuFanKui?: string //客户反馈
  teShuYaoQiu?: string //特殊要求
  kongZhiFangFa?: string //控制方法
  dingDanTeBieShuoMing?: string //订单特别说明
  yangPinPingShenXinXi?: string //样品评审信息
  dingDanPingShenXinXi?: string //订单评审信息

  yeWuDaiBiaoFenJi?: string //业务代表/分机
  yeWuRiqi?: string //业务日期
  shenHeRen?: string //审核人
  shenHeRiqi?: string //审核日期
  daYinRen?: string //打印人
  daYinRiqi?: string //打印日期

  //表格上没有的
  orderstatus: OrderStatus //订单状态
  auditLogs?: IAuditLog[] // 审批日志：记录“单子是怎么过的” (用于查看审核记录), OrderState不是Audit的时候不再更新
  attachments?: IAttachment[] //创建订单时上传的附件
}

//审核记录
export interface IAuditLog {
  time: string
  operator: string //业务员或者审核人，后期以工号替代
  action: string
  comment?: string
}

// ============ 订单状态枚举 ============
export enum OrderStatus {
  DRAFT = '草稿',
  PENDING_REVIEW = '待审核',
  APPROVED = '通过',
  REJECTED = '驳回',
  IN_PRODUCTION = '生产中',
  COMPLETED = '完成',
  CANCELLED = '取消',
}

/** 附件条目接口 */
export interface IAttachment {
  category: string // 附件分类
  fileName: string // 文件名
  file?: File // 可选：用于本地上传阶段的 File 对象
  url?: string // 可选：用于查看阶段的服务器下载链接
}

export interface IProduct {
  neiWen?: string //内文
  yongZhiChiCun?: string //报价用纸尺寸
  houDu?: number //厚度
  keZhong?: number //克重
  chanDi?: string //产地
  pinPai?: string //品牌
  zhiLei?: string //纸类
  FSC?: string //fsc
  yeShu?: number //页数
  yinSe?: string //印色(正/反)
  zhuanSe?: string //专色(正/反)
  biaoMianChuLi?: string //表面处理
  zhuangDingGongYi?: string //装订工艺
  beiZhu?: string //备注
}
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

export function initializeAuditLog(orderData: Partial<IOrder>, operatorName: string): void {
  const firstLog: IAuditLog = {
    time: formatFullTime(new Date()),
    operator: operatorName || '未知业务员',
    action: 'submit',
    comment: '业务员提交订单，发起审核流程',
  }
  orderData.auditLogs = orderData.auditLogs || []
  orderData.auditLogs.push(firstLog)
  orderData.orderstatus = OrderStatus.PENDING_REVIEW
}

export function prepareOrderFormData(orderData: Partial<IOrder>, salesmanName: string): FormData {
  const formData = new FormData()
  orderData.salesDate = formatYMD(new Date())
  // 1. 附件二进制
  orderData.attachments?.forEach((attr) => {
    if (attr.file) formData.append('files', attr.file)
  })

  // 2. 深度清洗 (不影响原数据)
  const cleanedPayload = JSON.parse(JSON.stringify(orderData)) as IOrder

  // 3. 日期字段白名单统一清洗
  const dateFieldKeys: (keyof IOrder)[] = [
    'xiaZiliaodaiRiqiRequired',
    'xiaZiliaodaiRiqiPromise',
    'yinzhangRiqiRequired',
    'yinzhangRiqiPromise',
    'zhepaiRiqiRequired',
    'zhepaiRiqiPromise',
    'chuyangRiqiRequired',
    'chuyangRiqiPromise',
    'chuHuoRiqiRequired',
    'chuHuoRiqiPromise',
    'yeWuRiqi',
    'shenHeRiqi',
    'daYinRiqi',
  ]

  dateFieldKeys.forEach((key) => {
    const value = cleanedPayload[key]
    if (value) {
      // 使用类型断言强制认定这个 key 对应的是 string 或 undefined
      Object.assign(cleanedPayload, { [key]: formatYMD(value as string | Date) })
    }
  })

  // 4. 附件元数据脱钩
  if (orderData.attachments) {
    cleanedPayload.attachments = orderData.attachments.map((attr) => ({
      category: attr.category,
      fileName: attr.fileName,
    }))
  }

  formData.append('orderData', JSON.stringify(cleanedPayload))
  formData.append('salesman', salesmanName)
  return formData
}
