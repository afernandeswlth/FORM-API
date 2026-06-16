<template>
  <div>
    <div class="sig-label">
      Signature * <span class="sig-hint">(draw with mouse or touch)</span>
    </div>
    <div class="sig-wrap">
      <canvas
        ref="canvasRef"
        class="sig-canvas"
        :class="{ error: error && !hasDrawn }"
        width="1200"
        height="240"
        @mousedown="startDraw"
        @mousemove="draw"
        @mouseup="endDraw"
        @mouseleave="endDraw"
        @touchstart.prevent="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend="endDraw"
      />
      <button type="button" class="sig-clear" @click="clear">Clear</button>
    </div>
    <div v-if="error && !hasDrawn" class="err-msg">Signature required</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{ error?: boolean }>()
const emit = defineEmits<{ 'update:value': [v: string | null] }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const drawing = ref(false)
const hasDrawn = ref(false)
let lastX = 0
let lastY = 0

function getPos(e: MouseEvent | Touch) {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top)  * (canvas.height / rect.height),
  }
}

function startDraw(e: MouseEvent) {
  const pos = getPos(e)
  drawing.value = true
  lastX = pos.x
  lastY = pos.y
}

function draw(e: MouseEvent) {
  if (!drawing.value) return
  const pos = getPos(e)
  stroke(lastX, lastY, pos.x, pos.y)
  lastX = pos.x
  lastY = pos.y
}

function onTouchStart(e: TouchEvent) {
  const pos = getPos(e.touches[0])
  drawing.value = true
  lastX = pos.x
  lastY = pos.y
}

function onTouchMove(e: TouchEvent) {
  if (!drawing.value) return
  const pos = getPos(e.touches[0])
  stroke(lastX, lastY, pos.x, pos.y)
  lastX = pos.x
  lastY = pos.y
}

function stroke(x1: number, y1: number, x2: number, y2: number) {
  const ctx = canvasRef.value!.getContext('2d')!
  ctx.strokeStyle = '#1a1a2e'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function endDraw() {
  if (!drawing.value) return
  drawing.value = false
  hasDrawn.value = true
  emit('update:value', canvasRef.value!.toDataURL('image/png'))
}

function clear() {
  const canvas = canvasRef.value!
  canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
  hasDrawn.value = false
  emit('update:value', null)
}

defineExpose({ clear, hasDrawn })
</script>

<style scoped>
.sig-label { font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 6px; }
.sig-hint  { font-weight: 400; }
.sig-wrap  { position: relative; margin-bottom: 4px; }
.sig-canvas {
  display: block; width: 100%; height: 120px;
  border: 1.5px solid var(--border); border-radius: 8px;
  background: #fff; cursor: crosshair; touch-action: none;
}
.sig-canvas.error { border-color: var(--error); }
.sig-clear {
  position: absolute; top: 6px; right: 8px;
  background: none; border: 1px solid var(--border); color: var(--muted);
  border-radius: 5px; font-size: 11px; padding: 3px 8px; cursor: pointer;
}
.sig-clear:hover { border-color: var(--dark); color: var(--dark); }
.err-msg { font-size: 11px; color: var(--error); margin-top: 3px; }
</style>
