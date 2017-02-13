/* tslint:disable:no-unused-variable */
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By, BrowserModule} from '@angular/platform-browser';
import {DebugElement} from '@angular/core';
import {LoginComponent} from './login.component';
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {MaterialModule} from "@angular/material";

import {AuthService} from "../auth.service";
import {RestService} from "../rest.service";
import {RouterTestingModule} from "@angular/router/testing";
import 'hammerjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        MaterialModule.forRoot(),
        RouterTestingModule
      ],
      providers: [AuthService, RestService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be enabled initially', () => {
    expect(component.loginEnabled).toBeFalsy();
  });

  it('should should be enabled after entring user/pass', () => {
    component.username = 'amin';
    component.password = 'test';
    component.onChange();
    expect(component.loginEnabled).toBeTruthy();
  })
});
