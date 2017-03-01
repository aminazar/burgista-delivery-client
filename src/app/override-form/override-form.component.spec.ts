import {async, ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {BrowserModule, By} from "@angular/platform-browser";
import {Router} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MaterialModule} from "@angular/material";

import { OverrideFormComponent } from './override-form.component';
import {CountingRuleComponent} from "../counting-rule/counting-rule.component";
import {RRuleComponent} from "../rrule/rrule.component";
import {MonthdayComponent} from "../rrule/monthday.component";
import {MessageService} from "../message.service";
import {RestService} from "../rest.service";
import {AuthService} from "../auth.service";
import {PromiseObservable} from "rxjs/observable/PromiseObservable";
import {wrapIntoObservable} from "@angular/router/src/utils/collection";


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
}

describe('OverrideFormComponent', () => {
  let component: OverrideFormComponent;
  let fixture: ComponentFixture<OverrideFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        OverrideFormComponent,
        CountingRuleComponent,
        RRuleComponent,
        MonthdayComponent,
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        BrowserModule,
        MaterialModule.forRoot(),
      ],
      providers: [
        MessageService,
        RestService,
        // AuthService,
        {provide: Router, useClass: RouterStub},
        {provide: AuthService, useClass: AuthServiceStub},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverrideFormComponent);
    component = fixture.componentInstance;

    let restService = fixture.debugElement.injector.get(RestService);
    let branchSpy = spyOn(restService, 'get').and.callFake(function (api) {
      if(api === 'unit?isBranch=true'){
        return PromiseObservable.create(Promise.resolve([
          {id: 4, name: 'Baker Street'},
          {id: 5, name: 'Piccadilly'},
          {id: 6, name: 'Shepherd’s Bush'}
        ]))
      }
      else if(api === 'override'){
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
        ]))
      }
      else{
        return PromiseObservable.create(Promise.resolve([
          {
            pid: 1,
            prep_unit_id: 2,
            code: 'ks01',
            name: 'Ketchup Sauce',
            size: 10,
            measuring_unit: 'Kg',
            default_max: 20,
            default_min: 10,
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
            default_mon_multiple: 3,
            default_tue_multiple: 1,
            default_wed_multiple: 1,
            default_thu_multiple: 1,
            default_fri_multiple: 1,
            default_sat_multiple: 2,
            default_sun_multiple: 1,
            default_usage_multiple: 5,
          }
        ]))
      }
    });

    component.authService.userType = 'admin';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should admin override a product for 'Baker Street' branch", fakeAsync(() => {
    component.selectedIndex = 0;
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    //Set Frying oil product
    let productName : HTMLElement = fixture.debugElement.query(By.css('.pnc')).nativeElement;
    productName.value = component.productName_Code[0];
    productName.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    expect(component.isFiltered).toBe(true, 'is not filtered');
    expect(component.branchList.length).toBe(3);
    expect(component.isAdmin).toBe(true);
    expect(component.productName_Code.length).toBe(4);
    // expect(component.filteredProductModel._product.code).toBe('fo01');
  }));
});
