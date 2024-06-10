import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { ExtMap } from '../../../plugins/ext-map.type';
import { CommonModule, KeyValue } from '@angular/common';
import { CheckboxComponent } from '../../base/checkbox/checkbox.component';
import {
  CheckboxMapNode,
  CheckboxNode,
  checkboxArrayToExtMap,
  checkboxExtMapToArray
} from './checkboxes.models';

// Component decorator to define metadata for the CheckboxesComponent
@Component({
  selector: 'jmkw-checkboxes',
  templateUrl: './checkboxes.component.html',
  standalone: true,
  imports: [CommonModule, CheckboxComponent],
  styleUrls: ['./checkboxes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxesComponent {
  private _checkboxNodeMap!: ExtMap<CheckboxMapNode>; // Private property to hold the checkbox node map

  @Input() expandable = true; // Input property to make checkboxes expandable
  @Input() set checkboxNodes(checkboxNodes: CheckboxNode[]) {
    this._checkboxNodeMap = checkboxArrayToExtMap(checkboxNodes); // Setter for checkboxNodes, converts array to map
  }
  @Input() set checkboxNodeMap(checkboxNodeMap: ExtMap<CheckboxMapNode>) {
    this._checkboxNodeMap = checkboxNodeMap; // Setter for checkboxNodeMap
  }
  get checkboxNodeMap() {
    return this._checkboxNodeMap; // Getter for checkboxNodeMap
  }

  @Output() hierarchyChange = new EventEmitter<CheckboxNode[]>(); // Output event to emit when the hierarchy changes
  @Output() hierarchyMapChange = new EventEmitter<ExtMap<CheckboxMapNode>>(); // Output event to emit when the hierarchy map changes
  @Output() flatChange = new EventEmitter<CheckboxNode[]>(); // Output event to emit when the flat list of nodes changes
  @Output() flatMapChange = new EventEmitter<CheckboxNode[]>(); // Output event to emit when the flat map of nodes changes
  @Output() checkboxChange = new EventEmitter<
    KeyValue<string, CheckboxMapNode>
  >(); // Output event to emit when a single checkbox changes

  // Method to handle checkbox change events
  checkboxChangeHandler(
    selected: boolean,
    checkboxKeyValue: KeyValue<string, CheckboxMapNode>
  ): void {
    const updatedNode = this.toggle(checkboxKeyValue.value, selected); // Toggle the selected state of the node
    this.checkboxNodeMap.set(checkboxKeyValue.key, updatedNode); // Update the node in the map
    this.checkboxChange.emit({ key: checkboxKeyValue.key, value: updatedNode }); // Emit individual checkbox change for hierarchial upflow

    this.emitChanges(); // Emit the changes
  }

  // Method to toggle the selected state of a node and its children
  toggle(node: CheckboxMapNode, selected: boolean): CheckboxMapNode {
    node.selected = selected;
    node.indeterminate = false;
    node.onChange?.(selected, node); // Call the onChange callback if it exists
    node.children.forEach((child) => this.toggle(child, selected)); // Recursively toggle all children
    return new CheckboxMapNode(node); // Return the updated node
  }

  // Method to handle changes from child checkboxes
  onChildChange(
    checkboxKeyValue: KeyValue<string, CheckboxMapNode>,
    parentKey: string
  ): void {
    const parentNode = this.checkboxNodeMap.get(parentKey); // Get the parent node
    if (parentNode) {
      parentNode.children.set(checkboxKeyValue.key, checkboxKeyValue.value); // Update the child node

      parentNode.selected = this._allSelected(parentNode); // Update the parent's selected state
      parentNode.indeterminate = this._someSelected(parentNode); // Update the parent's indeterminate state

      this.checkboxChange.emit({
        key: parentKey,
        value: parentNode
      }); // Emit the change to the parent's parent
    }

    this.emitChanges(); // Emit the changes
  }

  // Method to emit changes to the various outputs
  emitChanges(): void {
    this.hierarchyMapChange.emit(this.checkboxNodeMap); // Emit hierarchy map change

    const updatedNodes = checkboxExtMapToArray(this.checkboxNodeMap);
    this.hierarchyChange.emit(updatedNodes); // Emit hierarchy change

    const flatNodes = updatedNodes.flatMap((node) =>
      this.flattenCheckbox(node)
    );
    this.flatChange.emit(flatNodes); // Emit flat list change
  }

  flattenCheckbox(checkboxNode: CheckboxNode): CheckboxNode[] {
    return checkboxNode.children.length > 0
      ? checkboxNode.children.flatMap((child) => this.flattenCheckbox(child))
      : [checkboxNode];
  }

  // Method to toggle the expanded state of a node
  toggleExpandHandler(e: Event, key: string): void {
    e.preventDefault(); // Prevent default event behavior
    const node = this.checkboxNodeMap.get(key); // Get the node
    if (node) node.expanded = !node.expanded; // Toggle the expanded state
  }

  // Private method to check if all children of a node are selected
  private _allSelected(node: CheckboxMapNode): boolean {
    return [...node.children.values()].every((child) => child.selected); // Return true if all children are selected
  }

  // Private method to check if some but not all children of a node are selected
  private _someSelected(node: CheckboxMapNode): boolean {
    return (
      !node.selected &&
      [...node.children.values()].some((child) => child.selected)
    ); // Return true if some but not all children are selected
  }
}
