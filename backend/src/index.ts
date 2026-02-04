import express = require('express');
import cors = require('cors');
import multer = require('multer');
import path = require('path');
import {
    processOrderRequest, getOrder, deleteOrder,
    FindOrdersBySales, FindOrdersByAudit, FindOrderByID, FindOrdersWithStatus, UpdateOrderStatus, findAllOrders
} from './orderService';
import {
    handleIncomingWorkOrder, getWorkOrder,
    FindWorkOrdersByClerk, FindWorkOrdersByAudit, FindWorkOrderByID, FindWorkOrdersWithStatus,
    UpdateWorkOrderStatus, UpdateWorkOrderProcess
} from './workOrderService';

const app = express();
const port = process.env.PORT || 3000;

// 1. 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 新增：全局请求日志
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 2. 附件上传配置
const upload = multer({
    dest: 'uploads/', // 临时存放目录
});

// 3. 基础/健康检查路由
app.get('/', (req, res) => {
    res.send('<h1>E-Bench Backend is Running</h1><p>API endpoints are available at <code>/api/...</code></p>');
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/api', (req, res) => {
    res.json({
        message: 'E-Bench API Root',
        endpoints: {
            orders: '/api/orders',
            workOrders: '/api/workOrders',
            health: '/api/health'
        }
    });
});

// 4. 业务路由定义

// --- 订单 (Orders) ---

// Search Routes (Must be defined BEFORE /:id)

/**
 * 根据订单状态查询订单
 * GET /api/orders/status?orderstatus=待审核
 * 
 * 示例：
 * - /api/orders/status?orderstatus=待审核  => 查询所有待审核订单
 * - /api/orders/status?orderstatus=已审核  => 查询所有已审核订单
 * - /api/orders/status?orderstatus=草稿    => 查询所有草稿订单
 */
app.get('/api/orders/status', async (req, res) => {
    const { logAPI, logAPISuccess, logAPIError } = require('./utils/debugLogger');
    try {
        logAPI('GET /api/orders/status', {
            method: 'GET',
            query: req.query
        });
        
        const statusText = req.query.orderstatus as string;
        if (!statusText) {
            return res.status(400).json({ error: '缺少 orderstatus 参数' });
        }
        const result = await FindOrdersWithStatus(statusText);
        
        logAPISuccess('GET /api/orders/status', result);
        res.json(result);
    } catch (error: any) {
        logAPIError('GET /api/orders/status', error);
        res.status(400).json({ error: error.message });
    }
});

// 查询所有订单（不区分业务员），用于简单场景下的统一列表
app.get('/api/orders/all', async (req, res) => {
    try {
        const result = await findAllOrders();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 前端使用 /findBySales，保持兼容
app.get('/api/orders/findBySales', async (req, res) => {
    const { logAPI, logAPISuccess, logAPIError } = require('./utils/debugLogger');
    try {
        logAPI('GET /api/orders/findBySales', {
            method: 'GET',
            query: req.query
        });
        
        const sales = req.query.sales as string;
        if (!sales) return res.status(400).json({ error: 'Missing sales parameter' });
        
        const result = await FindOrdersBySales(sales);
        
        logAPISuccess('GET /api/orders/findBySales', result);
        res.json(result);
    } catch (error: any) {
        logAPIError('GET /api/orders/findBySales', error);
        res.status(500).json({ error: error.message });
    }
});

// 前端使用 /findByAudit，保持兼容
app.get('/api/orders/findByAudit', async (req, res) => {
    try {
        const audit = req.query.audit as string;
        if (!audit) return res.status(400).json({ error: 'Missing audit parameter' });
        const result = await FindOrdersByAudit(audit);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/orders/unique/:uniqueId', async (req, res) => {
    try {
        const result = await FindOrderByID(req.params.uniqueId);
        if (!result) return res.status(404).json({ error: 'Order not found' });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 根据唯一索引/ID 查询单个订单（前端：/orders/findById?order_id=...）
app.get('/api/orders/findById', async (req, res) => {
    try {
        const id = req.query.order_id as string;
        if (!id) return res.status(400).json({ error: 'Missing order_id parameter' });
        const result = await FindOrderByID(id);
        if (!result) return res.status(404).json({ error: 'Order not found/findById' });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 兼容 RESTful 和前端特定的 /create 路径
app.post(['/api/orders', '/api/orders/create'], upload.array('files'), async (req, res) => {
    const { logAPI, logAPISuccess, logAPIError } = require('./utils/debugLogger');
    try {
        logAPI('POST /api/orders/create', {
            method: 'POST',
            body: req.body,
            query: req.query,
            files: req.files?.length || 0
        });
        
        // 前端 FormData 可能将 JSON 放在 'orderData' 字段中
        const { orderData, salesman } = req.body;
        const isDraft = req.query.isDraft === 'true';
        const files = req.files as any[];

        const result = await processOrderRequest(orderData, salesman, isDraft, files);
        
        logAPISuccess('POST /api/orders/create', result);
        res.json(result);
    } catch (error: any) {
        logAPIError('POST /api/orders/create', error);
        console.error('Order Error:', error);
        res.status(400).json({ error: error.message });
    }
});

// 更新订单状态（前端：/orders/updateStatus，body: { order_unique, orderstatus, auditor? }）
app.post('/api/orders/updateStatus', async (req, res) => {
    const { logAPI, logAPISuccess, logAPIError } = require('./utils/debugLogger');
    try {
        logAPI('POST /api/orders/updateStatus', {
            method: 'POST',
            body: req.body
        });
        
        const { order_unique, orderstatus, auditor } = req.body;
        if (!order_unique || !orderstatus) {
            return res.status(400).json({ error: 'Missing order_unique or orderstatus in body' });
        }
        const result = await UpdateOrderStatus(order_unique, orderstatus, auditor || 'admin');
        
        logAPISuccess('POST /api/orders/updateStatus', result);
        res.json(result);
    } catch (error: any) {
        logAPIError('POST /api/orders/updateStatus', error);
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/orders/:id', async (req, res) => {
    try {
        const result = await getOrder(req.params.id);
        if (!result) return res.status(404).json({ error: 'Order not found' });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- 工程单 (WorkOrders) ---

// Search Routes (Must be defined BEFORE /:id)

//  临时调试接口：查询所有工程单
// app.get('/api/workOrders/all', async (req, res) => {
//     const { logAPI, logAPISuccess } = require('./utils/debugLogger');
//     try {
//         logAPI('GET /api/workOrders/all', { method: 'GET' });
//         const allWorkOrders = await sqlDB.engineeringOrder.findMany({
//             include: { materialLines: true, documents: true },
//             orderBy: { createdAt: 'desc' }
//         });
//         logAPISuccess('GET /api/workOrders/all', { count: allWorkOrders.length });
//         res.json({
//             total: allWorkOrders.length,
//             workOrders: allWorkOrders.map((wo: any) => ({
//                 workId: wo.workId,
//                 workUnique: wo.workUnique,
//                 workClerk: wo.workClerk,
//                 reviewStatus: wo.reviewStatus,
//                 keHu: wo.keHu,
//                 createdAt: wo.createdAt
//             }))
//         });
//     } catch (error: any) {
//         res.status(500).json({ error: error.message });
//     }
// });

/**
 * 根据工单状态查询工单
 * GET /api/workOrders/findWithStatus?workorderstatus=待审核
 * 
 * 示例：
 * - /api/workOrders/findWithStatus?workorderstatus=待审核  => 查询所有待审核工单
 * - /api/workOrders/findWithStatus?workorderstatus=通过    => 查询所有已通过工单
 * - /api/workOrders/findWithStatus?workorderstatus=驳回    => 查询所有已驳回工单
 */
app.get('/api/workOrders/findWithStatus', async (req, res) => {
    const { logAPI, logAPISuccess, logAPIError } = require('./utils/debugLogger');
    try {
        logAPI('GET /api/workOrders/findWithStatus', {
            method: 'GET',
            query: req.query
        });
        
        const statusText = req.query.workorderstatus as string;
        if (!statusText) {
            return res.status(400).json({ error: '缺少 workorderstatus 参数' });
        }
        const result = await FindWorkOrdersWithStatus(statusText);
        
        logAPISuccess('GET /api/workOrders/findWithStatus', result);
        res.json(result);
    } catch (error: any) {
        logAPIError('GET /api/workOrders/findWithStatus', error);
        res.status(400).json({ error: error.message });
    }
});

// 前端使用 /workOrders/findByClerk (注意: workOrders 不是 work-orders)
app.get('/api/workOrders/findByClerk', async (req, res) => {
    const { logAPI, logAPISuccess, logAPIError } = require('./utils/debugLogger');
    try {
        logAPI('GET /api/workOrders/findByClerk', {
            method: 'GET',
            query: req.query
        });
        
        // 兼容两种参数名：旧版 sales，新版 work_clerk
        const clerk = (req.query.work_clerk as string) || (req.query.sales as string);
        if (!clerk) return res.status(400).json({ error: 'Missing work_clerk parameter' });
        
        const result = await FindWorkOrdersByClerk(clerk);
        
        logAPISuccess('GET /api/workOrders/findByClerk', result);
        res.json(result);
    } catch (error: any) {
        logAPIError('GET /api/workOrders/findByClerk', error);
        res.status(500).json({ error: error.message });
    }
});

// 前端使用 /workOrders/findByAudit
app.get('/api/workOrders/findByAudit', async (req, res) => {
    try {
        // 兼容两种参数名：旧版 audit，新版 work_audit
        const audit = (req.query.work_audit as string) || (req.query.audit as string);
        if (!audit) return res.status(400).json({ error: 'Missing work_audit parameter' });
        const result = await FindWorkOrdersByAudit(audit);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 根据唯一索引查询工程单（前端：/workOrders/findById?work_unique=...）
app.get('/api/workOrders/findById', async (req, res) => {
    try {
        const id = req.query.work_unique as string;
        if (!id) return res.status(400).json({ error: 'Missing work_unique parameter' });
        const result = await FindWorkOrderByID(id);
        if (!result) return res.status(404).json({ error: 'WorkOrder not found' });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


// 修改工单状态（前端：/workOrders/updateStatus，body: { work_unique, workorderstatus }）
app.post('/api/workOrders/updateStatus', async (req, res) => {
    try {
        const { work_unique, workorderstatus } = req.body;
        if (!work_unique || !workorderstatus) {
            return res.status(400).json({ error: 'Missing work_unique or workorderstatus in body' });
        }
        const result = await UpdateWorkOrderStatus(work_unique, workorderstatus);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// 更新工序进度（前端：/workOrders/updateProcess，body: { work_id, process, dangQianJinDu }）
app.post('/api/workOrders/updateProcess', async (req, res) => {
    try {
        const { work_id, process, dangQianJinDu } = req.body;
        if (!work_id) return res.status(400).json({ error: 'Missing work_id in body' });
        const p = Number(process);
        if (Number.isNaN(p)) return res.status(400).json({ error: 'Invalid process value' });

        const result = await UpdateWorkOrderProcess(work_id, p, dangQianJinDu || '');
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// 创建/更新工程单
app.post('/api/workOrders/create', upload.array('files'), async (req, res) => {
    const { logAPI, logAPISuccess, logAPIError } = require('./utils/debugLogger');
    try {
        logAPI('POST /api/workOrders/create', {
            method: 'POST',
            body: req.body,
            files: req.files?.length || 0
        });
        
        const { workOrderData } = req.body;
        const files = req.files as any[];

        const result = await handleIncomingWorkOrder(workOrderData, files);
        
        logAPISuccess('POST /api/workOrders/create', result);
        res.json(result);
    } catch (error: any) {
        logAPIError('POST /api/workOrders/create', error);
        console.error('WorkOrder Error:', error);
        res.status(400).json({ error: error.message });
    }
});

// 5. 404 处理 (仅针对 /api 开头的路由)
app.use('/api', (req, res) => {
    res.status(404).json({ error: `Endpoint ${req.method} ${req.originalUrl} not found` });
});

// 6. 启动服务器
app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
    console.log(`- Order API: POST /api/orders & /api/orders/create`);
    console.log(`- WorkOrder API: POST /api/workOrders/create`);
});
