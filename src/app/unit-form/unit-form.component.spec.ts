/* tslint:disable:no-unused-variable */
import {async, ComponentFixture, TestBed, fakeAsync, tick, async} from '@angular/core/testing';
import {By, BrowserModule} from '@angular/platform-browser';
import {DebugElement} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MaterialModule} from "@angular/material";
import {PromiseObservable} from "rxjs/observable/PromiseObservable";

import {UnitFormComponent} from './unit-form.component';
import {SubFormComponent} from "./sub-form.component";
import {RestService} from "../rest.service";
import {Unit} from "./unit";
import {UnitModel} from "./unit.model";
import {ActionEnum} from "./actionEnum";
import {MessageService} from "../message.service";


describe('UnitFormComponent', () => {
  let component: UnitFormComponent;
  let fixture: ComponentFixture<UnitFormComponent>;
  let tempUnitModels : UnitModel[] = [];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        UnitFormComponent,
        SubFormComponent,
      ],
      imports: [
        BrowserModule,
        FormsModule,
        MaterialModule.forRoot(),
      ],
      providers: [
        MessageService,
        RestService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the origin title', () => {
    let de : DebugElement = fixture.debugElement.query(By.css('md-card-title'));
    let el : HTMLInputElement = de.nativeElement;
    expect(el.textContent).toContain('Branches and Preparation Units');
  });

  it('should sort a unitModels list', () => {
    let first_unit : Unit = new Unit();
    first_unit.id = 1;
    first_unit.name = 'Piccadilly';
    first_unit.username = 'Jack';
    first_unit.password = '';
    first_unit.is_branch = true;
    tempUnitModels.push(new UnitModel(first_unit));

    let second_unit : Unit = new Unit();
    second_unit.id = 2;
    second_unit.name = 'Shepherd’s Bush';
    second_unit.username = 'Joe';
    second_unit.password = '';
    second_unit.is_branch = true;
    tempUnitModels.push(new UnitModel(second_unit));

    let third_unit : Unit = new Unit();
    third_unit.id = 3;
    third_unit.name = 'Baker Street';
    third_unit.username = 'John';
    third_unit.password = '';
    third_unit.is_branch = true;
    tempUnitModels.push(new UnitModel(third_unit));

    let first_prep : Unit = new Unit();
    first_prep.id = 4;
    first_prep.name = 'main prep';
    first_prep.username = 'Johny';
    first_prep.password = '';
    first_prep.is_branch = false;
    tempUnitModels.push(new UnitModel(first_prep));

    component.unitModels = tempUnitModels;

    component.sortUnitModelList();

    fixture.detectChanges();

    expect(component.unitModels[0]._unit.name).toContain('main prep');
    expect(component.unitModels[1]._unit.name).toContain('Baker Street');
    expect(component.unitModels[2]._unit.name).toContain('Piccadilly');
    expect(component.unitModels[3]._unit.name).toContain('Shepherd’s Bush');
  });

  it('should delete a unitModel from unitModel list', fakeAsync(() => {
    component.unitModels = tempUnitModels;
    fixture.detectChanges();

    let tempValueObj = {
      type: ActionEnum.delete,
      data: tempUnitModels[1]._unit
    };

    fixture.detectChanges();

    let restService = fixture.debugElement.injector.get(RestService);
    let spy = spyOn(restService, 'delete').and.returnValue(PromiseObservable.create(Promise.resolve()));

    expect(component.unitModels.length).toBe(4);

    component.doClickedAction(tempValueObj);
    tick();
    expect(spy.calls.any()).toBe(true);
    expect(component.unitModels.length).toBe(3);
  }));

  it('should add a unitModel to unitModel list', fakeAsync(() => {
    let unit : Unit = new Unit();
    unit.id = -1;
    unit.name = 'No Name';
    unit.username = 'No Username';
    unit.password = '123';
    unit.is_branch = false;

    let tempValueObj = {
      type: ActionEnum.add,
      data: unit
    };

    component.unitModels = tempUnitModels;

    expect(component.unitModels.length).toBe(4);

    let restService = fixture.debugElement.injector.get(RestService);
    let spy = spyOn(restService, 'insert').and.returnValue(PromiseObservable.create(Promise.resolve(5)));

    component.doClickedAction(tempValueObj);
    tick();
    expect(spy.calls.any()).toBe(true);

    fixture.detectChanges();
    expect(component.unitModels[0]._unit.password).toBe('');
    expect(component.unitModels.length).toBe(5);
  }));

  it('should update an existing unitModel in unitModel list', fakeAsync(() => {
    component.unitModels = tempUnitModels;
    component.sortUnitModelList();

    expect(component.unitModels[2]._unit.name).toBe('Baker Street');

    let restService = fixture.debugElement.injector.get(RestService);
    let spy = spyOn(restService, 'update').and.returnValue(PromiseObservable.create(Promise.resolve()));

    component.unitModels[2]._unit.name = 'Another name';
    let tempValueObj = {
      type: ActionEnum.update,
      data: component.unitModels[2]._unit
    };

    component.doClickedAction(tempValueObj);
    tick();

    expect(spy.calls.any()).toBe(true);
    expect(component.unitModels[2]._unit.password).toBe('');
    expect(component.unitModels[2]._unit.name).toBe('Another name');
  }));

  //To test below unit test please change the access level to 'disableEnable' method to public and then uncomment below unit test
  //Don't forget to undo your changes on below unit test (uncomment) and 'disableEnable' method.
  // it('should disabled delete/update/add button of a unitModel in unitModel list', fakeAsync(() => {
  //   component.unitModels = tempUnitModels;
  //   component.sortProductModelList();
  //
  //   expect(component.isAdding).toBe(false);
  //   expect(component.unitModels[0].waiting.updating).toBe(false);
  //   expect(component.unitModels[0].waiting.deleting).toBe(false);
  //
  //   component.disableEnable(5, ActionEnum.add, true);
  //   expect(component.isAdding).toBe(true);
  //   component.disableEnable(5, ActionEnum.update, true);
  //   expect(component.unitModels[0].waiting.updating).toBe(true);
  //   component.disableEnable(5, ActionEnum.delete, true);
  //   expect(component.unitModels[0].waiting.deleting).toBe(true);
  //
  //   component.disableEnable(5, ActionEnum.add, false);
  //   expect(component.isAdding).toBe(false);
  //   component.disableEnable(5, ActionEnum.update, false);
  //   expect(component.unitModels[0].waiting.updating).toBe(false);
  //   component.disableEnable(5, ActionEnum.delete, false);
  //   expect(component.unitModels[0].waiting.deleting).toBe(false);
  // }));
});
