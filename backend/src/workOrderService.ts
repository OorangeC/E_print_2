import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 状态映射：将前端中文状态映射为后端标准英文枚举
 */
const statusMap: Record<string, any> = {
    '草稿': 'DRAFT',
    '待审核': 'PENDING_REVIEW',
    '通过': 'APPROVED',
    '驳回': 'REJECTED',
    '生产中': 'IN_PRODUCTION',
    '完成': 'COMPLETED',
    '取消': 'CANCELLED'
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
    const { intermedia, attachments, work_id, work_ver, zhiDanYuan, orderStatus, ...baseData } = data;

    return await prisma.engineeringOrder.create({
        data: {
            ...baseData,
            zhiDan: zhiDanYuan,
            // 状态翻译
            reviewStatus: statusMap[orderStatus] || 'PENDING',

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
    return await prisma.engineeringOrder.findUnique({
        where: { engineeringOrderId: id },
        include: { materialLines: true, documents: true }
    });
}
