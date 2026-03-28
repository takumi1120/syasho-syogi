<script setup lang="ts">
    import { onMounted, ref } from "vue";
    import {
        isModeSelectBgmPlaying,
        toggleModeSelectBgm,
    } from "../features/audio/modeSelectBgm";

    const isPlaying = ref(false);

    function syncState() {
        isPlaying.value = isModeSelectBgmPlaying();
    }

    async function handleClick() {
        isPlaying.value = await toggleModeSelectBgm();
    }

    onMounted(() => {
        syncState();
    });
</script>

<template>
    <button class="global-music-button" @click="handleClick">
        {{ isPlaying ? "音楽停止" : "音楽再生" }}
    </button>
</template>

<style scoped>
    .global-music-button {
        position: fixed;
        right: 110px;
        bottom: 16px;
        z-index: 9999;
        min-width: 108px;
        height: 33px;
        padding: 0 16px;
        border: 1px solid rgba(255, 255, 255, 0.62);
        border-radius: 999px;
        cursor: pointer;
        font-weight: 900;
        font-size: 13px;
        color: #4f4a87;
        background: linear-gradient(135deg,
                rgba(248, 236, 255, 0.94) 0%,
                rgba(236, 245, 255, 0.96) 50%,
                rgba(226, 239, 255, 0.94) 100%);
        box-shadow:
            0 8px 18px rgba(0, 0, 0, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
        transition:
            transform 0.2s ease,
            filter 0.2s ease,
            opacity 0.2s ease;
    }

    .global-music-button:hover {
        filter: brightness(1.03);
    }

    .global-music-button:active {
        transform: scale(0.97);
    }

    @media (max-width: 640px) {
        .global-music-button {
            right: 12px;
            bottom: 12px;
            min-width: 96px;
            height: 40px;
            padding: 0 14px;
            font-size: 12px;
        }
    }
</style>