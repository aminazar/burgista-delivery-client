import {Component, OnInit, style, trigger, state, transition, animate, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";

import {AuthService} from "../auth.service";
import {RestService} from "../rest.service";
import {InventoryModel} from "./inventory.model";
import {Inventory} from "./inventory";
import {setTimeout} from "timers";
import {Product} from "../product-form/product";
import * as moment from 'moment';


@Component({
  selector: 'app-inventory-form',
  templateUrl: './inventory-form.component.html',
  styleUrls: ['./inventory-form.component.css'],
  animations: [
    trigger('itemState', [
      state('exist',   style({opacity: 1, transform: 'translateX(0) scale(1)'})),
      state('delete',   style({opacity: 0, display: 'none', transform: 'translateX(0) scale(1)'})),
      state('sent',   style({opacity: 0, display: 'none', transform: 'translateX(0) scale(1)'})),
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

  unitName: string = '';
  inventoryModel: InventoryModel;
  currentDate;
  selectedDate;
  isSameDates: boolean = true;
  products: Product[] = [];
  productName_Code: string[] = [];
  filteredNameCode: any;
  productNameCodeCtrl: FormControl;

  constructor(private authService: AuthService, private restService: RestService) { }

  ngOnInit() {
    this.unitName = this.authService.unitName;

    this.currentDate = new Date();
    this.selectedDate = new Date();

    if(this.inventoryModel === null || this.inventoryModel === undefined)
      this.inventoryModel = new InventoryModel(this.unitName);

    //Fetch data
    this.getInventoryData();

    //Subscribe on autoComplete form
    this.productNameCodeCtrl = new FormControl();
    this.filteredNameCode = this.productNameCodeCtrl.valueChanges
      .startWith(null)
      .map((name_code) => this.filterProducts(name_code));


    this.productNameCodeCtrl.valueChanges.subscribe(
      (data) => {
        let tempNameObj = this.productName_Code.find((el) => {
          return el.toLowerCase() === data.toLowerCase();
        });

        if(tempNameObj !== undefined && tempNameObj !== null){
          let tempInventoryItem = new Inventory();
          tempInventoryItem.id = null;
          tempInventoryItem.unopenedPack = (this.unopenedPack.nativeElement.value !== undefined && this.unopenedPack.nativeElement.value !== null && this.unopenedPack.nativeElement.value !== '') ? this.unopenedPack.nativeElement.value : 0;
          tempInventoryItem.productCode = data.substr(0, data.indexOf('-') - 1);
          tempInventoryItem.productName = data.substr(data.indexOf('-') + 2);
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

  submitInventoryItem(inventoryItem: Inventory){
    if(inventoryItem.id === null){            //Should insert
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
    else{                                     //Should update
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

  removeInventoryItem(inventoryItem: Inventory){
    inventoryItem.state = 'delete';

    setTimeout(() => {
      this.inventoryModel._inventories = this.inventoryModel._inventories.filter((el) => {
        return el.productName !== inventoryItem.productName;
      });

      this.productName_Code.push(inventoryItem.productCode + ' - ' + inventoryItem.productName);
    }
    ,1000);
  }

  disableInventoryItem(inventoryItem: Inventory){
    if(inventoryItem.unopenedPack === null || inventoryItem.unopenedPack <= 0)
      return true;

    return false;
  }

  dateChanged(){
    this.compareDates();

    this.inventoryModel.clear();
    this.productName_Code = [];

    //Should get data from server
    this.getInventoryData();
  }

  compareDates(){
    if(this.currentDate.getDate() !== this.selectedDate.getDate())
      this.isSameDates = false;
    else if(this.currentDate.getMonth() !== this.selectedDate.getMonth())
      this.isSameDates = false;
    else if(this.currentDate.getFullYear() !== this.selectedDate.getFullYear())
      this.isSameDates = false;
    else
      this.isSameDates = true;
  }

  isCountingDatePast(countingDate){
    let tempDate = new Date(countingDate);
    if(this.currentDate.getFullYear() > tempDate.getFullYear())
      return true;
    else if(this.currentDate.getMonth() > tempDate.getMonth())
      return true;
    else if(this.currentDate.getDate() > tempDate.getDate())
      return true;
    else
      return false;
  }

  getInventoryData(){
    let dateParam = moment(this.selectedDate).format('YYYYMMDD');

    this.restService.get('stock/' + dateParam).subscribe(
      (data) => {
        this.inventoryModel.clear();
        this.products = [];

        for(let item of data){
          if(item.bsddid === null) {                     //Add to autoComplete list
            let tempProduct = new Product();
            tempProduct.id = item.pid;
            tempProduct.code = item.product_code;
            tempProduct.name = item.product_name;
            this.products.push(tempProduct);

            this.productName_Code.push(item.product_code + ' - ' + item.product_name);
          }
          else {
            if(item.counting_date === null){
              console.log('Error in data fetched from server');
            }
            else{
              let tempInventory = new Inventory();

              tempInventory.id = item.bsddid;
              tempInventory.productId = item.pid;
              tempInventory.productCode = item.product_code;
              tempInventory.productName = item.product_name;
              tempInventory.unopenedPack = item.product_count;

              let lastCount = moment(item.last_count).format('YYYY-MM-DD');

              if(lastCount === 'Invalid date')
                tempInventory.lastCount = this.currentDate;
              else
                tempInventory.lastCount = new Date(lastCount);

              tempInventory.shouldCountToday = !this.isCountingDatePast(item.counting_date);
              tempInventory.shouldIncluded = true;
              tempInventory.state = 'exist';
              this.inventoryModel.add(tempInventory);
            }
          }
        }

        console.log(data);
      },
      (err) => {
        console.log(err.message);
      }
    )
  }
}
