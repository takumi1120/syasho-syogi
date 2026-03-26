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
  padding: 14px 16px;
  border-radius: 20px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(12, 20, 37, 0.82);
  color: #eef5ff;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.2);
}

.panel.active {
  outline: 2px solid #8ec5ff;
}

.position {
  margin: 0 0 6px;
  font-size: 11px;
  letter-spacing: 0.16em;
  color: #8ec5ff;
}

h3 {
  margin: 0;
  font-size: 17px;
  line-height: 1.3;
}

.character {
  margin: 6px 0 0;
  color: #bcd4ef;
  font-size: 13px;
  line-height: 1.4;
}
</style>