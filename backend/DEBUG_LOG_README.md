# 🔍 调试日志使用说明

## 📦 文件位置

调试日志模块：`backend/src/utils/debugLogger.ts`

## 🎯 功能说明

这个调试日志系统可以追踪：
1. **API 层**：前端发送的请求参数、响应结果
2. **Service 层**：业务逻辑的数据处理、数据库查询条件和结果
3. **DTO 层**：数据转换过程（暂未添加，可按需添加）

## 📊 日志输出示例

### 创建工程单时的日志：

```
==================================================
📡 [API] POST /api/work-orders/create
==================================================
Method: POST
Body 字段: [ 'workOrderJson' ]
workOrderJson (前50字符): {"work_id":"","work_clerk":"admin","custome...
上传文件数: 2

🔧 [Service] handleIncomingWorkOrder
输入参数: { jsonLength: 1543, filesCount: 2 }

🔧 [Service] handleIncomingWorkOrder
解析后字段: [ 'work_id', 'work_clerk', 'customer', ... ]
关键字段:
  - work_clerk: admin
  - workorderstatus: 待审核
  - customer: 环球贸易

🔧 [Service] createWorkOrderFromFrontend
关键字段:
  - 生成的 workId: WORK-20260204123045-123
  - 生成的 workVer: V1
  - 生成的 workUnique: WORK-20260204123045-123_V1
  - 最终 workClerk: admin
  - customer: 环球贸易
  - reviewStatus: 待审核

✅ [Service] handleIncomingWorkOrder work_id: WORK-20260204123045-123
✅ [API] POST /api/work-orders/create 成功
返回 ID: WORK-20260204123045-123
==================================================
```

### 查询工程单时的日志：

```
==================================================
📡 [API] GET /api/workOrders/findByClerk
==================================================
Method: GET
Query 参数: {
  "work_clerk": "admin"
}

🔧 [Service] FindWorkOrdersByClerk
输入参数: { clerkName: 'admin' }
数据库查询条件: {
  "workClerk": "admin"
}

🔧 [Service] FindWorkOrdersByClerk
数据库返回: 5 条记录

🔧 [Service] FindWorkOrdersByClerk - 第一条记录
关键字段:
  - workId: WORK-20260204123045-123
  - workClerk: admin
  - reviewStatus: 待审核

✅ [API] GET /api/workOrders/findByClerk 成功
返回记录数: 5
==================================================
```

## 🔧 如何使用

### 1. 开启/关闭调试日志

**临时关闭**（代码运行时）：
```typescript
import { setDebugEnabled } from './utils/debugLogger';
setDebugEnabled(false); // 关闭所有日志
```

**永久关闭**：
修改 `backend/src/utils/debugLogger.ts` 第 13 行：
```typescript
const DEBUG_ENABLED = false;  // 改为 false
```

### 2. 查看日志

启动后端后，所有日志会输出到控制台（终端）。

### 3. 在新位置添加日志

如需在其他函数添加日志，导入并使用：

```typescript
import { logAPI, logService, logDTO } from './utils/debugLogger';

// API 层
logAPI('GET /api/myEndpoint', { query: req.query });

// Service 层
logService('myFunction', {
    input: { param1: 'value1' },
    fields: { key1: 'value1', key2: 'value2' }
});

// 成功/失败
logAPISuccess('GET /api/myEndpoint', result);
logAPIError('GET /api/myEndpoint', error);
```

## 🗑️ 如何删除调试日志

当调试完成后，删除步骤：

### 方法 1：手动删除（推荐）

1. **删除调试日志文件**：
   ```bash
   rm backend/src/utils/debugLogger.ts
   rm backend/DEBUG_LOG_README.md
   ```

2. **删除代码中的导入和调用**：
   
   在 `backend/src/index.ts` 中删除：
   ```typescript
   const { logAPI, logAPISuccess, logAPIError } = require('./utils/debugLogger');
   logAPI(...);
   logAPISuccess(...);
   logAPIError(...);
   ```
   
   在 `backend/src/workOrderService.ts` 中删除：
   ```typescript
   import { logService, logServiceSuccess, logServiceError } from './utils/debugLogger';
   logService(...);
   logServiceSuccess(...);
   logServiceError(...);
   ```

3. **验证**：重启后端，确保没有报错

### 方法 2：使用搜索替换

1. 在整个 `backend/src` 目录搜索：
   - `debugLogger`
   - `logAPI`
   - `logService`
   - `logDTO`

2. 删除所有相关的导入和调用

## 📋 已添加日志的位置

### API 层 (`backend/src/index.ts`)

#### 工程单相关：
- ✅ `POST /api/work-orders/create` - 创建工程单
- ✅ `GET /api/workOrders/findByClerk` - 按制单员查询工程单
- ✅ `GET /api/workOrders/findWithStatus` - 按状态查询工程单

#### 订单相关：
- ✅ `POST /api/orders/create` - 创建/更新订单
- ✅ `GET /api/orders/status` - 按状态查询订单
- ✅ `GET /api/orders/findBySales` - 按业务员查询订单
- ✅ `POST /api/orders/updateStatus` - 更新订单状态

### Service 层

#### 工程单 (`backend/src/workOrderService.ts`)
- ✅ `handleIncomingWorkOrder` - 工程单入口处理
- ✅ `createWorkOrderFromFrontend` - 创建工程单核心逻辑
- ✅ `FindWorkOrdersByClerk` - 按制单员查询
- ✅ `FindWorkOrdersWithStatus` - 按状态查询

#### 订单 (`backend/src/orderService.ts`)
- ✅ `processOrderRequest` - 订单入口处理
- ✅ `FindOrdersWithStatus` - 按状态查询订单
- ✅ `UpdateOrderStatus` - 更新订单状态

## 💡 提示

- 日志使用颜色编码，方便在终端中区分不同类型的信息
- 如果看不到颜色，说明终端不支持 ANSI 颜色代码
- 日志不会影响性能，但生产环境建议关闭或删除
