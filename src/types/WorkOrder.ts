export interface IWorkOrder {
  work_id: string //工程单号
  work_ver: string //版本号
  gongDanLeiXing?: string //工单类型
  caiLiao?: string //普通材料
  chanPinLeiXing?: string //产品类型
  zhiDanShiJian?: Date //制单时间
  customer?: string //客户
  customerPO?: string //客户PO
  productName?: string //成品名称
  chanPinGuiGe?: string //产品规格：似乎是页面大小

  //似乎都可以从Order.ts里直接过继过来
  dingDanShuLiang?: number //订单数量
  chuYangShuLiang?: number //出样数量
  chaoBiLiShuLiang?: number //超比例数量
  benChangFangSun?: string //本厂放损
  chuYangRiqiRequired?: Date //出样日期要求
  chuHuoRiqiRequired?: Date //出货日期要求
  orderStatus: OrderStatus
  intermedia: IIM[] //中间物料详单

  attachments?: IAttachment[] //创建订单时上传的附件
}

export enum OrderStatus {
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
}

/** 附件条目接口 */
export interface IAttachment {
  category: string // 附件分类
  fileName: string // 文件名
  file?: File // 可选：用于本地上传阶段的 File 对象
  url?: string // 可选：用于查看阶段的服务器下载链接
}

/**
 * 将工单数据和附件封装为 FormData 格式
 * @param rawOrder 页面上的响应式数据对象
 * @returns 准备好发送给后端的 FormData
 */

/**
 * 将工单数据和附件封装为 FormData 格式（严格类型版）
 */
export const prepareWorkOrderForSubmit = (rawOrder: Partial<IWorkOrder>): FormData => {
  const formData = new FormData()

  // 1. 深度克隆数据（JSON 序列化会丢失 File 对象，但 rawOrder.attachments 我们稍后单独处理）
  const orderCopy = JSON.parse(JSON.stringify(rawOrder)) as IWorkOrder

  // 2. 清洗中间物料详单 (IIM) - 移除 any
  if (orderCopy.intermedia && Array.isArray(orderCopy.intermedia)) {
    orderCopy.intermedia = orderCopy.intermedia.filter((item: IIM): boolean => {
      // 检查必填字段是否有值（trim 处理字符串，并确保字段存在）
      const hasComponent = !!(item.buJianMingCheng && item.buJianMingCheng.trim())
      const hasMaterial = !!(item.wuLiaoMingCheng && item.wuLiaoMingCheng.trim())
      return hasComponent || hasMaterial
    })
  }

  // 3. 构建 JSON 数据负载
  // 附件 File 对象不能被 JSON.stringify，所以从对象中剔除
  const { attachments, ...restData } = orderCopy
  formData.append('workOrderJson', JSON.stringify(restData))

  // 4. 处理附件 (从原始的 rawOrder 中提取 File 对象)
  // 因为 JSON.parse(JSON.stringify()) 会把 File 变成空对象，所以必须从 rawOrder 取
  if (rawOrder.attachments && rawOrder.attachments.length > 0) {
    rawOrder.attachments.forEach((attr) => {
      if (attr.file instanceof File) {
        // 后端接收文件的字段名通常为 'files'
        formData.append('files', attr.file)
        // 传递对应的分类信息
        formData.append('categories', attr.category)
      }
    })
  }

  return formData
}
