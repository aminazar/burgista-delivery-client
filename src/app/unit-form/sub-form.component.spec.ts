/* tslint:disable:no-unused-variable */
import {async, ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {DebugElement} from '@angular/core';

import {SubFormComponent} from './sub-form.component';
import {FormsModule} from "@angular/forms";
import {MaterialModule} from "@angular/material";
import {UnitModel} from "./unit.model";
import {Unit} from './unit';

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
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should equal to given unit model', fakeAsync(() => {
    let unit = new Unit();
    unit.id = 0;
    unit.name = 'center branch';
    unit.username = 'john';
    unit.password = '';
    unit.isBranch = true;

    let unitModel = new UnitModel(unit);
    component.unitModel = unitModel;

    component.isAdd = false;
    fixture.detectChanges();

    let unitModel = new UnitModel(unit);
    component.unitModel = unitModel;

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

  it('should should be enabled after change name/username/password', fakeAsync(() => {
    let unit = new Unit();
    unit.id = 0;
    unit.name = 'ali';
    unit.username = 'ahmadi';
    unit.password = '';
    unit.isBranch = true;

    let unitModel = new UnitModel(unit);
    component.unitModel = unitModel;
    component.isAdd = false;
    fixture.detectChanges();

    let de : DebugElement = fixture.debugElement.query(By.css('#name'));
    let el : HTMLInputElement = de.nativeElement;
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick();
    el.value = 'mehdi';
    de.triggerEventHandler('keyup', null);
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick();
    expect(fixture.debugElement.query(By.css('#updateBtn')).nativeElement.disabled).toBe(false);
  }));

});
