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
  width: min(100%, 1160px);
  height: 100dvh;
  margin: 0 auto;
  padding: 8px 12px 10px;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 8px;
}

.battle-content {
  min-height: 0;
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
}

.battle-header,
.battle-main,
.battle-sidebar {
  min-height: 0;
}

.battle-main {
  display: grid;
}

.battle-sidebar {
  display: grid;
  gap: 8px;
  align-content: start;
  grid-auto-rows: max-content;
}

@media (min-width: 980px) {
  .battle-content {
    grid-template-columns: minmax(0, 1fr) 300px;
  }
}

@media (max-width: 980px) {
  .battle-layout {
    height: auto;
    min-height: 100dvh;
  }
}

@media (max-width: 640px) {
  .battle-layout {
    padding: 10px;
  }
}
</style>