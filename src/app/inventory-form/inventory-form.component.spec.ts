import {async, ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {DatepickerModule} from "angular2-material-datepicker";

import { InventoryFormComponent } from './inventory-form.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MaterialModule} from "@angular/material";
import {RestService} from "../rest.service";
import {AuthService} from "../auth.service";
import {PromiseObservable} from "rxjs/observable/PromiseObservable";
import {RouterTestingModule} from "@angular/router/testing";
import {HomeComponent} from "../home/home.component";
import {LoginComponent} from "../login/login.component";
import {HttpModule} from "@angular/http";
import {MessageService} from "../message.service";
import {DebugElement} from "@angular/core";
import {By} from "@angular/platform-browser";
import {Inventory} from "./inventory";

fdescribe('InventoryFormComponent', () => {
  let component: InventoryFormComponent;
  let fixture: ComponentFixture<InventoryFormComponent>;
  let restService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        InventoryFormComponent,
        HomeComponent,
        LoginComponent
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        DatepickerModule,
        HttpModule,
        MaterialModule.forRoot(),
        RouterTestingModule.withRoutes([
          {path: '',      component: HomeComponent, pathMatch: 'full'},
          {path: 'login', component: LoginComponent}
        ]),
      ],
      providers: [
        RestService,
        AuthService,
        MessageService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryFormComponent);
    component = fixture.componentInstance;

    restService = fixture.debugElement.injector.get(RestService);
    let authService = fixture.debugElement.injector.get(AuthService);

    let currentDate = new Date();

    let restSpy = spyOn(restService, 'get').and.returnValue(PromiseObservable.create(Promise.resolve([
      {bsddid: null, counting_date: null, pid: 28, product_code: 'fo01', product_name: 'Frying Oil', last_count: null, product_count: null},
      {bsddid: null, counting_date: null, pid: 30, product_code: 'ks01', product_name: 'Ketchup Sauce', last_count: null, product_count: null},
      {bsddid: 1, counting_date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate()), pid: 32, product_code: 'tm91', product_name: 'Tomato', last_count: new Date(), product_count: null},
      {bsddid: 2, counting_date: new Date(), pid: 2, product_code: 'ff19', product_name: 'French Fries', last_count: new Date(), product_count: 2},
    ])));

    let restInsertSpy = spyOn(restService, 'insert').and.returnValue(PromiseObservable.create(Promise.resolve(3)));


    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize some list in component', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component.inventoryModel._inventories.length).toBe(2);
    expect(component.products.length).toBe(2);
    expect(component.productName_Code.length).toBe(2);
  }));

  it('should display only one product with red color', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    let red_unopenedElement: HTMLElement = fixture.debugElement.queryAll(By.css('input'))[1].nativeElement;
    let black_unopenedElement: HTMLElement = fixture.debugElement.queryAll(By.css('input'))[2].nativeElement;

    expect(red_unopenedElement.className).toContain('warnColoring');
    expect(black_unopenedElement.className).toContain('normalColoring');
  }));

  it('should not display remove button beside two element', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    let removeDebugElement: DebugElement = fixture.debugElement.query(By.css('.fa-times'));

    expect(removeDebugElement).toBe(null);
  }));

  it('should add a product when its name is on autoComplete field', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    let autoCompleteNativeElement: HTMLElement = fixture.debugElement.query(By.css('.pnc')).nativeElement;

    expect(component.inventoryModel._inventories.length).toBe(2);
    expect(component.productName_Code.length).toBe(2);

    autoCompleteNativeElement.value = 'fo01 - Frying Oil';
    autoCompleteNativeElement.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    expect(component.inventoryModel._inventories.length).toBe(3);
    expect(component.productName_Code.length).toBe(1);
  }));

  it('should submit button be disabled when unopened pack has correct not value', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    let unopenedElement: HTMLElement = fixture.debugElement.queryAll(By.css('input'))[1].nativeElement;
    let first_submitButtonElement: DebugElement = fixture.debugElement.queryAll(By.css('button'))[0].nativeElement;
    let second_submitButtonElement: DebugElement = fixture.debugElement.queryAll(By.css('button'))[1].nativeElement;

    expect(first_submitButtonElement.disabled).toBe(true);
    expect(second_submitButtonElement.disabled).toBe(false);

    unopenedElement.value = 2;
    unopenedElement.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    expect(first_submitButtonElement.disabled).toBe(false);
  }));

  it('should submit a product', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    let submitButtonDebugElement: DebugElement = fixture.debugElement.queryAll(By.css('button'))[1];

    let inventoryItem = new Inventory();
    inventoryItem.id = 2;
    inventoryItem.unopenedPack = 3;

    expect(component.inventoryModel._inventories.length).toBe(2);

    let restUpdateSpy = spyOn(restService, 'update').and.returnValue(PromiseObservable.create(Promise.resolve(2)));
    tick();

    submitButtonDebugElement.triggerEventHandler('click', inventoryItem);
    tick(1000);
    fixture.detectChanges();

    expect(component.inventoryModel._inventories.length).toBe(1);
  }));

  it('should remove a product', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    let autoCompleteNativeElement: HTMLElement = fixture.debugElement.query(By.css('.pnc')).nativeElement;
    autoCompleteNativeElement.value = 'fo01 - Frying Oil';
    autoCompleteNativeElement.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    let removeButtonDebugElement: DebugElement = fixture.debugElement.queryAll(By.css('button'))[2];

    expect(component.inventoryModel._inventories.length).toBe(3);

    let inventoryItem = new Inventory();
    inventoryItem.id = null;
    inventoryItem.productCode = 'fo01';

    removeButtonDebugElement.triggerEventHandler('click', inventoryItem);
    tick(1000);
    fixture.detectChanges();

    expect(component.inventoryModel._inventories.length).toBe(2);
    expect(component.inventoryModel._inventories.map(inv => inv.productCode)).not.toContain('fo01');
  }));

  it('should not display any button in page', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    let dateInputElement: HTMLElement = fixture.debugElement.queryAll(By.css('input'))[0].nativeElement;

    let currentDate = new Date();

    dateInputElement.value = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, currentDate.getDate());
    dateInputElement.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    let anyButtonElement: DebugElement = fixture.debugElement.queryAll(By.css('button'));
    let autoCompleteElement: DebugElement = fixture.debugElement.query(By.css('.pnc'));

    expect(component.inventoryModel._inventories.length).toBe(2);
    expect(anyButtonElement).toBe(null);
    expect(autoCompleteElement).toBe(null);
  }));
});
