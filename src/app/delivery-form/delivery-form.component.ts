import {Component, OnInit, trigger, state, style, transition, animate, ViewChild} from '@angular/core';

import {AuthService} from "../auth.service";
import {RestService} from "../rest.service";
import {DeliveryModel} from "./delivery.model";
import {Delivery} from "./delivery";
import {FormControl} from "@angular/forms";
import {MessageService} from "../message.service";
import {Product} from "../product-form/product";
import {MdDialog, MdDialogRef} from '@angular/material';
import {PrintViewerComponent} from "../print-viewer/print-viewer.component";
import {PrintService} from "../print.service";

@Component({
  selector: 'app-delivery-form',
  templateUrl: './delivery-form.component.html',
  styleUrls: ['./delivery-form.component.css'],
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
export class DeliveryFormComponent implements OnInit {
  @ViewChild('autoNameCode') autoNameCode;

  unitName: string;
  receiverName: string = 'All';
  selectedDate: Date;
  currentDate: Date;
  isToday: boolean = true;
  selectedIndex: number = 0;
  receivers: any[] = [];
  overallDeliveryModel: DeliveryModel;
  receiversDeliveryModels: any = {};
  productName_Code: any = {};
  productsList: Product[] = [];
  filteredNameCode: any;
  productNameCodeCtrl: FormControl;

  constructor(private authService: AuthService, private restService: RestService, private  msgService: MessageService, public dialog: MdDialog, private printService: PrintService) { }

  ngOnInit() {
    if(this.overallDeliveryModel === null || this.overallDeliveryModel === undefined)
      this.overallDeliveryModel = new DeliveryModel('All');

    this.overallDeliveryModel._shouldDisabled = true;
    this.unitName = this.authService.unitName;
    this.selectedDate = new Date();
    this.currentDate = new Date();

    this.receiversDeliveryModels = {};
    this.receivers = [];

    //Set stub data for receiversDeliveryModels
    let mockRcvListFromServer = [
      {
        products: [
          {id: 1, code: 'fo01', name: 'Frying Oil', min: 2, max: 5, stock: 3, stockDate: new Date(2017, 0, 5)},
          {id: 2, code: 'ks01', name: 'Ketchup Sauce', min: 5, max: 9, stock: 2, stockDate: new Date(2017, 1, 16)},
          {id: 3, code: 'tm01', name: 'Tomato', min: 4, max: 6, stock: 7, stockDate: new Date(2017, 1, 16)},
        ],
        uid: 4,
        name: 'Baker Street',
        didCounting: true
      },
      {
        products: [
          {id: 4, code: 'fo01', name: 'Frying Oil', min: 3, max: 5, stock: 6, stockDate: new Date(2017, 0, 15)},
          {id: 5, code: 'tm01', name: 'Tomato', min: 4, max: 6, stock: 7, stockDate: new Date(2017, 1, 16)},
        ],
        uid: 5,
        name: 'Piccadilly',
        didCounting: true
      },
      {
        products: [
          {id: 6, code: 'fo01', name: 'Frying Oil', min: 10, max: 14, stock: 3, stockDate: new Date(2017, 0, 5)},
          {id: 7, code: 'ks01', name: 'Ketchup Sauce', min: 12, max: 16, stock: 2, stockDate: new Date(2017, 1, 16)},
          {id: 8, code: 'tm01', name: 'Tomato', min: 14, max: 16, stock: 7, stockDate: new Date(2017, 2, 2)},
        ],
        uid: 2,
        name: 'Prep Kitchen',
        didCounting: true
      },
    ];

    for (let item of mockRcvListFromServer) {
      if (this.receiversDeliveryModels[item.name] === undefined)
        this.receiversDeliveryModels[item.name] = new DeliveryModel(item.name);


      for(let product of item.products){
        let tempDelivery = new Delivery();
        tempDelivery.id = product.id;
        tempDelivery.productCode = product.code;
        tempDelivery.productName = product.name;
        tempDelivery.min = product.min;
        tempDelivery.max = product.max;
        tempDelivery.stock = product.stock;
        tempDelivery.stockDate = product.stockDate;

        this.receiversDeliveryModels[item.name].add(tempDelivery);

        //Update overall list
        this.updateOverallDelivery(product.code, tempDelivery, 'add', 'min', tempDelivery.min);
        this.updateOverallDelivery(product.code, tempDelivery, 'add', 'max', tempDelivery.max);
        this.updateOverallDelivery(product.code, tempDelivery, 'add', 'realDelivery', tempDelivery.realDelivery);
      }

      //Update receivers list
      this.receivers.push({id: item.uid, name: item.name});
    }


    //Set stub data for got products
    let onionProduct = new Product();
    onionProduct.id = 1;
    onionProduct.code = 'on80';
    onionProduct.name = 'Onion';
    onionProduct.minQty = 5;
    onionProduct.maxQty = 8;
    this.productsList.push(onionProduct);
    this.addProductNameCodeToAllReceivers(onionProduct.code + ' - ' + onionProduct.name);
    let oliveProduct = new Product();
    oliveProduct.id = 2;
    oliveProduct.code = 'ov091';
    oliveProduct.name = 'Olive';
    oliveProduct.minQty = 2;
    oliveProduct.maxQty = 4;
    this.productsList.push(oliveProduct);
    this.addProductNameCodeToAllReceivers(oliveProduct.code + ' - ' + oliveProduct.name);
    let oliveOilProduct = new Product();
    oliveOilProduct.id = 3;
    oliveOilProduct.code = 'oo92';
    oliveOilProduct.name = 'Olive Oil';
    oliveOilProduct.minQty = 3;
    oliveOilProduct.maxQty = 6;
    this.productsList.push(oliveOilProduct);
    this.addProductNameCodeToAllReceivers(oliveOilProduct.code + ' - ' + oliveOilProduct.name);
    let breadProduct = new Product();
    breadProduct.id = 4;
    breadProduct.code = 'b100';
    breadProduct.name = 'Bread';
    breadProduct.minQty = 60;
    breadProduct.maxQty = 70;
    this.productsList.push(breadProduct);
    this.addProductNameCodeToAllReceivers(breadProduct.code + ' - ' + breadProduct.name);

    //Subscribe on autoComplete form
    this.productNameCodeCtrl = new FormControl();

    this.filteredNameCode = this.productNameCodeCtrl.valueChanges
      .map((name_code) => this.filterProducts(name_code));

    this.productNameCodeCtrl.valueChanges.subscribe(
      (data) => {
        let tempNameObj = this.productName_Code[this.receiverName].find((el) => {
          return el.toLowerCase() === data.toLowerCase();
        });

        if(tempNameObj !== undefined && tempNameObj !== null){
          let p_code = tempNameObj.substr(0, tempNameObj.indexOf('-') - 1);
          let p_name = tempNameObj.substr(tempNameObj.indexOf('-') + 2);

          let tempDelivery = new Delivery();
          tempDelivery.id = null;
          tempDelivery.productCode = p_code;
          tempDelivery.productName = p_name;
          let foundProduct: Product = this.productsList.find((el) => el.code.toLowerCase() === p_code.toLowerCase());
          tempDelivery.min = foundProduct.minQty;
          tempDelivery.max = foundProduct.maxQty;
          tempDelivery.realDelivery = null;
          tempDelivery.stock = null;
          tempDelivery.stockDate = this.currentDate;

          this.receiversDeliveryModels[this.receiverName].add(tempDelivery);

          this.autoNameCode.nativeElement.value = null;

          this.productName_Code[this.receiverName] = this.productName_Code[this.receiverName].filter((el) => {
            return el.toLowerCase() !== tempNameObj.toLowerCase();
          });

          //Add this data to overallDeliveryModel
          this.updateOverallDelivery(tempDelivery.productCode, tempDelivery, 'add', 'min', tempDelivery.min);
          this.updateOverallDelivery(tempDelivery.productCode, tempDelivery, 'add', 'max', tempDelivery.max);
          this.updateOverallDelivery(tempDelivery.productCode, tempDelivery, 'add', 'realDelivery', tempDelivery.realDelivery);

          //Change deliverModel._isSubmitted to false
          this.receiversDeliveryModels[this.receiverName]._isSubmitted = false;
        }
      },
      (err) => {
        console.log(err.message);
      }
    );
  }

  dateChanged(){
    if(this.selectedDate.getFullYear() !== this.currentDate.getFullYear())
      this.isToday = false;
    else if(this.selectedDate.getMonth() !== this.currentDate.getMonth())
      this.isToday = false;
    else if(this.selectedDate.getDate() !== this.currentDate.getDate())
      this.isToday = false;
    else
      this.isToday = true;
  }

  removeDeliveryItem(item: Delivery){
    //check selectedIndex
    if(this.selectedIndex === 0){
      console.log("Error. Cannot remove added items from 'All' tab");
    }
    else{
      //Update overallDeliveryModel
      this.updateOverallDelivery(item.productCode, item, 'sub', 'min', item.min);
      this.updateOverallDelivery(item.productCode, item, 'sub', 'max', item.max);
      this.updateOverallDelivery(item.productCode, item, 'sub', 'realDelivery', item.realDelivery);

      this.receiversDeliveryModels[this.receiverName].deleteByCode(item.productCode);

      //Add code and name to productName_Code (for specific receiver)
      this.productName_Code[this.receiverName].push(item.productCode + ' - ' + item.productName);

      this.receiversDeliveryModels[this.receiverName]._isSubmitted = false;
    }
  }

  filterProducts(val: string) {
    return val ? this.productName_Code[this.receiverName].filter((p) => new RegExp(val, 'gi').test(p)) : this.productName_Code[this.receiverName];
  }

  checkRealDeliveryValue(event, deliveryItem: Delivery){
    let value = parseInt(event.srcElement.value);

    if(value < 0){
      event.srcElement.value = 0;
      deliveryItem.realDelivery = 0;
      return;
    }

    if(value < deliveryItem.min)
      this.msgService.warn("The 'Real Delivery' value is less than 'Min' value");
    else if(value > deliveryItem.min)
      this.msgService.warn("The 'Real Delivery' value is greater than 'Min' value");

    //Should update realDelivery on overallDeliveryModel
    this.updateOverallDelivery(deliveryItem.productCode, deliveryItem, 'add', 'realDelivery', (value - deliveryItem.realDelivery));
    deliveryItem.realDelivery = value;

    //Change deliveryModel._isSubmitted to false
    this.receiversDeliveryModels[this.receiverName]._isSubmitted = false;
  }

  tabChanged(){
    if(this.selectedIndex === 0)
      this.receiverName = 'All';
    else
      this.receiverName = this.receivers[this.selectedIndex - 1].name;
  }

  addProductNameCodeToAllReceivers(nameCode: string){
    for(let rcv of this.receivers){
      if(this.productName_Code[rcv.name] === undefined)
        this.productName_Code[rcv.name] = [];

      this.productName_Code[rcv.name].push(nameCode);
    }
  }

  updateOverallDelivery(code: string, delivery: Delivery, action, whichItem, changedValue: number){
    if(this.overallDeliveryModel.getByCode(code) === undefined){          //Should add a product
      this.overallDeliveryModel.add(delivery);
    }
    else{                                                                //Should update a product
      switch (whichItem){
        case 'min': this.overallDeliveryModel.updateDeliveryProperty(action, code, 'min', changedValue);
          break;
        case 'max': this.overallDeliveryModel.updateDeliveryProperty(action, code, 'max', changedValue);
          break;
        case 'realDelivery': this.overallDeliveryModel.updateDeliveryProperty(action, code, 'realDelivery', changedValue);
          break;
      }
    }

    //Check if in 'All' tab this product only has 0 value for 'min' and 'max' should be removed
    if(this.overallDeliveryModel.getByCode(code).min === 0 && this.overallDeliveryModel.getByCode(code).max === 0)
      this.overallDeliveryModel.deleteByCode(code);
  }

  countToday(stockDate: Date){
    if(stockDate.getFullYear() !== this.currentDate.getFullYear())
      return false;
    else if(stockDate.getMonth() !== this.currentDate.getMonth())
      return false;
    else if(stockDate.getDate() !== this.currentDate.getDate())
      return false;
    else
      return true;
  }

  printDelivery(deliveryModel: DeliveryModel){
    if(deliveryModel._unitName === 'All'){
      for(let rcv of this.receivers) {
        if (!this.receiversDeliveryModels[rcv.name]._isSubmitted) {
          this.msgService.warn(rcv.name + ' data is not submitted');
          return;
        }
      }

      deliveryModel._isPrinted = true;
      this.sendForPrint(deliveryModel, true);
    }
    else{
      if(deliveryModel._isSubmitted) {
        deliveryModel._isPrinted = true;
        deliveryModel._shouldDisabled = true;
      }
      else
        this.msgService.warn('You should first submit the list');

      //Check all isPrinted values to disable or enable print button in 'All' tab
      let overallCanPrinted = true;

      for(let rcv of this.receivers){
        if(!this.receiversDeliveryModels[rcv.name]._isPrinted)
          overallCanPrinted = false;
      }

      this.overallDeliveryModel._shouldDisabled = !overallCanPrinted;

      this.sendForPrint(deliveryModel, false);
    }
  }

  submitDelivery(deliveryModel: DeliveryModel){
    for(let delItem of deliveryModel._deliveries){
      if(delItem.realDelivery === null){
        this.msgService.warn("The product '" + delItem.productName + "' has no 'realDelivery' value");
        return;
      }
      else if(delItem.realDelivery === 0){
        this.msgService.warn("The 'realDelivery' value of " + delItem.productName + " is zero");
      }

      if(delItem.id === null){
        //Set id received from server
        delItem.id = 10;
        delItem.state = 'added';
      }
    }

    deliveryModel._isSubmitted = true;
  }

  sendForPrint(deliveryModel: DeliveryModel, isAllTab: boolean){
    //Set data for print
    this.printService._isOverallPrint = isAllTab;
    this.printService._unitSupplier = this.unitName;
    this.printService._unitConsumer = (isAllTab) ? 'Aggregated' : this.receiverName;
    this.printService._receivers = this.receivers.map(rcv => rcv.name);
    this.printService._deliveryModels = this.receiversDeliveryModels;

    let dialogRef = this.dialog.open(PrintViewerComponent,{
      height: '600px',
      width: '1000px'
    });
    dialogRef.afterClosed().subscribe(
      (data) => this.printService.printData(),
      (err) => console.log(err.message)
    );
  }
}
