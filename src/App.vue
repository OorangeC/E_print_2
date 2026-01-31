<template>
  <header class="app-header">
    <div class="logo">E_Print 印刷派单系统</div>
    <nav class="nav-links">
      <RouterLink to="/order-uploader" class="nav-item">订单上传</RouterLink> |
      <RouterLink to="/work-uploader" class="nav-item">工程单上传</RouterLink>
    </nav>
  </header>

  <main class="app-body">
    <RouterView />
  </main>
</template>

<style>
/* 全局基础样式，确保页面铺满 */
body,
html {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}
.app-container {
  padding: 20px;
}
</style>
