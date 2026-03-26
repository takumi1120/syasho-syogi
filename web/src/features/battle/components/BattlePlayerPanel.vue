<script setup lang="ts">
withDefaults(
  defineProps<{
    position: string;
    name: string;
    characterName?: string;
    active?: boolean;
  }>(),
  {
    characterName: "未設定",
    active: false,
  },
);
</script>

<template>
  <section class="panel" :class="{ active }">
    <p class="position">{{ position }}</p>
    <h3>{{ name }}</h3>
    <p class="character">{{ characterName }}</p>
  </section>
</template>

<style scoped>
.panel {
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(12, 20, 37, 0.82);
  color: #eef5ff;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18);
}

.panel.active {
  outline: 2px solid #8ec5ff;
}

.position {
  margin: 0 0 4px;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: #8ec5ff;
}

h3 {
  margin: 0;
  font-size: 14px;
  line-height: 1.25;
  word-break: break-word;
}

.character {
  margin: 4px 0 0;
  color: #bcd4ef;
  font-size: 11px;
  line-height: 1.35;
  word-break: break-word;
}
</style>