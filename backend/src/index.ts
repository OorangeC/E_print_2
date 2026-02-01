import express = require('express');
import cors = require('cors');
import multer = require('multer');
import path = require('path');
import { processOrderRequest, getOrder, deleteOrder } from './orderService';
import { handleIncomingWorkOrder, getWorkOrder } from './workOrderService';

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
            workOrders: '/api/work-orders',
            health: '/api/health'
        }
    });
});

// 4. 业务路由定义

// --- 订单 (Orders) ---
// 兼容 RESTful 和前端特定的 /create 路径
app.post(['/api/orders', '/api/orders/create'], upload.array('files'), async (req, res) => {
    try {
        // 前端 FormData 可能将 JSON 放在 'orderData' 字段中
        const { orderData, salesman } = req.body;
        const isDraft = req.query.isDraft === 'true';
        const files = req.files as any[];

        const result = await processOrderRequest(orderData, salesman, isDraft, files);
        res.json(result);
    } catch (error: any) {
        console.error('Order Error:', error);
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
// 也是如此，支持前端 /work-orders 和可能出现的其他习惯
app.post(['/api/work-orders', '/api/work-orders/create'], upload.array('files'), async (req, res) => {
    try {
        const { workOrderJson } = req.body;
        const files = req.files as any[];

        const result = await handleIncomingWorkOrder(workOrderJson, files);
        res.json(result);
    } catch (error: any) {
        console.error('WorkOrder Error:', error);
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/work-orders/:id', async (req, res) => {
    try {
        const result = await getWorkOrder(req.params.id);
        if (!result) return res.status(404).json({ error: 'WorkOrder not found' });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
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
    console.log(`- WorkOrder API: POST /api/work-orders & /api/work-orders/create`);
});
