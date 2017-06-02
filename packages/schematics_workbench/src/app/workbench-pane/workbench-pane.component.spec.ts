import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkbenchPaneComponent } from './workbench-pane.component';

describe('WorkbenchPaneComponent', () => {
  let component: WorkbenchPaneComponent;
  let fixture: ComponentFixture<WorkbenchPaneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkbenchPaneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkbenchPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
