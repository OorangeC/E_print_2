import { sqlDB } from './db';
import { workOrderToDTO, workOrdersToDTO } from './dto/workOrderDTO';
import { logService, logServiceSuccess, logServiceError } from './utils/debugLogger';

export async function handleIncomingWorkOrder(jsonString: string, files?: any[]) {
    try {
        logService('handleIncomingWorkOrder', {
            input: { jsonLength: jsonString?.length || 0, filesCount: files?.length || 0 }
        });
        
        const rawData = JSON.parse(jsonString);
        
        logService('handleIncomingWorkOrder', {
            parsed: rawData,
            fields: {
                work_clerk: rawData.work_clerk,
                workorderstatus: rawData.workorderstatus,
                customer: rawData.customer
            }
        });
        
        const result = await createWorkOrderFromFrontend(rawData, files);
        logServiceSuccess('handleIncomingWorkOrder', '工程单处理成功');
        return result;
    } catch (error) {
        logServiceError('handleIncomingWorkOrder', error);
        console.error('WorkOrder processing failed:', error);
        throw error;
    }
}

async function createWorkOrderFromFrontend(data: any, files?: any[]) {
    const {
        intermedia,
        attachments,

        // 标准字段
        work_id,
        work_ver,
        work_unique,
        work_clerk,
        clerkDate,
        work_audit,
        auditDate,
        workorderstatus,

        // 工单业务字段
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
        // 其余字段忽略（白名单模式，防止数据注入）
        ...rest
    } = data;

    //  过滤空的物料行
    const validIntermedia = intermedia?.filter((item: any) => {
        const hasComponent = !!(item.buJianMingCheng && item.buJianMingCheng.trim());
        const hasMaterial = !!(item.wuLiaoMingCheng && item.wuLiaoMingCheng.trim());
        return hasComponent || hasMaterial;
    }) || [];

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
    // 生成工程单号：如果前端没传或传空字符串，自动生成
    let workId = work_id && work_id.trim() ? work_id : undefined;
    let workVer = work_ver && work_ver.trim() ? work_ver : undefined;
    let workUnique = work_unique && work_unique.trim() ? work_unique : undefined;

    if (!workId) {
        const ts = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
        const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        workId = `WORK-${ts}-${rand}`;
    }

    if (!workVer) {
        workVer = 'V1';
    }

    if (!workUnique) {
        workUnique = `${workId}_${workVer}`;
    }

    logService('createWorkOrderFromFrontend', {
        fields: {
            '生成的 workId': workId,
            '生成的 workVer': workVer,
            '生成的 workUnique': workUnique,
            'work_clerk': work_clerk,
            'customer': customer,
            'workorderstatus': workorderstatus || '待审核'
        }
    });

    // ✅ 先检查工程单是否已存在
    const existing = await sqlDB.engineeringOrder.findUnique({
        where: { workUnique },
        include: { materialLines: true, documents: true }
    });

    if (existing) {
        logService('createWorkOrderFromFrontend', { message: `工程单 ${workUnique} 已存在，更新现有工程单` });
        
        // 如果已存在，更新而不是创建
        const updated = await sqlDB.engineeringOrder.update({
            where: { workUnique },
            data: {
                workClerk: work_clerk,
                clerkDate: clerkDate || null,
                workAudit: work_audit || null,
                auditDate: auditDate || null,
                gongDanLeiXing,
                caiLiao,
                chanPinLeiXing,
                zhiDanShiJian: zhiDanShiJian || null,
                keHu: customer,
                po: customerPO,
                chengPinMingCheng: productName,
                chanPinGuiGe,
                dingDanShuLiang,
                chuYangShu: chuYangShuLiang,
                chaoBiLi: chaoBiLiShuLiang,
                benChangFangSun: benChangFangSun,
                chuYangRiqi: chuYangRiqiRequired || null,
                chuHuoRiqi: chuHuoRiqiRequired || null,
                zhiDan: work_clerk,
                reviewStatus: (workorderstatus || '待审核') as '草稿' | '待审核' | '通过' | '驳回' | '生产中' | '完成' | '取消',
                
                // 动态更新物料行：删除所有旧的，创建新的（已过滤空行）
                materialLines: {
                    deleteMany: {},
                    create: validIntermedia.map((item: any, idx: number) => ({
                        lineNo: item.lineNo || idx + 1,  // 前端可传入顺序，否则自动编号
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
                        paiBanFangShi: item.paiBanFangShi,
                        kaiShiShiJian: item.kaiShiRiQi || null,
                        jieShuShiJian: item.yuQiJieShu || null,
                        dangQianJinDu: typeof item.dangQianJinDu === 'number' ? item.dangQianJinDu : null
                    }))
                }
            },
            include: { materialLines: true, documents: true }
        });
        
        logServiceSuccess('createWorkOrderFromFrontend', `已更新工程单 ${workUnique}`);
        return workOrderToDTO(updated);
    }

    // 如果不存在，创建新的
    return await sqlDB.engineeringOrder.create({
        data: {
            // 与接口定义对齐的关键字段
            workId,
            workVer,
            workUnique,

            workClerk: work_clerk,
            clerkDate: clerkDate || null,
            workAudit: work_audit || null,
            auditDate: auditDate || null,

            // 表头信息
            gongDanLeiXing,
            caiLiao,
            chanPinLeiXing,
            zhiDanShiJian: zhiDanShiJian || null,

            // 订单信息备份映射到数据库字段
            keHu: customer,
            po: customerPO,
            chengPinMingCheng: productName,
            chanPinGuiGe,
            dingDanShuLiang,
            chuYangShu: chuYangShuLiang,
            chaoBiLi: chaoBiLiShuLiang,
            benChangFangSun: benChangFangSun,
            chuYangRiqi: chuYangRiqiRequired || null,
            chuHuoRiqi: chuHuoRiqiRequired || null,

            // 让工单能被 FindWorkOrdersByClerk(clerkName) 查到
            zhiDan: work_clerk,

            // 审批状态
            reviewStatus: (workorderstatus || '待审核') as '草稿' | '待审核' | '通过' | '驳回' | '生产中' | '完成' | '取消',

            // 中间物料行（动态添加/删除，已过滤空行）
            materialLines: {
                create: validIntermedia.map((item: any, idx: number) => ({
                    lineNo: item.lineNo || idx + 1,  // 前端可传入顺序，否则自动编号
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
                    paiBanFangShi: item.paiBanFangShi,
                    kaiShiShiJian: item.kaiShiRiQi || null,
                    jieShuShiJian: item.yuQiJieShu || null,
                    dangQianJinDu: typeof item.dangQianJinDu === 'number' ? item.dangQianJinDu : null
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
    logService('FindWorkOrdersByClerk', {
        input: { clerkName },
        dbQuery: { workClerk: clerkName }
    });
    
    const workOrders = await sqlDB.engineeringOrder.findMany({
        where: { workClerk: clerkName },
        include: { materialLines: true, documents: true }
    });
    
    logService('FindWorkOrdersByClerk', {
        dbResult: workOrders
    });
    
    if (workOrders.length > 0) {
        logService('FindWorkOrdersByClerk - 第一条记录', {
            fields: {
                workId: workOrders[0].workId,
                workClerk: workOrders[0].workClerk,
                reviewStatus: workOrders[0].reviewStatus
            }
        });
    }
    
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

/**
 * 根据工单状态查询工单
 * @param workOrderStatusText 前端传入的中文状态（WorkOrderStatus 枚举值），如 "待审核"、"通过"
 * @returns IWorkOrder[] 满足条件的工单数组
 * 
 * 示例：
 * - FindWorkOrdersWithStatus("待审核") => 查询 reviewStatus = '待审核' 的工单
 * - FindWorkOrdersWithStatus("通过") => 查询 reviewStatus = '通过' 的工单
 */
export async function FindWorkOrdersWithStatus(workOrderStatusText: string) {
    logService('FindWorkOrdersWithStatus', {
        input: { workOrderStatusText },
        dbQuery: { reviewStatus: workOrderStatusText }
    });
    
    // 验证是否为有效的工单状态
    const validStatuses = ['草稿', '待审核', '通过', '驳回', '生产中', '完成', '取消'];
    if (!validStatuses.includes(workOrderStatusText)) {
        logServiceError('FindWorkOrdersWithStatus', new Error(`不支持的工单状态: ${workOrderStatusText}`));
        throw new Error(`不支持的工单状态: ${workOrderStatusText}`);
    }
    
    const workOrders = await sqlDB.engineeringOrder.findMany({
        where: {
            reviewStatus: workOrderStatusText as '草稿' | '待审核' | '通过' | '驳回' | '生产中' | '完成' | '取消'
        },
        include: { materialLines: true, documents: true }
    });
    
    logService('FindWorkOrdersWithStatus', {
        dbResult: workOrders
    });
    
    return workOrdersToDTO(workOrders);
}

/**
 * 更新工程单状态（根据唯一索引 workUnique）
 * @param workUnique 工程单唯一标识
 * @param workOrderStatusText 前端传入的中文状态（WorkOrderStatus 枚举值），如 "待审核"、"通过"
 * @returns 更新后的工程单 DTO
 */
export async function UpdateWorkOrderStatus(workUnique: string, workOrderStatusText: string) {
    // 验证是否为有效的工单状态
    const validStatuses = ['草稿', '待审核', '通过', '驳回', '生产中', '完成', '取消'];
    if (!validStatuses.includes(workOrderStatusText)) {
        throw new Error(`不支持的工单状态: ${workOrderStatusText}`);
    }

    const updated = await sqlDB.engineeringOrder.update({
        where: { workUnique },
        data: {
            reviewStatus: workOrderStatusText as '草稿' | '待审核' | '通过' | '驳回' | '生产中' | '完成' | '取消'
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

