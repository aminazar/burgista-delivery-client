import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {NavbarComponent} from './navbar/navbar.component';
import {HomeComponent} from './home/home.component';
import {UsersComponent} from './users/users.component';
import {AuthService} from "./auth.service";
import {RestService} from "./rest.service";
import {LoggedInGuard} from "./login/logged-in.guard";
import {RouterModule} from "@angular/router";
import {MaterialModule} from "@angular/material";
import 'hammerjs';
import { UnitFormComponent } from './unit-form/unit-form.component';
import { SubFormComponent } from './unit-form/sub-form.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    HomeComponent,
    UsersComponent,
    UnitFormComponent,
    SubFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    RouterModule.forRoot([
      {path: '',      component: HomeComponent, pathMatch: 'full'},
      {path: 'login', component: LoginComponent},
      {path: 'users', component: UsersComponent, canActivate: [LoggedInGuard]},
      {path: 'units', component: UnitFormComponent, canActivate: [LoggedInGuard]},
    ]),
  ],
  providers: [AuthService, RestService, LoggedInGuard],
  bootstrap: [AppComponent]
})
export class AppModule {
}
