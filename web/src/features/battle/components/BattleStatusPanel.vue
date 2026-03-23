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
        <dt>現在の手番</dt>
        <dd>{{ turnLabel }}</dd>
      </div>

      <div v-if="resultLabel" class="row">
        <dt>勝敗</dt>
        <dd>{{ resultLabel }}</dd>
      </div>

      <div v-if="winReasonLabel" class="row">
        <dt>決着理由</dt>
        <dd>{{ winReasonLabel }}</dd>
      </div>

      <div v-if="lastActionLabel" class="row">
        <dt>最終行動</dt>
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
  padding: 20px;
  border-radius: 24px;
  border: 1px solid rgba(160, 205, 255, 0.16);
  background: rgba(12, 20, 37, 0.82);
  color: #eef5ff;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.22);
}

h3 {
  margin: 0 0 12px;
}

.status-list {
  margin: 0;
  display: grid;
  gap: 12px;
}

.row {
  display: grid;
  gap: 4px;
}

dt {
  font-size: 12px;
  color: #8ec5ff;
}

dd {
  margin: 0;
  font-weight: 700;
  line-height: 1.5;
}

.notice {
  margin-top: 14px;
  border-radius: 18px;
  padding: 14px 16px;
  font-weight: 700;
}

.notice.success {
  background: rgba(69, 182, 120, 0.16);
  border: 1px solid rgba(69, 182, 120, 0.32);
  color: #c8f0d7;
}

.notice.error {
  background: rgba(221, 97, 97, 0.16);
  border: 1px solid rgba(221, 97, 97, 0.32);
  color: #ffd4d4;
}
</style>