<template>
  <div class="overlay">
    <div class="box">
      <div class="icon-circle">
        <svg width="26" height="26" fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2>Form Submitted</h2>
      <p>Your request has been received and will be processed by the WLTH team.</p>
      <div class="ref-row">
        <span class="ref-label">Reference</span>
        <span class="ref-id">{{ refId }}</span>
      </div>
      <button class="btn-new" @click="$emit('reset')">Submit Another Form</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ refId: string }>()
defineEmits<{ reset: [] }>()
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(10,13,22,0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.box {
  background: #fff;
  border-radius: 16px;
  padding: 44px 40px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 24px 64px rgba(0,0,0,0.28);
}

.icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #1445C7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 22px;
}

h2 { font-size: 20px; font-weight: 700; color: #1F232D; margin-bottom: 10px; letter-spacing: -0.01em; }

p  { font-size: 14px; color: #64748B; line-height: 1.6; margin-bottom: 24px; }

.ref-row {
  background: #F5F7FA;
  border: 1px solid #E1E4EA;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  text-align: left;
}
.ref-label { font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; }
.ref-id    { font-size: 12px; font-family: ui-monospace, monospace; color: #1F232D; font-weight: 600; }

.btn-new {
  background: #1445C7;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 13px 28px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;
}
.btn-new:hover { background: #1138A8; }
</style>
