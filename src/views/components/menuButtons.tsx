import { defineComponent, type PropType } from "vue";
import { ElButton } from "element-plus";
import { Icon } from "@/components/base/Icon";

export type MenuButtonTone = "primary" | "danger";

export interface MenuButtonItem {
  key: string;
  label: string;
  icon?: string;
  tone?: MenuButtonTone;
  color?: string;
  disabled?: boolean;
  /** 在此项上方显示分隔线，用于菜单分组 */
  dividerBefore?: boolean;
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
          <div key={item.key} class="flex flex-col">
            {item.dividerBefore ? (
              <div class="mx-1 my-1 border-0 border-t border-solid border-[#ECECEC]" />
            ) : null}
            <ElButton
              link
              disabled={Boolean(item.disabled)}
              class={[
                "row-action-btn",
                item.tone &&
                  (item.tone === "danger"
                    ? "row-action-btn-danger"
                    : "row-action-btn-primary"),
              ]}
              style={{ color: item.color }}
              onClick={() => handleClick(item)}
            >
              <span class="flex justify-center items-center gap-2">
                {item.icon ? <Icon icon={item.icon} /> : null}
                {item.label}
              </span>
            </ElButton>
          </div>
        ))}
      </div>
    );
  },
});
