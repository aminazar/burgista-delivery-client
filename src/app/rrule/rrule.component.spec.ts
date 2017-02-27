/* tslint:disable:no-unused-variable */
import {async, ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {By, BrowserModule} from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import {RRuleComponent} from './rrule.component';
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {MaterialModule} from "@angular/material";
import {RouterTestingModule} from "@angular/router/testing";
import {MonthdayComponent} from "./monthday.component";
import * as Rrule from 'rrule';

describe('RruleComponent', () => {
  let component: RRuleComponent;
  let fixture: ComponentFixture<RRuleComponent>;
  let rruleStr: string = '';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RRuleComponent, MonthdayComponent ],
      imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        MaterialModule.forRoot(),
        RouterTestingModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RRuleComponent);
    component = fixture.componentInstance;

    component.RRuleStr = rruleStr;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
