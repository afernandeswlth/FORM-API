<template>
  <header class="app-header">
    <div>
      <div class="logo">WLTH</div>
      <div class="subtitle">{{ title }}</div>
    </div>
    <NuxtLink class="btn-back" to="/">← All Forms</NuxtLink>
  </header>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<style scoped>
.app-header {
  background: var(--dark); color: #fff;
  padding: 18px 32px; display: flex; align-items: center; gap: 16px;
}
.logo     { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
.subtitle { font-size: 13px; opacity: 0.7; }
.btn-back {
  margin-left: auto; background: rgba(255,255,255,0.12); color: #fff;
  border: 1px solid rgba(255,255,255,0.25); padding: 7px 16px;
  border-radius: 6px; font-size: 13px; text-decoration: none; transition: background 0.2s;
}
.btn-back:hover { background: rgba(255,255,255,0.22); }
</style>
