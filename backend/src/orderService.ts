import { PrismaClient } from '@prisma/client';
import { draftOrderSchema, submitOrderSchema } from './schemas/orderSchema';

const prisma = new PrismaClient();

/**
 * 后端 OrderService - 处理校验、暂存与提交
 */

/**
 * 核心：统一入口，根据动作执行不同的校验逻辑
 * @param jsonString 来自 FormData 的 'orderData'
 * @param salesman 业务员姓名
 * @param isDraft 是否为草稿模式
 */
export async function processOrderRequest(jsonString: string, salesman: string, isDraft: boolean, files?: any[]) {
    const rawData = JSON.parse(jsonString);

    // 1. 自动映射前端 order_id 为后端的 orderNumber (作为主键)
    // 如果前端未传 order_id，则自动生成唯一单号 (AUTO-timestamp-random)
    let orderNumber = rawData.order_id || rawData.orderNumber;
    if (!orderNumber || orderNumber.trim() === '') {
        const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        orderNumber = `AUTO-${timestamp}-${random}`;
    }

    // 2. 根据模式选择校验器
    const validator = isDraft ? draftOrderSchema : submitOrderSchema;

    // 3. 执行白名单校验与过滤
    const validationResult = validator.safeParse(rawData);

    if (!validationResult.success) {
        // 修正 lint 错误：使用 .issues
        const errorMsg = validationResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
        throw new Error(`校验失败: ${errorMsg}`);
    }

    const validatedData = validationResult.data;

    // 4. 执行数据库逻辑
    if (orderNumber) {
        // 检查是否存在订单
        const existing = await prisma.order.findUnique({ where: { orderNumber } });
        if (existing) {
            return await updateExistingOrder(orderNumber, validatedData, isDraft, files);
        }
    }

    // 如果没有找到 existing，则创建（如果是创建新单，orderNumber 应该已由前端分配或在此生成）
    return await createNewOrder(orderNumber || 'PENDING', validatedData, salesman, isDraft, files);
}

/**
 * 创建新订单
 */
async function createNewOrder(orderNumber: string, data: any, salesman: string, isDraft: boolean, files?: any[]) {
    const { chanPinMingXi, ...baseData } = data;

    return await prisma.order.create({
        data: {
            ...baseData,
            orderNumber,
            yeWuDaiBiaoFenJi: salesman,
            status: isDraft ? 'DRAFT' : 'PENDING_REVIEW',
            submittedAt: isDraft ? null : new Date(),

            orderItems: {
                create: chanPinMingXi?.map((item: any) => ({
                    ...item,
                    houDu: item.houDu?.toString()
                }))
            },

            documents: {
                create: files?.map(f => ({
                    category: 'OrderAttachment',
                    fileName: f.originalname,
                    fileUrl: `/uploads/${f.filename}`
                }))
            },

            // TODO: 需要先创建 SYSTEM 用户才能添加 audit log
            // auditLogs: {
            //     create: {
            //         action: isDraft ? 'SAVE_DRAFT' : 'SUBMIT',
            //         actionDescription: isDraft ? '保存为草稿' : '提交至待审核状态',
            //         userId: 'SYSTEM',
            //         entityType: 'Order',
            //         entityId: orderNumber,
            //         time: new Date()
            //     }
            // }
        },
        include: { orderItems: true }
    });
}

/**
 * 更新已有订单
 */
async function updateExistingOrder(orderNumber: string, data: any, isDraft: boolean, files?: any[]) {
    const { chanPinMingXi, ...baseData } = data;

    return await prisma.$transaction(async (tx) => {
        // 1. 更新主表
        await tx.order.update({
            where: { orderNumber },
            data: {
                ...baseData,
                status: isDraft ? 'DRAFT' : 'PENDING_REVIEW',
                updatedAt: new Date()
            }
        });

        // 2. 同步明细行
        if (chanPinMingXi) {
            await tx.orderItem.deleteMany({ where: { orderNumber } });
            await tx.orderItem.createMany({
                data: chanPinMingXi.map((item: any) => ({
                    ...item,
                    orderNumber,
                    houDu: item.houDu?.toString()
                }))
            });
        }

        return tx.order.findUnique({
            where: { orderNumber },
            include: { orderItems: true }
        });
    });
}

export async function getOrder(orderNumber: string) {
    return await prisma.order.findUnique({
        where: { orderNumber },
        include: { orderItems: true, documents: true, auditLogs: true }
    });
}

export async function deleteOrder(orderNumber: string) {
    return await prisma.order.delete({ where: { orderNumber } });
}