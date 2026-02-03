/**
 * WorkOrder DTO - 数据传输对象
 * 定义后端返回给前端的标准数据格式
 */

// ============ 前端期望的接口定义 ============

export interface IIMDTO {
    buJianMingCheng?: string;
    yinShuaYanSe?: string;
    wuLiaoMingCheng?: string;
    pinPai?: string;
    caiLiaoGuiGe?: string;
    FSC?: string;
    kaiShu?: number;
    shangJiChiCun?: string;
    paiBanMuShu?: number;
    yinChuShu?: number;
    yinSun?: number;
    lingLiaoShu?: number;
    biaoMianChuLi?: string;
    yinShuaBanShu?: number;
    shengChanLuJing?: string;
    paiBanFangShi?: string;
    kaiShiRiQi?: string;
    yuQiJieShu?: string;
    dangQianJinDu?: string;
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

export interface IWorkOrderDTO {
    // 必填字段
    work_id: string;
    work_ver: string;
    work_unique: string;
    work_clerk?: string;
    clerkDate?: string;
    work_audit?: string;
    auditDate?: string;

    // 基本信息
    gongDanLeiXing?: string;
    caiLiao?: string;
    chanPinLeiXing?: string;
    zhiDanShiJian?: string;
    customer?: string;
    customerPO?: string;
    productName?: string;
    chanPinGuiGe?: string;

    // 订单过继信息
    dingDanShuLiang?: number;
    chuYangShuLiang?: number;
    chaoBiLiShuLiang?: number;
    benChangFangSun?: string;
    chuYangRiqiRequired?: string;
    chuHuoRiqiRequired?: string;

    // 中间物料详单
    intermedia: IIMDTO[];

    // 状态
    workorderstatus: string;

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
 * 将 MaterialLine (后端 Prisma 模型) 转换为 IIMDTO
 */
function materialLineToIMDTO(line: any): IIMDTO {
    return {
        buJianMingCheng: line.buJianMingCheng || undefined,
        yinShuaYanSe: line.yinShuaYanSe || undefined,
        wuLiaoMingCheng: line.wuLiaoMiaoShu || undefined, // 后端字段名是 wuLiaoMiaoShu
        pinPai: line.pinPai || undefined,
        caiLiaoGuiGe: line.caiLiaoGuiGe || undefined,
        FSC: line.fsc || undefined,
        kaiShu: line.kaiShu || undefined,
        shangJiChiCun: line.shangJiChiCun || undefined,
        paiBanMuShu: line.paiBanMoSu || undefined, // 后端字段名是 paiBanMoSu
        yinChuShu: line.yinChuShu ? parseFloat(line.yinChuShu) : undefined,
        yinSun: line.yinSun || undefined,
        lingLiaoShu: line.lingLiaoShuZhang ? parseFloat(line.lingLiaoShuZhang) : undefined,
        biaoMianChuLi: line.biaoMianChuLi || undefined,
        yinShuaBanShu: line.yinShuaBanShu || undefined,
        shengChanLuJing: line.shengChanLuJing || undefined,
        paiBanFangShi: line.paiBanFangShi || undefined,
        kaiShiRiQi: formatDate(line.kaiShiShiJian),
        yuQiJieShu: formatDate(line.jieShuShiJian),
        dangQianJinDu: undefined, // 暂无对应字段
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
 * 数据库枚举与前端枚举完全一致，不需要转换！
 * 
 * 前端 WorkOrderStatus 枚举 = 数据库 ReviewResult 枚举：
 * - DRAFT = '草稿'
 * - PENDING_REVIEW = '待审核'
 * - APPROVED = '通过'
 * - REJECTED = '驳回'
 * - IN_PRODUCTION = '生产中'
 * - COMPLETED = '完成'
 * - CANCELLED = '取消'
 */

/**
 * 核心转换函数：将 Prisma EngineeringOrder 模型转换为前端 IWorkOrderDTO
 */
export function workOrderToDTO(workOrder: any, auditLogs?: any[]): IWorkOrderDTO {
    if (!workOrder) return null as any;

    return {
        // 必填字段 - 字段名映射
        work_id: workOrder.workId || workOrder.engineeringOrderId,
        work_ver: workOrder.workVer || 'V1',
        work_unique: workOrder.workUnique || `${workOrder.workId}_V1`,
        work_clerk: workOrder.workClerk || undefined,
        clerkDate: workOrder.clerkDate || undefined,
        work_audit: workOrder.workAudit || undefined,
        auditDate: workOrder.auditDate || undefined,

        // 基本信息
        gongDanLeiXing: workOrder.gongDanLeiXing || undefined,
        caiLiao: workOrder.caiLiao || undefined,
        chanPinLeiXing: workOrder.chanPinLeiXing || undefined,
        zhiDanShiJian: formatFullTime(workOrder.zhiDanShiJian),
        customer: workOrder.keHu || undefined,
        customerPO: workOrder.po || undefined,
        productName: workOrder.chengPinMingCheng || undefined,
        chanPinGuiGe: workOrder.chanPinGuiGe || undefined,

        // 订单过继信息
        dingDanShuLiang: workOrder.dingDanShuLiang || undefined,
        chuYangShuLiang: workOrder.chuYangShu || undefined,
        chaoBiLiShuLiang: workOrder.chaoBiLi || undefined,
        benChangFangSun: workOrder.benChangFangSun?.toString() || undefined,
        chuYangRiqiRequired: formatDate(workOrder.chuYangRiqi),
        chuHuoRiqiRequired: formatDate(workOrder.chuHuoRiqi),

        // 中间物料详单 - materialLines -> intermedia
        intermedia: workOrder.materialLines?.map(materialLineToIMDTO) || [],

        // 状态 - 数据库和前端枚举一致，直接使用
        workorderstatus: workOrder.reviewStatus || '待审核',

        // 审批日志
        auditLogs: auditLogs?.map(auditLogToDTO) || [],

        // 附件
        attachments: workOrder.documents?.map(documentToAttachmentDTO) || [],
    };
}

/**
 * 批量转换工程单列表
 */
export function workOrdersToDTO(workOrders: any[]): IWorkOrderDTO[] {
    return workOrders.map(wo => workOrderToDTO(wo));
}
