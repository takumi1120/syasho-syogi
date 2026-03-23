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
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
  display: grid;
  gap: 24px;
}

.battle-content {
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
}

.battle-main,
.battle-sidebar,
.battle-header {
  display: grid;
  gap: 16px;
}

@media (min-width: 980px) {
  .battle-content {
    grid-template-columns: minmax(0, 1fr) 320px;
  }
}

@media (max-width: 640px) {
  .battle-layout {
    padding: 14px;
  }
}
</style>