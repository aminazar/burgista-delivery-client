/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {By, BrowserModule} from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NavbarComponent } from './navbar.component';
import {RouterModule, RouterOutletMap} from "@angular/router";
import {MaterialModule} from "@angular/material";
import {RouterTestingModule} from "@angular/router/testing";
import {AuthService} from "../auth.service";
import {RestService} from "../rest.service";

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavbarComponent],
      imports: [RouterModule,
        BrowserModule,
        MaterialModule.forRoot(),
        RouterTestingModule,
      ],
      providers: [RouterOutletMap, AuthService, RestService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
