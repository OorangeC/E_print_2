import { z } from 'zod';

/**
 * 订单基础 Schema (白名单定义)
 * 仅列出允许从前端传入的字段，审计字段和系统主键被排除在外
 */
export const orderBaseSchema = z.object({
    // 前端必要的标识字段
    order_id: z.string().optional(),         // 前端的订单号字段
    order_ver: z.string().optional(),        // 订单版本
    order_unique: z.string().optional(),     // 唯一索引
    sales: z.string().optional(),            // 业务员名称或工号
    audit: z.string().optional(),            // 审单员名称或工号

    cpcQueRen: z.boolean().optional(),
    waixiaoFlag: z.boolean().optional(),
    cpsiaYaoqiu: z.boolean().optional(),
    dingZhiBeiZhu: z.string().optional(),

    customer: z.string().trim().optional().or(z.literal('')),
    productName: z.string().trim().optional().or(z.literal('')),
    orderNumber: z.string().optional(),
    jiuBianMa: z.string().optional(),
    isbn: z.string().optional(),
    customerPO: z.string().optional(),
    baoJiaDanHao: z.string().optional(),
    xiLieDanMing: z.string().optional(),
    qiTaShiBie: z.string().optional(),

    chanPinDaLei: z.string().optional(),
    ziLeiXing: z.string().optional(),
    zhuangDingFangShi: z.string().optional(),
    fscType: z.string().optional(),
    fenBanShuoMing: z.string().optional(),
    baoLiuQianSe: z.string().optional(),
    genSeZhiShi: z.string().optional(),
    yongTu: z.string().optional(),
    keLaiXinXi: z.string().optional(),

    dingDanShuLiang: z.coerce.number().int().optional(),
    chuYangShuLiang: z.coerce.number().int().optional(),
    chaoBiLiShuLiang: z.coerce.number().int().optional(),
    teShuLiuYangZhang: z.coerce.number().int().optional(),
    beiPinShuLiang: z.coerce.number().int().optional(),
    teShuLiuShuYang: z.coerce.number().int().optional(),
    zongShuLiang: z.coerce.number().int().optional(),
    chuHuoShuLiang: z.coerce.number().int().optional(),
    chuYangShuoMing: z.coerce.number().int().optional(),

    guigeGaoMm: z.coerce.number().optional(),
    guigeKuanMm: z.coerce.number().optional(),
    guigeHouMm: z.coerce.number().optional(),

    // 产品明细行
    chanPinMingXi: z.array(z.object({
        neiWen: z.string().optional(),
        yongZhiChiCun: z.string().optional(),
        pinPai: z.string().optional(),
        keZhong: z.coerce.number().optional(),
        zhiLei: z.string().optional(),
        chanDi: z.string().optional(),
        FSC: z.string().optional(),
        yeShu: z.coerce.number().optional(),
        yinSe: z.string().optional(),
        zhuanSe: z.string().optional(),
        biaoMianChuLi: z.string().optional(),
        zhuangDingGongYi: z.string().optional(),
        houDu: z.any().optional(), // 前端可能是 number 或 string
        beiZhu: z.string().optional(),
    })).optional(),

    // 说明区
    fuLiaoShuoMing: z.string().optional(),
    chanPinMingXiTeBieShuoMing: z.string().optional(),
    fenBanShuoMing2: z.string().optional(),
    wuLiaoShuoMing: z.string().optional(),
    yinShuaGenSeYaoQiu: z.string().optional(),
    zhuangDingShouGongYaoQiu: z.string().optional(),
    qiTa: z.string().optional(),
    zhiLiangYaoQiu: z.string().optional(),

    // 经办人员 (前端只读)
    yeWuDaiBiaoFenJi: z.string().optional(),
    yeWuRiqi: z.string().optional(),
    shenHeRen: z.string().optional(),
    shenHeRiqi: z.string().optional(),
    daYinRen: z.string().optional(),
    daYinRiqi: z.string().optional(),

    // 排期相关字段
    xiaZiliaodaiRiqiRequired: z.string().optional(),
    xiaZiliaodaiRiqiPromise: z.string().optional(),
    yinzhangRiqiRequired: z.string().optional(),
    yinzhangRiqiPromise: z.string().optional(),
    zhepaiRiqiRequired: z.string().optional(),
    zhepaiRiqiPromise: z.string().optional(),
    chuyangRiqiRequired: z.string().optional(),
    chuyangRiqiPromise: z.string().optional(),
    chuHuoRiqiRequired: z.string().optional(),
    chuHuoRiqiPromise: z.string().optional(),

    // 状态和评论 (虽然主要是后端控制，但前端可能会回传)
    orderstatus: z.string().optional(),
    keHuFanKui: z.string().optional(),
    teShuYaoQiu: z.string().optional(),
    kongZhiFangFa: z.string().optional(),
    dingDanTeBieShuoMing: z.string().optional(),
    yangPinPingShenXinXi: z.string().optional(),
    dingDanPingShenXinXi: z.string().optional(),
});

/**
 * 1. 草稿校验模式 (Partial)
 * 允许所有字段为空，仅做类型和白名单过滤
 */
export const draftOrderSchema = orderBaseSchema.partial();

/**
 * 2. 提交校验模式 (Strict)
 * 目前业务要求：仅强制客户名称必填，其余字段按需填写
 */
export const submitOrderSchema = orderBaseSchema.extend({
    customer: z.string().trim().min(1, '客户名称为必填项'),
});

export type OrderInput = z.infer<typeof orderBaseSchema>;
