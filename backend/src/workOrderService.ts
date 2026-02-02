import { sqlDB } from './db';
import { workOrderToDTO, workOrdersToDTO } from './dto/workOrderDTO';

/**
 * 状态映射：将前端中文状态映射为后端 ReviewResult 枚举
 * EngineeringOrder.reviewStatus 使用的是 ReviewResult(PENDING/APPROVED/REJECTED/NEEDS_REVISION)
 */
const statusMap: Record<string, string> = {
    '草稿': 'PENDING',
    '待审核': 'PENDING',
    '通过': 'APPROVED',
    '驳回': 'REJECTED',
    '需修改': 'NEEDS_REVISION',
    // 下面几种业务状态目前也先归并到审核结果枚举里，避免写入非法值导致 400
    '生产中': 'APPROVED',
    '完成': 'APPROVED',
    '取消': 'REJECTED'
};

export async function handleIncomingWorkOrder(jsonString: string, files?: any[]) {
    try {
        const rawData = JSON.parse(jsonString);
        return await createWorkOrderFromFrontend(rawData, files);
    } catch (error) {
        console.error('WorkOrder processing failed:', error);
        throw error;
    }
}

async function createWorkOrderFromFrontend(data: any, files?: any[]) {
    // 兼容前端字段：workorderstatus / orderStatus / reviewStatus 都可能出现
    const {
        intermedia,
        attachments,

        // --- 关键：与 IWorkOrder 对齐的字段命名 ---
        work_id,
        work_ver,
        work_unique,
        work_clerk,
        work_audit,
        zhiDanYuan,
        workClerk,

        orderStatus,
        workorderstatus,
        reviewStatus,

        // 与数据库字段需要手动映射的前端字段
        gongDanLeiXing,
        caiLiao,
        chanPinLeiXing,
        zhiDanShiJian,
        customer,
        customerPO,
        productName,
        chanPinGuiGe,
        dingDanShuLiang,
        chuYangShuLiang,
        chaoBiLiShuLiang,
        benChangFangSun,
        chuYangRiqiRequired,
        chuHuoRiqiRequired,
        // 其余字段先忽略，后面有需要再扩展
        ...rest
    } = data;

    // === 工程单号生成逻辑，与 IWorkOrder 注释对齐 ===
    // IWorkOrder:
    //   work_id: 工程单号，order 审核通过的时候自动创建, order_id + "_W"
    //   work_ver: 版本号，和 order_ver 相同
    //   work_unique: 唯一索引，work_id + "_" + work_ver
    //
    // 当前页面创建工程单时前端还没传 work_id/work_ver，这里做一个兜底生成：
    //   - 如果前端已有 work_id / work_ver / work_unique，则直接使用
    //   - 否则自动生成一个独立的工程单号，不依赖订单：
    //     WORK-YYYYMMDDHHmmss-xxx  +  版本 V1  +  唯一索引 `${workId}_V1`
    let workId = work_id as string | undefined;
    let workVer = work_ver as string | undefined;
    let workUnique = work_unique as string | undefined;

    if (!workId || !workId.trim()) {
        const ts = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
        const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        workId = `WORK-${ts}-${rand}`;
    }

    if (!workVer || !workVer.trim()) {
        workVer = 'V1';
    }

    if (!workUnique || !workUnique.trim()) {
        workUnique = `${workId}_${workVer}`;
    }

    return await sqlDB.engineeringOrder.create({
        data: {
            // 与接口定义对齐的关键字段
            workId,
            workVer,
            workUnique,

            workClerk: workClerk || work_clerk || zhiDanYuan,
            workAudit: work_audit || null,

            // 表头信息
            gongDanLeiXing,
            caiLiao,
            chanPinLeiXing,
            zhiDanShiJian: zhiDanShiJian ? new Date(zhiDanShiJian) : null,

            // 订单信息备份映射到数据库字段
            keHu: customer,
            po: customerPO,
            chengPinMingCheng: productName,
            chanPinGuiGe,
            dingDanShuLiang,
            chuYangShu: chuYangShuLiang,
            chaoBiLi: chaoBiLiShuLiang,
            benChangFangSun: benChangFangSun,
            chuYangRiqi: chuYangRiqiRequired ? new Date(chuYangRiqiRequired) : null,
            chuHuoRiqi: chuHuoRiqiRequired ? new Date(chuHuoRiqiRequired) : null,

            // 让工单能被 FindWorkOrdersByClerk(clerkName) 查到，同时保留制单人
            zhiDan: zhiDanYuan,

            // 审批状态映射
            reviewStatus: statusMap[reviewStatus || workorderstatus || orderStatus] || 'PENDING',

            // 中间物料行
            materialLines: {
                create: intermedia?.map((item: any, idx: number) => ({
                    lineNo: idx + 1,
                    buJianMingCheng: item.buJianMingCheng,
                    yinShuaYanSe: item.yinShuaYanSe,
                    wuLiaoMiaoShu: item.wuLiaoMingCheng,
                    pinPai: item.pinPai,
                    caiLiaoGuiGe: item.caiLiaoGuiGe,
                    fsc: item.FSC,
                    kaiShu: item.kaiShu,
                    shangJiChiCun: item.shangJiChiCun,
                    paiBanMoSu: item.paiBanMuShu,
                    yinChuShu: item.yinChuShu,
                    yinSun: item.yinSun,
                    lingLiaoShuZhang: item.lingLiaoShu,
                    biaoMianChuLi: item.biaoMianChuLi,
                    yinShuaBanShu: item.yinShuaBanShu,
                    shengChanLuJing: item.shengChanLuJing,
                    paiBanFangShi: item.paiBanFangShi
                }))
            },

            // 附件
            documents: {
                create: files?.map((f, idx) => ({
                    category: 'WorkOrderAttachment',
                    fileName: f.originalname || 'unknown',
                    fileUrl: `/uploads/${f.filename}`
                }))
            }
        }
    });
}

export async function getWorkOrder(id: string) {
    const workOrder = await sqlDB.engineeringOrder.findUnique({
        where: { engineeringOrderId: id },
        include: { materialLines: true, documents: true }
    });

    if (!workOrder) return null;

    return workOrderToDTO(workOrder);
}

// ============ New Interface Search Functions ============

export async function FindWorkOrdersByClerk(clerkName: string) {
    const workOrders = await sqlDB.engineeringOrder.findMany({
        where: { workClerk: clerkName },
        include: { materialLines: true, documents: true }
    });
    return workOrdersToDTO(workOrders);
}

export async function FindWorkOrdersByAudit(auditName: string) {
    const workOrders = await sqlDB.engineeringOrder.findMany({
        where: { workAudit: auditName },
        include: { materialLines: true, documents: true }
    });
    return workOrdersToDTO(workOrders);
}

export async function FindWorkOrderByID(uniqueId: string) {
    const workOrder = await sqlDB.engineeringOrder.findUnique({
        where: { workUnique: uniqueId },
        include: { materialLines: true, documents: true }
    });

    if (!workOrder) return null;

    return workOrderToDTO(workOrder);
}

export async function FindPendingWorkOrders() {
    const workOrders = await sqlDB.engineeringOrder.findMany({
        where: {
            reviewStatus: 'PENDING'
        },
        include: { materialLines: true, documents: true }
    });
    return workOrdersToDTO(workOrders);
}

// 更新工程单状态（根据唯一索引 workUnique）
export async function UpdateWorkOrderStatus(workUnique: string, statusText: string) {
    const reviewStatus = statusMap[statusText];
    if (!reviewStatus) {
        throw new Error(`Unsupported work order status: ${statusText}`);
    }

    const updated = await sqlDB.engineeringOrder.update({
        where: { workUnique },
        data: {
            reviewStatus
        },
        include: { materialLines: true, documents: true }
    });

    return workOrderToDTO(updated);
}

// 更新工程单进度（根据 workId）
export async function UpdateWorkOrderProcess(workId: string, process: number, note: string) {
    const updated = await sqlDB.engineeringOrder.updateMany({
        where: { workId },
        data: {
            wanChengJinDu: process,
            reviewComments: note
        }
    });

    // 简单返回受影响条数；如需返回 DTO，可以再查一次
    return { updatedCount: updated.count };
}
