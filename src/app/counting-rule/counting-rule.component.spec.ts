import {async, ComponentFixture, TestBed, tick, fakeAsync} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import { CountingRuleComponent } from './counting-rule.component';
import {MessageService} from "../message.service";
import {MaterialModule} from "@angular/material";
import {RRuleComponent} from "../rrule/rrule.component";
import {MonthdayComponent} from "../rrule/monthday.component";
import {By} from "@angular/platform-browser";
import {DebugElement} from "@angular/core";

fdescribe('CountingRuleComponent', () => {
  let component: CountingRuleComponent;
  let fixture: ComponentFixture<CountingRuleComponent>;
  let rruleStr: string = '';
  let maxQty: number = 0;
  let minQty: number = 0;
  let coefficients = {
    Monday: 1,
    Tuesday: 1,
    Wednesday: 1,
    Thursday: 1,
    Friday: 1,
    Saturday: 1,
    Sunday: 1,
    Usage: 1,
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CountingRuleComponent,
        RRuleComponent,
        MonthdayComponent
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialModule.forRoot()
      ],
      providers: [
        MessageService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountingRuleComponent);
    component = fixture.componentInstance;

    component.recursionRule = rruleStr;
    component.maxQty = maxQty;
    component.minQty = minQty;
    component.coefficients = coefficients;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update minQty value on change (Two way binding)', fakeAsync(() => {
    let minQtyField : HTMLElement = fixture.debugElement.query(By.css('.minQty')).nativeElement;

    expect(component.minQty).toBe(0);

    minQtyField.value = '12';
    minQtyField.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    expect(component.minQty).toBe(12);
  }));

  it('should raise an error message', fakeAsync(() => {
    let minQtyField : HTMLElement = fixture.debugElement.query(By.css('.minQty')).nativeElement;
    let maxQtyDebugElement : DebugElement = fixture.debugElement.query(By.css('.maxQty'));
    let maxQtyField : HTMLElement = maxQtyDebugElement.nativeElement;

    minQtyField.value = '12';
    minQtyField.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    maxQtyField.value = '10';
    maxQtyField.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    let errorData;
    component.hasError.subscribe((data) => errorData = data);

    maxQtyDebugElement.triggerEventHandler('keyup', null);
    tick();
    fixture.detectChanges();

    expect(component.minQty).toBe(12);
    expect(component.maxQty).toBe(10);

    expect(errorData.hasError).toBe(true);
    expect(errorData.message).toBe('The minQty should be less than maxQty');
  }));

  it('should replace 0 instead of negative value in minQty', fakeAsync(() => {
    let minQtyDebugElement : DebugElement = fixture.debugElement.query(By.css('.minQty'));
    let minQtyField : HTMLElement = minQtyDebugElement.nativeElement;

    minQtyField.value = -1;
    minQtyField.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    minQtyDebugElement.triggerEventHandler('keyup', null);
    tick();
    fixture.detectChanges();

    minQtyField.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    minQtyDebugElement.triggerEventHandler('keyup', null);
    tick();
    fixture.detectChanges();

    expect(parseInt(minQtyField.value)).toBe(0);
    expect(component.minQty).toBe(0);
  }));
});
