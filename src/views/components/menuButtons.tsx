import { defineComponent, type PropType } from "vue";
import { ElButton } from "element-plus";
import { Icon } from "@/components/base/Icon";

export type MenuButtonTone = "primary" | "danger";

export interface MenuButtonItem {
  key: string;
  label: string;
  icon?: string;
  tone?: MenuButtonTone;
  disabled?: boolean;
}

export default defineComponent({
  name: "MenuButtons",
  props: {
    items: {
      type: Array as PropType<MenuButtonItem[]>,
      default: () => [],
    },
    row: {
      type: Object as PropType<any>,
      default: null,
    },
  },
  emits: {
    action: (_key: string, _row: any) => true,
  },
  setup(props, { emit }) {
    const handleClick = (item: MenuButtonItem) => {
      emit("action", item.key, props.row);
    };

    return () => (
      <div class="py-2 px-1 flex flex-col">
        {props.items.map((item) => (
          <ElButton
            key={item.key}
            link
            disabled={item.disabled}
            class={[
              "row-action-btn",
              item.tone === "danger"
                ? "row-action-btn-danger"
                : "row-action-btn-primary",
            ]}
            onClick={() => handleClick(item)}
          >
            <span class="flex justify-center items-center gap-2">
              {item.icon ? <Icon icon={item.icon} /> : null}
              {item.label}
            </span>
          </ElButton>
        ))}
      </div>
    );
  },
});
