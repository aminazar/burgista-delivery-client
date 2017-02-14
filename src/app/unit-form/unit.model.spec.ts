/**
 * Created by Ali on 2/13/2017.
 */

import {UnitModel} from "./unit.model";
import {Unit} from "./unit";

describe('Unit Model', () => {
  let unit: Unit;
  let unitModel: UnitModel;

  it('should set own unit', () => {
    unit = new Unit();
    unit.id = 0;
    unit.name = 'CenterBranch';
    unit.username = 'Jack';
    unit.password = '';
    unit.isBranch = true;

    unitModel = new UnitModel(unit);
    expect(unitModel).toBeTruthy();
  });

  it('should return first value', () => {
    expect(unitModel._unit.name).toContain('CenterBranch');
  });

  it('should compare two unit (Different in name)', () => {
    let anotherUnit = new Unit();
    anotherUnit.id = 0;
    anotherUnit.name = 'CountryBranch';
    anotherUnit.username = 'Jack';
    anotherUnit.password = '';
    anotherUnit.isBranch = true;

    expect(unitModel.isDifferent(anotherUnit)).toBe(true);
  });

});
