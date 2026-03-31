import { computed, onBeforeUnmount, onMounted, ref } from "vue";

type FixedStageOptions = {
  baseWidth: number;
  baseHeight: number;
  viewportPadding?: number;
};

function roundToThousandths(value: number) {
  return Math.round(value * 1000) / 1000;
}

export function useFixedStage({
  baseWidth,
  baseHeight,
  viewportPadding = 24,
}: FixedStageOptions) {
  const viewportWidth = ref(baseWidth);
  const viewportHeight = ref(baseHeight);

  function updateViewport() {
    if (typeof window === "undefined") return;

    viewportWidth.value = Math.max(window.innerWidth - viewportPadding * 2, 320);
    viewportHeight.value = Math.max(window.innerHeight - viewportPadding * 2, 320);
  }

  const stageScale = computed(() => {
    const scale = Math.min(
      viewportWidth.value / baseWidth,
      viewportHeight.value / baseHeight,
    );

    return roundToThousandths(Math.max(scale, 0.1));
  });

  const stageShellStyle = computed(() => ({
    width: `${roundToThousandths(baseWidth * stageScale.value)}px`,
    height: `${roundToThousandths(baseHeight * stageScale.value)}px`,
  }));

  const stageStyle = computed(() => ({
    width: `${baseWidth}px`,
    height: `${baseHeight}px`,
    transform: `scale(${stageScale.value})`,
    transformOrigin: "top left",
  }));

  onMounted(() => {
    updateViewport();
    window.addEventListener("resize", updateViewport);
  });

  onBeforeUnmount(() => {
    if (typeof window === "undefined") return;
    window.removeEventListener("resize", updateViewport);
  });

  return {
    stageScale,
    stageShellStyle,
    stageStyle,
  };
}
