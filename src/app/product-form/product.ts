/**
 * Created by Ali on 2/20/2017.
 */

export class Product {
  id: number;
  name: string;
  code: string;
  size: number;
  measuringUnit: string;
  prep_unit_id: number;
  minQty: number;
  maxQty: number;
  countingRecursion: string = '';
  coefficients = {
    Monday: 1,
    Tuesday: 1,
    Wednesday: 1,
    Thursday: 1,
    Friday: 1,
    Saturday: 1,
    Sunday: 1,
    Usage: 1
  };
  isOverridden: boolean = false;
}
