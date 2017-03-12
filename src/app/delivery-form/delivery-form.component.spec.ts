import {async, ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {MaterialModule} from "@angular/material";
import {DatepickerModule} from "angular2-material-datepicker";
import * as moment from 'moment';
import {PromiseObservable} from "rxjs/observable/PromiseObservable";
import {DebugElement} from "@angular/core";
import {By} from "@angular/platform-browser";
import {FlexLayoutModule} from "@angular/flex-layout";
import {Router} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import { DeliveryFormComponent } from './delivery-form.component';
import {RestService} from "../rest.service";
import {MessageService} from "../message.service";
import {AuthService} from "../auth.service";
import {PrintService} from "../print.service";
import {CommonModule} from "@angular/common";

class RouterStub {
  navigateByUrl(url: string) {
    return url;
  }

  navigate(url: string) {
    return url;
  }
}

class AuthServiceStub{
  userType: 'admin';
  unitName: 'Main Depot';
}

class PrintServiceStub{
  printData(){
    return 'done';
  }
}

fdescribe('DeliveryFormComponent', () => {
  let component: DeliveryFormComponent;
  let fixture: ComponentFixture<DeliveryFormComponent>;
  let restService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DeliveryFormComponent
      ],
      imports: [
        MaterialModule.forRoot(),
        DatepickerModule,
        FormsModule,
        CommonModule,
        FlexLayoutModule,
        ReactiveFormsModule
      ],
      providers: [
        MessageService,
        RestService,
        {provide: AuthService, useClass: AuthServiceStub},
        {provide: Router, useClass: RouterStub},
        {provide: PrintService, useClass: PrintServiceStub}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryFormComponent);
    component = fixture.componentInstance;

    let date = moment(new Date).format('YYYYMMDD');

    restService = fixture.debugElement.injector.get(RestService);
    let unitSpy = spyOn(restService, 'get').and.callFake(function (api) {
      if(api === 'unit?isBranch=true'){
        return PromiseObservable.create(Promise.resolve([
          {name: 'Baker Street', uid: 4},
          {name: 'Piccadilly', uid: 5},
          {name: 'Shepherd’s Bush', uid: 6}
        ]));
      }
      else if(api === 'delivery/' + date + '/4'){
        return PromiseObservable.create(Promise.resolve([
          {
            id: null,
            productId: 2,
            productCode: 'fo01',
            productName: 'Frying Oil',
            min: 2,
            max: 4,
            realDelivery: null,
            stock: null,
            stockDate: null
          },
          {
            id: 1,
            productId: 3,
            productCode: 'ks130',
            productName: 'Ketchup Sauce',
            min: 10,
            max: 12,
            realDelivery: 3,
            stock: 10,
            stockDate: Date.toString()
          },
          {
            id: 2,
            productId: 4,
            productCode: 'm41',
            productName: 'Meat',
            min: 5,
            max: 6,
            realDelivery: null,
            stock: 6,
            stockDate: Date.toString()
          }
        ]));
      }
      else if(api === 'delivery/' + date + '/5'){
        return PromiseObservable.create(Promise.resolve([
          {
            id: 3,
            productId: 6,
            productCode: 'oo4',
            productName: 'Olive Oil',
            min: 1,
            max: 2,
            realDelivery: null,
            stock: null,
            stockDate: null
          }
        ]));
      }
      else if(api === 'delivery/' + date + '/6'){
        return PromiseObservable.create(Promise.resolve([

        ]));
      }
    });

    fixture.detectChanges();
  });

  it('should create', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.receivers.length).toBe(3);
    expect(component.receiverName).toBe('All');
  }));

  it("should show autoComplete element for 'Baker Street' branch", fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    component.selectedIndex = 1;
    component.tabChanged();

    let autoDebugElement: DeubgElement = fixture.debugElement.query(By.css('.pnc'));

    expect(component.productsList['Baker Street'].length).toBe(1);
    expect(component.isToday).toBe(true);
    expect(component.receiversDeliveryModels['Baker Street']._shouldDisabled).toBe(false);
    expect(component.overallDeliveryModel._isPrinted).toBe(false);
    expect(autoDebugElement).not.toBe(null);
    expect(component.selectedIndex).toBe(1);
    expect(component.receiverName).toBe('Baker Street');
  }));
});
