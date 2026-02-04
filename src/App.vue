<script setup lang="ts">
import { ref, reactive } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

// --- 登录状态管理 ---
const isLoggedIn = ref(false)
const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false,
})

const handleLogin = () => {
  if (loginForm.username && loginForm.password) {
    // 这里可以添加真实的 API 验证逻辑
    console.log('登录中...', loginForm)
    isLoggedIn.value = true
  } else {
    alert('请输入用户名和密码')
  }
}

const handleLogout = () => {
  isLoggedIn.value = false
}
</script>

<template>
  <div class="app-container">
    <div v-if="!isLoggedIn" class="login-portal">
      <div class="login-card">
        <div class="brand-header">
          <div class="logo-circle">E</div>
          <h1>欢迎使用 <span class="highlight">E_Bench</span></h1>
          <p>数字化工厂智能派单系统</p>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="input-group">
            <label>用户名</label>
            <input v-model="loginForm.username" type="text" placeholder="请输入工号/邮箱" />
          </div>

          <div class="input-group">
            <label>密码</label>
            <input v-model="loginForm.password" type="password" placeholder="请输入密码" />
          </div>

          <div class="form-options">
            <label class="toggle-container">
              <input type="checkbox" v-model="loginForm.rememberMe" />
              <span class="slider"></span>
              <span class="label-text">记住用户名和密码</span>
            </label>
          </div>

          <button type="submit" class="login-btn">登录系统</button>
        </form>
      </div>
    </div>

    <template v-else>
      <header class="app-header">
        <nav class="nav-bar">
          <div class="nav-left">
            <span class="mini-logo">E_Bench</span>
            <!-- <RouterLink to="/order-tracker">订单追踪</RouterLink> -->
            <RouterLink to="/order-uploader">订单上传</RouterLink>
            <RouterLink to="/order-reviewer">审核中心</RouterLink>
            <RouterLink to="/work-uploader">工程单上传</RouterLink>
            <RouterLink to="/work-reviewer">工程单追踪</RouterLink>
            <!-- <RouterLink to="/dispatch-center">派单中心</RouterLink> -->
          </div>
          <div class="nav-right">
            <span class="user-info">管理员：{{ loginForm.username }}</span>
            <button @click="handleLogout" class="logout-link">退出</button>
          </div>
        </nav>
      </header>

      <main class="main-viewport">
        <RouterView />
      </main>
    </template>
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  background: #f0f4f8;
  font-family: 'Inter', system-ui, sans-serif;
}

/* --- 登录门户样式 --- */
.login-portal {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
}

.brand-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-circle {
  width: 60px;
  height: 60px;
  background: #2563eb;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 900;
  margin: 0 auto 16px;
}

.highlight {
  color: #2563eb;
}

.login-form .input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

.input-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-sizing: border-box;
}

/* --- Toggle 开关样式 --- */
.form-options {
  margin: 20px 0;
}

.toggle-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 10px;
}

.toggle-container input {
  display: none;
}

.slider {
  width: 40px;
  height: 20px;
  background-color: #cbd5e1;
  border-radius: 20px;
  position: relative;
  transition: 0.3s;
}

.slider:before {
  content: '';
  position: absolute;
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}

input:checked + .slider {
  background-color: #2563eb;
}
input:checked + .slider:before {
  transform: translateX(20px);
}

.label-text {
  font-size: 14px;
  color: #64748b;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover {
  background: #1d4ed8;
}

/* --- 已登录页眉样式 --- */
.app-header {
  background: #1a1a1a;
  color: white;
  padding: 0 20px;
}

.nav-bar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-left {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-left a {
  color: #94a3b8;
  text-decoration: none;
}

.nav-left a.router-link-active {
  color: white;
  border-bottom: 2px solid #2563eb;
}

.mini-logo {
  font-weight: 800;
  color: #3b82f6;
  margin-right: 20px;
}

.logout-link {
  background: none;
  border: 1px solid #475569;
  color: #94a3b8;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 15px;
}
</style>
