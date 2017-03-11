/**
 * Created by Ali on 3/6/2017.
 */
import {Delivery} from "./delivery";

export class DeliveryModel{
  _deliveries: Delivery[] = [];
  _unitName: string = '';
  _shouldDisabled: boolean = false;
  _isSubmitted: boolean = false;
  _isPrinted: boolean = false;

  constructor(unitName: string){
    this._unitName = unitName;
  }

  add(delivery: Delivery){
    let tempDelivery = new Delivery();

    for(let prop in delivery){
      tempDelivery[prop] = delivery[prop];
    }

    this._deliveries.push(tempDelivery);
  }

  get(id: number): Delivery{
    return this._deliveries.find((el) => {
      return el.id === id;
    });
  }

  getByCode(code: string): Delivery{
    return this._deliveries.find((el) => {
      return el.productCode.toLowerCase() === code.toLowerCase();
    });
  }

  deleteByCode(code: string): boolean{
    try{
      this._deliveries = this._deliveries.filter((el) => {
        return el.productCode.toLowerCase() !== code.toLowerCase();
      });

      return true;
    }
    catch (err){
      console.log(err.message);
      return false;
    }
  }

  clear(){
    this._deliveries = [];
  }

  replaceDeliveryProperty(code: string, whichItem: string, value: any): boolean{
    try{
      this._deliveries.find((el) => {
        return el.productCode.toLowerCase() === code.toLowerCase();
      })[whichItem] = value;

      return true;
    }
    catch (err){
      console.log(err.message);
      return false;
    }
  }

  updateDeliveryProperty(action: string, code: string, whichItem: string, value: any): boolean{
    try{
      switch (action){
        case "add":{
          this._deliveries.find((el) => {
            return el.productCode.toLowerCase() === code.toLowerCase();
          })[whichItem] += value;
        }
        break;
        case "sub": {
          this._deliveries.find((el) => {
            return el.productCode.toLowerCase() === code.toLowerCase();
          })[whichItem] -= value;
        }
        break;
      }

      return true;
    }
    catch (err){
      console.log(err.message);
      return false;
    }
  }
}
