<template>
  <div style="text-align:center;padding:2rem">
    <h2>{{ msg }}</h2>
    <button @click="count++" style="padding:0.5rem 1rem;font-size:1rem;cursor:pointer">
      👆 点了 {{ count }} 次
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const msg = ref('Hello from Sandpack!')
const count = ref(0)
</script>
