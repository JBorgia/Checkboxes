import { ExtMap } from '../../../plugins/ext-map.type';

type ThemeColors =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'warn'
  | 'info'
  | 'success'
  | 'error';

abstract class BaseCheckboxNode {
  id!: string;
  title!: string;
  selected = false;
  indeterminate? = false;
  onChange?: (selected: boolean, node: BaseCheckboxNode) => void;
  expanded? = false;
  color?: ThemeColors;
  order?: number;

  abstract children: ExtMap<CheckboxMapNode> | CheckboxNode[];

  constructor(props: Partial<BaseCheckboxNode>) {
    Object.assign(this, props);
  }
}

export class CheckboxMapNode extends BaseCheckboxNode {
  children: ExtMap<CheckboxMapNode> = new ExtMap();

  constructor(props: Partial<CheckboxMapNode>) {
    super(props);
    Object.assign(this, props);
  }
}

export class CheckboxNode extends BaseCheckboxNode {
  children: CheckboxNode[] = [];

  constructor(props: Partial<CheckboxNode>) {
    super(props);
    Object.assign(this, props);
  }
}

export function checkboxArrayToExtMap(
  nodes?: CheckboxNode[]
): ExtMap<CheckboxMapNode> {
  return new ExtMap<CheckboxMapNode>(
    nodes?.map((node) => {
      // Align parent checkbox state to children
      const indeterminate =
        new Set(node.children?.map((child) => child.selected)).size === 2;

      const selected =
        node.children?.length && !indeterminate
          ? node.children.every((child) => child.selected)
          : node.selected;

      return [
        node.id,
        new CheckboxMapNode({
          ...node,
          selected,
          indeterminate,
          children: checkboxArrayToExtMap(node.children)
        })
      ];
    })
  );
}

export function checkboxExtMapToArray(
  map: ExtMap<CheckboxMapNode>
): CheckboxNode[] {
  return [
    ...map
      .map((key, node) => {
        // Align parent checkbox state to children
        const indeterminate =
          new Set([...node.children.values()].map((child) => child.selected))
            .size === 2;

        const selected =
          node.children.size && !indeterminate
            ? [...node.children.values()].every((child) => child.selected)
            : node.selected;

        return new CheckboxNode({
          ...node,
          selected,
          indeterminate,
          children: checkboxExtMapToArray(node.children)
        });
      })
      .values()
  ];
}
