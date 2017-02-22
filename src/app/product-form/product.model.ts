/**
 * Created by Ali on 2/20/2017.
 */

import { Product } from './product';
import {hasProperties} from "codelyzer/util/astQuery";
import {BehaviorSubject} from "rxjs";

export class ProductModel {
  _product: Product;
  waiting : BehaviorSubject<any> = new BehaviorSubject({
    adding: false,
    updating: false,
    deleting: false
  });

  constructor(product: Product){
    this._product = new Product();

    this._product.id = product.id;
    this._product.name = product.name;
    this._product.code = product.code;
    this._product.size = product.size;
    this._product.measuringUnit = product.measuringUnit;
    this._product.prep_unit_id = product.prep_unit_id;
    this._product.minQty = product.minQty;
    this._product.maxQty = product.maxQty;
    this._product.coefficients = product.coefficients;
    this._product.countingRecursion = product.countingRecursion;
  }

  isDifferent(product: Product) : boolean {
    for(let prop in product){
      if(prop === 'coefficients'){
        for(let day in product.coefficients){
          if(this._product.coefficients[day] !== product.coefficients[day])
            return true;
        }
      }
      else if(this._product[prop] !== product[prop])
        return true;
    }
  }

  getDifferentValues(product: Product){
    let diffValue = {};

    for(let prop in product){
      if(prop === 'coefficients'){
        for(let day in product.coefficients){
          if(this._product.coefficients[day] !== product.coefficients[day]){
            if(!diffValue['coefficients'])
              diffValue['coefficients'] = {};

            diffValue['coefficients'][day] = product.coefficients[day];
          }
        }
      }
      else if(this._product[prop] !== product[prop])
        diffValue[prop] = product[prop];
    }

    return diffValue;
  }

  setProduct(product: Product){
    this._product.id = product.id;
    this._product.name = product.name;
    this._product.code = product.code;
    this._product.size = product.size;
    this._product.measuringUnit = product.measuringUnit;
    this._product.prep_unit_id = product.prep_unit_id;
    this._product.minQty = product.minQty;
    this._product.maxQty = product.maxQty;
    this._product.coefficients = product.coefficients;
    this._product.countingRecursion = product.countingRecursion;
  }

  static toAnyObject(product) : any{
    let resObj = {};

    for(let prop in product){
      switch (prop){
        case 'id': resObj['pid'] = product.id;
          break;
        case 'name': resObj['name'] = product.name;
          break;
        case 'code': resObj['code'] = product.code;
          break;
        case 'size': resObj['size'] = product.size;
          break;
        case 'measuringUnit': resObj['measuring_unit'] = product.measuringUnit;
          break;
        case 'prep_unit_id': resObj['prep_unit_id'] = product.prep_unit_id;
          break;
        case 'minQty': resObj['default_min'] = product.minQty;
          break;
        case 'maxQty': resObj['default_max'] = product.maxQty;
          break;
        case 'countingRecursion': resObj['default_date_rule'] = product.countingRecursion;
          break;
        case 'coefficients':{
          for(let day in product.coefficients){
            switch (day){
              case 'Monday': resObj['default_mon_multiple'] = product.coefficients.Monday;
                break;
              case 'Tuesday': resObj['default_tue_multiple'] = product.coefficients.Tuesday;
                break;
              case 'Wednesday': resObj['default_wed_multiple'] = product.coefficients.Wednesday;
                break;
              case 'Thursday': resObj['default_thu_multiple'] = product.coefficients.Thursday;
                break;
              case 'Friday': resObj['default_fri_multiple'] = product.coefficients.Friday;
                break;
              case 'Saturday': resObj['default_sat_multiple'] = product.coefficients.Saturday;
                break;
              case 'Sunday': resObj['default_sun_multiple'] = product.coefficients.Sunday;
                break;
              case 'Usage': resObj['default_usage'] = product.coefficients.Usage;
                break;
            }
          }
        }
          break;
      }
    }

    return resObj;
  }

  static fromAnyObject(object: any) : Product {
    let tempProduct : Product = new Product();

    for(let prop in object){
      switch (prop){
        case 'pid': tempProduct.id = object[prop];
          break;
        case 'name': tempProduct.name = object[prop];
          break;
        case 'code': tempProduct.code = object[prop];
          break;
        case 'size': tempProduct.size = object[prop];
          break;
        case 'measuring_unit': tempProduct.measuringUnit = object[prop];
          break;
        case 'prep_unit_id': tempProduct.prep_unit_id = object[prop];
          break;
        case 'default_min': tempProduct.minQty = object[prop];
          break;
        case 'default_max': tempProduct.maxQty = object[prop];
          break;
        case 'default_date_rule': tempProduct.countingRecursion = object[prop];
          break;
        case 'default_mon_multiple': tempProduct.coefficients.Monday = object[prop];
          break;
        case 'default_tue_multiple': tempProduct.coefficients.Tuesday = object[prop];
          break;
        case 'default_wed_multiple': tempProduct.coefficients.Wednesday = object[prop];
          break;
        case 'default_thu_multiple': tempProduct.coefficients.Thursday = object[prop];
          break;
        case 'default_fri_multiple': tempProduct.coefficients.Friday = object[prop];
          break;
        case 'default_sat_multiple': tempProduct.coefficients.Saturday = object[prop];
          break;
        case 'default_sun_multiple': tempProduct.coefficients.Sunday = object[prop];
          break;
        case 'default_usage': tempProduct.coefficients.Usage = object[prop];
          break;
      }
    }

    return tempProduct;
  }
}
