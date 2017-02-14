import {Component, OnInit, EventEmitter} from '@angular/core';
import {Input, Output} from "@angular/core/src/metadata/directives";
import {ViewChild} from "@angular/core/src/metadata/di";

import {ActionEnum} from "./actionEnum";
import {Unit} from "./unit";

@Component({
  selector: 'app-sub-form',
  templateUrl: './sub-form.component.html',
  styleUrls: ['./sub-form.component.css']
})
export class SubFormComponent implements OnInit {
  @Input() isAdd;
  @Input() unitModel;

  @Output() action = new EventEmitter();

  @ViewChild('name') name;
  @ViewChild('username') username;
  @ViewChild('password') password;
  @ViewChild('isBranch') isBranch;

  ae = ActionEnum;

  shouldUpdate = false;
  formTitle = '';

  constructor() { }

  ngOnInit() {
    if(this.isAdd)
      this.formTitle = 'New Unit';
    else {
      if(this.unitModel._unit.isBranch)
        this.formTitle = 'Main depote';
      else
        this.formTitle = 'Prep Kitchen';
    }
  }

  checkDiff(){
    this.shouldUpdate = this.unitModel.isDifferent();
  }

  actionEmitter(clickType){
    let data : Unit = null;

    if( clickType === ActionEnum.add ){
      data = new Unit();
      data.name = this.name.nativeElement.value;
      data.username = this.username.nativeElement.value;
      data.password = this.password.nativeElement.value;
      data.isBranch = this.isBranch.nativeElement.value;

    }
    else{
      data = this.unitModel._unit;
    }

    let value = {
      type : clickType,
      data : data
    };

    this.action.emit(value);
  }

}
