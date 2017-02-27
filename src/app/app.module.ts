import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {NavbarComponent} from './navbar/navbar.component';
import {HomeComponent} from './home/home.component';
import {AuthService} from "./auth.service";
import {RestService} from "./rest.service";
import {LoggedInGuard} from "./login/logged-in.guard";
import {RouterModule} from "@angular/router";
import {MaterialModule} from "@angular/material";
import 'hammerjs';
import { UnitFormComponent } from './unit-form/unit-form.component';
import { SubFormComponent } from './unit-form/sub-form.component';
import {FlexLayoutModule} from "@angular/flex-layout";
import { RRuleComponent } from './rrule/rrule.component';
import { MonthdayComponent } from './rrule/monthday.component';
import {ProductFormComponent} from "./product-form/product-form.component";
import {ProductSubFormComponent} from "./product-form/product-sub-form.component";
import { CountingRuleComponent } from './counting-rule/counting-rule.component';
import {MessageService} from "./message.service";

import { FocusDirective } from './focus.directive';
import { OverrideFormComponent } from './override-form/override-form.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    HomeComponent,
    UnitFormComponent,
    SubFormComponent,
    RRuleComponent,
    MonthdayComponent,
    ProductFormComponent,
    ProductSubFormComponent,
    CountingRuleComponent,
    FocusDirective,
    OverrideFormComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    FlexLayoutModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      {path: '',      component: HomeComponent, pathMatch: 'full'},
      {path: 'login', component: LoginComponent},
      {path: 'units', component: UnitFormComponent, canActivate: [LoggedInGuard]},
      {path: 'products', component: ProductFormComponent, canActivate: [LoggedInGuard]},
    ]),
  ],
  providers: [AuthService, RestService, LoggedInGuard, MessageService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
