<template>
  <section class="panel">
    <slot>
      <h3>Members</h3>
      <p>Host and guest information can be rendered here.</p>
    </slot>
  </section>
</template>

<style scoped>
.panel {
  padding: 20px;
  border-radius: 16px;
  background: rgba(18, 29, 52, 0.56);
  color: #eef5ff;
}
</style>
