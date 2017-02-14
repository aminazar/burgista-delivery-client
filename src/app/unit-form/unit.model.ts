/**
 * Created by Ali on 2/13/2017.
 */
import {Unit} from "./unit";

export class UnitModel {
  _unit: Unit;          //Can change
  isUpdating: boolean;
  isDeleting: boolean;
  private _unitBackup: Unit;      //One time initialized

  constructor(unit: Unit){
    this._unit = new Unit();
    this._unitBackup = new Unit();

    this._unit.id = unit.id;
    this._unit.name = unit.name;
    this._unit.username = unit.username;
    this._unit.password = unit.password;
    this._unit.isBranch = unit.isBranch;

    this._unitBackup.id = unit.id;
    this._unitBackup.name = unit.name;
    this._unitBackup.username = unit.username;
    this._unitBackup.password = unit.password;
    this._unitBackup.isBranch = unit.isBranch;
  }

  isDifferent() : boolean {
    if(this._unit.password !== '')
      return true;
    else if(this._unitBackup.name !== this._unit.name)
      return true;
    else if(this._unitBackup.username !== this._unit.username)
      return true;
    else if(this._unitBackup.isBranch !== this._unit.isBranch)
      return true;
    else
      return false;
  }
}
