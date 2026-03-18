import { defineComponent, h, type PropType } from "vue";
import { ElTooltip } from "element-plus";
// import { Icon } from "@iconify/vue";
import { Icon } from "@/components/base/Icon";

export type HeaderHintPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end";

export interface TableHeaderHintOptions {
  content: string;
  placement?: HeaderHintPlacement;
  effect?: "dark" | "light";
  icon?: string;
  className?: string;
  iconClassName?: string;
}

const defaultOptions: Required<
  Pick<TableHeaderHintOptions, "placement" | "effect" | "icon">
> = {
  placement: "bottom",
  effect: "light",
  icon: "fa7-regular:circle-question",
  // icon: "svg-icon:circle-question",
};

export const TableHeaderHint = defineComponent({
  name: "TableHeaderHint",
  props: {
    label: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    placement: {
      type: String as PropType<HeaderHintPlacement>,
      default: defaultOptions.placement,
    },
    effect: {
      type: String as PropType<"dark" | "light">,
      default: defaultOptions.effect,
    },
    icon: {
      type: String,
      default: defaultOptions.icon,
    },
    className: {
      type: String,
      default: "inline-flex items-center justify-center gap-1",
    },
    iconClassName: {
      type: String,
      default: "color-[#DBDBDB] text-xs leading-none w-4 h-4",
    },
  },
  setup(props) {
    return () =>
      h(
        ElTooltip,
        {
          content: props.content,
          placement: props.placement,
          effect: props.effect,
        },
        {
          default: () =>
            h("div", { class: props.className }, [
              h("span", props.label),
              props.icon?.includes(":")
                ? h(Icon, {
                    icon: props.icon,
                    color: "#D1D5DB",
                    class: props.iconClassName,
                  })
                : h("span", { class: props.iconClassName }, props.icon),
            ]),
        }
      );
  },
});

export const createHeaderHintRenderer = (
  options: string | TableHeaderHintOptions
) => {
  const normalized =
    typeof options === "string" ? { content: options } : { ...options };
  return (scope: any) =>
    h(TableHeaderHint, {
      label: scope?.column?.label || "",
      ...defaultOptions,
      ...normalized,
    });
};
