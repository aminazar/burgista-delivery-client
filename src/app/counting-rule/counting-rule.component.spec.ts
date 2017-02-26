import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountingRuleComponent } from './counting-rule.component';

describe('CountingRuleComponent', () => {
  let component: CountingRuleComponent;
  let fixture: ComponentFixture<CountingRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountingRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountingRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
