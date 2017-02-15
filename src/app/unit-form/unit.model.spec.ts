/**
 * Created by Ali on 2/13/2017.
 */

import {UnitModel} from "./unit.model";
import {Unit} from "./unit";

describe('Unit Model', () => {
  let unit: Unit;
  let anotherUnit: Unit;
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
    anotherUnit = new Unit();
    anotherUnit.id = 0;
    anotherUnit.name = 'CountryBranch';
    anotherUnit.username = 'Jack';
    anotherUnit.password = '';
    anotherUnit.isBranch = true;

    expect(unitModel.isDifferent(anotherUnit)).toBe(true);
  });

  it('should give changed properties', () => {
    expect(unitModel.getDifferentValues(anotherUnit)).toEqual(jasmine.objectContaining({
      name: 'CountryBranch'
    }));
  });

  it('should compare two unit (no difference)', () => {
    anotherUnit.name = 'CenterBranch';
    expect(unitModel.isDifferent(anotherUnit)).toBe(false);
  });

  it('should return true for difference in password', () => {
    anotherUnit.password = '123';
    expect(unitModel.isDifferent(anotherUnit)).toBe(true);
  });

  it('should return empty object', () => {
    anotherUnit.password = '';
    expect(unitModel.getDifferentValues(anotherUnit)).toEqual(jasmine.objectContaining({}));
  });

  it('should check correct value for waiting on update', () => {
    expect(unitModel.waiting.updating).toBe(false);
    unitModel.waiting.updating = true;
    expect(unitModel.waiting.updating).toBe(true);
  });
});
