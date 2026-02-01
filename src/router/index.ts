import { createRouter, createWebHistory } from 'vue-router'
import OrderUploader from '@/views/OrderUploader.vue'
import WorkUploader from '@/views/WorkUploader.vue'
import OrderReviewer from '@/views/OrderReviewer.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/order-uploader', // 浏览器访问的地址
      name: 'order-uploader',
      component: OrderUploader,
    },
    {
      path: '/work-uploader', // 浏览器访问的地址
      name: 'work-uploader',
      component: WorkUploader,
    },
    {
      path: '/order-reviewer', // 浏览器访问的地址
      name: 'order-reviewer',
      component: OrderReviewer,
    },
  ],
})

export default router
