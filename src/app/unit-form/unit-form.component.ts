import { Component, OnInit } from '@angular/core';
import {BehaviorSubject} from "rxjs";

import {UnitModel} from "./unit.model";
import {ActionEnum} from "./actionEnum";
import {Unit} from "./unit";
import {RestService} from "../rest.service";

@Component({
  selector: 'app-unit-form',
  templateUrl: './unit-form.component.html',
  styleUrls: ['./unit-form.component.css']
})
export class UnitFormComponent implements OnInit {
  unitModels: UnitModel[] = [];
  isAdding = false;
  actionIsSuccess : BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private restService: RestService) { }

  ngOnInit() {
    //Get all units from server
    this.restService.get('unit').subscribe(
      (data) => {
        this.unitModels = [];

        for(let unitData of data){
          if(unitData.name === 'admin')
            continue;

          let unit = new Unit();
          unit.id = unitData.uid;
          unit.name = unitData.name;
          unit.username = unitData.username;
          unit.password = '';
          unit.is_branch = unitData.is_branch;

          let unitModel = new UnitModel(unit);

          this.unitModels.push(unitModel);
        }
      },
      (error) => {
        console.log(error);

        //ToDo: adding prop message
      }
    );

  }

  doClickedAction(value){
    let clickType : ActionEnum = value.type;
    let clickData : Unit = value.data;

    //Disable respective button
    this.disableEnable(clickData.id, clickType, true);

    //Do update, delete or add
    switch (clickType){
      case ActionEnum.add: this.addUnit(clickData);
        break;
      case ActionEnum.delete: this.deleteUnit(clickData.id);
        break;
      case ActionEnum.update: this.updateUnit(clickData.id, clickData);
        break;
    }
  }

  private addUnit(unit: Unit){
    this.restService.insert('unit', unit).subscribe(
      (data) => {
        //Adding new unit to unitModels list
        unit.id = data;
        let tempUnitModel = new UnitModel(unit);

        this.actionIsSuccess.next(true);

        this.unitModels.push(tempUnitModel);

        this.disableEnable(unit.id, ActionEnum.add, false);

        this.actionIsSuccess.next(false);
        //ToDo: adding prop message
      },
      (error) => {
        console.log(error);

        this.disableEnable(unit.id, ActionEnum.add, false);
        //ToDo: adding prop message
      }
    );
  }

  private deleteUnit(unitId: number){
    this.restService.delete('unit', unitId).subscribe(
      (data) => {
        //Deleting this unit from unitModels list
        this.unitModels = this.unitModels.filter(function (elemenet) {
          return elemenet._unit.id !== unitId;
        });

        this.disableEnable(unitId, ActionEnum.delete, false);
        //ToDo: adding prop message
      },
      (error) => {
        console.log(error);

        this.disableEnable(unitId, ActionEnum.delete, false);
        //ToDo: adding prop message
      }
    );
  }

  private updateUnit(unitId: number, unit: Unit){
    let index : number = this.unitModels.findIndex(function (element) {
      return element._unit.id == unitId;
    });

    this.restService.update('unit', unitId, this.unitModels[index].getDifferentValues(unit)).subscribe(
      (data) => {
        this.actionIsSuccess.next(true);

        //Update this unit in unitModels list
        this.unitModels[index].setUnit(unit);

        this.disableEnable(unitId, ActionEnum.update, false);
        //ToDo: adding prop message

        this.actionIsSuccess.next(false);
      },
      (error) => {
        console.log(error);

        this.disableEnable(unitId, ActionEnum.update, false);
        //ToDo: adding prop message
      }
    )
  }

  private disableEnable(unitId: number, btnType : ActionEnum, isDisable: boolean){
    let tempUnitModel : UnitModel = this.unitModels.find(function (element) {
      return element._unit.id == unitId;
    });

    switch (btnType){
      case ActionEnum.update: tempUnitModel.waiting.updating = isDisable;
        break;
      case ActionEnum.delete: tempUnitModel.waiting.deleting = isDisable;
        break;
      case ActionEnum.add: this.isAdding = isDisable;
        break;
    }
  }

  // changeTabComponent(id){
  //
  // }
}
