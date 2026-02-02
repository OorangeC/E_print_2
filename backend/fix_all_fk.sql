-- 删除所有可能重复的外键约束
SET FOREIGN_KEY_CHECKS = 0;

-- orders 表
ALTER TABLE orders DROP FOREIGN KEY IF EXISTS orders_previous_order_number_fkey;

-- order_items 表
ALTER TABLE order_items DROP FOREIGN KEY IF EXISTS order_items_order_number_fkey;
ALTER TABLE order_items DROP FOREIGN KEY IF EXISTS order_items_material_id_fkey;

-- engineering_order_material_lines 表
ALTER TABLE engineering_order_material_lines DROP FOREIGN KEY IF EXISTS engineering_order_material_lines_engineering_order_id_fkey;
ALTER TABLE engineering_order_material_lines DROP FOREIGN KEY IF EXISTS engineering_order_material_lines_material_id_fkey;

-- documents 表
ALTER TABLE documents DROP FOREIGN KEY IF EXISTS documents_order_number_fkey;
ALTER TABLE documents DROP FOREIGN KEY IF EXISTS documents_eo_id_fkey;

-- review_tasks 表
ALTER TABLE review_tasks DROP FOREIGN KEY IF EXISTS review_tasks_order_number_fkey;

-- todos 表
ALTER TABLE todos DROP FOREIGN KEY IF EXISTS todos_user_id_fkey;

-- step_plans 表
ALTER TABLE step_plans DROP FOREIGN KEY IF EXISTS step_plans_order_number_fkey;
ALTER TABLE step_plans DROP FOREIGN KEY IF EXISTS step_plans_eo_id_fkey;

SET FOREIGN_KEY_CHECKS = 1;
