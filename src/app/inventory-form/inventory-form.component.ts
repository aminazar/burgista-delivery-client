import {Component, OnInit, style, trigger, state, transition, animate, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';

import {AuthService} from '../auth.service';
import {RestService} from '../rest.service';
import {InventoryModel} from './inventory.model';
import {Inventory} from './inventory';
import {setTimeout} from 'timers';
import {Product} from '../product-form/product';
import * as moment from 'moment';


@Component({
  selector: 'app-inventory-form',
  templateUrl: './inventory-form.component.html',
  styleUrls: ['./inventory-form.component.css'],
  animations: [
    trigger('itemState', [
      state('exist', style({opacity: 1, transform: 'translateX(0) scale(1)'})),
      state('delete', style({opacity: 0, display: 'none', transform: 'translateX(0) scale(1)'})),
      state('sent', style({opacity: 0, display: 'none', transform: 'translateX(0) scale(1)'})),
      transition('exist => delete', [
        animate('1s ease-out', style({
          opacity: 0,
          transform: 'translateX(-100%) scale(1)'
        }))
      ]),
      transition('exist => sent', [
        animate('0.5s ease-out', style({
          opacity: 0,
          transform: 'translateX(0) scale(0.5)'
        }))
      ])
    ])
  ],
})
export class InventoryFormComponent implements OnInit {
  @ViewChild('unopenedPack') unopenedPack;
  @ViewChild('autoNameCode') autoNameCode;

  noButton = true;
  unitName = '';
  inventoryModel: InventoryModel;
  currentDate;
  selectedDate;
  isSameDates = true;
  submitShouldDisabled = true;
  products: Product[] = [];
  productName_Code: string[] = [];
  filteredNameCode: any;
  productNameCodeCtrl: FormControl;
  waiting = false;

  constructor(private authService: AuthService, private restService: RestService) {
  }

  ngOnInit() {
    this.unitName = this.authService.unitName;

    this.currentDate = new Date();
    this.selectedDate = new Date();

    this.restService.get('date').subscribe(d => {
      this.currentDate = new Date(d);
      this.selectedDate = new Date(d);
    }, err => console.error(err));

    if (this.inventoryModel === null || this.inventoryModel === undefined) {
      this.inventoryModel = new InventoryModel(this.unitName);
    }

    // Fetch data
    this.getInventoryData();

    // Subscribe on autoComplete form
    this.productNameCodeCtrl = new FormControl();
    this.filteredNameCode = this.productNameCodeCtrl.valueChanges
      .startWith(null)
      .map((name_code) => this.filterProducts(name_code));


    this.productNameCodeCtrl.valueChanges.subscribe(
      (data) => {
        let tempNameObj = this.productName_Code.find((el) => {
          return el.toLowerCase() === data.toLowerCase();
        });

        if (tempNameObj !== undefined && tempNameObj !== null) {
          let tempInventoryItem = new Inventory();
          tempInventoryItem.id = null;
          tempInventoryItem.unopenedPack = (this.unopenedPack.nativeElement.value !== undefined && this.unopenedPack.nativeElement.value !== null && this.unopenedPack.nativeElement.value !== '') ? this.unopenedPack.nativeElement.value : 0;
          tempInventoryItem.productCode = data.substr(0, data.indexOf(' '));
          tempInventoryItem.productName = data.substr(data.indexOf(' ') + 3);
          tempInventoryItem.productId = this.products.find((el) => el.code === tempInventoryItem.productCode).id;
          tempInventoryItem.lastCount = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate());
          tempInventoryItem.state = 'exist';
          tempInventoryItem.shouldIncluded = false;

          this.inventoryModel.add(tempInventoryItem);

          this.unopenedPack.nativeElement.value = null;
          this.autoNameCode.nativeElement.value = null;

          this.productName_Code = this.productName_Code.filter((el) => {
            return el.toLowerCase() !== data.toLowerCase();
          });
        }
      },
      (err) => {
        console.log(err.message);
      }
    );

    this.compareDates();
  }

  filterProducts(val: string) {
    return val ? this.productName_Code.filter((p) => new RegExp(val, 'gi').test(p)) : this.productName_Code;
  }

  submitInventoryItem(inventoryItem: Inventory) {
    if (inventoryItem.id === null) {            //Should insert
      this.restService.insert('stock', InventoryModel.toAnyObject(inventoryItem)).subscribe(
        (data) => {
          inventoryItem.state = 'sent';

          setTimeout(
            () => {
              this.inventoryModel._inventories = this.inventoryModel._inventories.filter((el) => {
                return el.productCode !== inventoryItem.productCode;
              });
            }
            , 500);
        },
        (err) => {
          console.log(err.message);
        }
      );
    }
    else {                                     //Should update
      this.restService.update('stock', inventoryItem.id, InventoryModel.toAnyObject(inventoryItem)).subscribe(
        (data) => {
          inventoryItem.state = 'sent';

          setTimeout(
            () => {
              this.inventoryModel._inventories = this.inventoryModel._inventories.filter((el) => {
                return el.productCode !== inventoryItem.productCode;
              });
            }
            , 500);
        },
        (err) => {
          console.log(err.message);
        }
      );
    }
  }

  submitInventories() {
    let newItems = [];
    let oldItems = [];

    for (let invItem of this.inventoryModel._inventories) {
      // this.submitInventoryItem(invItem);
      if (invItem.id === null) {    //Add to newItems
        newItems.push(InventoryModel.toAnyObject(invItem));
      }
      else {                       //Add to oldItems
        oldItems.push(InventoryModel.toAnyObject(invItem));
      }
    }

    //Send to server
    let sendData = {
      'insert': newItems,
      'update': oldItems
    };

    this.waiting = true;

    this.restService.insert('stock/batch', sendData).subscribe(
      (data) => {
        setTimeout(
          () => {
            this.inventoryModel._inventories = [];
            this.waiting = false;
          }, 500);
      },
      (err) => {
        this.waiting = false;
        console.log(err);
      }
    );
  }

  removeInventoryItem(inventoryItem: Inventory) {
    inventoryItem.state = 'delete';

    setTimeout(() => {
        this.inventoryModel._inventories = this.inventoryModel._inventories.filter((el) => {
          return el.productName !== inventoryItem.productName;
        });

        this.productName_Code.push(inventoryItem.productCode + ' - ' + inventoryItem.productName);
      }
      , 1000);
  }

  disableInventoryItem(inventoryItem: Inventory) {
    if (inventoryItem.unopenedPack === null || inventoryItem.unopenedPack < 0)
      return true;

    return false;
  }

  dateChanged() {
    this.compareDates();

    this.inventoryModel.clear();
    this.productName_Code = [];

    //Should get data from server
    this.getInventoryData();
  }

  compareDates() {
    if (this.currentDate.getDate() !== this.selectedDate.getDate())
      this.isSameDates = false;
    else if (this.currentDate.getMonth() !== this.selectedDate.getMonth())
      this.isSameDates = false;
    else if (this.currentDate.getFullYear() !== this.selectedDate.getFullYear())
      this.isSameDates = false;
    else
      this.isSameDates = true;
  }

  isCountingDatePast(countingDate) {
    let tempDate = new Date(countingDate);
    if (this.currentDate.getFullYear() > tempDate.getFullYear())
      return true;
    else if (this.currentDate.getMonth() > tempDate.getMonth())
      return true;
    else if (this.currentDate.getDate() > tempDate.getDate())
      return true;
    else
      return false;
  }

  getInventoryData() {
    let dateParam = moment(this.selectedDate).format('YYYYMMDD');

    this.restService.get('stock/' + dateParam).subscribe(
      (data) => {

        this.inventoryModel.clear();
        this.products = [];

        this.productName_Code = data.filter((el) => el.bsddid === null).sort((a, b) => {// Add to autoComplete list
          if (a.product_name.toLowerCase() > b.product_name.toLowerCase())
            return 1;
          else if (a.product_name.toLowerCase() < b.product_name.toLowerCase())
            return -1;
          else {
            if (a.product_code.toLowerCase() > b.product_code.toLowerCase())
              return 1;
            else if (a.product_code.toLowerCase() < b.product_code.toLowerCase())
              return -1;
            else
              return 0;
          }
        }).map(r => `${r.product_code} - ${r.product_name}`);

        // removing non-relevant products from auto-complete list
        this.restService.get('override?uid=' + this.authService.unit_id).subscribe(
          products => {
            let nameCodeCouples = products.map(product => `${product.code} - ${product.name}`);
            this.productName_Code = this.productName_Code.filter(item => {
              return nameCodeCouples.includes(item);
            });
          },
          error => {
            console.log(error.message);
          }
        );

        for (let item of data) {
          this.checkDisability(item);

          if (item.bsddid === null) {
            let tempProduct = new Product();
            tempProduct.id = item.pid;
            tempProduct.code = item.product_code;
            tempProduct.name = item.product_name;
            this.products.push(tempProduct);

            // this.productName_Code.push(item.product_code + ' - ' + item.product_name);
          }
          else {
            if (item.counting_date === null) {
              console.log('Error in data fetched from server');
            }
            else {
              let tempInventory = new Inventory();

              tempInventory.id = item.bsddid;
              tempInventory.productId = item.pid;
              tempInventory.productCode = item.product_code;
              tempInventory.productName = item.product_name;
              tempInventory.unopenedPack = item.product_count;

              if (item.last_count === null)
                tempInventory.lastCount = null;
              else {
                let lastCount = moment(item.last_count).format('YYYY-MM-DD');

                if (lastCount === 'Invalid date')
                  tempInventory.lastCount = this.currentDate;
                else
                  tempInventory.lastCount = new Date(lastCount);
              }

              tempInventory.shouldCountToday = !this.isCountingDatePast(item.counting_date);
              tempInventory.shouldIncluded = true;
              tempInventory.state = 'exist';
              this.inventoryModel.add(tempInventory);
            }
          }
        }

        //Sort data
        this.inventoryModel._inventories.sort(function (a, b) {
          if ((!a.shouldCountToday && a.shouldIncluded) && !(!b.shouldCountToday && b.shouldIncluded))
            return -1;
          else if (!(!a.shouldCountToday && a.shouldIncluded) && (!b.shouldCountToday && b.shouldIncluded))
            return 1;
          else if (a.productName.toLowerCase() > b.productName.toLowerCase())
            return 1;
          else if (a.productName.toLowerCase() < b.productName.toLowerCase())
            return -1;
          else {
            if (a.productCode.toLowerCase() > b.productCode.toLowerCase())
              return 1;
            else if (a.productCode.toLowerCase() < b.productCode.toLowerCase())
              return -1;
            else
              return 0;
          }
        });

        this.noButton = this.inventoryModel._inventories.map(r => r.shouldIncluded).reduce((x, y) => x && y, true);
        // console.log(data);
      },
      (err) => {
        console.log(err.message);
      }
    );
  }

  checkDisability(item) {
    //Check the value to be non negative
    if (item.unopenedPack < 0)
      item.unopenedPack = 0;

    let noValue = false;

    for (let invItem of this.inventoryModel._inventories) {
      if (this.disableInventoryItem(invItem)) {
        noValue = true;
        break;
      }
    }

    this.submitShouldDisabled = noValue;
  }

  showProductList() {
    this.productNameCodeCtrl.setValue('');
  }
}
