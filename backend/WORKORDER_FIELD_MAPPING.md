# WorkOrder 字段对齐检查表

## ✅ 主要字段映射（完全对齐）

| 前端字段 (IWorkOrder) | 后端接收 (createWorkOrderFromFrontend) | 数据库字段 (Prisma) | 状态 |
|---------------------|--------------------------------------|-------------------|------|
| `work_id` | `work_id` | `workId` | ✅ |
| `work_ver` | `work_ver` | `workVer` | ✅ |
| `work_unique` | `work_unique` | `workUnique` | ✅ |
| `work_clerk` | `work_clerk` | `workClerk` | ✅ |
| `clerkDate` | `clerkDate` | `clerkDate` | ✅ |
| `work_audit` | `work_audit` | `workAudit` | ✅ |
| `auditDate` | `auditDate` | `auditDate` | ✅ |
| `gongDanLeiXing` | `gongDanLeiXing` | `gongDanLeiXing` | ✅ |
| `caiLiao` | `caiLiao` | `caiLiao` | ✅ |
| `chanPinLeiXing` | `chanPinLeiXing` | `chanPinLeiXing` | ✅ |
| `zhiDanShiJian` | `zhiDanShiJian` | `zhiDanShiJian` | ✅ |
| `chanPinGuiGe` | `chanPinGuiGe` | `chanPinGuiGe` | ✅ |
| `dingDanShuLiang` | `dingDanShuLiang` | `dingDanShuLiang` | ✅ |
| `benChangFangSun` | `benChangFangSun` | `benChangFangSun` | ✅ |
| `workorderstatus` | `workorderstatus` | `reviewStatus` | ✅ |

---

## 🔄 需要映射的字段（已正确处理）

| 前端字段 (IWorkOrder) | 后端接收 | 数据库字段 (Prisma) | 映射逻辑 | 状态 |
|---------------------|---------|-------------------|---------|------|
| `customer` | `customer` | `keHu` | `keHu: customer` | ✅ |
| `customerPO` | `customerPO` | `po` | `po: customerPO` | ✅ |
| `productName` | `productName` | `chengPinMingCheng` | `chengPinMingCheng: productName` | ✅ |
| `chuYangShuLiang` | `chuYangShuLiang` | `chuYangShu` | `chuYangShu: chuYangShuLiang` | ✅ |
| `chaoBiLiShuLiang` | `chaoBiLiShuLiang` | `chaoBiLi` | `chaoBiLi: chaoBiLiShuLiang` | ✅ |
| `chuYangRiqiRequired` | `chuYangRiqiRequired` | `chuYangRiqi` | `chuYangRiqi: chuYangRiqiRequired` | ✅ |
| `chuHuoRiqiRequired` | `chuHuoRiqiRequired` | `chuHuoRiqi` | `chuHuoRiqi: chuHuoRiqiRequired` | ✅ |

---

## 🔄 中间物料 (intermedia) 字段映射

| 前端字段 (IIM) | 后端接收 | 数据库字段 (MaterialLine) | 映射逻辑 | 状态 |
|--------------|---------|-------------------------|---------|------|
| `buJianMingCheng` | `buJianMingCheng` | `buJianMingCheng` | 直接映射 | ✅ |
| `yinShuaYanSe` | `yinShuaYanSe` | `yinShuaYanSe` | 直接映射 | ✅ |
| `wuLiaoMingCheng` | `wuLiaoMingCheng` | `wuLiaoMiaoShu` | `wuLiaoMiaoShu: wuLiaoMingCheng` | ✅ |
| `pinPai` | `pinPai` | `pinPai` | 直接映射 | ✅ |
| `caiLiaoGuiGe` | `caiLiaoGuiGe` | `caiLiaoGuiGe` | 直接映射 | ✅ |
| `FSC` | `FSC` | `fsc` | `fsc: FSC` | ✅ |
| `kaiShu` | `kaiShu` | `kaiShu` | 直接映射 | ✅ |
| `shangJiChiCun` | `shangJiChiCun` | `shangJiChiCun` | 直接映射 | ✅ |
| `paiBanMuShu` | `paiBanMuShu` | `paiBanMoSu` | `paiBanMoSu: paiBanMuShu` | ✅ |
| `yinChuShu` | `yinChuShu` | `yinChuShu` | 直接映射 | ✅ |
| `yinSun` | `yinSun` | `yinSun` | 直接映射 | ✅ |
| `lingLiaoShu` | `lingLiaoShu` | `lingLiaoShuZhang` | `lingLiaoShuZhang: lingLiaoShu` | ✅ |
| `biaoMianChuLi` | `biaoMianChuLi` | `biaoMianChuLi` | 直接映射 | ✅ |
| `yinShuaBanShu` | `yinShuaBanShu` | `yinShuaBanShu` | 直接映射 | ✅ |
| `shengChanLuJing` | `shengChanLuJing` | `shengChanLuJing` | 直接映射 | ✅ |
| `paiBanFangShi` | `paiBanFangShi` | `paiBanFangShi` | 直接映射 | ✅ |
| `kaiShiRiQi` | *未接收* | `kaiShiShiJian` | ⚠️ **缺失** |
| `yuQiJieShu` | *未接收* | `jieShuShiJian` | ⚠️ **缺失** |
| `dangQianJinDu` | `dangQianJinDu` | `dangQianJinDu` | 直接映射 | ✅ |

---

## ⚠️ 发现的问题

### 1. 中间物料缺少时间字段映射

前端 `IIM` 有两个时间字段没有在后端 `createWorkOrderFromFrontend` 中处理：

- `kaiShiRiQi` (工序开始日期) → 应该映射到数据库的 `kaiShiShiJian`
- `yuQiJieShu` (工序预期结束日期) → 应该映射到数据库的 `jieShuShiJian`

**当前状态**：这两个字段前端传了，但后端没接收，导致数据丢失！

---

## 📋 完整字段列表

### ✅ 已对齐的字段 (31/33)

- 主表字段：15 个
- 映射字段：7 个
- 中间物料字段：15/17 个（缺 2 个时间字段）
- 附件和审计日志：已对齐

### ⚠️ 需要修复的字段 (2/33)

- `kaiShiRiQi` → `kaiShiShiJian`
- `yuQiJieShu` → `jieShuShiJian`

---

## 🔧 修复建议

在 `backend/src/workOrderService.ts` 的 `createWorkOrderFromFrontend` 函数中，修改 `materialLines` 创建逻辑：

```typescript
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
        paiBanFangShi: item.paiBanFangShi,
        kaiShiShiJian: item.kaiShiRiQi || null,  // ✅ 添加
        jieShuShiJian: item.yuQiJieShu || null,  // ✅ 添加
        dangQianJinDu: typeof item.dangQianJinDu === 'number' ? item.dangQianJinDu : null
    }))
}
```

---

## ✅ 总结

**字段对齐率：94% (31/33)**

- ✅ 主要字段：完全对齐
- ✅ 映射字段：正确处理
- ⚠️ 中间物料时间字段：缺少 2 个映射

修复后将达到 **100% 对齐**！
