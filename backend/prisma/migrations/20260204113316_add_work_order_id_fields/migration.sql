/*
  Warnings:

  - You are about to drop the column `order_id` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to alter the column `new_value` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `old_value` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to drop the column `order_id` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `bao_jia_yong_zhi_chi_cun` on the `materials` table. All the data in the column will be lost.
  - You are about to drop the column `material_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `order_number` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `previous_order_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `review_tasks` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `step_plans` table. All the data in the column will be lost.
  - Added the required column `work_id` to the `engineering_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `work_unique` to the `engineering_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `work_ver` to the `engineering_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_number` to the `review_tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_number` to the `step_plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "engineering_order_material_lines" ADD COLUMN "dang_qian_jin_du" REAL;

-- CreateTable
CREATE TABLE "order_items" (
    "order_item_id" TEXT NOT NULL PRIMARY KEY,
    "order_number" TEXT NOT NULL,
    "material_id" TEXT,
    "nei_wen" TEXT,
    "yong_zhi_chi_cun" TEXT,
    "hou_du" TEXT,
    "ke_zhong" INTEGER,
    "chan_di" TEXT,
    "pin_pai" TEXT,
    "zhi_lei" TEXT,
    "FSC" TEXT,
    "ye_shu" INTEGER,
    "yin_se" TEXT,
    "zhuan_se" TEXT,
    "biao_mian_chu_li" TEXT,
    "zhuang_ding_gong_yi" TEXT,
    "bei_zhu" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "order_items_order_number_fkey" FOREIGN KEY ("order_number") REFERENCES "orders" ("order_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_items_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials" ("material_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_audit_logs" (
    "log_id" TEXT NOT NULL PRIMARY KEY,
    "order_number" TEXT,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "action_description" TEXT,
    "user_id" TEXT NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" TEXT,
    "time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_order_number_fkey" FOREIGN KEY ("order_number") REFERENCES "orders" ("order_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_audit_logs" ("action", "action_description", "entity_id", "entity_type", "ip_address", "log_id", "new_value", "old_value", "time", "user_id") SELECT "action", "action_description", "entity_id", "entity_type", "ip_address", "log_id", "new_value", "old_value", "time", "user_id" FROM "audit_logs";
DROP TABLE "audit_logs";
ALTER TABLE "new_audit_logs" RENAME TO "audit_logs";
CREATE INDEX "audit_logs_order_number_idx" ON "audit_logs"("order_number");
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX "audit_logs_time_idx" ON "audit_logs"("time");
CREATE TABLE "new_documents" (
    "document_id" TEXT NOT NULL PRIMARY KEY,
    "order_number" TEXT,
    "eo_id" TEXT,
    "category" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT,
    "file_size" INTEGER,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documents_order_number_fkey" FOREIGN KEY ("order_number") REFERENCES "orders" ("order_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "documents_eo_id_fkey" FOREIGN KEY ("eo_id") REFERENCES "engineering_orders" ("engineering_order_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_documents" ("category", "document_id", "file_name", "file_size", "file_url", "uploaded_at") SELECT "category", "document_id", "file_name", "file_size", "file_url", "uploaded_at" FROM "documents";
DROP TABLE "documents";
ALTER TABLE "new_documents" RENAME TO "documents";
CREATE INDEX "documents_order_number_idx" ON "documents"("order_number");
CREATE INDEX "documents_eo_id_idx" ON "documents"("eo_id");
CREATE INDEX "documents_category_idx" ON "documents"("category");
CREATE TABLE "new_engineering_orders" (
    "engineering_order_id" TEXT NOT NULL PRIMARY KEY,
    "work_id" TEXT NOT NULL,
    "work_ver" TEXT NOT NULL,
    "work_unique" TEXT NOT NULL,
    "work_clerk" TEXT,
    "clerk_date" TEXT,
    "work_audit" TEXT,
    "audit_date" TEXT,
    "gong_si_ming_cheng" TEXT,
    "gong_cheng_dan_ming_cheng" TEXT,
    "gong_dan_lei_xing" TEXT,
    "cai_liao" TEXT,
    "chan_pin_lei_xing" TEXT,
    "zhi_dan_shi_jian" DATETIME,
    "ding_dan_xu_hao" INTEGER,
    "ke_hu" TEXT,
    "po" TEXT,
    "cheng_pin_ming_cheng" TEXT,
    "chan_pin_gui_ge" TEXT,
    "ding_dan_shu_liang" INTEGER,
    "chu_yang_shu" INTEGER,
    "chao_bi_li" INTEGER,
    "ben_chang_fang_sun" INTEGER,
    "chu_yang_riqi" DATETIME,
    "chu_huo_riqi" DATETIME,
    "chan_pin_yao_qiu" TEXT,
    "zhi_dan" TEXT,
    "shen_he" TEXT,
    "ben_chang_nei_bu_gong_xu" TEXT,
    "appendix" TEXT,
    "ren_li_requirement" INTEGER,
    "yu_ji_gong_qi" TEXT,
    "kai_shi_shi_jian" DATETIME,
    "jie_shu_shi_jian" DATETIME,
    "shi_fou_wan_gong" BOOLEAN NOT NULL DEFAULT false,
    "wan_cheng_jin_du" REAL,
    "review_status" TEXT NOT NULL DEFAULT 'PENDING',
    "submitted_at" DATETIME,
    "reviewed_by" TEXT,
    "reviewed_at" DATETIME,
    "review_comments" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_engineering_orders" ("ben_chang_fang_sun", "ben_chang_nei_bu_gong_xu", "cai_liao", "chan_pin_gui_ge", "chan_pin_lei_xing", "chan_pin_yao_qiu", "chao_bi_li", "cheng_pin_ming_cheng", "chu_huo_riqi", "chu_yang_riqi", "chu_yang_shu", "created_at", "ding_dan_shu_liang", "ding_dan_xu_hao", "engineering_order_id", "gong_cheng_dan_ming_cheng", "gong_dan_lei_xing", "gong_si_ming_cheng", "ke_hu", "po", "shen_he", "updated_at", "zhi_dan", "zhi_dan_shi_jian") SELECT "ben_chang_fang_sun", "ben_chang_nei_bu_gong_xu", "cai_liao", "chan_pin_gui_ge", "chan_pin_lei_xing", "chan_pin_yao_qiu", "chao_bi_li", "cheng_pin_ming_cheng", "chu_huo_riqi", "chu_yang_riqi", "chu_yang_shu", "created_at", "ding_dan_shu_liang", "ding_dan_xu_hao", "engineering_order_id", "gong_cheng_dan_ming_cheng", "gong_dan_lei_xing", "gong_si_ming_cheng", "ke_hu", "po", "shen_he", "updated_at", "zhi_dan", "zhi_dan_shi_jian" FROM "engineering_orders";
DROP TABLE "engineering_orders";
ALTER TABLE "new_engineering_orders" RENAME TO "engineering_orders";
CREATE UNIQUE INDEX "engineering_orders_work_unique_key" ON "engineering_orders"("work_unique");
CREATE INDEX "engineering_orders_work_unique_idx" ON "engineering_orders"("work_unique");
CREATE INDEX "engineering_orders_work_clerk_idx" ON "engineering_orders"("work_clerk");
CREATE TABLE "new_materials" (
    "material_id" TEXT NOT NULL PRIMARY KEY,
    "nei_wen" TEXT,
    "yong_zhi_chi_cun" TEXT,
    "hou_du" TEXT,
    "ke_zhong" INTEGER,
    "chan_di" TEXT,
    "pin_pai" TEXT,
    "zhi_lei" TEXT,
    "fsc_info" TEXT,
    "ye_shu" INTEGER,
    "yin_se_zheng_fan" TEXT,
    "zhuan_se_zheng_fan" TEXT,
    "biao_mian_chu_li" TEXT,
    "zhuang_ding_gong_yi" TEXT,
    "bei_zhu" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_materials" ("bei_zhu", "biao_mian_chu_li", "chan_di", "created_at", "fsc_info", "hou_du", "ke_zhong", "material_id", "nei_wen", "pin_pai", "updated_at", "ye_shu", "yin_se_zheng_fan", "zhi_lei", "zhuan_se_zheng_fan", "zhuang_ding_gong_yi") SELECT "bei_zhu", "biao_mian_chu_li", "chan_di", "created_at", "fsc_info", "hou_du", "ke_zhong", "material_id", "nei_wen", "pin_pai", "updated_at", "ye_shu", "yin_se_zheng_fan", "zhi_lei", "zhuan_se_zheng_fan", "zhuang_ding_gong_yi" FROM "materials";
DROP TABLE "materials";
ALTER TABLE "new_materials" RENAME TO "materials";
CREATE TABLE "new_orders" (
    "order_id" TEXT NOT NULL PRIMARY KEY,
    "waixiao_flag" BOOLEAN,
    "cpsia_yaoqiu" TEXT,
    "xia_ziliaodai_riqi_required" DATETIME,
    "xia_ziliaodai_riqi_promise" DATETIME,
    "yinzhang_riqi_required" DATETIME,
    "yinzhang_riqi_promise" DATETIME,
    "zhepai_riqi_required" DATETIME,
    "zhepai_riqi_promise" DATETIME,
    "chuyang_riqi_required" DATETIME,
    "chuyang_riqi_promise" DATETIME,
    "customer" TEXT,
    "product_name" TEXT,
    "customer_po" TEXT,
    "bao_jia_dan_hao" TEXT,
    "jiu_bian_ma" TEXT,
    "isbn" TEXT,
    "xi_lie_dan_ming" TEXT,
    "qi_ta_shi_bie" TEXT,
    "chan_pin_da_lei" TEXT,
    "zi_lei_xing" TEXT,
    "zhuang_ding_fang_shi" TEXT,
    "yong_tu" TEXT,
    "fsc_type" TEXT,
    "fen_ban_shuo_ming" TEXT,
    "gen_se_zhi_shi" TEXT,
    "ke_lai_xin_xi" TEXT,
    "bao_liu_qian_se" TEXT,
    "ding_dan_shu_liang" INTEGER,
    "chu_yang_shu_liang" INTEGER,
    "chao_bi_li_shu_liang" INTEGER,
    "te_shu_liu_yang_zhang" INTEGER,
    "bei_pin_shu_liang" INTEGER,
    "te_shu_liu_shu_yang" INTEGER,
    "zong_shu_liang" INTEGER,
    "chu_huo_shu_liang" INTEGER,
    "guige_gao_mm" REAL,
    "guige_kuan_mm" REAL,
    "guige_hou_mm" REAL,
    "fu_liao_shuo_ming" TEXT,
    "chan_pin_ming_xi_te_bie_shuo_ming" TEXT,
    "fen_ban_shuo_ming_2" TEXT,
    "wu_liao_shuo_ming" TEXT,
    "yin_shua_gen_se_yao_qiu" TEXT,
    "zhuang_ding_shou_gong_yao_qiu" TEXT,
    "qi_ta" TEXT,
    "zhi_liang_yao_qiu" TEXT,
    "ke_hu_fan_kui" TEXT,
    "te_shu_yao_qiu" TEXT,
    "kong_zhi_fang_fa" TEXT,
    "ding_dan_te_bie_shuo_ming" TEXT,
    "yang_pin_ping_shen_xin_xi" TEXT,
    "ding_dan_ping_shen_xin_xi" TEXT,
    "ye_wu_dai_biao_fen_ji" TEXT,
    "shen_he_ren" TEXT,
    "da_yin_ren" TEXT,
    "ye_wu_riqi" DATETIME,
    "shen_he_riqi" DATETIME,
    "da_yin_riqi" DATETIME,
    "version_number" INTEGER NOT NULL DEFAULT 1,
    "previous_order_number" TEXT,
    "is_latest_version" BOOLEAN NOT NULL DEFAULT true,
    "version_tag" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submitted_at" DATETIME,
    "reviewed_at" DATETIME,
    "reviewed_by" TEXT,
    "review_comments" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "orders_previous_order_number_fkey" FOREIGN KEY ("previous_order_number") REFERENCES "orders" ("order_id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("bao_jia_dan_hao", "bao_liu_qian_se", "bei_pin_shu_liang", "chan_pin_da_lei", "chan_pin_ming_xi_te_bie_shuo_ming", "chao_bi_li_shu_liang", "chu_huo_shu_liang", "chu_yang_shu_liang", "chuyang_riqi_promise", "chuyang_riqi_required", "cpsia_yaoqiu", "created_at", "customer", "customer_po", "da_yin_ren", "ding_dan_ping_shen_xin_xi", "ding_dan_shu_liang", "ding_dan_te_bie_shuo_ming", "fen_ban_shuo_ming", "fen_ban_shuo_ming_2", "fsc_type", "fu_liao_shuo_ming", "gen_se_zhi_shi", "guige_gao_mm", "guige_hou_mm", "guige_kuan_mm", "is_latest_version", "isbn", "jiu_bian_ma", "ke_hu_fan_kui", "ke_lai_xin_xi", "kong_zhi_fang_fa", "order_id", "product_name", "qi_ta", "qi_ta_shi_bie", "review_comments", "reviewed_at", "reviewed_by", "shen_he_ren", "status", "submitted_at", "te_shu_liu_shu_yang", "te_shu_liu_yang_zhang", "te_shu_yao_qiu", "updated_at", "version_number", "version_tag", "waixiao_flag", "wu_liao_shuo_ming", "xi_lie_dan_ming", "xia_ziliaodai_riqi_promise", "xia_ziliaodai_riqi_required", "yang_pin_ping_shen_xin_xi", "ye_wu_dai_biao_fen_ji", "yin_shua_gen_se_yao_qiu", "yinzhang_riqi_promise", "yinzhang_riqi_required", "yong_tu", "zhepai_riqi_promise", "zhepai_riqi_required", "zhi_liang_yao_qiu", "zhuang_ding_fang_shi", "zhuang_ding_shou_gong_yao_qiu", "zi_lei_xing", "zong_shu_liang") SELECT "bao_jia_dan_hao", "bao_liu_qian_se", "bei_pin_shu_liang", "chan_pin_da_lei", "chan_pin_ming_xi_te_bie_shuo_ming", "chao_bi_li_shu_liang", "chu_huo_shu_liang", "chu_yang_shu_liang", "chuyang_riqi_promise", "chuyang_riqi_required", "cpsia_yaoqiu", "created_at", "customer", "customer_po", "da_yin_ren", "ding_dan_ping_shen_xin_xi", "ding_dan_shu_liang", "ding_dan_te_bie_shuo_ming", "fen_ban_shuo_ming", "fen_ban_shuo_ming_2", "fsc_type", "fu_liao_shuo_ming", "gen_se_zhi_shi", "guige_gao_mm", "guige_hou_mm", "guige_kuan_mm", "is_latest_version", "isbn", "jiu_bian_ma", "ke_hu_fan_kui", "ke_lai_xin_xi", "kong_zhi_fang_fa", "order_id", "product_name", "qi_ta", "qi_ta_shi_bie", "review_comments", "reviewed_at", "reviewed_by", "shen_he_ren", "status", "submitted_at", "te_shu_liu_shu_yang", "te_shu_liu_yang_zhang", "te_shu_yao_qiu", "updated_at", "version_number", "version_tag", "waixiao_flag", "wu_liao_shuo_ming", "xi_lie_dan_ming", "xia_ziliaodai_riqi_promise", "xia_ziliaodai_riqi_required", "yang_pin_ping_shen_xin_xi", "ye_wu_dai_biao_fen_ji", "yin_shua_gen_se_yao_qiu", "yinzhang_riqi_promise", "yinzhang_riqi_required", "yong_tu", "zhepai_riqi_promise", "zhepai_riqi_required", "zhi_liang_yao_qiu", "zhuang_ding_fang_shi", "zhuang_ding_shou_gong_yao_qiu", "zi_lei_xing", "zong_shu_liang" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE INDEX "orders_customer_po_idx" ON "orders"("customer_po");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_previous_order_number_idx" ON "orders"("previous_order_number");
CREATE INDEX "orders_is_latest_version_idx" ON "orders"("is_latest_version");
CREATE INDEX "orders_version_number_idx" ON "orders"("version_number");
CREATE TABLE "new_review_tasks" (
    "task_id" TEXT NOT NULL PRIMARY KEY,
    "order_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assigned_to" TEXT,
    "result" TEXT NOT NULL DEFAULT 'PENDING',
    "due_date" DATETIME,
    "completed_at" DATETIME,
    "comments" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "review_tasks_order_number_fkey" FOREIGN KEY ("order_number") REFERENCES "orders" ("order_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_review_tasks" ("assigned_to", "comments", "completed_at", "created_at", "description", "due_date", "result", "task_id", "title", "updated_at") SELECT "assigned_to", "comments", "completed_at", "created_at", "description", "due_date", "result", "task_id", "title", "updated_at" FROM "review_tasks";
DROP TABLE "review_tasks";
ALTER TABLE "new_review_tasks" RENAME TO "review_tasks";
CREATE INDEX "review_tasks_order_number_idx" ON "review_tasks"("order_number");
CREATE INDEX "review_tasks_result_idx" ON "review_tasks"("result");
CREATE INDEX "review_tasks_assigned_to_idx" ON "review_tasks"("assigned_to");
CREATE TABLE "new_step_plans" (
    "plan_id" TEXT NOT NULL PRIMARY KEY,
    "order_number" TEXT NOT NULL,
    "eo_id" TEXT,
    "sequence" INTEGER NOT NULL,
    "step_name" TEXT,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "step_plans_order_number_fkey" FOREIGN KEY ("order_number") REFERENCES "orders" ("order_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "step_plans_eo_id_fkey" FOREIGN KEY ("eo_id") REFERENCES "engineering_orders" ("engineering_order_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_step_plans" ("created_at", "description", "eo_id", "plan_id", "sequence", "step_name", "updated_at") SELECT "created_at", "description", "eo_id", "plan_id", "sequence", "step_name", "updated_at" FROM "step_plans";
DROP TABLE "step_plans";
ALTER TABLE "new_step_plans" RENAME TO "step_plans";
CREATE INDEX "step_plans_order_number_idx" ON "step_plans"("order_number");
CREATE INDEX "step_plans_eo_id_idx" ON "step_plans"("eo_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "order_items_order_number_idx" ON "order_items"("order_number");

-- CreateIndex
CREATE INDEX "order_items_material_id_idx" ON "order_items"("material_id");
