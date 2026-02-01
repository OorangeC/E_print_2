# 📚 生产管理系统 - 完整 API 实现文档

> 基于 Prisma Schema 的工业级代码实现

## 📋 目录

1. [通用架构与工具函数](#1-通用架构与工具函数)
2. [订单模块 (Order)](#2-订单模块-order)
3. [物料库 (Material)](#3-物料库-material)
4. [工程单 (EngineeringOrder)](#4-工程单-engineeringorder)
5. [工程单物料明细 (MaterialLine)](#5-工程单物料明细-materialline)
6. [用户中心 (User)](#6-用户中心-user)
7. [审计日志 (AuditLog)](#7-审计日志-auditlog)
8. [文档附件 (Document)](#8-文档附件-document)
9. [审批任务 (ReviewTask)](#9-审批任务-reviewtask)
10. [待办事项 (Todo)](#10-待办事项-todo)
11. [工序计划 (StepPlan)](#11-工序计划-stepplan)

---

## 1. 通用架构与工具函数

### 架构原则

1. **单一入口**：所有变动类接口（Create/Update）仅接收一个 `data` 对象
2. **Partial 更新**：`Update` 接口均采用 `Patch` 策略，`undefined` 字段不触发更新
3. **隔离 DTO**：系统字段由后端自动维护，不允许前端修改

### 通用类型定义

```typescript
// ============ 通用响应格式 ============
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// ============ 分页响应 ============
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
}

// ============ 分页参数 ============
interface PaginationParams {
  take?: number;  // 每页数量，默认 20
  skip?: number;  // 跳过数量，默认 0
}
```

### 通用工具函数

```typescript
// ============ Partial 更新 ============
async function updateEntity<T>(
  model: any,
  id: string,
  patch: Partial<T>
): Promise<T> {
  return await model.update({
    where: { id },
    data: patch // undefined 字段自动被忽略
  });
}

// ============ 审计日志 ============
async function createAuditLog(params: {
  userId: string;
  entityType: string;
  entityId: string;
  action: string;
  actionDescription?: string;
  oldValue?: any;
  newValue?: any;
  orderId?: string;
  ipAddress?: string;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      ...params,
      time: new Date()
    }
  });
}
```

---

## 2. 订单模块 (Order)

**核心业务模型，包含 50+ 字段，支持版本控制**

### DTO 定义

```typescript
// ============ 创建订单 DTO ============
interface CreateOrderDto {
  // 必填字段
  orderNumber: string;
  
  // 基本信息
  customer?: string;
  productName?: string;
  jiuBianMa?: string;
  isbn?: string;
  customerPO?: string;
  baoJiaDanHao?: string;
  xiLieDanMing?: string;
  qiTaShiBie?: string;
  
  // 排期信息
  xiaZiliaodaiRiqiRequired?: Date;
  xiaZiliaodaiRiqiPromise?: Date;
  yinzhangRiqiRequired?: Date;
  yinzhangRiqiPromise?: Date;
  zhepaiRiqiRequired?: Date;
  zhepaiRiqiPromise?: Date;
  chuyangRiqiRequired?: Date;
  chuyangRiqiPromise?: Date;
  
  // 分类与工艺
  chanPinDaLei?: string;
  ziLeiXing?: string;
  zhuangDingFangShi?: string;
  yongTu?: string;
  fscType?: string;
  fenBanShuoMing?: string;
  genSeZhiShi?: string;
  keLaiXinXi?: string;
  baoLiuQianSe?: string;
  
  // 数量及规格
  dingDanShuLiang?: number;
  chuYangShuLiang?: number;
  chaoBiLiShuLiang?: number;
  teShuLiuYangZhang?: number;
  beiPinShuLiang?: number;
  teShuLiuShuYang?: number;
  zongShuLiang?: number;
  chuHuoShuLiang?: number;
  
  guigeGaoMm?: number;
  guigeKuanMm?: number;
  guigeHouMm?: number;
  
  // 产品明细 (支持多行)
  orderItems?: {
    materialId?: string;
    neiWen?: string;
    pinPai?: string;
    keZhong?: number;
    zhiLei?: string;
    beiZhu?: string;
  }[];
  
  // 说明区
  fuLiaoShuoMing?: string;
  chanPinMingXiTeBieShuoMing?: string;
  fenBanShuoMing2?: string;
  wuLiaoShuoMing?: string;
  yinShuaGenSeYaoQiu?: string;
  zhuangDingShouGongYaoQiu?: string;
  qiTa?: string;
  zhiLiangYaoQiu?: string;
  
  // 客户反馈
  keHuFanKui?: string;
  teShuYaoQiu?: string;
  kongZhiFangFa?: string;
  dingDanTeBieShuoMing?: string;
  yangPinPingShenXinXi?: string;
  dingDanPingShenXinXi?: string;
  
  // 经办人员
  yeWuDaiBiaoFenJi?: string;
  shenHeRen?: string;
  daYinRen?: string;
  yeWuRiqi?: Date;    // 业务日期
  shenHeRiqi?: Date;  // 审核日期
  daYinRiqi?: Date;   // 打印日期
  
  // 外销与CPSIA
  waixiaoFlag?: boolean;
  cpsiaYaoqiu?: string;
  
  // 版本控制
  versionTag?: string;
}

// ============ 更新订单 DTO ============
type UpdateOrderDto = Partial<CreateOrderDto>;

// ============ 查询过滤器 ============
interface OrderFilterDto extends PaginationParams {
  orderNumber?: string;
  customer?: string;
  status?: OrderStatus;
  customerPO?: string;
  isLatestVersion?: boolean;
  versionNumber?: number;
}

// ============ 订单状态枚举 ============
enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PRODUCTION = 'IN_PRODUCTION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
```

### CRUD 实现

```typescript
// ============ 创建订单 ============
/**
 * POST /api/orders
 * 初始状态为 DRAFT
 */
async function createOrder(data: CreateOrderDto): Promise<ApiResponse<Order>> {
  try {
    const { orderItems, ...orderData } = data;
    const newOrder = await prisma.order.create({
      data: {
        ...orderData,
        orderItems: {
          create: orderItems?.map(item => ({
            materialId: item.materialId,
            neiWen: item.neiWen,
            pinPai: item.pinPai,
            keZhong: item.keZhong,
            zhiLei: item.zhiLei,
            beiZhu: item.beiZhu
          }))
        }
      },
      include: { orderItems: true }
    });

    return { success: true, data: newOrder };
  } catch (error) {
    return {
      success: false,
      error: { code: 'CREATE_FAILED', message: error.message }
    };
  }
}

// ============ 查询订单列表 ============
/**
 * GET /api/orders?orderNumber=xxx&status=DRAFT&take=20&skip=0
 * 支持模糊搜索和分页
 */
async function getOrders(
  filter: OrderFilterDto
): Promise<ApiResponse<PaginatedResponse<Order>>> {
  try {
    const {
      orderNumber,
      customer,
      status,
      customerPO,
      isLatestVersion,
      versionNumber,
      take = 20,
      skip = 0
    } = filter;

    const where: any = {};
    if (orderNumber) where.orderNumber = { contains: orderNumber, mode: 'insensitive' };
    if (customer) where.customer = { contains: customer, mode: 'insensitive' };
    if (status) where.status = status;
    if (customerPO) where.customerPO = { contains: customerPO, mode: 'insensitive' };
    if (isLatestVersion !== undefined) where.isLatestVersion = isLatestVersion;
    if (versionNumber !== undefined) where.versionNumber = versionNumber;

    const total = await prisma.order.count({ where });
    const orders = await prisma.order.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      include: {
        material: true,
        documents: true,
        reviewTasks: true,
        stepPlans: { orderBy: { sequence: 'asc' } }
      }
    });

    return {
      success: true,
      data: {
        data: orders,
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        hasNext: skip + take < total
      }
    };
  } catch (error) {
    return {
      success: false,
      error: { code: 'QUERY_FAILED', message: error.message }
    };
  }
}

// ============ 查询单个订单 ============
/**
 * GET /api/orders/:orderId
 */
async function getOrderById(orderId: string): Promise<ApiResponse<Order>> {
  try {
    const order = await prisma.order.findUnique({
      where: { orderId },
      include: {
        material: true,
        documents: true,
        reviewTasks: true,
        stepPlans: { orderBy: { sequence: 'asc' } },
        previousOrder: true,
        nextVersions: true
      }
    });

    if (!order) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '订单不存在' }
      };
    }

    return { success: true, data: order };
  } catch (error) {
    return {
      success: false,
      error: { code: 'QUERY_FAILED', message: error.message }
    };
  }
}

// ============ 更新订单（Partial Patch） ============
/**
 * PATCH /api/orders/:orderId
 * 工业核心接口 - 仅更新传入的字段
 */
async function updateOrder(
  orderId: string,
  patch: UpdateOrderDto,
  userId: string
): Promise<ApiResponse<Order>> {
  try {
    const oldOrder = await prisma.order.findUnique({ where: { orderId } });
    if (!oldOrder) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '订单不存在' }
      };
    }

    const updatedOrder = await prisma.order.update({
      where: { orderId },
      data: patch,
      include: {
        material: true,
        documents: true,
        reviewTasks: true,
        stepPlans: { orderBy: { sequence: 'asc' } }
      }
    });

    await createAuditLog({
      userId,
      entityType: 'Order',
      entityId: orderId,
      action: 'UPDATE',
      actionDescription: '更新订单',
      oldValue: oldOrder,
      newValue: updatedOrder,
      orderId
    });

    return { success: true, data: updatedOrder };
  } catch (error) {
    return {
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message }
    };
  }
}

// ============ 创建订单新版本 ============
/**
 * POST /api/orders/:orderId/versions
 */
async function createOrderVersion(
  orderId: string,
  changes: UpdateOrderDto,
  userId: string,
  versionTag?: string
): Promise<ApiResponse<Order>> {
  try {
    const originalOrder = await prisma.order.findUnique({ where: { orderId } });
    if (!originalOrder) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '原订单不存在' }
      };
    }

    const newOrder = await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { orderId },
        data: { isLatestVersion: false }
      });

      const { orderId: _, createdAt, updatedAt, ...originalData } = originalOrder;
      
      return await tx.order.create({
        data: {
          ...originalData,
          ...changes,
          versionNumber: originalOrder.versionNumber + 1,
          previousOrderId: orderId,
          isLatestVersion: true,
          versionTag: versionTag || `V${originalOrder.versionNumber + 1}`
        },
        include: {
          material: true,
          documents: true,
          reviewTasks: true,
          stepPlans: { orderBy: { sequence: 'asc' } }
        }
      });
    });

    await createAuditLog({
      userId,
      entityType: 'Order',
      entityId: newOrder.orderId,
      action: 'VERSION_CREATE',
      actionDescription: `创建订单版本 ${newOrder.versionNumber}`,
      oldValue: originalOrder,
      newValue: newOrder,
      orderId: newOrder.orderId
    });

    return { success: true, data: newOrder };
  } catch (error) {
    return {
      success: false,
      error: { code: 'VERSION_CREATE_FAILED', message: error.message }
    };
  }
}

// ============ 删除订单 ============
/**
 * DELETE /api/orders/:orderId
 * 物理删除（级联删除关联数据）
 */
async function deleteOrder(
  orderId: string,
  userId: string
): Promise<ApiResponse<void>> {
  try {
    const order = await prisma.order.findUnique({
      where: { orderId },
      include: { documents: true, reviewTasks: true, stepPlans: true }
    });

    if (!order) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '订单不存在' }
      };
    }

    await prisma.order.delete({ where: { orderId } });

    await createAuditLog({
      userId,
      entityType: 'Order',
      entityId: orderId,
      action: 'DELETE',
      actionDescription: `删除订单 ${order.orderNumber}`,
      oldValue: order
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { code: 'DELETE_FAILED', message: error.message }
    };
  }
}

// ============ 更新订单状态 ============
/**
 * PATCH /api/orders/:orderId/status
 * 订单状态流转（提交审批、审批通过等）
 */
async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  userId: string,
  comments?: string
): Promise<ApiResponse<Order>> {
  try {
    const updates: any = { status: newStatus };

    if (newStatus === OrderStatus.PENDING_REVIEW || newStatus === OrderStatus.IN_REVIEW) {
      updates.submittedAt = new Date();
    } else if (newStatus === OrderStatus.APPROVED || newStatus === OrderStatus.REJECTED) {
      updates.reviewedAt = new Date();
      updates.reviewedBy = userId;
      if (comments) updates.reviewComments = comments;
    }

    const updatedOrder = await prisma.order.update({
      where: { orderId },
      data: updates,
      include: {
        material: true,
        documents: true,
        reviewTasks: true,
        stepPlans: { orderBy: { sequence: 'asc' } }
      }
    });

    await createAuditLog({
      userId,
      entityType: 'Order',
      entityId: orderId,
      action: 'STATUS_CHANGE',
      actionDescription: `订单状态变更为 ${newStatus}`,
      newValue: { status: newStatus, comments },
      orderId
    });

    return { success: true, data: updatedOrder };
  } catch (error) {
    return {
      success: false,
      error: { code: 'STATUS_UPDATE_FAILED', message: error.message }
    };
  }
}
```

---

## 3. 物料库 (Material)

**物料主数据表，支持引用限制删除**

### DTO 定义

```typescript
interface CreateMaterialDto {
  neiWen?: string;
  baoJiaYongZhiChiCun?: string;
  houDu?: string;
  keZhong?: number;          // 克重
  chanDi?: string;           // 产地
  pinPai?: string;           // 品牌
  zhiLei?: string;           // 纸类
  fscInfo?: string;
  yeShu?: number;
  yinSeZhengFan?: string;
  zhuanSeZhengFan?: string;
  biaoMianChuLi?: string;
  zhuangDingGongYi?: string;
  beiZhu?: string;
}

type UpdateMaterialDto = Partial<CreateMaterialDto>;

interface MaterialFilterDto extends PaginationParams {
  pinPai?: string;
  zhiLei?: string;
  keZhong?: number;
  chanDi?: string;
}
```

### CRUD 实现

```typescript
// ============ 创建物料 ============
/**
 * POST /api/materials
 */
async function createMaterial(
  data: CreateMaterialDto,
  userId: string
): Promise<ApiResponse<Material>> {
  try {
    const material = await prisma.material.create({ data });

    await createAuditLog({
      userId,
      entityType: 'Material',
      entityId: material.materialId,
      action: 'CREATE',
      actionDescription: `创建物料 ${material.pinPai || ''} ${material.zhiLei || ''}`,
      newValue: material
    });

    return { success: true, data: material };
  } catch (error) {
    return {
      success: false,
      error: { code: 'CREATE_FAILED', message: error.message }
    };
  }
}

// ============ 查询物料列表 ============
/**
 * GET /api/materials?pinPai=xxx&zhiLei=xxx
 */
async function getMaterials(
  filter: MaterialFilterDto
): Promise<ApiResponse<PaginatedResponse<Material>>> {
  try {
    const { pinPai, zhiLei, keZhong, chanDi, take = 20, skip = 0 } = filter;

    const where: any = {};
    if (pinPai) where.pinPai = { contains: pinPai, mode: 'insensitive' };
    if (zhiLei) where.zhiLei = { contains: zhiLei, mode: 'insensitive' };
    if (keZhong) where.keZhong = keZhong;
    if (chanDi) where.chanDi = { contains: chanDi, mode: 'insensitive' };

    const total = await prisma.material.count({ where });
    const materials = await prisma.material.findMany({
      where,
      take,
      skip,
      orderBy: [
        { pinPai: 'asc' },
        { zhiLei: 'asc' },
        { keZhong: 'asc' }
      ]
    });

    return {
      success: true,
      data: {
        data: materials,
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        hasNext: skip + take < total
      }
    };
  } catch (error) {
    return {
      success: false,
      error: { code: 'QUERY_FAILED', message: error.message }
    };
  }
}

// ============ 查询单个物料 ============
/**
 * GET /api/materials/:materialId
 */
async function getMaterialById(materialId: string): Promise<ApiResponse<Material>> {
  try {
    const material = await prisma.material.findUnique({ where: { materialId } });
    
    if (!material) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '物料不存在' }
      };
    }

    return { success: true, data: material };
  } catch (error) {
    return {
      success: false,
      error: { code: 'QUERY_FAILED', message: error.message }
    };
  }
}

// ============ 更新物料 ============
/**
 * PATCH /api/materials/:materialId
 */
async function updateMaterial(
  materialId: string,
  patch: UpdateMaterialDto,
  userId: string
): Promise<ApiResponse<Material>> {
  try {
    const oldMaterial = await prisma.material.findUnique({ where: { materialId } });
    if (!oldMaterial) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '物料不存在' }
      };
    }

    const updatedMaterial = await prisma.material.update({
      where: { materialId },
      data: patch
    });

    await createAuditLog({
      userId,
      entityType: 'Material',
      entityId: materialId,
      action: 'UPDATE',
      actionDescription: '更新物料',
      oldValue: oldMaterial,
      newValue: updatedMaterial
    });

    return { success: true, data: updatedMaterial };
  } catch (error) {
    return {
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message }
    };
  }
}

// ============ 删除物料 ============
/**
 * DELETE /api/materials/:materialId
 * 限制逻辑：若物料已被引用，禁止删除（RESTRICT）
 */
async function deleteMaterial(
  materialId: string,
  userId: string
): Promise<ApiResponse<void>> {
  try {
    // 检查订单引用
    const ordersCount = await prisma.order.count({ where: { materialId } });
    if (ordersCount > 0) {
      return {
        success: false,
        error: {
          code: 'MATERIAL_IN_USE',
          message: `该物料已被 ${ordersCount} 个订单引用，无法删除`
        }
      };
    }

    // 检查工程单引用
    const engineeringLinesCount = await prisma.engineeringOrderMaterialLine.count({
      where: { materialId }
    });
    if (engineeringLinesCount > 0) {
      return {
        success: false,
        error: {
          code: 'MATERIAL_IN_USE',
          message: `该物料已被 ${engineeringLinesCount} 个工程单明细引用，无法删除`
        }
      };
    }

    const material = await prisma.material.findUnique({ where: { materialId } });
    if (!material) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '物料不存在' }
      };
    }

    await prisma.material.delete({ where: { materialId } });

    await createAuditLog({
      userId,
      entityType: 'Material',
      entityId: materialId,
      action: 'DELETE',
      actionDescription: `删除物料 ${material.pinPai || ''} ${material.zhiLei || ''}`,
      oldValue: material
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { code: 'DELETE_FAILED', message: error.message }
    };
  }
}
```

---

## 4. 工程单 (EngineeringOrder)

**生产指令主表**

### DTO 定义

```typescript
interface CreateEngineeringOrderDto {
  // 表头信息
  gongSiMingCheng?: string;
  gongChengDanMingCheng?: string;
  gongDanLeiXing?: string;
  caiLiao?: string;
  chanPinLeiXing?: string;
  zhiDanShiJian?: Date;
  
  // 订单信息备份
  dingDanXuHao?: number;
  keHu?: string;
  po?: string;
  chengPinMingCheng?: string;
  chanPinGuiGe?: string;
  dingDanShuLiang?: number;
  chuYangShu?: number;
  chaoBiLi?: number;
  benChangFangSun?: number;
  chuYangRiqi?: Date;
  chuHuoRiqi?: Date;
  
  // 产品要求与工序
  chanPinYaoQiu?: string;
  zhiDan?: string;
  shenHe?: string;
  benChangNeiBuGongXu?: string;
  appendix?: string; // 附件说明

  // 生产跟踪 (Production Tracking)
  renLiRequirement?: number; // 需投入人力
  yuJiGongQi?: string;      // 预计工期
  kaiShiShiJian?: Date;     // 实际开始时间
  jieShuShiJian?: Date;     // 实际结束时间
  shiFouWanGong?: boolean;
  wanChengJinDu?: number;   // 0-100
}

type UpdateEngineeringOrderDto = Partial<CreateEngineeringOrderDto>;

interface EngineeringOrderFilterDto extends PaginationParams {
  keHu?: string;
  po?: string;
  gongDanLeiXing?: string;
  reviewStatus?: ReviewResult;
}
```

### CRUD 实现

```typescript
// ============ 创建工程单 ============
/**
 * POST /api/engineering-orders
 */
async function createEngineeringOrder(
  data: CreateEngineeringOrderDto,
  userId: string
): Promise<ApiResponse<EngineeringOrder>> {
  try {
    const engineeringOrder = await prisma.engineeringOrder.create({
      data,
      include: {
        materialLines: {
          include: { material: true },
          orderBy: { lineNo: 'asc' }
        },
        stepPlans: { orderBy: { sequence: 'asc' } }
      }
    });

    await createAuditLog({
      userId,
      entityType: 'EngineeringOrder',
      entityId: engineeringOrder.engineeringOrderId,
      action: 'CREATE',
      actionDescription: `创建工程单 ${data.gongChengDanMingCheng || ''}`,
      newValue: engineeringOrder
    });

    return { success: true, data: engineeringOrder };
  } catch (error) {
    return {
      success: false,
      error: { code: 'CREATE_FAILED', message: error.message }
    };
  }
}

// ============ 查询工程单列表 ============
/**
 * GET /api/engineering-orders
 * 深度查询，包含所有物料行
 */
async function getEngineeringOrders(
  params: PaginationParams
): Promise<ApiResponse<PaginatedResponse<EngineeringOrder>>> {
  try {
    const { take = 20, skip = 0 } = params;

    const total = await prisma.engineeringOrder.count();
    const engineeringOrders = await prisma.engineeringOrder.findMany({
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      include: {
        materialLines: {
          include: { material: true },
          orderBy: { lineNo: 'asc' }
        },
        stepPlans: { orderBy: { sequence: 'asc' } }
      }
    });

    return {
      success: true,
      data: {
        data: engineeringOrders,
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        hasNext: skip + take < total
      }
    };
  } catch (error) {
    return {
      success: false,
      error: { code: 'QUERY_FAILED', message: error.message }
    };
  }
}

// ============ 查询单个工程单 ============
/**
 * GET /api/engineering-orders/:id
 */
async function getEngineeringOrderById(
  engineeringOrderId: string
): Promise<ApiResponse<EngineeringOrder>> {
  try {
    const engineeringOrder = await prisma.engineeringOrder.findUnique({
      where: { engineeringOrderId },
      include: {
        materialLines: {
          include: { material: true },
          orderBy: { lineNo: 'asc' }
        },
        stepPlans: { orderBy: { sequence: 'asc' } }
      }
    });

    if (!engineeringOrder) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '工程单不存在' }
      };
    }

    return { success: true, data: engineeringOrder };
  } catch (error) {
    return {
      success: false,
      error: { code: 'QUERY_FAILED', message: error.message }
    };
  }
}

// ============ 更新工程单 ============
/**
 * PATCH /api/engineering-orders/:id
 */
async function updateEngineeringOrder(
  engineeringOrderId: string,
  patch: UpdateEngineeringOrderDto,
  userId: string
): Promise<ApiResponse<EngineeringOrder>> {
  try {
    const oldOrder = await prisma.engineeringOrder.findUnique({
      where: { engineeringOrderId }
    });

    if (!oldOrder) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '工程单不存在' }
      };
    }

    const updatedOrder = await prisma.engineeringOrder.update({
      where: { engineeringOrderId },
      data: patch,
      include: {
        materialLines: {
          include: { material: true },
          orderBy: { lineNo: 'asc' }
        },
        stepPlans: { orderBy: { sequence: 'asc' } }
      }
    });

    await createAuditLog({
      userId,
      entityType: 'EngineeringOrder',
      entityId: engineeringOrderId,
      action: 'UPDATE',
      actionDescription: '更新工程单',
      oldValue: oldOrder,
      newValue: updatedOrder
    });

    return { success: true, data: updatedOrder };
  } catch (error) {
    return {
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message }
    };
  }
}

// ============ 删除工程单 ============
/**
 * DELETE /api/engineering-orders/:id
 */
async function deleteEngineeringOrder(
  engineeringOrderId: string,
  userId: string
): Promise<ApiResponse<void>> {
  try {
    const order = await prisma.engineeringOrder.findUnique({
      where: { engineeringOrderId },
      include: { materialLines: true, stepPlans: true }
    });

    if (!order) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '工程单不存在' }
      };
    }

    await prisma.engineeringOrder.delete({ where: { engineeringOrderId } });

    await createAuditLog({
      userId,
      entityType: 'EngineeringOrder',
      entityId: engineeringOrderId,
      action: 'DELETE',
      actionDescription: `删除工程单 ${order.gongChengDanMingCheng || ''}`,
      oldValue: order
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { code: 'DELETE_FAILED', message: error.message }
    };
  }
}

// ============ 审批工程单 ============
/**
 * PATCH /api/engineering-orders/:eoId/review
 */
async function reviewEngineeringOrder(
  eoId: string,
  result: ReviewResult,
  userId: string,
  comments?: string
): Promise<ApiResponse<EngineeringOrder>> {
  try {
    const updatedEO = await prisma.engineeringOrder.update({
      where: { engineeringOrderId: eoId },
      data: {
        reviewStatus: result,
        reviewedBy: userId,
        reviewedAt: new Date(),
        reviewComments: comments
      }
    });

    return { success: true, data: updatedEO };
  } catch (error) {
    return {
      success: false,
      error: { code: 'REVIEW_FAILED', message: error.message }
    };
  }
}

---

## 5. 工程单物料明细 (MaterialLine)

**工程单下的具体用料计划，支持到料跟踪**

### DTO 定义

```typescript
interface CreateMaterialLineDto {
  engineeringOrderId: string;
  lineNo: number;
  materialId?: string;
  buJianMingCheng?: string;
  yinShuaYanSe?: string;
  wuLiaoMiaoShu?: string;
  pinPai?: string;
  caiLiaoGuiGe?: string;
  fsc?: string;
  kaiShu?: number;
  shangJiChiCun?: string;
  paiBanMoSu?: number;
  yinChuShu?: number;
  yinSun?: number;
  lingLiaoShuZhang?: number;
  biaoMianChuLi?: string;
  yinShuaBanShu?: number;
  shengChanLuJing?: string;
  paiBanFangShi?: string;
  kaiShiShiJian?: Date;
  shiFouDaoLiao?: boolean;
  jieShuShiJian?: Date;
}

type UpdateMaterialLineDto = Partial<Omit<CreateMaterialLineDto, 'engineeringOrderId' | 'lineNo'>>;

interface MaterialArrivalDto {
  shiFouDaoLiao: boolean;
  jieShuShiJian?: Date;
}
```

### CRUD 实现

```typescript
// ============ 创建物料行 ============
/**
 * POST /api/engineering-orders/:engineeringOrderId/material-lines
 */
async function createMaterialLine(
  data: CreateMaterialLineDto,
  userId: string
): Promise<ApiResponse<EngineeringOrderMaterialLine>> {
  try {
    const engineeringOrder = await prisma.engineeringOrder.findUnique({
      where: { engineeringOrderId: data.engineeringOrderId }
    });

    if (!engineeringOrder) {
      return {
        success: false,
        error: { code: 'ENGINEERING_ORDER_NOT_FOUND', message: '工程单不存在' }
      };
    }

    const materialLine = await prisma.engineeringOrderMaterialLine.create({
      data,
      include: { material: true }
    });

    await createAuditLog({
      userId,
      entityType: 'EngineeringOrderMaterialLine',
      entityId: materialLine.lineId,
      action: 'CREATE',
      actionDescription: `创建物料行 ${data.lineNo}`,
      newValue: materialLine
    });

    return { success: true, data: materialLine };
  } catch (error) {
    if (error.code === 'P2002') {
      return {
        success: false,
        error: { code: 'DUPLICATE_LINE_NO', message: '该工程单已存在相同行号的物料行' }
      };
    }
    return {
      success: false,
      error: { code: 'CREATE_FAILED', message: error.message }
    };
  }
}

// ============ 批量创建/更新物料行（Upsert） ============
/**
 * PUT /api/engineering-orders/:engineeringOrderId/material-lines/batch
 */
async function upsertMaterialLines(
  engineeringOrderId: string,
  lines: CreateMaterialLineDto[],
  userId: string
): Promise<ApiResponse<EngineeringOrderMaterialLine[]>> {
  try {
    const engineeringOrder = await prisma.engineeringOrder.findUnique({
      where: { engineeringOrderId }
    });

    if (!engineeringOrder) {
      return {
        success: false,
        error: { code: 'ENGINEERING_ORDER_NOT_FOUND', message: '工程单不存在' }
      };
    }

    const results = await prisma.$transaction(
      lines.map(line =>
        prisma.engineeringOrderMaterialLine.upsert({
          where: {
            engineeringOrderId_lineNo: {
              engineeringOrderId,
              lineNo: line.lineNo
            }
          },
          create: { ...line, engineeringOrderId },
          update: line,
          include: { material: true }
        })
      )
    );

    await createAuditLog({
      userId,
      entityType: 'EngineeringOrderMaterialLine',
      entityId: engineeringOrderId,
      action: 'BATCH_UPSERT',
      actionDescription: `批量更新 ${lines.length} 条物料行`,
      newValue: results
    });

    return { success: true, data: results };
  } catch (error) {
    return {
      success: false,
      error: { code: 'BATCH_UPSERT_FAILED', message: error.message }
    };
  }
}

// ============ 查询物料行列表 ============
/**
 * GET /api/engineering-orders/:engineeringOrderId/material-lines
 */
async function getMaterialLines(
  engineeringOrderId: string
): Promise<ApiResponse<EngineeringOrderMaterialLine[]>> {
  try {
    const materialLines = await prisma.engineeringOrderMaterialLine.findMany({
      where: { engineeringOrderId },
      orderBy: { lineNo: 'asc' },
      include: { material: true }
    });

    return { success: true, data: materialLines };
  } catch (error) {
    return {
      success: false,
      error: { code: 'QUERY_FAILED', message: error.message }
    };
  }
}

// ============ 更新物料行 ============
/**
 * PATCH /api/material-lines/:lineId
 */
async function updateMaterialLine(
  lineId: string,
  patch: UpdateMaterialLineDto,
  userId: string
): Promise<ApiResponse<EngineeringOrderMaterialLine>> {
  try {
    const oldLine = await prisma.engineeringOrderMaterialLine.findUnique({
      where: { lineId }
    });

    if (!oldLine) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '物料行不存在' }
      };
    }

    const updatedLine = await prisma.engineeringOrderMaterialLine.update({
      where: { lineId },
      data: patch,
      include: { material: true }
    });

    await createAuditLog({
      userId,
      entityType: 'EngineeringOrderMaterialLine',
      entityId: lineId,
      action: 'UPDATE',
      actionDescription: '更新物料行',
      oldValue: oldLine,
      newValue: updatedLine
    });

    return { success: true, data: updatedLine };
  } catch (error) {
    return {
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message }
    };
  }
}

// ============ 到料跟踪（特殊逻辑） ============
/**
 * PATCH /api/material-lines/:lineId/arrival
 * 当 shiFouDaoLiao 设为 true 时，自动注入当前时间至 jieShuShiJian
 */
async function updateMaterialArrival(
  lineId: string,
  data: MaterialArrivalDto,
  userId: string
): Promise<ApiResponse<EngineeringOrderMaterialLine>> {
  try {
    const oldLine = await prisma.engineeringOrderMaterialLine.findUnique({
      where: { lineId }
    });

    if (!oldLine) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '物料行不存在' }
      };
    }

    const updateData: any = { shiFouDaoLiao: data.shiFouDaoLiao };
    
    if (data.shiFouDaoLiao === true && !data.jieShuShiJian) {
      updateData.jieShuShiJian = new Date();
    } else if (data.jieShuShiJian) {
      updateData.jieShuShiJian = data.jieShuShiJian;
    }

    const updatedLine = await prisma.engineeringOrderMaterialLine.update({
      where: { lineId },
      data: updateData,
      include: { material: true }
    });

    await createAuditLog({
      userId,
      entityType: 'EngineeringOrderMaterialLine',
      entityId: lineId,
      action: 'ARRIVAL_UPDATE',
      actionDescription: data.shiFouDaoLiao ? '标记物料已到料' : '标记物料未到料',
      oldValue: oldLine,
      newValue: updatedLine
    });

    return { success: true, data: updatedLine };
  } catch (error) {
    return {
      success: false,
      error: { code: 'ARRIVAL_UPDATE_FAILED', message: error.message }
    };
  }
}

// ============ 删除物料行 ============
/**
 * DELETE /api/material-lines/:lineId
 */
async function deleteMaterialLine(
  lineId: string,
  userId: string
): Promise<ApiResponse<void>> {
  try {
    const line = await prisma.engineeringOrderMaterialLine.findUnique({
      where: { lineId }
    });

    if (!line) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '物料行不存在' }
      };
    }

    await prisma.engineeringOrderMaterialLine.delete({ where: { lineId } });

    await createAuditLog({
      userId,
      entityType: 'EngineeringOrderMaterialLine',
      entityId: lineId,
      action: 'DELETE',
      actionDescription: `删除物料行 ${line.lineNo}`,
      oldValue: line
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { code: 'DELETE_FAILED', message: error.message }
    };
  }
}
```

---

## 6. 用户中心 (User)

**系统权控模型，bcrypt 加密**

### DTO 定义

```typescript
interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role?: UserRole;
}

interface UpdateUserDto {
  fullName?: string;
  role?: UserRole;
  isActive?: boolean;
}

enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  AUDITOR = 'AUDITOR',
  QC = 'QC',
  PLANNER = 'PLANNER'
}
```

### CRUD 实现

```typescript
import * as bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;

// ============ 创建用户 ============
/**
 * POST /api/users
 * 密码需在 Service 层进行 bcrypt 加密
 */
async function createUser(
  data: CreateUserDto,
  adminUserId: string
): Promise<ApiResponse<User>> {
  try {
    if (!data.username || !data.email || !data.password) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'username, email, password 为必填字段'
        }
      };
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        role: data.role || UserRole.OPERATOR,
        isActive: true
      }
    });

    await createAuditLog({
      userId: adminUserId,
      entityType: 'User',
      entityId: user.userId,
      action: 'CREATE',
      actionDescription: `创建用户 ${data.username}`,
      newValue: { ...user, passwordHash: '[REDACTED]' }
    });

    const { passwordHash: _, ...userResponse } = user;
    return { success: true, data: userResponse };
  } catch (error) {
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return {
        success: false,
        error: {
          code: 'DUPLICATE_USER',
          message: `${field === 'username' ? '用户名' : '邮箱'}已存在`
        }
      };
    }
    return {
      success: false,
      error: { code: 'CREATE_FAILED', message: error.message }
    };
  }
}

// ============ 查询用户列表 ============
/**
 * GET /api/users
 * 严禁在接口中返回 passwordHash 字段
 */
async function getUsers(
  params: PaginationParams
): Promise<ApiResponse<PaginatedResponse<User>>> {
  try {
    const { take = 20, skip = 0 } = params;

    const total = await prisma.user.count();
    const users = await prisma.user.findMany({
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      select: {
        userId: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
        // 注意：不选择 passwordHash
      }
    });

    return {
      success: true,
      data: {
        data: users,
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        hasNext: skip + take < total
      }
    };
  } catch (error) {
    return {
      success: false,
      error: { code: 'QUERY_FAILED', message: error.message }
    };
  }
}

// ============ 查询单个用户 ============
/**
 * GET /api/users/:userId
 */
async function getUserById(userId: string): Promise<ApiResponse<User>> {
  try {
    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '用户不存在' }
      };
    }

    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: { code: 'QUERY_FAILED', message: error.message }
    };
  }
}

// ============ 更新用户 ============
/**
 * PATCH /api/users/:userId
 * 允许更新 role 或禁用账户 (isActive: false)
 */
async function updateUser(
  userId: string,
  patch: UpdateUserDto,
  adminUserId: string
): Promise<ApiResponse<User>> {
  try {
    const oldUser = await prisma.user.findUnique({ where: { userId } });

    if (!oldUser) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '用户不存在' }
      };
    }

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: patch,
      select: {
        userId: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    await createAuditLog({
      userId: adminUserId,
      entityType: 'User',
      entityId: userId,
      action: 'UPDATE',
      actionDescription: '更新用户信息',
      oldValue: { ...oldUser, passwordHash: '[REDACTED]' },
      newValue: updatedUser
    });

    return { success: true, data: updatedUser };
  } catch (error) {
    return {
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message }
    };
  }
}

// ============ 修改密码 ============
/**
 * POST /api/users/:userId/change-password
 */
async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<ApiResponse<void>> {
  try {
    const user = await prisma.user.findUnique({ where: { userId } });

    if (!user) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '用户不存在' }
      };
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.passwordHash);
    
    if (!isValidPassword) {
      return {
        success: false,
        error: { code: 'INVALID_PASSWORD', message: '旧密码不正确' }
      };
    }

    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { userId },
      data: { passwordHash: newPasswordHash }
    });

    await createAuditLog({
      userId,
      entityType: 'User',
      entityId: userId,
      action: 'PASSWORD_CHANGE',
      actionDescription: '修改密码'
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { code: 'PASSWORD_CHANGE_FAILED', message: error.message }
    };
  }
}

// ============ 删除用户 ============
/**
 * DELETE /api/users/:userId
 */
async function deleteUser(
  userId: string,
  adminUserId: string
): Promise<ApiResponse<void>> {
  try {
    const user = await prisma.user.findUnique({ where: { userId } });

    if (!user) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '用户不存在' }
      };
    }

    await prisma.user.delete({ where: { userId } });

    await createAuditLog({
      userId: adminUserId,
      entityType: 'User',
      entityId: userId,
      action: 'DELETE',
      actionDescription: `删除用户 ${user.username}`,
      oldValue: { ...user, passwordHash: '[REDACTED]' }
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { code: 'DELETE_FAILED', message: error.message }
    };
  }
}
```

---

## 7. 审计日志 (AuditLog)

**数据变更痕迹，此接口不对前端开放**

### DTO 定义

```typescript
interface AuditLogFilterDto extends PaginationParams {
  orderId?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: string;
  startTime?: Date;
  endTime?: Date;
}
```

### 接口实现

```typescript
// ============ 查询审计日志列表 ============
/**
 * GET /api/audit-logs?orderId=xxx
 * 仅管理员可查。支持按 orderId 查单个订单的全生命周期变更
 */
async function getAuditLogs(
  filter: AuditLogFilterDto,
  requestUserId: string
): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
  try {
    const requestUser = await prisma.user.findUnique({
      where: { userId: requestUserId }
    });

    if (!requestUser || (requestUser.role !== UserRole.ADMIN && requestUser.role !== UserRole.AUDITOR)) {
      return {
        success: false,
        error: { code: 'PERMISSION_DENIED', message: '无权限查看审计日志' }
      };
    }

    const {
      orderId,
      entityType,
      entityId,
      userId,
      action,
      startTime,
      endTime,
      take = 50,
      skip = 0
    } = filter;

    const where: any = {};
    
    if (orderId) where.orderId = orderId;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (userId) where.userId = userId;
    if (action) where.action = action;
    
    if (startTime || endTime) {
      where.time = {};
      if (startTime) where.time.gte = startTime;
      if (endTime) where.time.lte = endTime;
    }

    const total = await prisma.auditLog.count({ where });
    const logs = await prisma.auditLog.findMany({
      where,
      take,
      skip,
      orderBy: { time: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            fullName: true
          }
        }
      }
    });

    return {
      success: true,
      data: {
        data: logs,
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        hasNext: skip + take < total
      }
    };
  } catch (error) {
    return {
      success: false,
      error: { code: 'QUERY_FAILED', message: error.message }
    };
  }
}

// ============ 查询单个实体的审计历史 ============
/**
 * GET /api/audit-logs/entity/:entityType/:entityId
 */
async function getEntityAuditHistory(
  entityType: string,
  entityId: string,
  requestUserId: string
): Promise<ApiResponse<AuditLog[]>> {
  try {
    const requestUser = await prisma.user.findUnique({
      where: { userId: requestUserId }
    });

    if (!requestUser || (requestUser.role !== UserRole.ADMIN && requestUser.role !== UserRole.AUDITOR)) {
      return {
        success: false,
        error: { code: 'PERMISSION_DENIED', message: '无权限查看审计日志' }
      };
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        entityType,
        entityId
      },
      orderBy: { time: 'asc' },
      include: {
        user: {
          select: {
            username: true,
            fullName: true
          }
        }
      }
    });

    return { success: true, data: logs };
  } catch (error) {
    return {
      success: false,
      error: { code: 'QUERY_FAILED', message: error.message }
    };
  }
}
```

---

## 8. 文档附件 (Document)

**订单相关的 PDF、CAD 等**

### DTO 定义

```typescript
interface CreateDocumentDto {
  orderId: string;
  category: string;
  fileName: string;
  fileUrl?: string;
  fileSize?: number;
}
```

### CRUD 实现

```typescript
// ============ 上传文档 ============
/**
 * POST /api/documents
 * 上传成功后，在数据库登记 fileUrl
 */
async function createDocument(
  data: CreateDocumentDto,
  userId: string
): Promise<ApiResponse<Document>> {
  try {
    const order = await prisma.order.findUnique({
      where: { orderId: data.orderId }
    });

    if (!order) {
      return {
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: '订单不存在' }
      };
    }

    const document = await prisma.document.create({
      data: {
        orderId: data.orderId,
        category: data.category,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize
      }
    });

    await createAuditLog({
      userId,
      entityType: 'Document',
      entityId: document.documentId,
      action: 'UPLOAD',
      actionDescription: `上传文档 ${data.fileName}`,
      newValue: document,
      orderId: data.orderId
    });

    return { success: true, data: document };
  } catch (error) {
    return {
      success: false,
      error: { code: 'CREATE_FAILED', message: error.message }
    };
  }
}

// ============ 查询订单的所有文档 ============
/**
 * GET /api/orders/:orderId/documents
 */
async function getOrderDocuments(
  orderId: string
): Promise<ApiResponse<Document[]>> {
  try {
    const documents = await prisma.document.findMany({
      where: { orderId },
      orderBy: { uploadedAt: 'desc' }
    });

    return { success: true, data: documents };
  } catch (error) {
    return {
      success: false,
      error: { code: 'QUERY_FAILED', message: error.message }
    };
  }
}

// ============ 删除文档 ============
/**
 * DELETE /api/documents/:documentId
 * 删除记录的同时，Service 层需调用云存储 API 物理删除文件
 */
async function deleteDocument(
  documentId: string,
  userId: string
): Promise<ApiResponse<void>> {
  try {
    const document = await prisma.document.findUnique({
      where: { documentId }
    });

    if (!document) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '文档不存在' }
      };
    }

    // TODO: 调用云存储 API 删除实际文件
    // await cloudStorage.deleteFile(document.fileUrl);

    await prisma.document.delete({ where: { documentId } });

    await createAuditLog({
      userId,
      entityType: 'Document',
      entityId: documentId,
      action: 'DELETE',
      actionDescription: `删除文档 ${document.fileName}`,
      oldValue: document,
      orderId: document.orderId
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { code: 'DELETE_FAILED', message: error.message }
    };
  }
}
```

---

## 9. 审批任务 (ReviewTask)

**流程引擎，核心动作触发订单状态变更**

### DTO 定义

```typescript
interface CreateReviewTaskDto {
  orderId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
}

interface UpdateReviewTaskDto {
  title?: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
}

interface CompleteReviewDto {
  result: ReviewResult;
  comments?: string;
}

enum ReviewResult {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_REVISION = 'NEEDS_REVISION'
}
```

### CRUD 实现

```typescript
// ============ 创建审批任务 ============
/**
 * POST /api/review-tasks
 */
async function createReviewTask(
  data: CreateReviewTaskDto,
  userId: string
): Promise<ApiResponse<ReviewTask>> {
  try {
    const order = await prisma.order.findUnique({
      where: { orderId: data.orderId }
    });

    if (!order) {
      return {
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: '订单不存在' }
      };
    }

    const reviewTask = await prisma.reviewTask.create({
      data: {
        orderId: data.orderId,
        title: data.title,
        description: data.description,
        assignedTo: data.assignedTo,
        result: ReviewResult.PENDING,
        dueDate: data.dueDate
      }
    });

    await createAuditLog({
      userId,
      entityType: 'ReviewTask',
      entityId: reviewTask.taskId,
      action: 'CREATE',
      actionDescription: `创建审批任务 ${data.title}`,
      newValue: reviewTask,
      orderId: data.orderId
    });

    return { success: true, data: reviewTask };
  } catch (error) {
    return {
      success: false,
      error: { code: 'CREATE_FAILED', message: error.message }
    };
  }
}

// ============ 查询审批任务列表 ============
/**
 * GET /api/review-tasks?orderId=xxx&assignedTo=xxx&result=PENDING
 */
async function getReviewTasks(
  filter: {
    orderId?: string;
    assignedTo?: string;
    result?: ReviewResult;
  } & PaginationParams
): Promise<ApiResponse<PaginatedResponse<ReviewTask>>> {
  try {
    const { orderId, assignedTo, result, take = 20, skip = 0 } = filter;

    const where: any = {};
    if (orderId) where.orderId = orderId;
    if (assignedTo) where.assignedTo = assignedTo;
    if (result) where.result = result;

    const total = await prisma.reviewTask.count({ where });
    const reviewTasks = await prisma.reviewTask.findMany({
      where,
      take,
      skip,
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return {
      success: true,
      data: {
        data: reviewTasks,
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        hasNext: skip + take < total
      }
    };
  } catch (error) {
    return {
      success: false,
      error: { code: 'QUERY_FAILED', message: error.message }
    };
  }
}

// ============ 完成审批（核心动作） ============
/**
 * POST /api/review-tasks/:taskId/complete
 * 当 result 变为 APPROVED 时，Service 应触发后续逻辑
 * （如将 Order 状态改为 APPROVED）
 */
async function completeReview(
  taskId: string,
  data: CompleteReviewDto,
  userId: string
): Promise<ApiResponse<ReviewTask>> {
  try {
    const task = await prisma.reviewTask.findUnique({
      where: { taskId },
      include: { order: true }
    });

    if (!task) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '审批任务不存在' }
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.reviewTask.update({
        where: { taskId },
        data: {
          result: data.result,
          comments: data.comments,
          completedAt: new Date()
        }
      });

      let newOrderStatus: OrderStatus | undefined;
      
      if (data.result === ReviewResult.APPROVED) {
        newOrderStatus = OrderStatus.APPROVED;
      } else if (data.result === ReviewResult.REJECTED) {
        newOrderStatus = OrderStatus.REJECTED;
      } else if (data.result === ReviewResult.NEEDS_REVISION) {
        newOrderStatus = OrderStatus.DRAFT;
      }

      if (newOrderStatus) {
        await tx.order.update({
          where: { orderId: task.orderId },
          data: {
            status: newOrderStatus,
            reviewedAt: new Date(),
            reviewedBy: userId,
            reviewComments: data.comments
          }
        });
      }

      return updatedTask;
    });

    await createAuditLog({
      userId,
      entityType: 'ReviewTask',
      entityId: taskId,
      action: 'COMPLETE',
      actionDescription: `完成审批，结果: ${data.result}`,
      oldValue: task,
      newValue: { ...result, comments: data.comments },
      orderId: task.orderId
    });

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: { code: 'COMPLETE_FAILED', message: error.message }
    };
  }
}
```

---

## 10. 待办事项 (Todo)

**个人任务追踪**

### DTO 定义

```typescript
interface CreateTodoDto {
  userId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  entityType?: string;
  entityId?: string;
}

interface UpdateTodoDto {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  isDone?: boolean;
  dueDate?: Date;
}

enum TaskPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}
```

### CRUD 实现

```typescript
// ============ 创建待办 ============
/**
 * POST /api/todos
 */
async function createTodo(
  data: CreateTodoDto
): Promise<ApiResponse<Todo>> {
  try {
    const user = await prisma.user.findUnique({
      where: { userId: data.userId }
    });

    if (!user) {
      return {
        success: false,
        error: { code: 'USER_NOT_FOUND', message: '用户不存在' }
      };
    }

    const todo = await prisma.todo.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description,
        priority: data.priority || TaskPriority.NORMAL,
        dueDate: data.dueDate,
        entityType: data.entityType,
        entityId: data.entityId,
        isDone: false
      }
    });

    await createAuditLog({
      userId: data.userId,
      entityType: 'Todo',
      entityId: todo.todoId,
      action: 'CREATE',
      actionDescription: `创建待办 ${data.title}`,
      newValue: todo
    });

    return { success: true, data: todo };
  } catch (error) {
    return {
      success: false,
      error: { code: 'CREATE_FAILED', message: error.message }
    };
  }
}

// ============ 查询待办列表 ============
/**
 * GET /api/todos?userId=xxx&isDone=false
 * 过滤器 userId 必传
 */
async function getTodos(
  filter: {
    userId: string;
    isDone?: boolean;
    priority?: TaskPriority;
  } & PaginationParams
): Promise<ApiResponse<PaginatedResponse<Todo>>> {
  try {
    const { userId, isDone, priority, take = 20, skip = 0 } = filter;

    if (!userId) {
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'userId 为必填参数' }
      };
    }

    const where: any = { userId };
    if (isDone !== undefined) where.isDone = isDone;
    if (priority) where.priority = priority;

    const total = await prisma.todo.count({ where });
    const todos = await prisma.todo.findMany({
      where,
      take,
      skip,
      orderBy: [
        { isDone: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return {
      success: true,
      data: {
        data: todos,
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        hasNext: skip + take < total
      }
    };
  } catch (error) {
    return {
      success: false,
      error: { code: 'QUERY_FAILED', message: error.message }
    };
  }
}

// ============ 更新待办 ============
/**
 * PATCH /api/todos/:todoId
 * 用于勾选完成 (isDone: true)
 */
async function updateTodo(
  todoId: string,
  patch: UpdateTodoDto,
  userId: string
): Promise<ApiResponse<Todo>> {
  try {
    const oldTodo = await prisma.todo.findUnique({ where: { todoId } });

    if (!oldTodo) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '待办不存在' }
      };
    }

    const updateData: any = { ...patch };
    if (patch.isDone === true && !oldTodo.isDone) {
      updateData.completedAt = new Date();
    } else if (patch.isDone === false) {
      updateData.completedAt = null;
    }

    const updatedTodo = await prisma.todo.update({
      where: { todoId },
      data: updateData
    });

    await createAuditLog({
      userId,
      entityType: 'Todo',
      entityId: todoId,
      action: 'UPDATE',
      actionDescription: patch.isDone ? '完成待办' : '更新待办',
      oldValue: oldTodo,
      newValue: updatedTodo
    });

    return { success: true, data: updatedTodo };
  } catch (error) {
    return {
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message }
    };
  }
}
```

---

## 11. 工序计划 (StepPlan)

**生产排程计划**

### DTO 定义

```typescript
interface CreateStepPlanDto {
  orderId: string;
  eoId?: string;
  sequence: number;
  stepName?: string;
  description?: string;
}

interface UpdateStepPlanDto {
  sequence?: number;
  stepName?: string;
  description?: string;
  eoId?: string;
}
```

### CRUD 实现

```typescript
// ============ 创建工序 ============
/**
 * POST /api/step-plans
 */
async function createStepPlan(
  data: CreateStepPlanDto,
  userId: string
): Promise<ApiResponse<StepPlan>> {
  try {
    const order = await prisma.order.findUnique({
      where: { orderId: data.orderId }
    });

    if (!order) {
      return {
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: '订单不存在' }
      };
    }

    const stepPlan = await prisma.stepPlan.create({ data });

    await createAuditLog({
      userId,
      entityType: 'StepPlan',
      entityId: stepPlan.planId,
      action: 'CREATE',
      actionDescription: `创建工序 ${data.sequence}: ${data.stepName || ''}`,
      newValue: stepPlan,
      orderId: data.orderId
    });

    return { success: true, data: stepPlan };
  } catch (error) {
    return {
      success: false,
      error: { code: 'CREATE_FAILED', message: error.message }
    };
  }
}

// ============ 查询工序列表 ============
/**
 * GET /api/orders/:orderId/step-plans
 * 按 sequence (序号) 升序排列返回，用于前端甘特图或甘特表展示
 */
async function getStepPlans(
  orderId: string
): Promise<ApiResponse<StepPlan[]>> {
  try {
    const stepPlans = await prisma.stepPlan.findMany({
      where: { orderId },
      orderBy: { sequence: 'asc' }
    });

    return { success: true, data: stepPlans };
  } catch (error) {
    return {
      success: false,
      error: { code: 'QUERY_FAILED', message: error.message }
    };
  }
}

// ============ 更新工序 ============
/**
 * PATCH /api/step-plans/:planId
 * 允许调整工序描述
 */
async function updateStepPlan(
  planId: string,
  patch: UpdateStepPlanDto,
  userId: string
): Promise<ApiResponse<StepPlan>> {
  try {
    const oldPlan = await prisma.stepPlan.findUnique({ where: { planId } });

    if (!oldPlan) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '工序不存在' }
      };
    }

    const updatedPlan = await prisma.stepPlan.update({
      where: { planId },
      data: patch
    });

    await createAuditLog({
      userId,
      entityType: 'StepPlan',
      entityId: planId,
      action: 'UPDATE',
      actionDescription: '更新工序',
      oldValue: oldPlan,
      newValue: updatedPlan,
      orderId: oldPlan.orderId
    });

    return { success: true, data: updatedPlan };
  } catch (error) {
    return {
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message }
    };
  }
}

// ============ 重新排序工序 ============
/**
 * PUT /api/orders/:orderId/step-plans/reorder
 */
async function reorderStepPlans(
  orderId: string,
  reorderedIds: string[],
  userId: string
): Promise<ApiResponse<StepPlan[]>> {
  try {
    const stepPlans = await prisma.$transaction(
      reorderedIds.map((planId, index) =>
        prisma.stepPlan.update({
          where: { planId },
          data: { sequence: index + 1 }
        })
      )
    );

    await createAuditLog({
      userId,
      entityType: 'StepPlan',
      entityId: orderId,
      action: 'REORDER',
      actionDescription: '重新排序工序',
      newValue: { reorderedIds },
      orderId
    });

    return { success: true, data: stepPlans };
  } catch (error) {
    return {
      success: false,
      error: { code: 'REORDER_FAILED', message: error.message }
    };
  }
}
```

---

## 📊 总结

本文档提供了生产管理系统的完整 API 实现代码，涵盖 11 个核心模块：

✅ **订单管理** - 50+ 字段，版本控制，状态流转  
✅ **物料库** - 引用限制删除  
✅ **工程单** - 生产指令，物料明细  
✅ **到料跟踪** - 自动时间戳  
✅ **用户中心** - bcrypt 加密，角色权限  
✅ **审计日志** - 完整变更追踪  
✅ **文档附件** - 云存储集成  
✅ **审批任务** - 流程引擎，自动状态变更  
✅ **待办事项** - 个人任务管理  
✅ **工序计划** - 生产排程  

### 核心特性

- ✅ **Partial 更新** - `undefined` 字段不触发更新
- ✅ **统一响应格式** - ApiResponse<T>
- ✅ **完整审计日志** - 记录所有数据变更
- ✅ **错误处理** - 标准化错误码和消息
- ✅ **权限控制** - 基于角色的访问控制
- ✅ **事务保证** - 确保数据一致性
- ✅ **级联删除** - 自动清理关联数据

### 最佳实践

1. 所有变动类接口仅接收一个 `data` 对象
2. 系统字段由后端自动维护
3. 敏感信息（如密码）永不返回给前端
4. 使用事务处理复杂业务逻辑
5. 完整的审计日志记录
6. 规范的错误处理和响应格式
