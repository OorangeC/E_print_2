-- CreateTable
CREATE TABLE "orders" (
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
    "order_number" TEXT,
    "jiu_bian_ma" TEXT,
    "isbn" TEXT,
    "customer_po" TEXT,
    "bao_jia_dan_hao" TEXT,
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
    "material_id" TEXT,
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
    "version_number" INTEGER NOT NULL DEFAULT 1,
    "previous_order_id" TEXT,
    "is_latest_version" BOOLEAN NOT NULL DEFAULT true,
    "version_tag" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submitted_at" DATETIME,
    "reviewed_at" DATETIME,
    "reviewed_by" TEXT,
    "review_comments" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "orders_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials" ("material_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "orders_previous_order_id_fkey" FOREIGN KEY ("previous_order_id") REFERENCES "orders" ("order_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "materials" (
    "material_id" TEXT NOT NULL PRIMARY KEY,
    "nei_wen" TEXT,
    "bao_jia_yong_zhi_chi_cun" TEXT,
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

-- CreateTable
CREATE TABLE "engineering_orders" (
    "engineering_order_id" TEXT NOT NULL PRIMARY KEY,
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "engineering_order_material_lines" (
    "line_id" TEXT NOT NULL PRIMARY KEY,
    "engineering_order_id" TEXT NOT NULL,
    "line_no" INTEGER NOT NULL,
    "material_id" TEXT,
    "bu_jian_ming_cheng" TEXT,
    "yin_shua_yan_se" TEXT,
    "wu_liao_miao_shu" TEXT,
    "pin_pai" TEXT,
    "cai_liao_gui_ge" TEXT,
    "fsc" TEXT,
    "kai_shu" INTEGER,
    "shang_ji_chi_cun" TEXT,
    "pai_ban_mo_su" INTEGER,
    "yin_chu_shu" REAL,
    "yin_sun" INTEGER,
    "ling_liao_shu_zhang" REAL,
    "biao_mian_chu_li" TEXT,
    "yin_shua_ban_shu" INTEGER,
    "sheng_chan_lu_jing" TEXT,
    "pai_ban_fang_shi" TEXT,
    "kai_shi_shi_jian" DATETIME,
    "shi_fou_dao_liao" BOOLEAN NOT NULL DEFAULT false,
    "jie_shu_shi_jian" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "engineering_order_material_lines_engineering_order_id_fkey" FOREIGN KEY ("engineering_order_id") REFERENCES "engineering_orders" ("engineering_order_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "engineering_order_material_lines_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials" ("material_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'OPERATOR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "log_id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "action_description" TEXT,
    "user_id" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "ip_address" TEXT,
    "time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("order_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "document_id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT,
    "file_size" INTEGER,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documents_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("order_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "review_tasks" (
    "task_id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assigned_to" TEXT,
    "result" TEXT NOT NULL DEFAULT 'PENDING',
    "due_date" DATETIME,
    "completed_at" DATETIME,
    "comments" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "review_tasks_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("order_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "todos" (
    "todo_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "is_done" BOOLEAN NOT NULL DEFAULT false,
    "due_date" DATETIME,
    "completed_at" DATETIME,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "todos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "step_plans" (
    "plan_id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "eo_id" TEXT,
    "sequence" INTEGER NOT NULL,
    "step_name" TEXT,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "step_plans_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("order_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "step_plans_eo_id_fkey" FOREIGN KEY ("eo_id") REFERENCES "engineering_orders" ("engineering_order_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "orders_order_number_idx" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_customer_po_idx" ON "orders"("customer_po");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_previous_order_id_idx" ON "orders"("previous_order_id");

-- CreateIndex
CREATE INDEX "orders_is_latest_version_idx" ON "orders"("is_latest_version");

-- CreateIndex
CREATE INDEX "orders_version_number_idx" ON "orders"("version_number");

-- CreateIndex
CREATE INDEX "engineering_order_material_lines_engineering_order_id_idx" ON "engineering_order_material_lines"("engineering_order_id");

-- CreateIndex
CREATE INDEX "engineering_order_material_lines_material_id_idx" ON "engineering_order_material_lines"("material_id");

-- CreateIndex
CREATE INDEX "engineering_order_material_lines_shi_fou_dao_liao_idx" ON "engineering_order_material_lines"("shi_fou_dao_liao");

-- CreateIndex
CREATE UNIQUE INDEX "engineering_order_material_lines_engineering_order_id_line_no_key" ON "engineering_order_material_lines"("engineering_order_id", "line_no");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "audit_logs_order_id_idx" ON "audit_logs"("order_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_time_idx" ON "audit_logs"("time");

-- CreateIndex
CREATE INDEX "documents_order_id_idx" ON "documents"("order_id");

-- CreateIndex
CREATE INDEX "documents_category_idx" ON "documents"("category");

-- CreateIndex
CREATE INDEX "review_tasks_order_id_idx" ON "review_tasks"("order_id");

-- CreateIndex
CREATE INDEX "review_tasks_result_idx" ON "review_tasks"("result");

-- CreateIndex
CREATE INDEX "review_tasks_assigned_to_idx" ON "review_tasks"("assigned_to");

-- CreateIndex
CREATE INDEX "todos_user_id_idx" ON "todos"("user_id");

-- CreateIndex
CREATE INDEX "todos_is_done_idx" ON "todos"("is_done");

-- CreateIndex
CREATE INDEX "todos_due_date_idx" ON "todos"("due_date");

-- CreateIndex
CREATE INDEX "todos_priority_idx" ON "todos"("priority");

-- CreateIndex
CREATE INDEX "step_plans_order_id_idx" ON "step_plans"("order_id");

-- CreateIndex
CREATE INDEX "step_plans_eo_id_idx" ON "step_plans"("eo_id");
