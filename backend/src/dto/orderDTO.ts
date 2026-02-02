/**
 * Order DTO - 数据传输对象
 * 定义后端返回给前端的标准数据格式
 */

// ============ 前端期望的接口定义 ============

export interface IProductDTO {
    neiWen?: string;
    yongZhiChiCun?: string;
    houDu?: number;
    keZhong?: number;
    chanDi?: string;
    pinPai?: string;
    zhiLei?: string;
    FSC?: string;
    yeShu?: number;
    yinSe?: string;
    zhuanSe?: string;
    biaoMianChuLi?: string;
    zhuangDingGongYi?: string;
    beiZhu?: string;
}

export interface IAuditLogDTO {
    time: string;
    operator: string;
    action: string;
    comment?: string;
}

export interface IAttachmentDTO {
    category: string;
    fileName: string;
    url?: string;
}

export interface IOrderDTO {
    // 必填字段
    order_id?: string;
    order_ver?: string;
    order_unique?: string;
    customer: string;
    sales: string;
    audit?: string;

    // 外销与CPSIA
    cpcQueRen?: boolean;
    waixiaoFlag?: boolean;
    cpsiaYaoqiu?: boolean;
    dingZhiBeiZhu?: string;

    // 产品基本信息
    productName?: string;
    jiuBianMa?: string;
    isbn?: string;
    customerPO?: string;
    baoJiaDanHao?: string;
    xiLieDanMing?: string;
    qiTaShiBie?: string;
    chanPinDaLei?: string;
    ziLeiXing?: string;
    fscType?: string;
    fenBanShuoMing?: string;
    baoLiuQianSe?: string;

    // 订单数量及产品规格
    dingDanShuLiang?: number;
    chuYangShuLiang?: number;
    chaoBiLiShuLiang?: number;
    teShuLiuYangZhang?: number;
    beiPinShuLiang?: number;
    teShuLiuShuYang?: number;
    zongShuLiang?: number;
    chuYangShuoMing?: number;
    zhuangDingFangShi?: string;
    guigeGaoMm?: number;
    guigeKuanMm?: number;
    guigeHouMm?: number;
    genSeZhiShi?: string;

    // 排期信息
    xiaZiliaodaiRiqiRequired?: string;
    xiaZiliaodaiRiqiPromise?: string;
    yinzhangRiqiRequired?: string;
    yinzhangRiqiPromise?: string;
    zhepaiRiqiRequired?: string;
    zhepaiRiqiPromise?: string;
    chuyangRiqiRequired?: string;
    chuyangRiqiPromise?: string;
    chuHuoShuLiang?: number;
    chuHuoRiqiRequired?: string;
    chuHuoRiqiPromise?: string;
    yongTu?: string;
    keLaiXinxi?: string;

    // 产品明细
    chanPinMingXi?: IProductDTO[];

    // 工艺说明
    fuLiaoShuoMing?: string;
    chanPinMingXiTeBieShuoMing?: string;
    fenBanShuoMing2?: string;
    wuLiaoShuoMing?: string;
    yinShuaGenSeYaoQiu?: string;
    zhuangDingShouGongYaoQiu?: string;
    qiTa?: string;
    zhiLiangYaoQiu?: string;
    keHuFanKui?: string;
    teShuYaoQiu?: string;
    kongZhiFangFa?: string;
    dingDanTeBieShuoMing?: string;
    yangPinPingShenXinXi?: string;
    dingDanPingShenXinXi?: string;

    // 签字流程
    yeWuDaiBiaoFenJi?: string;
    yeWuRiqi?: string;
    shenHeRen?: string;
    shenHeRiqi?: string;
    daYinRen?: string;
    daYinRiqi?: string;

    // 订单状态
    orderstatus: string;

    // 审批日志与附件
    auditLogs?: IAuditLogDTO[];
    attachments?: IAttachmentDTO[];
}

// ============ 转换函数 ============

/**
 * 格式化日期为 yyyy-mm-dd 字符串
 */
function formatDate(date: Date | string | null | undefined): string | undefined {
    if (!date) return undefined;
    const d = new Date(date);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString().split('T')[0];
}

/**
 * 格式化完整时间为 yyyy-mm-dd HH:mm:ss 字符串
 */
function formatFullTime(date: Date | string | null | undefined): string | undefined {
    if (!date) return undefined;
    const d = new Date(date);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString().replace('T', ' ').slice(0, 19);
}

/**
 * 将 OrderItem (后端 Prisma 模型) 转换为 IProductDTO
 */
function orderItemToProductDTO(item: any): IProductDTO {
    return {
        neiWen: item.neiWen || undefined,
        yongZhiChiCun: item.yongZhiChiCun || undefined,
        houDu: item.houDu ? parseFloat(item.houDu) : undefined,
        keZhong: item.keZhong || undefined,
        chanDi: item.chanDi || undefined,
        pinPai: item.pinPai || undefined,
        zhiLei: item.zhiLei || undefined,
        FSC: item.FSC || undefined,
        yeShu: item.yeShu || undefined,
        yinSe: item.yinSe || undefined,
        zhuanSe: item.zhuanSe || undefined,
        biaoMianChuLi: item.biaoMianChuLi || undefined,
        zhuangDingGongYi: item.zhuangDingGongYi || undefined,
        beiZhu: item.beiZhu || undefined,
    };
}

/**
 * 将 Document (后端 Prisma 模型) 转换为 IAttachmentDTO
 */
function documentToAttachmentDTO(doc: any): IAttachmentDTO {
    return {
        category: doc.category,
        fileName: doc.fileName,
        url: doc.fileUrl || undefined,
    };
}

/**
 * 将 AuditLog (后端 MongoDB 模型) 转换为 IAuditLogDTO
 */
function auditLogToDTO(log: any): IAuditLogDTO {
    return {
        time: formatFullTime(log.time) || '',
        operator: log.userId || 'SYSTEM',
        action: log.action,
        comment: log.actionDescription || undefined,
    };
}

/**
 * 后端订单状态到前端枚举映射（英文 -> 中文）
 */
const statusMap: Record<string, string> = {
    'DRAFT': '草稿',
    'PENDING_REVIEW': '待审核',
    'IN_REVIEW': '审核中',
    'APPROVED': '通过',
    'REJECTED': '驳回',
    'IN_PRODUCTION': '生产中',
    'COMPLETED': '完成',
    'CANCELLED': '取消',
};

/**
 * 前端订单状态到后端枚举映射（中文 -> 英文）
 */
export const statusMapReverse: Record<string, string> = {
    '草稿': 'DRAFT',
    '待审核': 'PENDING_REVIEW',
    '审核中': 'IN_REVIEW',
    '通过': 'APPROVED',
    '驳回': 'REJECTED',
    '生产中': 'IN_PRODUCTION',
    '完成': 'COMPLETED',
    '取消': 'CANCELLED',
};

/**
 * 将前端中文状态转换为后端英文枚举
 * @param orderStatusText 前端中文状态（如 '草稿', '待审核'）
 * @returns 后端英文枚举（如 'DRAFT', 'PENDING_REVIEW'），如果未找到则返回 undefined
 */
export function orderStatusToDb(orderStatusText: string | undefined): string | undefined {
    if (!orderStatusText) return undefined;
    return statusMapReverse[orderStatusText];
}

/**
 * 将后端英文枚举转换为前端中文状态
 * @param dbStatus 后端英文枚举（如 'DRAFT', 'PENDING_REVIEW'）
 * @returns 前端中文状态（如 '草稿', '待审核'），如果未找到则返回原值
 */
export function dbStatusToOrderStatus(dbStatus: string | undefined): string | undefined {
    if (!dbStatus) return undefined;
    return statusMap[dbStatus] || dbStatus;
}

/**
 * 核心转换函数：将 Prisma Order 模型转换为前端 IOrderDTO
 */
export function orderToDTO(order: any, auditLogs?: any[]): IOrderDTO {
    if (!order) return null as any;

    return {
        // 必填字段 - 字段名映射
        order_id: order.orderNumber,
        order_ver: order.orderVer || 'V1',
        order_unique: order.orderUnique || `${order.orderNumber}_V1`,
        customer: order.customer || '',
        sales: order.sales || order.yeWuDaiBiaoFenJi || '',
        audit: order.audit || undefined,

        // 外销与CPSIA
        cpcQueRen: order.cpcQueRen || undefined,
        waixiaoFlag: order.waixiaoFlag || undefined,
        cpsiaYaoqiu: order.cpsiaYaoqiu ? true : undefined,
        dingZhiBeiZhu: order.dingZhiBeiZhu || undefined,

        // 产品基本信息
        productName: order.productName || undefined,
        jiuBianMa: order.jiuBianMa || undefined,
        isbn: order.isbn || undefined,
        customerPO: order.customerPO || undefined,
        baoJiaDanHao: order.baoJiaDanHao || undefined,
        xiLieDanMing: order.xiLieDanMing || undefined,
        qiTaShiBie: order.qiTaShiBie || undefined,
        chanPinDaLei: order.chanPinDaLei || undefined,
        ziLeiXing: order.ziLeiXing || undefined,
        fscType: order.fscType || undefined,
        fenBanShuoMing: order.fenBanShuoMing || undefined,
        baoLiuQianSe: order.baoLiuQianSe || undefined,

        // 订单数量及产品规格
        dingDanShuLiang: order.dingDanShuLiang || undefined,
        chuYangShuLiang: order.chuYangShuLiang || undefined,
        chaoBiLiShuLiang: order.chaoBiLiShuLiang || undefined,
        teShuLiuYangZhang: order.teShuLiuYangZhang || undefined,
        beiPinShuLiang: order.beiPinShuLiang || undefined,
        teShuLiuShuYang: order.teShuLiuShuYang || undefined,
        zongShuLiang: order.zongShuLiang || undefined,
        zhuangDingFangShi: order.zhuangDingFangShi || undefined,
        guigeGaoMm: order.guigeGaoMm || undefined,
        guigeKuanMm: order.guigeKuanMm || undefined,
        guigeHouMm: order.guigeHouMm || undefined,
        genSeZhiShi: order.genSeZhiShi || undefined,

        // 排期信息 - Date 转 string
        xiaZiliaodaiRiqiRequired: formatDate(order.xiaZiliaodaiRiqiRequired),
        xiaZiliaodaiRiqiPromise: formatDate(order.xiaZiliaodaiRiqiPromise),
        yinzhangRiqiRequired: formatDate(order.yinzhangRiqiRequired),
        yinzhangRiqiPromise: formatDate(order.yinzhangRiqiPromise),
        zhepaiRiqiRequired: formatDate(order.zhepaiRiqiRequired),
        zhepaiRiqiPromise: formatDate(order.zhepaiRiqiPromise),
        chuyangRiqiRequired: formatDate(order.chuyangRiqiRequired),
        chuyangRiqiPromise: formatDate(order.chuyangRiqiPromise),
        chuHuoShuLiang: order.chuHuoShuLiang || undefined,
        chuHuoRiqiRequired: formatDate(order.chuHuoRiqiRequired),
        chuHuoRiqiPromise: formatDate(order.chuHuoRiqiPromise),
        yongTu: order.yongTu || undefined,
        keLaiXinxi: order.keLaiXinXi || undefined,

        // 产品明细 - orderItems -> chanPinMingXi
        chanPinMingXi: order.orderItems?.map(orderItemToProductDTO) || [],

        // 工艺说明
        fuLiaoShuoMing: order.fuLiaoShuoMing || undefined,
        chanPinMingXiTeBieShuoMing: order.chanPinMingXiTeBieShuoMing || undefined,
        fenBanShuoMing2: order.fenBanShuoMing2 || undefined,
        wuLiaoShuoMing: order.wuLiaoShuoMing || undefined,
        yinShuaGenSeYaoQiu: order.yinShuaGenSeYaoQiu || undefined,
        zhuangDingShouGongYaoQiu: order.zhuangDingShouGongYaoQiu || undefined,
        qiTa: order.qiTa || undefined,
        zhiLiangYaoQiu: order.zhiLiangYaoQiu || undefined,
        keHuFanKui: order.keHuFanKui || undefined,
        teShuYaoQiu: order.teShuYaoQiu || undefined,
        kongZhiFangFa: order.kongZhiFangFa || undefined,
        dingDanTeBieShuoMing: order.dingDanTeBieShuoMing || undefined,
        yangPinPingShenXinXi: order.yangPinPingShenXinXi || undefined,
        dingDanPingShenXinXi: order.dingDanPingShenXinXi || undefined,

        // 签字流程
        yeWuDaiBiaoFenJi: order.yeWuDaiBiaoFenJi || undefined,
        yeWuRiqi: formatDate(order.yeWuRiqi),
        shenHeRen: order.shenHeRen || undefined,
        shenHeRiqi: formatDate(order.shenHeRiqi),
        daYinRen: order.daYinRen || undefined,
        daYinRiqi: formatDate(order.daYinRiqi),

        // 订单状态 - 转换为前端枚举值
        orderstatus: dbStatusToOrderStatus(order.status) || order.status,

        // 审批日志
        auditLogs: auditLogs?.map(auditLogToDTO) || [],

        // 附件
        attachments: order.documents?.map(documentToAttachmentDTO) || [],
    };
}

/**
 * 批量转换订单列表
 */
export function ordersToDTO(orders: any[]): IOrderDTO[] {
    return orders.map(order => orderToDTO(order));
}

/**
 * 将前端 DTO 转换为后端数据库格式（用于创建/更新订单）
 * 主要处理字段名映射和状态转换
 * @param dto 前端传入的 IOrderDTO
 * @returns 后端数据库格式的数据对象
 */
export function dtoToOrder(dto: Partial<IOrderDTO>): any {
    const result: any = { ...dto };

    // 1. 字段名映射：前端 order_id -> 后端 orderNumber
    if (dto.order_id) {
        result.orderNumber = dto.order_id;
        delete result.order_id;
    }

    // 2. 字段名映射：前端 order_ver -> 后端 orderVer
    if (dto.order_ver) {
        result.orderVer = dto.order_ver;
        delete result.order_ver;
    }

    // 3. 字段名映射：前端 order_unique -> 后端 orderUnique
    if (dto.order_unique) {
        result.orderUnique = dto.order_unique;
        delete result.order_unique;
    }

    // 4. 状态转换：前端 orderstatus（中文）-> 后端 status（英文枚举）
    if (dto.orderstatus) {
        const dbStatus = orderStatusToDb(dto.orderstatus);
        if (dbStatus) {
            result.status = dbStatus;
        }
        // 删除前端的 orderstatus 字段，因为后端模型中没有这个字段
        delete result.orderstatus;
    }

    // 5. 产品明细字段名映射：前端 chanPinMingXi -> 后端 orderItems
    if (dto.chanPinMingXi) {
        result.orderItems = dto.chanPinMingXi;
        delete result.chanPinMingXi;
    }

    // 6. 附件字段名映射：前端 attachments -> 后端 documents（如果需要）
    // 注意：附件通常在文件上传时单独处理，这里保留原字段名

    return result;
}
