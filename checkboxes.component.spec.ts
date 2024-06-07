import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  CheckboxItemComponent,
  CheckboxProperties
} from './checkboxes.component';
import { FormsModule } from '@angular/forms';

describe('CheckboxItemComponent', () => {
  let component: CheckboxItemComponent;
  let fixture: ComponentFixture<CheckboxItemComponent>;
  const mockCheckboxCollection: CheckboxProperties = new CheckboxProperties({
    id: '123',
    title: 'Parent',
    selected: false,
    expanded: false,
    color: 'primary',
    children: [
      {
        id: '456',
        title: 'Child 1',
        selected: false
      },
      {
        id: '789',
        title: 'Child 2',
        selected: false
      }
    ]
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckboxItemComponent],
      imports: [FormsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxItemComponent);
    component = fixture.componentInstance;
    component.checkboxProperties = mockCheckboxCollection;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit change event with checkboxCollection when a child checkbox is changed', () => {
    const spy = spyOn(component.change, 'emit');
    const child = component.checkboxProperties;
    child.selected = true;
    component.onChildChange(child);
    expect(spy).toHaveBeenCalledWith(component.checkboxProperties);
  });

  it('should toggle expanded flag on click', () => {
    component.expandable = true;
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('mat-icon');
    toggle.click();
    expect(component.checkboxProperties.expanded).toBe(true);
    toggle.click();
    expect(component.checkboxProperties.expanded).toBe(false);
  });

  it('should set allSelected to true when all children are selected', () => {
    component.toggle(true);
    expect(component.allSelected).toBe(true);
  });

  it('should set allSelected to false when not all children are selected', () => {
    component.toggle(false);
    expect(component.allSelected).toBe(false);
  });

  it('should emit change event with checkboxCollection when a parent checkbox is changed', () => {
    spyOn(component.change, 'emit');
    component.checkboxProperties.selected = true;
    component.toggle(false);
    expect(component.change.emit).toHaveBeenCalledWith(
      component.checkboxProperties
    );
  });

  it('should return false for someSelected when no children are selected', () => {
    component.checkboxProperties.children.forEach(
      (child) => (child.selected = false)
    );
    expect(component.someSelected).toBe(false);
  });

  it('should return false for someSelected when all children are selected', () => {
    component.checkboxProperties.children.forEach(
      (child) => (child.selected = true)
    );
    expect(component.someSelected).toBe(false);
  });

  it('should return true for someSelected when some but not all children are selected', () => {
    component.checkboxProperties.children[0].selected = true;
    component.checkboxProperties.children[1].selected = false;
    expect(component.someSelected).toBe(true);
  });

  it('should emit change event when checkbox selection changes', () => {
    const emitterSpy = spyOn(component.change, 'emit');
    const checkboxCollection = new CheckboxProperties({
      title: 'Parent',
      selected: false,
      children: [
        { title: 'Child 1', selected: false },
        { title: 'Child 2', selected: false }
      ]
    });
    component.checkboxProperties = checkboxCollection;
    fixture.detectChanges();
    const checkbox = fixture.nativeElement.querySelector(
      'input[type="checkbox"]'
    );
    checkbox.dispatchEvent(new Event('click'));
    expect(emitterSpy).toHaveBeenCalledWith(checkboxCollection);
  });

  it('should toggle expandable when toggleExpandHandler is called', () => {
    const checkboxCollection: CheckboxProperties = {
      title: 'Parent Checkbox',
      selected: false,
      expanded: false,
      children: []
    };
    component.toggleExpandHandler(new Event('click'), checkboxCollection);
    expect(checkboxCollection.expanded).toBeTruthy();
  });

  it('should emit the changed CheckboxCollection when onChildChange is called', () => {
    const onChildChangeSpy = spyOn(component, 'onChildChange');
    const checkboxCollection: CheckboxProperties = {
      id: '1',
      title: 'Parent',
      selected: false,
      children: [
        { id: '2', title: 'Child 1', selected: false },
        { id: '3', title: 'Child 2', selected: false },
        { id: '4', title: 'Child 3', selected: false }
      ]
    };
    component.onChildChange(checkboxCollection);
    expect(onChildChangeSpy).toHaveBeenCalledWith(checkboxCollection);
  });

  it('should emit the changed checkbox collection', () => {
    spyOn(component.change, 'emit');
    component.onChildChange(mockCheckboxCollection);
    expect(component.change.emit).toHaveBeenCalledWith(mockCheckboxCollection);
  });
});
