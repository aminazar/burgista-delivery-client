/**
 * Created by Ali on 2/13/2017.
 */
import {Unit} from "./unit";

export class UnitModel {
  _unit: Unit;

  constructor(unit: Unit) {
    this._unit = new Unit();

    this._unit.id = unit.id;
    this._unit.name = unit.name;
    this._unit.username = unit.username;
    this._unit.password = unit.password;
    this._unit.isBranch = unit.isBranch;
  }

  isDifferent(unit: Unit): boolean {
    if (this._unit.password !== '')
      return true;
    else if (unit.name !== this._unit.name)
      return true;
    else if (unit.username !== this._unit.username)
      return true;
    else if (unit.isBranch !== this._unit.isBranch)
      return true;
    else
      return false;
  }
}
