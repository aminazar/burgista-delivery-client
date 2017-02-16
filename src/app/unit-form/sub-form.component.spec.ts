/* tslint:disable:no-unused-variable */
import {async, ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {DebugElement} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MaterialModule} from "@angular/material";
import {BehaviorSubject} from "rxjs";

import {SubFormComponent} from './sub-form.component';
import {UnitModel} from "./unit.model";
import {Unit} from './unit';
import {ActionEnum} from "./actionEnum";

describe('SubFormComponent', () => {
  let component: SubFormComponent;
  let fixture: ComponentFixture<SubFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SubFormComponent],
      imports: [FormsModule, MaterialModule.forRoot()]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.isAdd = true;

    let actionIsSuccess : BehaviorSubject<boolean> = new BehaviorSubject(false);
    component.actionIsSuccess = actionIsSuccess;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should equal to given unit model', fakeAsync(() => {
    let unit = new Unit();
    unit.id = 0;
    unit.name = 'center branch';
    unit.username = 'john';
    unit.password = '';
    unit.is_branch = true;

    let unitModel = new UnitModel(unit);
    component.unitModel = unitModel;

    let actionIsSuccess : BehaviorSubject<boolean> = new BehaviorSubject(false);
    component.actionIsSuccess = actionIsSuccess;
    component.isAdd = false;
    fixture.detectChanges();

    let de : DebugElement = fixture.debugElement.query(By.css('#name'));
    let el : HTMLInputElement = de.nativeElement;

    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick();
    expect(el.value).toContain('center branch');

    de = fixture.debugElement.query(By.css('#username'));
    el = de.nativeElement;
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick();
    expect(el.value).toContain('john');

    de = fixture.debugElement.query(By.css('#password'));
    el = de.nativeElement;
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick();
    expect(el.value).toBe('');
  }));

  it('should be enabled after change name/username/password', fakeAsync(() => {
    let unit = new Unit();
    unit.id = 0;
    unit.name = 'ali';
    unit.username = 'ahmadi';
    unit.password = '';
    unit.is_branch = true;

    let unitModel = new UnitModel(unit);
    component.unitModel = unitModel;
    component.isAdd = false;
    let actionIsSuccess : BehaviorSubject<boolean> = new BehaviorSubject(false);
    component.actionIsSuccess = actionIsSuccess;
    fixture.detectChanges();

    let de : DebugElement = fixture.debugElement.query(By.css('#name'));
    let el : HTMLInputElement = de.nativeElement;
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick();
    expect(el.value).toContain('ali');
    el.value = 'mahdi';
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick();
    actionIsSuccess.next(true);
    de.triggerEventHandler('keyup', null);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('#updateBtn')).nativeElement.disabled).toBe(false);
  }));

  it('should trigger event to delete specific unitModel', () => {
    let unit : Unit = new Unit();
    unit.id = 1;
    unit.name = 'Baker Street';
    unit.username = 'John';
    unit.password = '';
    unit.is_branch = true;

    let actionIsSuccess : BehaviorSubject<boolean> = new BehaviorSubject(false);
    component.isAdd = false;
    component.unitModel = new UnitModel(unit);
    component.actionIsSuccess = actionIsSuccess;

    fixture.detectChanges();

    let rcvId = 0;
    component.action.subscribe((value) => rcvId = value.data.id);

    let de : DebugElement = fixture.debugElement.query(By.css('#deleteBtn'));
    de.triggerEventHandler('click', ActionEnum.delete);

    expect(rcvId).toBe(1);
  });
});
