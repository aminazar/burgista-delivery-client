import {Component, OnInit, EventEmitter} from '@angular/core';
import {Input, Output} from "@angular/core/src/metadata/directives";
import {ViewChild} from "@angular/core/src/metadata/di";

import {ActionEnum} from "./actionEnum";
import {Unit} from "./unit";
import {document} from "@angular/platform-browser/src/facade/browser";

@Component({
  selector: 'app-sub-form',
  templateUrl: './sub-form.component.html',
  styleUrls: ['./sub-form.component.css']
})
export class SubFormComponent implements OnInit {
  @Input() isAdd = true;
  @Input() isAdding = false;

  @Input() unitModel;

  @Output() action = new EventEmitter();

  unit : Unit = new Unit();
  ae = ActionEnum;

  shouldUpdate = false;
  formTitle = '';

  constructor() { }

  ngOnInit() {
    if(this.isAdd) {
      this.formTitle = 'New Unit';

      this.unit.id = -1;
      this.unit.name = '';
      this.unit.username = '';
      this.unit.password = '';
      this.unit.isBranch = true;
    }
    else {
      this.unit.id = this.unitModel._unit.id;
      this.unit.name = this.unitModel._unit.name;
      this.unit.username = this.unitModel._unit.username;
      this.unit.isBranch = this.unitModel._unit.isBranch;

      if(this.unit.isBranch)
        this.formTitle = 'Main depote';
      else
        this.formTitle = 'Prep Kitchen';
    }
  }

  checkDiff(){
    if(!this.isAdd)
     this.shouldUpdate = this.unitModel.isDifferent(this.unit);
  }

  actionEmitter(clickType){
    let value = {
      type : clickType,
      data : this.unit
    };
    this.action.emit(value);
  }

  checkSubFormInputs(){
    if( this.unitModel._unit.name && this.unitModel._unit.username && this.unitModel._unit.password && (this.unitModel._unit.isBranch || !this.unitModel._unit.isBranch) )
      return true;
    else
      return false;
  }
}
