/* tslint:disable:no-unused-variable */
import {async, ComponentFixture, TestBed, tick, fakeAsync} from '@angular/core/testing';
import {By, BrowserModule} from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import {MaterialModule} from "@angular/material";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";

import { ProductFormComponent } from './product-form.component';
import {ProductSubFormComponent} from "./product-sub-form.component";
import {CountingRuleComponent} from "../counting-rule/counting-rule.component";
import {RRuleComponent} from "../rrule/rrule.component";
import {MonthdayComponent} from "../rrule/monthday.component";
import {RestService} from "../rest.service";
import {MessageService} from "../message.service";
import {Product} from "./product";
import {PromiseObservable} from "rxjs/observable/PromiseObservable";
import {ActionEnum} from "../unit-form/actionEnum";

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let restService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProductFormComponent,
        ProductSubFormComponent,
        CountingRuleComponent,
        RRuleComponent,
        MonthdayComponent
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        BrowserModule,
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
    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;

    restService = fixture.debugElement.injector.get(RestService);
    let spy = spyOn(restService, 'get').and.callFake(function (api) {
      if(api === 'product')
        return PromiseObservable.create(Promise.resolve([
          {
            pid: 1,
            prep_unit_id: 2,
            code: 'ks01',
            name: 'Ketchup Sauce',
            size: 10,
            measuring_unit: 'Kg',
            default_max: 2,
            default_min: 1,
            default_date_rule: 'FREQ=WEEKLY;DTSTART=20170222T075136Z;INTERVAL=1;BYDAY=WE',
            default_mon_multiple: 1,
            default_tue_multiple: 1,
            default_wed_multiple: 1,
            default_thu_multiple: 1,
            default_fri_multiple: 1,
            default_sat_multiple: 1,
            default_sun_multiple: 1,
            default_usage_multiple: 1,
          },
          {
            pid: 2,
            prep_unit_id: 3,
            code: 'fo01',
            name: 'Frying oil',
            size: 20,
            measuring_unit: 'Litre',
            default_max: 2,
            default_min: 1,
            default_date_rule: 'FREQ=DAILY;DTSTART=20170222T075434Z;INTERVAL=1',
            default_mon_multiple: 1,
            default_tue_multiple: 1,
            default_wed_multiple: 1,
            default_thu_multiple: 1,
            default_fri_multiple: 1,
            default_sat_multiple: 2,
            default_sun_multiple: 1,
            default_usage_multiple: 2,
          }
        ]));
      else if(api === 'unit?isBranch=false')
        return PromiseObservable.create(Promise.resolve([
          {id: 2, name: 'Prep Kitchen'},
          {id: 3, name: 'Main Depot'}
        ]));
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch all products and set some lists', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component.productModels.length).toBe(2);
    expect(component.productNames).toContain('Frying oil');
    expect(component.productCodes).toContain('ks01');

    //Check productName_Code list be sorted
    expect(component.productName_Code[0]).toBe('Frying oil');
    expect(component.productName_Code[3]).toBe('ks01');
  }));

  it('should add a product to productModels', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    let product: Product = new Product();
    product.id = 2;
    product.name = 'testProduct';
    product.code = 'tp01';
    product.size = 10;
    product.measuringUnit = 'g';
    product.prep_unit_id = 3;
    product.minQty = 1;
    product.maxQty = 2;
    product.coefficients = {
      Monday: 2,
      Tuesday: 2,
      Wednesday: 1,
      Thursday: 1,
      Friday: 1,
      Saturday: 1,
      Sunday: 2,
      Usage: 2
    };
    product.countingRecursion = 'FREQ=DAILY;DTSTART=20170222T075434Z;INTERVAL=1';

    let value = {
      type: ActionEnum.add,
      data: product
    };

    let restSpy = spyOn(restService, 'insert').and.returnValue(PromiseObservable.create(Promise.resolve(5)));

    component.doClickedAction(value);
    tick();
    fixture.detectChanges();

    expect(component.productModels.length).toBe(3);
    expect(component.productModels.filter((p) => p._product.id === 5)[0]._product.name).toBe('testProduct');
    expect(component.productCodes).toContain('tp01');
    expect(component.productNames).toContain('testProduct');
    expect(component.productName_Code).toContain('tp01');
    expect(component.productName_Code).toContain('testProduct');
  }));

  it('should set a proper productModel based on autoComplete', fakeAsync(() => {
    component.selectedIndex = 1;
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    //Set Frying oil product
    let productName : HTMLElement = fixture.debugElement.query(By.css('.pnc')).nativeElement;

    productName.value = component.productName_Code[0];
    productName.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    expect(component.isFiltered).toBe(true);
    expect(component.filteredProductModel._product.code).toBe('fo01');
  }));

  it('should update product size and coefficients Saturday', fakeAsync(() => {
    component.selectedIndex = 1;
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    //Set Frying oil product
    let productName : HTMLElement = fixture.debugElement.query(By.css('.pnc')).nativeElement;

    productName.value = component.productName_Code[0];
    productName.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    //Create an updated object
    let product: Product = new Product();
    product.id = 2;
    product.name = 'Frying oil';
    product.code = 'fo01';
    product.size = 10;
    product.measuringUnit = 'Litre';
    product.prep_unit_id = 3;
    product.minQty = 1;
    product.maxQty = 2;
    product.coefficients = {
      Monday: 1,
      Tuesday: 1,
      Wednesday: 1,
      Thursday: 1,
      Friday: 1,
      Saturday: 1,
      Sunday: 1,
      Usage: 2
    };
    product.countingRecursion = 'FREQ=DAILY;DTSTART=20170222T075434Z;INTERVAL=1';

    let value = {
      type: ActionEnum.update,
      data: product
    };

    let restSpy = spyOn(restService, 'update').and.returnValue(PromiseObservable.create(Promise.resolve()));

    component.doClickedAction(value);
    tick();
    fixture.detectChanges();

    expect(component.productModels.filter((p) => p._product.code === 'fo01')[0]._product.size).toBe(10);
    expect(component.productModels.filter((p) => p._product.code === 'fo01')[0]._product.coefficients.Saturday).toBe(1);
  }));

  it('should update product name and productName list', fakeAsync(() => {
    component.selectedIndex = 1;
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    //Set Frying oil product
    let productName : HTMLElement = fixture.debugElement.query(By.css('.pnc')).nativeElement;

    productName.value = component.productName_Code[0];
    productName.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    //Create an updated object
    let product: Product = new Product();
    product.id = 2;
    product.name = 'Frying oil_01';
    product.code = 'fo11';
    product.size = 20;
    product.measuringUnit = 'Litre';
    product.prep_unit_id = 3;
    product.minQty = 1;
    product.maxQty = 2;
    product.coefficients = {
      Monday: 1,
      Tuesday: 1,
      Wednesday: 1,
      Thursday: 1,
      Friday: 1,
      Saturday: 2,
      Sunday: 1,
      Usage: 2
    };
    product.countingRecursion = 'FREQ=DAILY;DTSTART=20170222T075434Z;INTERVAL=1';

    let value = {
      type: ActionEnum.update,
      data: product
    };

    let restSpy = spyOn(restService, 'update').and.returnValue(PromiseObservable.create(Promise.resolve()));

    component.doClickedAction(value);
    tick();
    fixture.detectChanges();

    expect(component.productModels.filter((p) => p._product.code === 'fo01').length).toBe(0);
    expect(component.productModels.filter((p) => p._product.code === 'fo11')[0]._product.name).toBe('Frying oil_01');
    expect(component.productNames).not.toContain('Frying oil');
    expect(component.productCodes).not.toContain('fo01');
    expect(component.productName_Code).toContain('fo11');
    expect(component.productName_Code).toContain('Frying oil_01');
  }));

  it('should delete a product from productModels list', fakeAsync(() => {
    component.selectedIndex = 1;
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    //Set Frying oil product
    let productName : HTMLElement = fixture.debugElement.query(By.css('.pnc')).nativeElement;

    productName.value = component.productName_Code[0];
    productName.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    //Create an updated object
    let product: Product = new Product();
    product.id = 2;
    product.name = 'Frying oil';
    product.code = 'fo01';
    product.size = 20;
    product.measuringUnit = 'Litre';
    product.prep_unit_id = 3;
    product.minQty = 1;
    product.maxQty = 2;
    product.coefficients = {
      Monday: 1,
      Tuesday: 1,
      Wednesday: 1,
      Thursday: 1,
      Friday: 1,
      Saturday: 2,
      Sunday: 1,
      Usage: 2
    };
    product.countingRecursion = 'FREQ=DAILY;DTSTART=20170222T075434Z;INTERVAL=1';

    let value = {
      type: ActionEnum.delete,
      data: product
    };

    let restSpy = spyOn(restService, 'delete').and.returnValue(PromiseObservable.create(Promise.resolve()));

    component.doClickedAction(value);
    tick();
    fixture.detectChanges();

    expect(component.productModels.filter((p) => p._product.code === 'fo01').length).toBe(0);
    expect(component.productNames).not.toContain('Frying oil');
    expect(component.productCodes).not.toContain('fo01');
    expect(component.productModels.length).toBe(1);
  }));
});
