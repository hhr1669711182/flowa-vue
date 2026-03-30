<template>
  <MenuButtons :items="resolvedItems" :row="row" @action="onAction" />
</template>

<script setup lang="ts">
import MenuButtons, { type MenuButtonItem } from "@/views/components/menuButtons";

const props = defineProps<{
  row: any;
  items?: MenuButtonItem[];
}>();

const emit = defineEmits<{
  (e: "action", key: string, row: any): void;
}>();

const defaultActions: MenuButtonItem[] = [
  // {
  //   key: "view",
  //   label: "View",
  //   icon: "svg-icon:eye",
  //   tone: "primary",
  // },
  // {
  //   key: "edit",
  //   label: "Edit",
  //   icon: "svg-icon:pencil",
  //   tone: "primary",
  // },
  // {
  //   key: "export",
  //   label: "Export/Print",
  //   icon: "svg-icon:printer",
  //   tone: "primary",
  // },
  {
    key: "support",
    label: "Contact Support",
    icon: "svg-icon:headphones",
    tone: "danger",
  },
  // {
  //   key: "delete",
  //   label: "Delete",
  //   icon: "svg-icon:trash-bin",
  //   tone: "danger",
  // },
];

const resolvedItems = computed(() => props.items || defaultActions);

const onAction = (key: string, row: any) => {
  emit("action", key, row);
};
</script>

<style scoped lang="less"></style>
