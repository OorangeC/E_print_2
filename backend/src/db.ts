import { PrismaClient as MySQLClient } from './generated/mysql';
import { PrismaClient as MongoClient } from './generated/mongodb';

export const sqlDB = new MySQLClient({
    log: ['query', 'info', 'warn', 'error'],
});

export const mongoDB = new MongoClient({
    log: ['info', 'warn', 'error'],
});
