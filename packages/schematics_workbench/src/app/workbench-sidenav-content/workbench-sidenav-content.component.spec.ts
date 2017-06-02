import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkbenchSidenavContentComponent } from './workbench-sidenav-content.component';

describe('WorkbenchSidenavContentComponent', () => {
  let component: WorkbenchSidenavContentComponent;
  let fixture: ComponentFixture<WorkbenchSidenavContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkbenchSidenavContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkbenchSidenavContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
