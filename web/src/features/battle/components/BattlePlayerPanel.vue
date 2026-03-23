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
  padding: 20px;
  border-radius: 24px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(12, 20, 37, 0.82);
  color: #eef5ff;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.22);
}

.panel.active {
  outline: 2px solid #8ec5ff;
}

.position {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.2em;
  color: #8ec5ff;
}

h3 {
  margin: 0;
}

.character {
  margin: 8px 0 0;
  color: #bcd4ef;
}
</style>