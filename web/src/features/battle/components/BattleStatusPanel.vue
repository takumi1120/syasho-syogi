<script setup lang="ts">
withDefaults(
  defineProps<{
    turnLabel: string;
    resultLabel?: string | null;
    winReasonLabel?: string | null;
    lastActionLabel?: string | null;
    message?: string | null;
    errorMessage?: string | null;
  }>(),
  {
    resultLabel: null,
    winReasonLabel: null,
    lastActionLabel: null,
    message: null,
    errorMessage: null,
  },
);
</script>

<template>
  <section class="panel">
    <h3>対局情報</h3>

    <dl class="status-list">
      <div class="row">
        <dt>手番</dt>
        <dd>{{ turnLabel }}</dd>
      </div>

      <div v-if="resultLabel" class="row">
        <dt>勝敗</dt>
        <dd>{{ resultLabel }}</dd>
      </div>

      <div v-if="winReasonLabel" class="row">
        <dt>決着</dt>
        <dd>{{ winReasonLabel }}</dd>
      </div>

      <div v-if="lastActionLabel" class="row action-row">
        <dt>最終</dt>
        <dd>{{ lastActionLabel }}</dd>
      </div>
    </dl>

    <div v-if="message" class="notice success">
      {{ message }}
    </div>

    <div v-if="errorMessage" class="notice error">
      {{ errorMessage }}
    </div>
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

h3 {
  margin: 0 0 8px;
  font-size: 14px;
}

.status-list {
  margin: 0;
  display: grid;
  gap: 6px;
}

.row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
}

dt {
  font-size: 10px;
  color: #8ec5ff;
  line-height: 1.4;
}

dd {
  margin: 0;
  font-weight: 700;
  line-height: 1.4;
  font-size: 12px;
  word-break: break-word;
}

.action-row dd {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notice {
  margin-top: 8px;
  border-radius: 12px;
  padding: 8px 10px;
  font-weight: 700;
  font-size: 12px;
  line-height: 1.4;
}

.notice.success {
  background: rgba(69, 182, 120, 0.16);
  border: 1px solid rgba(69, 182, 120, 0.3);
  color: #c8f0d7;
}

.notice.error {
  background: rgba(221, 97, 97, 0.16);
  border: 1px solid rgba(221, 97, 97, 0.3);
  color: #ffd4d4;
}
</style>