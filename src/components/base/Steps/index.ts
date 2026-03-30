import Steps from './src/Steps.vue'
interface StepItem {
    title: string;
    subtitle?: string;
    state?: "completed" | "active" | "pending";
}

export { Steps, StepItem }

