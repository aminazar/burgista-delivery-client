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
    unitModel._unit.name = 'CountryBranch';
    expect(unitModel.isDifferent()).toBe(true);
  });

});
