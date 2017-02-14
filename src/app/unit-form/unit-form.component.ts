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

  constructor() { }

  ngOnInit() {
    this.unitModels = [];
    let unit = new Unit();
    unit.id = 0;
    unit.isBranch = true;
    unit.name = 'ali';
    unit.username = 'aa_salehi';
    unit.password = '';

    let unitModel = new UnitModel(unit);
    this.unitModels.push(unitModel);
  }

  doClickedAction(value){

  }
}
