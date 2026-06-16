<template>
  <header class="app-header">
    <div class="header-brand">
      <NuxtLink to="/" class="brand-link">
        <svg class="w-mark" viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <polygon points="3,5 18,5 49,85 34,85" fill="white"/>
          <polygon points="34,85 49,85 67,5 52,5" fill="white"/>
          <polygon points="52,5 67,5 82,85 67,85" fill="white"/>
          <polygon points="67,85 82,85 97,5 82,5" fill="white"/>
        </svg>
        <span class="wordmark">WLTH</span>
      </NuxtLink>
      <div class="header-divider"></div>
      <span class="header-title">{{ title }}</span>
    </div>
    <NuxtLink class="btn-back" to="/">
      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
        <line x1="19" y1="12" x2="5" y2="12"/>
        <polyline points="12 19 5 12 12 5"/>
      </svg>
      All Forms
    </NuxtLink>
  </header>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<style scoped>
.app-header {
  background: #1F232D;
  color: #fff;
  padding: 0 32px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-brand { display: flex; align-items: center; }

.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
}
.w-mark   { width: 24px; height: 22px; flex-shrink: 0; }
.wordmark { font-size: 16px; font-weight: 800; letter-spacing: 0.08em; color: #fff; }

.header-divider {
  width: 1px;
  height: 22px;
  background: rgba(255,255,255,0.15);
  margin: 0 18px;
}

.header-title {
  font-size: 13px;
  color: rgba(255,255,255,0.55);
  font-weight: 500;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.8);
  border: 1px solid rgba(255,255,255,0.12);
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.15s;
}
.btn-back:hover { background: rgba(255,255,255,0.14); color: #fff; }
</style>
