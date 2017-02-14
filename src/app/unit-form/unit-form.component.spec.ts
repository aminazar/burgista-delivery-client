/* tslint:disable:no-unused-variable */
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {DebugElement} from '@angular/core';

import {UnitFormComponent} from './unit-form.component';
import {SubFormComponent} from "./sub-form.component";
import {FormsModule} from "@angular/forms";
import {MaterialModule} from "@angular/material";
import {RestService} from "../rest.service";

describe('UnitFormComponent', () => {
  let component: UnitFormComponent;
  let fixture: ComponentFixture<UnitFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        UnitFormComponent,
        SubFormComponent,
      ],
      imports: [
        FormsModule,
        MaterialModule.forRoot(),
      ],
      providers: [
        RestService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
