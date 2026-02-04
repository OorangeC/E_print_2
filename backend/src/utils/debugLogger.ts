/**
 * 🔍 调试日志工具
 * 
 * 用途：追踪前后端数据流，方便调试
 * 删除方法：
 * 1. 删除此文件 (backend/src/utils/debugLogger.ts)
 * 2. 删除所有文件中的 import { ... } from './utils/debugLogger'
 * 3. 删除所有 logAPI(), logService(), logDTO() 等调用
 */

// 是否启用调试日志（设为 false 可快速关闭所有日志）
const DEBUG_ENABLED = true;

// 颜色代码（用于终端输出）
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

/**
 * API 层日志（入口）
 */
export function logAPI(endpoint: string, data: any) {
    if (!DEBUG_ENABLED) return;
    
    console.log(`\n${colors.cyan}${'='.repeat(50)}${colors.reset}`);
    console.log(`${colors.cyan}📡 [API] ${endpoint}${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(50)}${colors.reset}`);
    
    if (data.method) {
        console.log(`${colors.bright}Method:${colors.reset}`, data.method);
    }
    if (data.query) {
        console.log(`${colors.bright}Query 参数:${colors.reset}`, JSON.stringify(data.query, null, 2));
    }
    if (data.body) {
        console.log(`${colors.bright}Body 字段:${colors.reset}`, Object.keys(data.body));
        if (data.body.workOrderJson) {
            console.log(`${colors.bright}workOrderJson (前50字符):${colors.reset}`, data.body.workOrderJson.substring(0, 50) + '...');
        }
        if (data.body.orderData) {
            console.log(`${colors.bright}orderData (前50字符):${colors.reset}`, data.body.orderData.substring(0, 50) + '...');
        }
    }
    if (data.files) {
        console.log(`${colors.bright}上传文件数:${colors.reset}`, data.files);
    }
}

/**
 * API 成功响应日志
 */
export function logAPISuccess(endpoint: string, result: any) {
    if (!DEBUG_ENABLED) return;
    
    console.log(`${colors.green}✅ [API] ${endpoint} 成功${colors.reset}`);
    if (Array.isArray(result)) {
        console.log(`${colors.green}返回记录数: ${result.length}${colors.reset}`);
    } else if (result?.work_id || result?.order_id) {
        console.log(`${colors.green}返回 ID: ${result.work_id || result.order_id}${colors.reset}`);
    }
    console.log(`${colors.cyan}${'='.repeat(50)}${colors.reset}\n`);
}

/**
 * API 错误日志
 */
export function logAPIError(endpoint: string, error: any) {
    if (!DEBUG_ENABLED) return;
    
    console.error(`${colors.red}❌ [API] ${endpoint} 失败${colors.reset}`);
    console.error(`${colors.red}错误信息: ${error.message}${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(50)}${colors.reset}\n`);
}

/**
 * Service 层日志（业务逻辑）
 */
export function logService(functionName: string, data: any) {
    if (!DEBUG_ENABLED) return;
    
    console.log(`${colors.yellow}🔧 [Service] ${functionName}${colors.reset}`);
    
    if (data.input) {
        console.log(`${colors.bright}输入参数:${colors.reset}`, data.input);
    }
    if (data.parsed) {
        console.log(`${colors.bright}解析后字段:${colors.reset}`, Object.keys(data.parsed));
    }
    if (data.fields) {
        console.log(`${colors.bright}关键字段:${colors.reset}`);
        Object.entries(data.fields).forEach(([key, value]) => {
            console.log(`  - ${key}: ${value}`);
        });
    }
    if (data.dbQuery) {
        console.log(`${colors.bright}数据库查询条件:${colors.reset}`, JSON.stringify(data.dbQuery, null, 2));
    }
    if (data.dbResult !== undefined) {
        if (Array.isArray(data.dbResult)) {
            console.log(`${colors.bright}数据库返回: ${data.dbResult.length} 条记录${colors.reset}`);
            if (data.dbResult.length > 0) {
                console.log(`${colors.bright}第一条记录 ID:${colors.reset}`, data.dbResult[0].workId || data.dbResult[0].orderNumber);
            }
        } else {
            console.log(`${colors.bright}数据库返回:${colors.reset}`, data.dbResult ? '成功' : '失败');
        }
    }
}

/**
 * Service 成功日志
 */
export function logServiceSuccess(functionName: string, message?: string) {
    if (!DEBUG_ENABLED) return;
    
    console.log(`${colors.green}✅ [Service] ${functionName} ${message || '完成'}${colors.reset}`);
}

/**
 * Service 错误日志
 */
export function logServiceError(functionName: string, error: any) {
    if (!DEBUG_ENABLED) return;
    
    console.error(`${colors.red}❌ [Service] ${functionName} 失败: ${error.message}${colors.reset}`);
}

/**
 * DTO 转换日志
 */
export function logDTO(functionName: string, data: any) {
    if (!DEBUG_ENABLED) return;
    
    console.log(`${colors.magenta}🔄 [DTO] ${functionName}${colors.reset}`);
    
    if (data.input) {
        console.log(`${colors.bright}输入字段:${colors.reset}`, Object.keys(data.input));
    }
    if (data.mapping) {
        console.log(`${colors.bright}字段映射:${colors.reset}`);
        Object.entries(data.mapping).forEach(([from, to]) => {
            console.log(`  ${from} → ${to}`);
        });
    }
    if (data.output) {
        console.log(`${colors.bright}输出字段:${colors.reset}`, Object.keys(data.output));
    }
}

/**
 * 数据流追踪日志（完整追踪某个字段）
 */
export function logDataFlow(fieldName: string, stages: { stage: string; value: any }[]) {
    if (!DEBUG_ENABLED) return;
    
    console.log(`\n${colors.blue}📊 数据流追踪: ${fieldName}${colors.reset}`);
    stages.forEach(({ stage, value }) => {
        console.log(`  ${stage}: ${JSON.stringify(value)}`);
    });
    console.log('');
}

/**
 * 分隔线
 */
export function logSeparator(title?: string) {
    if (!DEBUG_ENABLED) return;
    
    if (title) {
        console.log(`\n${colors.bright}━━━━━━━━━━ ${title} ━━━━━━━━━━${colors.reset}`);
    } else {
        console.log(`${colors.bright}${'─'.repeat(50)}${colors.reset}`);
    }
}

/**
 * 警告日志
 */
export function logWarning(message: string, data?: any) {
    if (!DEBUG_ENABLED) return;
    
    console.warn(`${colors.yellow}⚠️  警告: ${message}${colors.reset}`);
    if (data) {
        console.warn(`${colors.yellow}详情:${colors.reset}`, data);
    }
}

/**
 * 快速开关调试日志
 * 在代码中设置 setDebugEnabled(false) 即可关闭所有日志
 */
export function setDebugEnabled(enabled: boolean) {
    // 注意：这只在运行时有效，要永久关闭请修改文件顶部的 DEBUG_ENABLED
    Object.defineProperty(exports, 'DEBUG_ENABLED', { value: enabled, writable: false });
}
