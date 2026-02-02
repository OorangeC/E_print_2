export interface IUser {
  // ======== 基础账号信息 ========
  userId: string // string: 用户唯一标识符 (UUID或工号)
  username: string // string: 登录账号名
  email: string // string: 电子邮箱
  passwordHash: string // string: 加密后的密码哈希值 (前端不存储明文)
  fullName: string // string: 用户真实姓名
  isActive: boolean // boolean: 账号是否启用

  // ======== 提交与审核权限 (流程控制) ========
  order_submit: boolean // boolean: 订单提交权限 (业务员)
  order_audit: boolean // boolean: 订单审核权限 (审单员/主管)
  work_submit: boolean // boolean: 工程单提交权限 (制单员)
  work_audit: boolean // boolean: 工程单审核权限 (工程主管)

  // ======== 查看和修改权限 (模块准入) ========
  order_check: boolean // boolean: 订单查看权限
  work_check: boolean // boolean: 工程单查看权限
  pmc_check: boolean // boolean: PMC(生产排期)查看权限
  pmc_edit: boolean // boolean: PMC(生产排期)修改权限

  // ======== 查看和修改发货 (物流权限) ========
  delieve_check: boolean // boolean: 发货/出库记录查看权限
  delieve_edit: boolean // boolean: 发货/出库单据编辑权限

  // ======== 系统辅助字段 ========
  lastLogin?: string // string: 最后登录时间 (yyyy-mm-dd HH:mm:ss)
}

// export function createUser(input: Pick<IUser, 'fullName' | 'role'> & Partial<IUser>): IUser {
//   const { fullName, role, ...rest } = input

//   // 初始化基础字段和默认权限
//   const user: IUser = {
//     userId: '',
//     username: '',
//     email: '',
//     passwordHash: '',
//     fullName,
//     role,
//     isActive: true,

//     // 提交 / 审核权限
//     order_submit: false,
//     order_audit: false,
//     work_submit: false,
//     work_audit: false,

//     // 查看 / 修改权限
//     order_check: false,
//     work_check: false,
//     pmc_check: false,
//     pmc_edit: false,

//     // 查看和修改发货
//     delieve_check: false,
//     delieve_edit: false,

//     ...rest, // 覆盖额外字段
//   }

//   // 根据 role 给权限赋值
//   switch (role) {
//     case UserRole.Sales:
//       user.order_submit = true
//       break
//     case UserRole.Audit:
//       user.order_audit = true
//       user.work_audit = true
//       break
//     case UserRole.PMC:
//       user.pmc_check = true
//       user.pmc_edit = true
//       break
//     case UserRole.Admin:
//       user.order_submit = true
//       user.order_audit = true
//       user.work_submit = true
//       user.work_audit = true
//       user.order_check = true
//       user.work_check = true
//       user.pmc_check = true
//       user.pmc_edit = true
//       user.delieve_check = true
//       user.delieve_edit = true
//       break
//   }

//   return user
// }
