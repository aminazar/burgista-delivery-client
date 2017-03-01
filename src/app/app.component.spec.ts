/* tslint:disable:no-unused-variable */

import {TestBed, async, ComponentFixture, getTestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {NavbarComponent} from "./navbar/navbar.component";
import {HomeComponent} from "./home/home.component";
import {RouterOutletMap, Router} from "@angular/router";
import {RouterTestingModule} from "@angular/router/testing";
import {LoginComponent} from "./login/login.component";
import {UsersComponent} from "./users/users.component";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MaterialModule} from "@angular/material";
import {HttpModule, BaseRequestOptions, Http, XHRBackend} from "@angular/http";
import {AuthService} from "./auth.service";
import {RestService} from "./rest.service";
import {LoggedInGuard} from "./login/logged-in.guard";
import {MessageService} from "./message.service";
import {CountingRuleComponent} from "./counting-rule/counting-rule.component";
import {OverrideFormComponent} from "./override-form/override-form.component";
import {ProductFormComponent} from "./product-form/product-form.component";
import {ProductSubFormComponent} from "./product-form/product-sub-form.component";
import {UnitFormComponent} from "./unit-form/unit-form.component";
import {SubFormComponent} from "./unit-form/sub-form.component";
import {RRuleComponent} from "./rrule/rrule.component";
import {MonthdayComponent} from "./rrule/monthday.component";
import {MockBackend} from "@angular/http/testing";
import {APP_BASE_HREF} from "@angular/common";

describe('App: Burgista Internal Delivery', () => {
  let app : AppComponent;
  let fixture : ComponentFixture<AppComponent>;
  let mockBackend: MockBackend, restService: RestService, authService: AuthService, router: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        NavbarComponent,
        HomeComponent,
        LoginComponent,
        CountingRuleComponent,
        OverrideFormComponent,
        ProductFormComponent,
        ProductSubFormComponent,
        UnitFormComponent,
        SubFormComponent,
        RRuleComponent,
        MonthdayComponent,
      ],
      imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        MaterialModule.forRoot(),
        RouterTestingModule.withRoutes([
          {path: '',      component: HomeComponent, pathMatch: 'full'},
          {path: 'login', component: LoginComponent}
        ]),
        ReactiveFormsModule,
      ],
      providers: [
        RestService,
        AuthService,
        MockBackend,
        BaseRequestOptions,
        MessageService,
        LoggedInGuard,
        // {provide: Router, useClass: RouterStub},
        {
          provide: Http,
          deps: [MockBackend, BaseRequestOptions],
          useFactory: (backend: XHRBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backend, defaultOptions);
          }
        },
      ]
    })
      .compileComponents();

    mockBackend = getTestBed().get(MockBackend);
    restService = getTestBed().get(RestService);
    authService = getTestBed().get(AuthService);
    router = getTestBed().get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it(`should have as title 'app works!'`, () => {
    expect(app.title).toEqual('app works!');
  });


  //Incorrect test
  // it('should render title in a h1 tag', async(() => {
  //   let fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   let compiled = fixture.debugElement.nativeElement;
  //   expect(compiled.querySelector('h1').textContent).toContain('app works!');
  // }));
});
