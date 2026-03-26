<template>
  <section class="battle-layout">
    <header v-if="$slots.header" class="battle-header">
      <slot name="header" />
    </header>

    <div class="battle-content">
      <main class="battle-main">
        <slot />
      </main>

      <aside v-if="$slots.sidebar" class="battle-sidebar">
        <slot name="sidebar" />
      </aside>
    </div>
  </section>
</template>

<style scoped>
.battle-layout {
  width: min(100%, 1240px);
  min-height: 100dvh;
  margin: 0 auto;
  padding: 12px 18px 14px;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 12px;
}

.battle-content {
  min-height: 0;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
}

.battle-main,
.battle-sidebar,
.battle-header {
  min-height: 0;
  display: grid;
  gap: 12px;
}

@media (min-width: 980px) {
  .battle-content {
    grid-template-columns: minmax(0, 1fr) 280px;
  }
}

@media (max-width: 640px) {
  .battle-layout {
    min-height: auto;
    padding: 12px;
  }
}
</style>