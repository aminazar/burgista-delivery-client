import {Component, OnInit, EventEmitter} from '@angular/core';
import {Input, Output} from "@angular/core/src/metadata/directives";
import {Observable} from "rxjs";

import {ActionEnum} from "./actionEnum";
import {Unit} from "./unit";

@Component({
  selector: 'app-sub-form',
  templateUrl: './sub-form.component.html',
  styleUrls: ['./sub-form.component.css']
})
export class SubFormComponent implements OnInit {
  @Input() isAdd = true;
  @Input() isAdding = false;

  @Input() unitModel;
  @Input() actionIsSuccess : Observable<boolean>;

  @Output() action = new EventEmitter();

  unit : Unit = new Unit();
  ae = ActionEnum;

  formTitle = '';
  addIsDisable = true;
  updateIsDisable = true;
  deleteIsDisable = false;

  constructor() { }

  ngOnInit() {
    this.actionIsSuccess.subscribe(
      (data) => {
        if(data === true){
          if(this.isAdd === true){
            this.unit.id = -1;
            this.unit.name = '';
            this.unit.username = '';
            this.unit.password = '';
            this.unit.is_branch = null;
            this.unit.is_kitchen = null;
          }

          this.disabilityStatus();
        }
      },
      (error) => {
        console.log(error);
      }
    );

    if(this.isAdd) {
      this.formTitle = 'New Unit';

      this.unit.id = -1;
      this.unit.name = '';
      this.unit.username = '';
      this.unit.password = '';
      this.unit.is_branch = null;
      this.unit.is_kitchen = null;
    }
    else {
      this.unit.id = this.unitModel._unit.id;
      this.unit.name = this.unitModel._unit.name;
      this.unit.username = this.unitModel._unit.username;
      this.unit.is_branch = this.unitModel._unit.is_branch;
      this.unit.is_kitchen = this.unitModel._unit.is_kitchen;
      this.unit.password = '';

      if(this.unit.is_branch)
        this.formTitle = this.unit.name + ' - Branch';
      else
        this.formTitle = this.unit.name + ' - Prep Unit';
      console.log(this.unitModel);
    }
  }

  disabilityStatus(){
    if(this.isAdd)
      this.addIsDisable = this.shouldDisableAddBtn();
    else{
      this.deleteIsDisable = this.shouldDisableDeleteBtn();
      this.updateIsDisable = this.shouldDisableUpdateBtn();
    }
  }

  actionEmitter(clickType){
    let value = {
      type : clickType,
      data : this.unit
    };
    this.action.emit(value);
  }

  isCorrectFormData(isForAdd : boolean){
    if(isForAdd === true && this.unit.password === "")
      return false;

    if( this.unit.name !== "" && this.unit.username !== "" && this.unit.is_branch !== null )
      return true;
    else
      return false;
  }

  shouldDisableAddBtn() : boolean{
    if(this.isAdding === true)
      return true;
    else
      return !this.isCorrectFormData(true);
  }

  shouldDisableUpdateBtn() : boolean{
    if(this.unitModel.waiting.updating === true)
      return true;
    else{
      if(this.unitModel.isDifferent(this.unit) === true)
        return !this.isCorrectFormData(false);
      else
        return true;
    }
  }

  shouldDisableDeleteBtn() : boolean{
    if(this.unitModel.waiting.deleting === true)
      return true;
    else
      return false;
  }
}
