import { sqlDB, mongoDB } from './db';
import { draftOrderSchema, submitOrderSchema } from './schemas/orderSchema';

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
        const existing = await sqlDB.order.findUnique({ where: { orderNumber } });
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

    // 1. 创建订单 (MySQL)
    const newOrder = await sqlDB.order.create({
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
            }
        },
        include: { orderItems: true }
    });

    // 2. 异步记录审计日志 (MongoDB)
    try {
        await mongoDB.auditLog.create({
            data: {
                action: isDraft ? 'SAVE_DRAFT' : 'SUBMIT',
                actionDescription: isDraft ? '保存为草稿' : '提交至待审核状态',
                userId: 'SYSTEM', // TODO: Replace with actual user ID when auth is ready
                entityType: 'Order',
                entityId: orderNumber,
                orderNumber: orderNumber,
                time: new Date()
            }
        });
    } catch (logError) {
        console.error('Failed to create audit log:', logError);
        // 不阻断主流程
    }

    return newOrder;
}

/**
 * 更新已有订单
 */
async function updateExistingOrder(orderNumber: string, data: any, isDraft: boolean, files?: any[]) {
    const { chanPinMingXi, ...baseData } = data;

    const updatedOrder = await sqlDB.$transaction(async (tx) => {
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

    // 3. 异步记录审计日志 (MongoDB)
    try {
        await mongoDB.auditLog.create({
            data: {
                action: isDraft ? 'UPDATE_DRAFT' : 'UPDATE_SUBMIT',
                actionDescription: '更新订单',
                userId: 'SYSTEM',
                entityType: 'Order',
                entityId: orderNumber,
                orderNumber: orderNumber,
                time: new Date()
            }
        });
    } catch (logError) {
        console.error('Failed to create audit log:', logError);
    }

    return updatedOrder;
}

export async function getOrder(orderNumber: string) {
    // 聚合查询：从 MySQL 查订单，从 MongoDB 查日志
    const order = await sqlDB.order.findUnique({
        where: { orderNumber },
        include: { orderItems: true, documents: true }
    });

    if (!order) return null;

    // 获取日志
    const logs = await mongoDB.auditLog.findMany({
        where: { orderNumber }
    });

    return { ...order, auditLogs: logs };
}

export async function deleteOrder(orderNumber: string) {
    return await sqlDB.order.delete({ where: { orderNumber } });
}

// ============ New Interface Search Functions ============

export async function findOrdersBySales(salesName: string) {
    return await sqlDB.order.findMany({
        where: { sales: salesName },
        include: { orderItems: true }
    });
}

export async function findOrdersByAudit(auditName: string) {
    return await sqlDB.order.findMany({
        where: { audit: auditName },
        include: { orderItems: true }
    });
}

export async function findOrderByUniqueId(uniqueId: string) {
    const order = await sqlDB.order.findUnique({
        where: { orderUnique: uniqueId },
        include: { orderItems: true, documents: true }
    });

    if (!order) return null;

    // Fetch AuditLogs from MongoDB
    const logs = await mongoDB.auditLog.findMany({
        where: { orderNumber: order.orderNumber }
    });

    return { ...order, auditLogs: logs };
}

export async function findPendingOrders() {
    return await sqlDB.order.findMany({
        where: {
            status: 'PENDING_REVIEW' // Matches OrderStatus.PENDING_REVIEW
        },
        include: { orderItems: true }
    });
}