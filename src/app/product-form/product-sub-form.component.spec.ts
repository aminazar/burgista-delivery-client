/* tslint:disable:no-unused-variable */
import {async, ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProductSubFormComponent } from './product-sub-form.component';
import {MaterialModule} from "@angular/material";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CountingRuleComponent} from "../counting-rule/counting-rule.component";
import {RRuleComponent} from "../rrule/rrule.component";
import {MonthdayComponent} from "../rrule/monthday.component";
import {RestService} from "../rest.service";
import {Product} from "./product";
import {BehaviorSubject} from "rxjs";
import {PromiseObservable} from "rxjs/observable/PromiseObservable";
import {ProductModel} from "./product.model";
import {ActionEnum} from "../unit-form/actionEnum";
import {MessageService} from "../message.service";

describe('ProductSubFormComponent', () => {
  let component: ProductSubFormComponent;
  let fixture: ComponentFixture<ProductSubFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProductSubFormComponent,
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
        RestService,
        MessageService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSubFormComponent);
    component = fixture.componentInstance;

    //Spy restService.get
    let restService = fixture.debugElement.injector.get(RestService);
    let spy = spyOn(restService, 'get').and.returnValue(PromiseObservable.create(Promise.resolve([
      {id: 2, name: 'Prep Kitchen'},
      {id: 3, name: 'Main Depot'}
    ])));
    let actionIsSuccess : BehaviorSubject<boolean> = new BehaviorSubject(false);
    component.actionIsSuccess = actionIsSuccess;
    component.isAdd = true;
    let isAdding : BehaviorSubject<boolean> = new BehaviorSubject(false);
    component.isAdding = isAdding;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add button be disabled/enabled', () => {
    let product: Product = new Product();
    product.name = 'Frying oil';
    product.code = 'fo01';
    product.size = 10;
    product.measuringUnit = 'Kg';
    product.prep_unit_id = 2;
    product.minQty = 2;
    product.maxQty = 3;
    product.coefficients = {
      Monday: 1,
      Tuesday: 1,
      Wednesday: 1,
      Thursday: 1,
      Friday: 1,
      Saturday: 1,
      Sunday: 1,
      Usage: 1
    };
    product.countingRecursion = 'FREQ=DAILY;DTSTART=20170222T075434Z;INTERVAL=1';

    component.product = product;

    let nameDebugElement : DebugElement = fixture.debugElement.query(By.css('.name'));
    let nameField : HTMLElement = nameDebugElement.nativeElement;

    component.disabilityStatus();
    let addBtn : HTMLElement = fixture.debugElement.query(By.css('.addBtn')).nativeElement;

    fixture.detectChanges();
    expect(addBtn.disabled).toBe(false);

    nameField.value = '';
    nameField.dispatchEvent(new Event('input'));
    nameDebugElement.triggerEventHandler('keyup', null);
    fixture.detectChanges();
    expect(addBtn.disabled).toBe(true);
  });

  it('should add a product', () => {
    let product: Product = new Product();
    product.name = 'Frying oil';
    product.code = 'fo01';
    product.size = 10;
    product.measuringUnit = 'Kg';
    product.prep_unit_id = 2;
    product.minQty = 2;
    product.maxQty = 3;
    product.coefficients = {
      Monday: 1,
      Tuesday: 1,
      Wednesday: 1,
      Thursday: 1,
      Friday: 1,
      Saturday: 1,
      Sunday: 1,
      Usage: 1
    };
    product.countingRecursion = 'FREQ=DAILY;DTSTART=20170222T075434Z;INTERVAL=1';

    component.product = product;

    component.disabilityStatus();
    let addBtnDebugElement : DebugElement = fixture.debugElement.query(By.css('.addBtn'));
    let addBtn : HTMLElement = addBtnDebugElement.nativeElement;

    fixture.detectChanges();
    expect(addBtn.disabled).toBe(false);

    let rcvData;

    component.action.subscribe((data) => rcvData = data);

    addBtnDebugElement.triggerEventHandler('click', ActionEnum.add);
    fixture.detectChanges();
    expect(rcvData.type).toBe(ActionEnum.add);
    expect(rcvData.data.name).toBe('Frying oil');
  });

  it('should show a product', fakeAsync(() => {
    component.isAdd = false;

    let product: Product = new Product();
    product.id = 1;
    product.name = 'Frying oil';
    product.code = 'fo01';
    product.size = 10;
    product.measuringUnit = 'Kg';
    product.prep_unit_id = 2;
    product.minQty = 2;
    product.maxQty = 3;
    product.coefficients = {
      Monday: 1,
      Tuesday: 1,
      Wednesday: 1,
      Thursday: 1,
      Friday: 1,
      Saturday: 1,
      Sunday: 1,
      Usage: 1
    };
    product.countingRecursion = 'FREQ=DAILY;DTSTART=20170222T075434Z;INTERVAL=1';
    let productModel : ProductModel = new ProductModel(product);
    component.productModel = productModel;

    component.ngOnInit();
    fixture.detectChanges();

    let nameField : HTMLElement = fixture.debugElement.query(By.css('.name')).nativeElement;
    let prepUnitIdField : HTMLElement = fixture.debugElement.queryAll(By.css('input'))[3].nativeElement;

    nameField.dispatchEvent(new Event('input'));
    prepUnitIdField.dispatchEvent(new Event('input'));
    tick();

    fixture.detectChanges();
    expect(nameField.value).toBe('Frying oil');
    expect(parseInt(prepUnitIdField.value)).toBe(2);
  }));

  it('should disabled/enabled update and delete buttons', fakeAsync(() => {
    component.isAdd = false;

    let product: Product = new Product();
    product.id = 1;
    product.name = 'Frying oil';
    product.code = 'fo01';
    product.size = 10;
    product.measuringUnit = 'Kg';
    product.prep_unit_id = 2;
    product.minQty = 2;
    product.maxQty = 3;
    product.coefficients = {
      Monday: 1,
      Tuesday: 1,
      Wednesday: 1,
      Thursday: 1,
      Friday: 1,
      Saturday: 1,
      Sunday: 1,
      Usage: 1
    };
    product.countingRecursion = 'FREQ=DAILY;DTSTART=20170222T075434Z;INTERVAL=1';
    let productModel : ProductModel = new ProductModel(product);
    component.productModel = productModel;

    component.ngOnInit();
    component.disabilityStatus();
    fixture.detectChanges();

    let updateBtnDebugElement : DebugElement = fixture.debugElement.query(By.css('.updateBtn'));
    let updateBtn : HTMLElement = updateBtnDebugElement.nativeElement;
    let deleteBtnDebugElement : DebugElement = fixture.debugElement.query(By.css('.deleteBtn'));
    let deleteBtn : HTMLElement = deleteBtnDebugElement.nativeElement;

    expect(updateBtn.disabled).toBe(true);
    expect(deleteBtn.disabled).toBe(false);

    let nameDebugElement : DebugElement = fixture.debugElement.query(By.css('.name'));
    let nameField : HTMLElement = nameDebugElement.nativeElement;

    nameField.value = 'Frying oil_1';
    nameField.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    nameDebugElement.triggerEventHandler('keyup', null);
    fixture.detectChanges();

    expect(updateBtn.disabled).toBe(false);
    expect(deleteBtn.disabled).toBe(false);

    nameField.value = 'Frying oil';
    nameField.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    nameDebugElement.triggerEventHandler('keyup', null);
    fixture.detectChanges();

    expect(updateBtn.disabled).toBe(true);
    expect(deleteBtn.disabled).toBe(false);
  }));

  it('should update/delete a product', () => {
    component.isAdd = false;

    let product: Product = new Product();
    product.id = 1;
    product.name = 'Frying oil';
    product.code = 'fo01';
    product.size = 10;
    product.measuringUnit = 'Kg';
    product.prep_unit_id = 2;
    product.minQty = 2;
    product.maxQty = 3;
    product.coefficients = {
      Monday: 1,
      Tuesday: 1,
      Wednesday: 1,
      Thursday: 1,
      Friday: 1,
      Saturday: 1,
      Sunday: 1,
      Usage: 1
    };
    product.countingRecursion = 'FREQ=DAILY;DTSTART=20170222T075434Z;INTERVAL=1';
    let productModel : ProductModel = new ProductModel(product);
    component.productModel = productModel;

    component.ngOnInit();
    component.disabilityStatus();
    fixture.detectChanges();

    let updateBtnDebugElement : DebugElement = fixture.debugElement.query(By.css('.updateBtn'));
    let deleteBtnDebugElement : DebugElement = fixture.debugElement.query(By.css('.deleteBtn'));

    let rcvData;

    component.action.subscribe((data) => rcvData = data);

    updateBtnDebugElement.triggerEventHandler('click', ActionEnum.update);
    expect(rcvData.type).toBe(ActionEnum.update);
    expect(rcvData.data.code).toBe('fo01');

    deleteBtnDebugElement.triggerEventHandler('click', ActionEnum.delete);
    expect(rcvData.type).toBe(ActionEnum.delete);
    expect(rcvData.data.id).toBe(1);
  });
});
