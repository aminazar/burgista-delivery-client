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
  filter = false;

  constructor(unitName: string, filter){
    this._unitName = unitName;
    this.filter = filter;
  }

  get deliveries() : Delivery[] {
    return (this.filter ? this._deliveries.filter(r => r.realDelivery !== 0) : this._deliveries).sort((x, y) => !x.id ? 1 : !y.id ? -1 : x.productName < y.productName ? -1 : x.productName > y.productName ? 1 : 0);
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
      let foundedDelivery = this._deliveries.find((el) => {
        return el.productCode.toLowerCase() === code.toLowerCase();
      });

      if((value === null || foundedDelivery[whichItem] === null) && (whichItem !== 'realDelivery' && whichItem !== 'min' && whichItem !== 'max'))
        foundedDelivery[whichItem] = null;
      else{
        switch (action){
          case "add": foundedDelivery[whichItem] += value;
            break;
          case "sub": foundedDelivery[whichItem] -= value;
            break;
        }
      }

      return true;
    }
    catch (err){
      console.log(err.message);
      return false;
    }
  }

  static toAnyObject(delivery: Delivery, isPrinted: boolean, product_id: number): any{
    let resObj = {};

    resObj['real_delivery'] = delivery.realDelivery;
    resObj['is_delivery_finalised'] = isPrinted;

    if(product_id !== null)
      resObj['product_id'] = product_id;

    return resObj;
  }

  afterSubmit() { // Make all nulls zero
    this._deliveries.forEach(d => {
      if (d.realDelivery === null) {
        d.realDelivery = 0;
      }
    })
  }
}
