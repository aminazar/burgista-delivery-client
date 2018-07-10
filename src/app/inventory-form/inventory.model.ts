/**
 * Created by Ali on 3/4/2017.
 */

import {Inventory} from "./inventory";

export class InventoryModel {
  _inventories: Inventory[] = [];
  _unitName: string = '';

  constructor(unitName: string) {
    this._unitName = unitName;
    this._inventories = [];
  }

  clear() {
    this._inventories = [];
  }

  add(item: Inventory) {
    this._inventories.push(item);
  }

  get(id): Inventory {
    return this._inventories.find((el) => {
      return el.id === id;
    });
  }

  getByCode(code): Inventory {
    return this._inventories.find((el) => {
      return el.productCode === code;
    });
  }

  delete(id) {
    this._inventories = this._inventories.filter((el) => {
      return el.id !== id;
    });
  }

  static toAnyObject(inventory: Inventory): any {
    let resObj = {};

    resObj['bsddid'] = inventory.id;
    resObj['product_id'] = inventory.productId;
    resObj['product_count'] = inventory.unopenedPack;
    resObj['product_code'] = inventory.productCode;
    resObj['product_name'] = inventory.productName;
    resObj['last_count'] = inventory.lastCount;

    return resObj;
  }

  static fromAnyObject(object: any): Inventory {
    let resInventory = new Inventory();

    for (let prop in object) {
      switch (prop) {
        case 'bsddid': resInventory.id = object[prop];
          break;
        case 'product_code': resInventory.productCode = object[prop];
          break;
        case 'product_name': resInventory.productName = object[prop];
          break;
        case 'product_count': resInventory.unopenedPack = object[prop];
          break;
        case 'last_count': resInventory.lastCount = object[prop];
          break;
        case 'pid': resInventory.productId = object[prop];
      }
    }

    return resInventory;
  }
}
