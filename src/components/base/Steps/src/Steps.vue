<template>
  <div class="w-full">
    <div class="flex w-full gap-1.5">
      <div
        v-for="(step, idx) in steps"
        :key="`${idx}-${step.title}`"
        class="flex-1 min-w-0"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span
              v-if="showStateIcon"
              class="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
              :class="
                getStepState(step, idx) === 'completed'
                  ? 'bg-#1E8E3E'
                  : getStepState(step, idx) === 'active'
                    ? variant === 'success'
                      ? 'bg-#1E8E3E'
                      : 'bg-#0A123C'
                    : 'bg-#E5E7EB'
              "
            >
              <svg
                v-if="getStepState(step, idx) === 'completed'"
                viewBox="0 0 24 24"
                width="12"
                height="12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="white"
                  stroke-width="2.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <svg
                v-else-if="getStepState(step, idx) === 'active'"
                class="animate-spin"
                viewBox="0 0 24 24"
                width="12"
                height="12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="white"
                  stroke-width="2.2"
                  stroke-opacity="0.35"
                />
                <path
                  d="M21 12a9 9 0 0 0-9-9"
                  stroke="white"
                  stroke-width="2.2"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span
              class="text-sm truncate font-600 line-height-22px"
              :class="idx === active ? 'text-#000' : 'text-#6B6B6B '"
            >
              {{ step.title }}
            </span>
          </div>
        </div>
        <div
          v-if="step.subtitle"
          class="text-12px mt-1 truncate"
          :class="
            variant === 'success'
              ? getStepState(step, idx) === 'pending'
                ? 'text-#9A9A9A'
                : 'text-#1E8E3E'
              : idx === active
                ? 'text-#C62828'
                : 'text-#9A9A9A'
          "
        >
          {{ step.subtitle }}
        </div>
        <div
          class="mt-3 h-4px w-full rounded-full"
          :class="
            variant === 'success'
              ? getStepState(step, idx) === 'pending'
                ? 'bg-#ECECEC'
                : 'bg-#1E8E3E'
              : idx === active
                ? 'bg-#0A123C'
                : 'bg-#ECECEC'
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface StepItem {
  title: string;
  subtitle?: string;
  state?: "completed" | "active" | "pending";
}

const props = withDefaults(
  defineProps<{
    steps: StepItem[];
    active?: number;
    variant?: "primary" | "success";
    showStateIcon?: boolean;
  }>(),
  {
    active: 0,
    variant: "primary",
    showStateIcon: false,
  },
);

const getStepState = (step: StepItem, idx: number) => {
  if (step.state) return step.state;
  if (idx < props.active) return "completed";
  if (idx === props.active) return "active";
  return "pending";
};
</script>
