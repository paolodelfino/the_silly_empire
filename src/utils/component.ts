export type Props<T extends (props: Record<string, any>) => any> = T extends (
  props: infer Props,
) => any
  ? Props
  : never;
