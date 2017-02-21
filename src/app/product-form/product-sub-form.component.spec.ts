/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProductSubFormComponent } from './product-sub-form.component';
import {MaterialModule} from "@angular/material";
import {FormsModule} from "@angular/forms";

describe('ProductSubFormComponent', () => {
  let component: ProductSubFormComponent;
  let fixture: ComponentFixture<ProductSubFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductSubFormComponent ],
      imports: [
        FormsModule,
        MaterialModule.forRoot()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSubFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
