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

  toCheckboxNode(): CheckboxNode {
    return new CheckboxNode({
      ...this,
      children: checkboxExtMapToArray(this.children)
    });
  }
}

export class CheckboxNode extends BaseCheckboxNode {
  children: CheckboxNode[] = [];

  constructor(props: Partial<CheckboxNode>) {
    super(props);
    Object.assign(this, props);
  }

  toCheckboxMapNode(): CheckboxMapNode {
    return new CheckboxMapNode({
      ...this,
      children: checkboxArrayToExtMap(this.children)
    });
  }
}

export function checkboxArrayToExtMap(
  nodes?: CheckboxNode[]
): ExtMap<CheckboxMapNode> {
  return new ExtMap<CheckboxMapNode>(
    nodes?.map((node) => [
      node.id,
      new CheckboxMapNode({
        ...node,
        children: checkboxArrayToExtMap(node.children)
      })
    ])
  );
}

export function checkboxExtMapToArray(
  map: ExtMap<CheckboxMapNode>
): CheckboxNode[] {
  return [
    ...map
      .map((key, value) => {
        return new CheckboxNode({
          ...value,
          children: checkboxExtMapToArray(value.children)
        });
      })
      .values()
  ];
}
