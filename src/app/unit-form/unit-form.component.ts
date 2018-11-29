import { Component, OnInit, isDevMode } from '@angular/core';
import {BehaviorSubject} from "rxjs";

import {UnitModel} from "./unit.model";
import {ActionEnum} from "./actionEnum";
import {Unit} from "./unit";
import {RestService} from "../rest.service";
import {MessageService} from "../message.service";

@Component({
  selector: 'app-unit-form',
  templateUrl: './unit-form.component.html',
  styleUrls: ['./unit-form.component.css']
})
export class UnitFormComponent implements OnInit {
  unitModels: UnitModel[] = [];
  isAdding = false;
  actionIsSuccess : BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private restService: RestService, private messageService:MessageService) { }

  ngOnInit() {
    //Get all units from server
    this.restService.get('unit').subscribe(
      (data) => {
        this.unitModels = [];

        for(let unitData of data){
          // if(unitData.username === 'admin')
          //   continue;

          let unit = new Unit();
          unit.id = unitData.uid;
          unit.name = unitData.name;
          unit.username = unitData.username;
          unit.password = '';
          unit.is_branch = unitData.is_branch;
          unit.is_kitchen = unitData.is_kitchen;

          let unitModel = new UnitModel(unit);

          this.unitModels.push(unitModel);
        }

        this.sortUnitModelList();
      },
      (error) => {
        this.messageService.error(error);
        if(isDevMode())
          console.log(error);
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
    let name = unit.name;
    this.restService.insert('unit', unit).subscribe(
      (data) => {
        //Adding new unit to unitModels list
        unit.id = data;
        unit.password = '';
        let tempUnitModel = new UnitModel(unit);

        this.actionIsSuccess.next(true);

        this.unitModels.push(tempUnitModel);

        //Sort unitModels
        this.sortUnitModelList();

        this.disableEnable(unit.id, ActionEnum.add, false);

        this.actionIsSuccess.next(false);
        this.messageService.message(`'${name}' is added to units as a new ${unit.is_branch?'Branch':'Prep Unit'}`);
      },
      (error) => {
        this.messageService.error(error);
        if(isDevMode())
          console.log(error);

        this.disableEnable(unit.id, ActionEnum.add, false);
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

        this.messageService.message('Unit is deleted.');
      },
      (error) => {
        this.messageService.error(error);
        if(isDevMode())
          console.log(error);

        this.disableEnable(unitId, ActionEnum.delete, false);
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
        unit.password = '';
        this.unitModels[index].setUnit(unit);

        //Sort unitModels
        this.sortUnitModelList();

        this.disableEnable(unitId, ActionEnum.update, false);
        this.messageService.message(`${unit.name} (${unit.is_branch?'branch':'prep unit'}) is updated.`);

        this.actionIsSuccess.next(false);
      },
      (error) => {
        this.messageService.error(error);
        if(isDevMode())
          console.log(error);

        this.disableEnable(unitId, ActionEnum.update, false);
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

  sortUnitModelList(){
    this.unitModels.sort(function(a, b){
      if(a._unit.is_branch === false && b._unit.is_branch === true)
        return -1;
      else if(a._unit.is_branch === true && b._unit.is_branch === false)
        return 1;
      else {
        if(a._unit.name > b._unit.name)
          return 1;
        else if(a._unit.name < b._unit.name)
          return -1;
        else
          return 0;
      }
    });
  }
}
