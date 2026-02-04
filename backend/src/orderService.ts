import { sqlDB, mongoDB } from './db';
import { draftOrderSchema, submitOrderSchema } from './schemas/orderSchema';
import { orderToDTO, ordersToDTO } from './dto/orderDTO';
import { logService, logServiceSuccess, logServiceError } from './utils/debugLogger';

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
    logService('processOrderRequest', {
        input: { jsonLength: jsonString?.length || 0, salesman, isDraft, filesCount: files?.length || 0 }
    });
    
    const rawData = JSON.parse(jsonString);
    
    logService('processOrderRequest解析后', {
        fields: {
            order_id: rawData.order_id,
            sales: rawData.sales,
            customer: rawData.customer,
            keLaiXinxi: rawData.keLaiXinxi,
            daYinRiqi: rawData.daYinRiqi
        }
    });

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

    const validatedData = validationResult.data as any;

    // 4. 状态字段：前端传入 orderstatus（中文），数据库枚举也是中文，无需转换
    if (validatedData.orderstatus && typeof validatedData.orderstatus === 'string') {
        // 直接使用前端传入的中文状态
        validatedData._convertedStatus = validatedData.orderstatus;
    }

    // 5. 执行数据库逻辑
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
    const { chanPinMingXi, order_id, order_ver, order_unique, ...baseData } = data;

    // 只排除前端专用字段，其余字段直接传入数据库
    const {
        orderstatus, // 前端传的是中文状态，Prisma 模型里没有这个字段，只有 status
        _convertedStatus, // 从 processOrderRequest 转换来的英文状态
        keLaiXinxi, // 前端字段名（小写 x），需要映射到数据库
        ...dbSafeData
    } = baseData;

    // 字段名映射：前端 keLaiXinxi（小写 x）→ 数据库 keLaiXinXi（大写 X）
    if (keLaiXinxi !== undefined) {
        dbSafeData.keLaiXinXi = keLaiXinxi;
    }

    // 确定最终的状态值：优先使用前端传入的状态，否则根据 isDraft 决定
    const finalStatus = (_convertedStatus || (isDraft ? '草稿' : '待审核')) as '草稿' | '待审核' | '通过' | '驳回' | '生产中' | '完成' | '取消';

    // 1. 创建订单 (MySQL)
    const newOrder = await sqlDB.order.create({
        data: {
            ...dbSafeData,
            orderNumber,
            // 保存前端传入的关键字段
            orderVer: order_ver || 'V1',
            orderUnique: order_unique || `${orderNumber}_V1`,
            sales: data.sales || salesman,  // 优先使用前端传入的 sales，否则用 salesman
            yeWuDaiBiaoFenJi: salesman,
            status: finalStatus, // 使用转换后的状态或默认值
            submittedAt: isDraft ? null : new Date().toISOString(),

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
                time: new Date().toISOString()
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
    // 把前端专用字段剥离掉
    const { chanPinMingXi, order_id, order_ver, order_unique, orderNumber: _ignoredOrderNumber, ...baseData } = data;

    // 只排除前端专用字段，其余字段直接传入数据库
    const {
        orderstatus, // 前端传的是中文状态，Prisma 模型里没有这个字段，只有 status
        _convertedStatus, // 从 processOrderRequest 转换来的英文状态
        keLaiXinxi, // 前端字段名（小写 x），需要映射到数据库
        ...dbSafeData
    } = baseData;

    // 字段名映射：前端 keLaiXinxi（小写 x）→ 数据库 keLaiXinXi（大写 X）
    if (keLaiXinxi !== undefined) {
        dbSafeData.keLaiXinXi = keLaiXinxi;
    }

    // PATCH 语义：仅更新前端显式传入的字段（undefined 视为未传，空字符串视为要清空）
    const patchData = Object.fromEntries(
        Object.entries(dbSafeData).filter(([key, value]) => {
            // 允许空字符串（表示清空字段），但过滤 undefined（表示未传入）
            if (value === undefined) return false;
            // 特殊处理：daYinRiqi 等日期字段，即使是空字符串也保存
            if (['daYinRiqi', 'yeWuRiqi', 'shenHeRiqi'].includes(key)) {
                return true;
            }
            return true;
        })
    ) as Record<string, any>;

    // 状态字段：仅在前端显式传入时更新
    if (typeof _convertedStatus === 'string') {
        patchData.status = _convertedStatus;
    } else if (typeof orderstatus === 'string') {
        patchData.status = orderstatus;
    }

    const updatedOrder = await sqlDB.$transaction(async (tx) => {
        // 1. 更新主表
        await tx.order.update({
            where: { orderNumber },
            data: {
                ...patchData,
                updatedAt: new Date().toISOString()
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
                time: new Date().toISOString()
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

    return orderToDTO(order, logs);
}

export async function deleteOrder(orderNumber: string) {
    return await sqlDB.order.delete({ where: { orderNumber } });
}

// ============ New Interface Search Functions ============

export async function FindOrdersBySales(salesName: string) {
    const orders = await sqlDB.order.findMany({
        where: { sales: salesName },
        include: { orderItems: true, documents: true }
    });
    return ordersToDTO(orders);
}

export async function FindOrdersByAudit(auditName: string) {
    const orders = await sqlDB.order.findMany({
        where: { audit: auditName },
        include: { orderItems: true, documents: true }
    });
    return ordersToDTO(orders);
}

/**
 * 查询所有订单（不按业务员过滤）
 */
export async function findAllOrders() {
    const orders = await sqlDB.order.findMany({
        include: { orderItems: true, documents: true }
    });
    return ordersToDTO(orders);
}

export async function FindOrderByID(uniqueId: string) {
    const order = await sqlDB.order.findUnique({
        where: { orderUnique: uniqueId },
        include: { orderItems: true, documents: true }
    });

    if (!order) return null;

    // Fetch AuditLogs from MongoDB
    const logs = await mongoDB.auditLog.findMany({
        where: { orderNumber: order.orderNumber }
    });

    return orderToDTO(order, logs);
}

/**
 * 根据订单状态查询订单
 * @param orderStatusText 前端传入的中文状态（如"待审核"、"通过"等）
 * @returns IOrder[] 满足条件的订单数组
 * 
 * 示例：
 * - FindOrdersWithStatus("待审核") => 查询 status = '待审核' 的订单
 * - FindOrdersWithStatus("通过") => 查询 status = '通过' 的订单
 */
export async function FindOrdersWithStatus(orderStatusText: string) {
    // 验证是否为有效的订单状态
    const validStatuses = ['草稿', '待审核', '通过', '驳回', '生产中', '完成', '取消'];
    if (!validStatuses.includes(orderStatusText)) {
        throw new Error(`不支持的订单状态: ${orderStatusText}`);
    }
    
    const orders = await sqlDB.order.findMany({
        where: {
            status: orderStatusText as '草稿' | '待审核' | '通过' | '驳回' | '生产中' | '完成' | '取消'
        },
        include: { orderItems: true, documents: true }
    });
    
    logService('FindOrdersWithStatus', { dbResult: orders });
    
    return ordersToDTO(orders);
}

// 更新订单状态（根据唯一索引 orderUnique）
export async function UpdateOrderStatus(orderUnique: string, orderStatusText: string, auditorName: string = 'admin') {
    logService('UpdateOrderStatus', { input: { orderUnique, orderStatusText, auditorName } });
    
    // 验证是否为有效的订单状态
    const validStatuses = ['草稿', '待审核', '通过', '驳回', '生产中', '完成', '取消'];
    if (!validStatuses.includes(orderStatusText)) {
        throw new Error(`不支持的订单状态: ${orderStatusText}`);
    }
    
    // 构建更新数据
    const updateData: any = {
        status: orderStatusText as '草稿' | '待审核' | '通过' | '驳回' | '生产中' | '完成' | '取消',
        reviewedAt: new Date().toISOString()
    };
    
    // 如果状态变为"通过"或"驳回"，设置审核员和审核日期
    if (orderStatusText === '通过' || orderStatusText === '驳回') {
        updateData.audit = auditorName;
        updateData.auditDate = new Date().toISOString();
    }
    
    const updated = await sqlDB.order.update({
        where: { orderUnique },
        data: updateData,
        include: { orderItems: true, documents: true }
    });

    logServiceSuccess('UpdateOrderStatus', `已更新订单 ${orderUnique} 状态为 ${orderStatusText}，审核员: ${auditorName}`);
    
    // 这里简单地不写 Mongo 审计日志，后面如果需要可按订单创建时的方式补充
    return orderToDTO(updated);
}