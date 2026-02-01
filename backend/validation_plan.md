# 订单校验与草稿逻辑方案 (Validation & Draft Plan)

基于您的要求，我们需要在后端引入 **Zod 白名单校验**，并实现“宽口径草稿”与“严格提交”的双重逻辑。

## 1. 核心设计思路

我们将校验分为两层，对应不同的业务场景：

### A. 草稿模式 (DRAFT)
*   **逻辑**：允许“全空”保存。即使没有填写 `customer`，也允许暂存到数据库中。
*   **用途**：随时保存，防止数据丢失。
*   **后端动作**：`orderSchema.partial()`。执行白名单过滤（剔除非法字段），但不强制任何字段。

### B. 提交模式 (SUBMISSION)
*   **逻辑**：严格校验必填字段（如客户名、产品名、订单量等）。
*   **用途**：当订单状态变为 `PENDING_REVIEW` (待审核) 时触发。
*   **后端动作**：执行完整的 Zod Schema 校验，如果不符合规则，拒绝写入数据库并返回 400 错误。

---

## 2. 技术方案对标

## 2. 安全与审计保护 (Audit & System Protection)

*   **强制剥离系统字段**：审计相关字段（`auditLogs`、`submittedAt`、`reviewedAt` 等）以及系统生成的 ID 和版本号（`orderId`、`versionNumber`）**禁止由前端 JSON 直接改写**。
*   **后端权威性**：所有保存动作（无论是草稿还是提交）都会经过 Zod 白名单。如果前端传了 `auditLogs`，后端会直接将其从 payload 中剔除。审计日志仅由后端 Service 在执行 `submit` 或 `approve` 动作时根据业务逻辑自动追加。

### 部分更新 (Partial Update)
`updateOrder` 函数将升级为真正的增量更新：
1.  **基础字段**：使用 `Prisma.OrderUpdateInput`。
2.  **关联字段 (orderItems)**：采用“覆盖式更新”策略，如果前端传了明细数组，后端先清理旧记录再同步新记录。

---

## 3. 执行计划

1.  **安装 Zod**：在 `backend` 目录下添加依赖。
2.  **定义 Schema**：在 `backend/src/schemas/orderSchema.ts` 定义校验规则。
3.  **重构 Service**：
    *   `saveAsDraft(id, data)`: 使用 Partial Schema。
    *   `submitOrder(id, data)`: 使用 Strict Schema，成功后更新状态为 `PENDING_REVIEW`。

---

## 4. 前端对标点
根据 `OrderCreator.vue` 的逻辑，目前前端在 `handleSubmitOrder` 时会手动检查 `customer`。
**改进建议**：后端实施 Zod 校验后，前端可以取消简单的 `if(!orderData.customer)`，转而捕获后端返回的详细错误列表（例如：“产品名缺失”、“数量必须大于0”等），提升用户体验。

**您是否同意我按照这个“分级校验”的逻辑去实施代码修改？**
