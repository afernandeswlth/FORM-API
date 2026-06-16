<template>
  <div class="overlay">
    <div class="box">
      <div class="icon">✅</div>
      <h2>Request Submitted</h2>
      <p>Your form has been received and sent to the WLTH team.</p>
      <div class="ref">Ref: {{ refId }}</div>
      <button class="btn-new" @click="$emit('reset')">Submit Another</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ refId: string }>()
defineEmits<{ reset: [] }>()
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  z-index: 10000; display: flex; align-items: center; justify-content: center;
}
.box {
  background: #fff; border-radius: 14px; padding: 40px 36px;
  max-width: 420px; width: 90%; text-align: center;
  box-shadow: 0 8px 40px rgba(0,0,0,0.2);
}
.icon  { font-size: 48px; margin-bottom: 16px; }
h2     { font-size: 20px; margin-bottom: 10px; color: var(--dark); }
p      { font-size: 14px; color: var(--muted); margin-bottom: 20px; line-height: 1.5; }
.ref   { font-size: 12px; font-family: monospace; color: var(--dark); background: #f4f4f6; padding: 8px 14px; border-radius: 6px; display: inline-block; margin-bottom: 24px; }
.btn-new {
  background: var(--dark); color: #fff; border: none;
  border-radius: 8px; padding: 12px 28px; font-size: 14px; font-weight: 700; cursor: pointer;
}
</style>
