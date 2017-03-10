import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintViewerComponent } from './print-viewer.component';

describe('PrintViewerComponent', () => {
  let component: PrintViewerComponent;
  let fixture: ComponentFixture<PrintViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
