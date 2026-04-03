import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";

type FixedStageOptions = {
  baseWidth: number;
  baseHeight: number;
  viewportPadding?: number;
  viewportRef?: Ref<HTMLElement | null>;
};

function roundToThousandths(value: number) {
  return Math.round(value * 1000) / 1000;
}

export function useFixedStage({
  baseWidth,
  baseHeight,
  viewportPadding = 24,
  viewportRef,
}: FixedStageOptions) {
  const viewportWidth = ref(baseWidth);
  const viewportHeight = ref(baseHeight);
  let resizeObserver: ResizeObserver | null = null;
  let animationFrame = 0;

  function setViewportSize(width: number, height: number) {
    viewportWidth.value = Math.max(width - viewportPadding * 2, 320);
    viewportHeight.value = Math.max(height - viewportPadding * 2, 320);
  }

  function updateFromViewportElement() {
    const viewport = viewportRef?.value;

    if (!viewport) {
      return false;
    }

    const rect = viewport.getBoundingClientRect();
    setViewportSize(Math.max(rect.width, 1), Math.max(rect.height, 1));
    return true;
  }

  function updateViewport() {
    if (typeof window === "undefined") return;

    if (updateFromViewportElement()) {
      return;
    }

    const visualViewport = window.visualViewport;
    setViewportSize(visualViewport?.width ?? window.innerWidth, visualViewport?.height ?? window.innerHeight);
  }

  function scheduleViewportUpdate() {
    if (typeof window === "undefined") return;

    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
    }

    animationFrame = window.requestAnimationFrame(() => {
      animationFrame = 0;
      updateViewport();
    });
  }

  function bindViewportObserver() {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }

    const viewport = viewportRef?.value;

    if (!viewport || typeof ResizeObserver === "undefined") {
      return;
    }

    resizeObserver = new ResizeObserver(() => {
      scheduleViewportUpdate();
    });
    resizeObserver.observe(viewport);
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

  watch(
    () => viewportRef?.value,
    () => {
      if (typeof window === "undefined") return;

      bindViewportObserver();
      scheduleViewportUpdate();
    },
    { flush: "post" },
  );

  onMounted(() => {
    bindViewportObserver();
    updateViewport();
    window.addEventListener("resize", scheduleViewportUpdate);
    window.visualViewport?.addEventListener("resize", scheduleViewportUpdate);
    window.visualViewport?.addEventListener("scroll", scheduleViewportUpdate);
  });

  onBeforeUnmount(() => {
    if (typeof window === "undefined") return;

    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }

    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }

    window.removeEventListener("resize", scheduleViewportUpdate);
    window.visualViewport?.removeEventListener("resize", scheduleViewportUpdate);
    window.visualViewport?.removeEventListener("scroll", scheduleViewportUpdate);
  });

  return {
    stageScale,
    stageShellStyle,
    stageStyle,
  };
}
