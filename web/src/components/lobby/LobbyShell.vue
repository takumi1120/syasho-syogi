<template>
  <section class="lobby-shell">
    <header v-if="$slots.header" class="shell-header">
      <slot name="header" />
    </header>

    <main class="shell-body">
      <slot />
    </main>

    <footer v-if="$slots.footer" class="shell-footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.lobby-shell {
  display: grid;
  gap: 12px;
  width: min(100%, 1180px);
  height: 100%;
  margin: 0 auto;
}

.shell-body {
  display: grid;
  gap: 12px;
  min-height: 0;
  align-content: start;
}

.shell-header,
.shell-footer {
  display: grid;
  gap: 10px;
}
</style>