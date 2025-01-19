<script setup>
import AppFooter from './AppFooter.vue';
import AppTopbar from './AppTopbar.vue';
</script>

<template>
  <div class="layout-wrapper" :class="containerClass">
    <app-topbar></app-topbar>

    <div class="layout-main-container">
      <div class="layout-main">
        <router-view></router-view>
      </div>

      <app-footer></app-footer>
    </div>
  </div>

  <Toast />
</template>
