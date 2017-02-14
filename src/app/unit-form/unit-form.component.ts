import { Component, OnInit } from '@angular/core';
import {UnitModel} from "./unit.model";
import {Unit} from "./unit";

@Component({
  selector: 'app-unit-form',
  templateUrl: './unit-form.component.html',
  styleUrls: ['./unit-form.component.css']
})
export class UnitFormComponent implements OnInit {
  unitModels: UnitModel[] = [];
  addedUnitModel: UnitModel;

  constructor() { }

  ngOnInit() {
  }

  doClickedAction(value){

  }
}
