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
import * as moment from 'moment';
import {BehaviorSubject} from "rxjs";

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
  // @ViewChild('autoNameCode') autoNameCode;

  showZeroDelivery = false;
  filteredDeliveries = [];
  filteredBranchDeliveries = {};
  dataIsReady: boolean = false;
  isWaiting: any = {};
  unitName: string;
  isKitchen: boolean;
  receiverName: string = 'All';
  selectedDate: Date;
  currentDate: Date;
  isToday: boolean = true;
  selectedIndex: number = 0;
  receivers: any[] = [];
  overallDeliveryModel: DeliveryModel;
  receiversSumDeliveries: any = {};
  receiversDeliveryModels: any = {};
  productName_Code: any = {};
  // productsList: Product[] = [];
  productsList: any = {};
  filteredNameCode: any;
  productNameCodeCtrl: FormControl;
  thereIsProactiveItem = false;

  constructor(private authService: AuthService, private restService: RestService, private  msgService: MessageService, public dialog: MdDialog, private printService: PrintService) { }

  ngOnInit() {
    if(this.overallDeliveryModel === null || this.overallDeliveryModel === undefined)
      this.overallDeliveryModel = new DeliveryModel('All', null, !this.showZeroDelivery);

    this.overallDeliveryModel._shouldDisabled = true;
    this.unitName = this.authService.unitName;
    this.isKitchen = this.authService.isKitchen;
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.restService.get('date').subscribe(d => {
      this.currentDate = new Date(d);
      this.selectedDate = new Date(d);
    }, err => {
      console.error(err);
    });


    this.receiversDeliveryModels = {All: this.overallDeliveryModel};
    let tempAllDelivery: Delivery = new Delivery();
    tempAllDelivery.realDelivery = 0;
    tempAllDelivery.min = 0;
    tempAllDelivery.max = 0;
    tempAllDelivery.minDelivery = 0;
    tempAllDelivery.maxDelivery = 0;
    tempAllDelivery.stock = 0;
    this.receiversSumDeliveries = {All: tempAllDelivery};
    this.receivers = [];

    //Get receivers (branches)
    this.restService.get('unit?isBranch=true&isKitchen=' + this.isKitchen).subscribe(
      (data) => {
        for(let item of data){
          let obj = {
            id: item.uid,
            name: item.name,
            warn: 'no'
          };

          this.receivers.push(obj);
          this.isWaiting[obj.name] = false;
        }

        //Get product items from server for each receiver (branch)
        this.getDeliveryData();
      },
      (err) => {
        console.log(err.message);
      }
    );

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
          let p_code = tempNameObj.substr(0, tempNameObj.indexOf(' - '));
          let p_name = tempNameObj.substr(tempNameObj.indexOf(' - ') + 3);

          let tempDelivery = new Delivery();
          tempDelivery.id = null;
          tempDelivery.uid = this.receiversDeliveryModels[this.receiverName].uid;
          tempDelivery.productCode = p_code;
          tempDelivery.productName = p_name;
          let foundProduct: Product = this.productsList[this.receiverName].find((el) => el.code.toLowerCase() === p_code.toLowerCase());
          tempDelivery.min = foundProduct.minQty;
          tempDelivery.max = foundProduct.maxQty;
          tempDelivery.realDelivery = null;
          tempDelivery.stock = 0;
          tempDelivery.minDelivery = (tempDelivery.min - tempDelivery.stock) < 0 ? 0 : (tempDelivery.min - tempDelivery.stock);
          tempDelivery.maxDelivery = tempDelivery.max - tempDelivery.stock;
          tempDelivery.stockDate = moment(tempDelivery.stockDate).format('DD MMM YY');

          this.receiversDeliveryModels[this.receiverName].add(tempDelivery);
          this.thereIsProactiveItem = !!this.overallDeliveryModel._deliveries.find(r => r.id === null);
          this.calSumRow(this.receiverName, tempDelivery, 'add');
          this.calSumRow('All', tempDelivery, 'add');

          // this.autoNameCode.nativeElement.value = null;

          this.productName_Code[this.receiverName] = this.productName_Code[this.receiverName].filter((el) => {
            return el.toLowerCase() !== tempNameObj.toLowerCase();
          });

          //Add this data to overallDeliveryModel
          if(this.overallDeliveryModel.getByCode(tempDelivery.productCode) === undefined) {
            this.overallDeliveryModel.add(tempDelivery);
            this.thereIsProactiveItem = !!this.overallDeliveryModel._deliveries.find(r => r.id === null);
            this.updateOverallDelivery(tempDelivery.productCode, tempDelivery, 'add', 'min', 0);
            this.updateOverallDelivery(tempDelivery.productCode, tempDelivery, 'add', 'max', 0);
            this.updateOverallDelivery(tempDelivery.productCode, tempDelivery, 'add', 'realDelivery', 0);
            this.updateOverallDelivery(tempDelivery.productCode, tempDelivery, 'add', 'minDelivery', 0);
            this.updateOverallDelivery(tempDelivery.productCode, tempDelivery, 'add', 'maxDelivery', 0);
            this.updateOverallDelivery(tempDelivery.productCode, tempDelivery, 'add', 'stock', 0);
          }
          else {
            this.updateOverallDelivery(tempDelivery.productCode, tempDelivery, 'add', 'min', tempDelivery.min);
            this.updateOverallDelivery(tempDelivery.productCode, tempDelivery, 'add', 'max', tempDelivery.max);
            this.updateOverallDelivery(tempDelivery.productCode, tempDelivery, 'add', 'realDelivery', tempDelivery.realDelivery);
            this.updateOverallDelivery(tempDelivery.productCode, tempDelivery, 'add', 'minDelivery', tempDelivery.minDelivery);
            this.updateOverallDelivery(tempDelivery.productCode, tempDelivery, 'add', 'maxDelivery', tempDelivery.maxDelivery);
            this.updateOverallDelivery(tempDelivery.productCode, tempDelivery, 'add', 'stock', tempDelivery.stock);
          }
          this.changeFilter();
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

    this.overallDeliveryModel.clear();
    this.getDeliveryData();
  }

  removeDeliveryItem(item: Delivery){
    //check selectedIndex
    if(this.selectedIndex === 0){
      console.log("Error. Cannot remove added items from 'All' tab");
    }
    else{
      //Update overallDeliveryModel
      this.updateOverallDelivery(item.productCode, item, 'sub', 'realDelivery', item.realDelivery);
      this.updateOverallDelivery(item.productCode, item, 'sub', 'minDelivery', item.minDelivery);
      this.updateOverallDelivery(item.productCode, item, 'sub', 'maxDelivery', item.maxDelivery);
      this.updateOverallDelivery(item.productCode, item, 'sub', 'stock', item.stock);
      this.updateOverallDelivery(item.productCode, item, 'sub', 'min', item.min);
      this.updateOverallDelivery(item.productCode, item, 'sub', 'max', item.max);

      this.receiversDeliveryModels[this.receiverName].deleteByCode(item.productCode);

      let ids = [];
      let minDelivery = 0;
      let maxDelivery = 0;
      let stock = 0;
      for(let rcv of this.receivers){
        let tempItem = this.receiversDeliveryModels[rcv.name]._deliveries.find(
          (el) => el.productCode.toLowerCase() === item.productCode.toLowerCase()
        );

        if(tempItem !== undefined) {
          ids.push(tempItem.id);
          minDelivery += tempItem.minDelivery;
          maxDelivery += tempItem.maxDelivery;
          stock += tempItem.stock;
        }
      }

      let nullId = ids.find((el) => el === null);
      if(nullId === undefined){
        //Update the overallDeliveryModels

        let matchItem = this.overallDeliveryModel._deliveries.find(
          (el) => el.productCode.toLowerCase() === item.productCode.toLowerCase()
        );

        if(matchItem !== undefined){
          matchItem.minDelivery = minDelivery;
          matchItem.maxDelivery = maxDelivery;
          matchItem.stock = stock;

          // let rcv = this.receivers.find((el) => el.name.toLowerCase() === this.receiverName.toLowerCase());
          //
          // if(rcv.warn === 'unknown')
          //   rcv.warn = 'no';

          // this.calSumRow('All', item, 'sub');
        }
      }

      let rcv = this.receivers.find((el) => el.name.toLowerCase() === this.receiverName.toLowerCase());
      if(this.receiversDeliveryModels[this.receiverName]._deliveries.find((el) => el.id === null) === undefined){
        if(this.receiversDeliveryModels[this.receiverName]._deliveries.find((el) => el.stock === null) === undefined)
          rcv.warn = 'no';
        else
          rcv.warn = 'count';
      }
      else
        rcv.warn = 'unknown';

      this.calSumRow(this.receiverName, item, 'sub');

      //Update the sum row for all tab
      if(this.overallDeliveryModel._deliveries.length > 0){
        this.receiversSumDeliveries['All'].realDelivery = this.overallDeliveryModel._deliveries
          .map((el) => el.realDelivery)
          .reduce((a, b) => a + b);
        this.receiversSumDeliveries['All'].min = this.overallDeliveryModel._deliveries
          .map((el) => el.min)
          .reduce((a, b) => a + b);
        this.receiversSumDeliveries['All'].max = this.overallDeliveryModel._deliveries
          .map((el) => el.max)
          .reduce((a, b) => a + b);

        if(this.overallDeliveryModel._deliveries.find((el) => el.stock === null) === undefined){
          this.receiversSumDeliveries['All'].minDelivery = this.overallDeliveryModel._deliveries
            .map((el) => el.minDelivery)
            .reduce((a, b) => a + b);

          this.receiversSumDeliveries['All'].maxDelivery = this.overallDeliveryModel._deliveries
            .map((el) => el.maxDelivery)
            .reduce((a, b) => a + b);

          this.receiversSumDeliveries['All'].stock = this.overallDeliveryModel._deliveries
            .map((el) => el.stock)
            .reduce((a, b) => a + b);
        }
      }

      //Add code and name to productName_Code (for specific receiver)
      this.productName_Code[this.receiverName].push(item.productCode + ' - ' + item.productName);
      this.changeFilter();
      this.receiversDeliveryModels[this.receiverName]._isSubmitted = false;
    }
  }

  filterProducts(val: string) {
    return val ? this.productName_Code[this.receiverName].filter((p) => new RegExp(val.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'gi').test(p)) : this.productName_Code[this.receiverName];
  }

  checkRealDeliveryValue(event, deliveryItem: Delivery){
    let value = (event.srcElement.value === '') ? 0 : parseInt(event.srcElement.value);

    if(value < 0){
      event.srcElement.value = 0;
      deliveryItem.realDelivery = 0;
      return;
    }

    if(value < deliveryItem.minDelivery)
      this.msgService.warn("The 'Real Delivery' value is less than 'Min' value");
    else if(value > deliveryItem.maxDelivery)
      this.msgService.warn("The 'Real Delivery' value is greater than 'Max Delivery' value");

    //Should update realDelivery on overallDeliveryModel
    this.updateOverallDelivery(deliveryItem.productCode, deliveryItem, 'add', 'realDelivery', (value - deliveryItem.realDelivery));

    //Update sum row
    this.receiversSumDeliveries[this.receiverName].realDelivery += (value - deliveryItem.realDelivery);
    this.receiversSumDeliveries['All'].realDelivery += (value - deliveryItem.realDelivery);


    deliveryItem.realDelivery = value;

    //Change deliveryModel._isSubmitted to false
    this.receiversDeliveryModels[this.receiverName]._isSubmitted = false;
    this.changeFilter();
  }

  tabChanged(){
    if(this.selectedIndex === 0)
      this.receiverName = 'All';
    else
      this.receiverName = this.receivers[this.selectedIndex - 1].name;
  }

  updateOverallDelivery(code: string, delivery: Delivery, action, whichItem, changedValue: number){
    // if(this.overallDeliveryModel.getByCode(code) === undefined){          //Should add a product
    //   this.overallDeliveryModel.add(delivery);
    // }
    // else{                                                                //Should update a product
      switch (whichItem){
        case 'min': this.overallDeliveryModel.updateDeliveryProperty(action, code, 'min', changedValue);
          break;
        case 'max': this.overallDeliveryModel.updateDeliveryProperty(action, code, 'max', changedValue);
          break;
        case 'realDelivery': this.overallDeliveryModel.updateDeliveryProperty(action, code, 'realDelivery', changedValue);
          break;
        case 'minDelivery': {
          if(delivery.stock === null || delivery.id === null)
            changedValue = null;

          this.overallDeliveryModel.updateDeliveryProperty(action, code, 'minDelivery', changedValue);
        }
          break;
        case 'maxDelivery': {
          if(delivery.stock === null || delivery.id === null)
            changedValue = null;

          this.overallDeliveryModel.updateDeliveryProperty(action, code, 'maxDelivery', changedValue);
        }
          break;
        case 'stock': {
          if(delivery.stock === null || delivery.id === null)
            changedValue = null;

          this.overallDeliveryModel.updateDeliveryProperty(action, code, 'stock', changedValue);
        }
          break;
      }
    // }

    //Check if in 'All' tab this product only has 0 value for 'min' and 'max' should be removed
    if(this.overallDeliveryModel.getByCode(code).min === 0 && this.overallDeliveryModel.getByCode(code).max === 0)
      this.overallDeliveryModel.deleteByCode(code);


    //Sort overallDeliveryModel._deliveries
    this.overallDeliveryModel.deliveries.sort((a, b) => {
      if(a.productName.toLowerCase() > b.productName.toLowerCase())
        return 1;
      else if(a.productName.toLowerCase() < b.productName.toLowerCase())
        return -1;
      else{
        if(a.productCode.toLowerCase() > b.productCode.toLowerCase())
          return 1;
        else if(a.productCode.toLowerCase() < a.productCode.toLowerCase())
          return -1;
        else
          return 0;
      }
    });
  }

  countToday(stockDate: string){
    if(stockDate === null)
      return false;

    if(moment(stockDate).format('YYMMDD')!== moment(this.currentDate).format('YYMMDD'))
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

      this.sendForPrint(deliveryModel, true);
    }
    else{
      if(deliveryModel._isSubmitted) {
        deliveryModel._shouldDisabled = true;

        this.sendForPrint(deliveryModel, false);
      }
      else
        this.msgService.warn('You should first submit the list');
    }
  }

  submitDelivery(deliveryModel: DeliveryModel){
    deliveryModel.afterSubmit();
    for(let delItem of deliveryModel.deliveries){
      if(delItem.realDelivery === null){
        this.msgService.warn("Delivery data are submitted, but delivery value of '" + delItem.productName + "' was blank.");
        return;
      }
      else if(delItem.realDelivery === 0){
        this.msgService.warn("Delivery data are submitted, but delivery value of '" + delItem.productName + "' was zero");
      }

      deliveryModel._isSubmitted = true;

      //Send data to server
      if(delItem.id === null){                            //Should insert data
        let branchId = this.receivers.find((el) => el.name.toLowerCase() === this.receiverName.toLowerCase()).id;
        let productId = this.productsList[this.receiverName].find((el) => el.code.toLowerCase() === delItem.productCode.toLowerCase()).id;

        this.restService.insert('delivery/' + branchId, DeliveryModel.toAnyObject(delItem, delItem.isPrinted, productId)).subscribe(
          (data) => {
            delItem.state = 'added';
            delItem.id = data;
            this.msgService.message('Delivery data are submitted');
          },
          (err) => {
            deliveryModel._isSubmitted = false;
            console.log(err.message);
            this.msgService.error(err);
          }
        )
      }
      else{                                               //Should update data
        this.restService.update('delivery', delItem.id, DeliveryModel.toAnyObject(delItem, delItem.isPrinted, null)).subscribe(
          (data) => {
            console.log('Update this item successfully');
          },
          (err) => {
            deliveryModel._isSubmitted = false;
            console.log(err.message);
            this.msgService.error(err);
          }
        )
      }
    }
  }

  sendForPrint(deliveryModel: DeliveryModel, isAllTab: boolean){
    //Set data for print
    this.printService._isOverallPrint = isAllTab;
    this.printService._unitSupplier = this.unitName;
    this.printService.uid = this.receiversDeliveryModels[this.receiverName].uid;
    this.printService._unitConsumer = (isAllTab) ? 'Aggregated' : this.receiverName;
    this.printService._receivers = this.receivers.map(rcv => rcv.name);
    this.printService._deliveryModels = this.receiversDeliveryModels;
    this.printService._deliveryModels['All'] = this.overallDeliveryModel;
    this.printService._showWarningMessage = !this.receiversDeliveryModels[this.receiverName]._isPrinted;
    this.printService.currentDate = this.currentDate;

    let dialogRef = this.dialog.open(PrintViewerComponent,{
      height: '600px',
      width: '1200px'
    });
    dialogRef.afterClosed().subscribe(
      (data) => {
        if(data === 'print') {
          //Update finalised this deliveries in the server
          if(!isAllTab){
            let doneAllItems: BehaviorSubject<boolean> = new BehaviorSubject(false);
            let noFailure: boolean = true;

            let counter = 0;
            for(let item of deliveryModel.deliveries){
              item.isPrinted = true;
              this.restService.update('delivery', item.id, DeliveryModel.toAnyObject(item, item.isPrinted, null)).subscribe(
                (data) => {
                  deliveryModel._isPrinted = deliveryModel.deliveries.map(d => d.isPrinted).reduce((a, b) => a && b);

                  counter++;
                  if(counter >= deliveryModel.deliveries.length)
                    doneAllItems.next(true);
                },
                (err) => {
                  item.isPrinted = false;
                  deliveryModel._isPrinted = false;
                  noFailure = false;

                  counter++;
                  if(counter >= deliveryModel.deliveries.length)
                    doneAllItems.next(true);
                }
              )
            }

            doneAllItems.subscribe(
              (data) => {
                if(data && noFailure){
                  this.checkOverallPrintDisability();
                  this.printService.printData();
                }
              }
            )
          }
          else{
            this.printService.printData();
          }
        }
      },
      (err) => console.log(err.message)
    );
  }

  checkOverallPrintDisability(){
    //Check all isPrinted values to disable or enable print button in 'All' tab
    let overallCanPrinted = true;

    for(let rcv of this.receivers){
      if(!this.receiversDeliveryModels[rcv.name]._isPrinted && this.receiversDeliveryModels[rcv.name].deliveries.length > 0)
        overallCanPrinted = false;
    }

    this.overallDeliveryModel._shouldDisabled = !overallCanPrinted;
  }

  getDeliveryData(){
    let dateParam = moment(this.selectedDate).format('YYYYMMDD');

    for(let rcv of this.receivers){
      rcv.warn = 'no';

      //Turn on waiting (Show spinner)
      this.isWaiting[rcv.name] = true;
      this.waiting();

      this.restService.get('delivery/' + dateParam + '/' + rcv.id).subscribe(
        (data) => {
          // console.log(data);
          this.isWaiting[rcv.name] = false;
          this.waiting();
          this.productsList[rcv.name] = [];

          this.receiversDeliveryModels[rcv.name] = new DeliveryModel(rcv.name, +rcv.id, !this.showZeroDelivery);
          this.filteredBranchDeliveries[rcv.name] = [];
          this.receiversSumDeliveries[rcv.name] = new Delivery();
          this.receiversSumDeliveries[rcv.name].min = 0;
          this.receiversSumDeliveries[rcv.name].max = 0;
          this.receiversSumDeliveries[rcv.name].minDelivery = 0;
          this.receiversSumDeliveries[rcv.name].maxDelivery = 0;
          this.receiversSumDeliveries[rcv.name].realDelivery = 0;
          this.receiversSumDeliveries[rcv.name].stock = 0;


          for(let item of data){
            if(item.id === null){        //Add to productList and productName_Code list
              let tempProduct = new Product();
              tempProduct.id = item.productId;
              tempProduct.code = item.productCode;
              tempProduct.name = item.productName;
              tempProduct.minQty = item.min;
              tempProduct.maxQty = item.max;

              if(this.productsList[rcv.name] === undefined)
                this.productsList[rcv.name] = [];
              this.productsList[rcv.name].push(tempProduct);

              if(this.productName_Code[rcv.name] === undefined)
                this.productName_Code[rcv.name] = [];
              this.productName_Code[rcv.name].push(item.productCode + ' - ' + item.productName);
            }
            else{                               //Add to deliveryList
              //check stock value
              if(item.stock === null || (typeof item.stock !== 'number'))
                rcv.warn = 'count';
              // if(typeof item.stock !== 'number')
              //   rcv.warn = 'count';

              //this.receiversDeliveryModels[rcv.name]._isPrinted = item.isPrinted;
              let tempDelivery = new Delivery();
              tempDelivery.id = item.id;
              tempDelivery.uid = +item.uid;
              tempDelivery.productCode = item.productCode;
              tempDelivery.productName = item.productName;
              if(item.stock === null && item.realDelivery === null)
                tempDelivery.realDelivery = null;
              else if(item.realDelivery ===null)
                tempDelivery.realDelivery = (item.max - item.stock) < 0 ? 0 : (item.max - item.stock);
              else
                tempDelivery.realDelivery = item.realDelivery;
              tempDelivery.minDelivery = (item.min - item.stock) < 0 ? 0 : (item.min - item.stock);
              tempDelivery.maxDelivery = item.max - item.stock >= 0 ? item.max - item.stock : 0;
              tempDelivery.min = item.min;
              tempDelivery.max = item.max;
              tempDelivery.stock = item.stock;
              tempDelivery.isPrinted = item.isPrinted;
              if(item.stockDate === null)
                tempDelivery.stockDate = null;
              else
                tempDelivery.stockDate = moment(item.stockDate).format('DD MMM YY');
              tempDelivery.oldCount = item.oldCount;
              tempDelivery.state = 'exist';
              tempDelivery.untilNextCountingDay = item.untilNextCountingDay;

              this.receiversDeliveryModels[rcv.name].add(tempDelivery);
              this.thereIsProactiveItem = !!this.overallDeliveryModel.deliveries.find(r => r.id === null);
              this.calSumRow(rcv.name, tempDelivery, 'add');
              this.calSumRow('All', tempDelivery, 'add');

              //Update overall list
              if(this.overallDeliveryModel.getByCode(item.productCode) === undefined){          //Should add a product
                this.overallDeliveryModel.add(tempDelivery);
                this.thereIsProactiveItem = !!this.overallDeliveryModel.deliveries.find(r => r.id === null);
              }
              else{
                this.updateOverallDelivery(item.productCode, tempDelivery, 'add', 'min', tempDelivery.min);
                this.updateOverallDelivery(item.productCode, tempDelivery, 'add', 'max', tempDelivery.max);
                this.updateOverallDelivery(item.productCode, tempDelivery, 'add', 'realDelivery', tempDelivery.realDelivery);
                this.updateOverallDelivery(item.productCode, tempDelivery, 'add', 'minDelivery', tempDelivery.minDelivery);
                this.updateOverallDelivery(item.productCode, tempDelivery, 'add', 'maxDelivery', tempDelivery.maxDelivery);
                this.updateOverallDelivery(item.productCode, tempDelivery, 'add', 'stock', tempDelivery.stock);
              }
            }
          }

          if(this.receiversDeliveryModels[rcv.name].deliveries.length > 0)
            this.receiversDeliveryModels[rcv.name]._isPrinted = this.receiversDeliveryModels[rcv.name].deliveries.map(d => d.isPrinted)
                                                                                                    .reduce((a, b) => a && b);
          else{
            this.receiversDeliveryModels[rcv.name]._isSubmitted = true;
            // rcv.warn = 'login';
          }

          if(this.receiversDeliveryModels[rcv.name]._isPrinted)
            this.receiversDeliveryModels[rcv.name]._isSubmitted = true;

          //Sort data
          this.receiversDeliveryModels[rcv.name].deliveries.sort((a, b) => {
            if(!this.countToday(a.stockDate) && this.countToday(b.stockDate))
              return -1;
            else if(this.countToday(a.stockDate) && !this.countToday(b.stockDate))
              return 1;
            if(a.productName.toLowerCase() > b.productName.toLowerCase())
              return 1;
            else if(a.productName.toLowerCase() < b.productName.toLowerCase())
              return -1;
            else{
              if(a.productCode.toLowerCase() > b.productCode.toLowerCase())
                return 1;
              else if(a.productCode.toLowerCase() < a.productCode.toLowerCase())
                return -1;
              else
                return 0;
            }
          });
          this.filteredBranchDeliveries[rcv.name] = this.receiversDeliveryModels[rcv.name].deliveries;
          this.filteredDeliveries = this.overallDeliveryModel.deliveries;
        },
        (err) => {
          this.isWaiting[rcv.name] = false;
          this.waiting();
          console.log(err.message);
        }
      )
    }
  }

  showProductList(){
    this.productNameCodeCtrl.setValue('');
  }

  clearInput($event){
    setTimeout(function () {
      $event.target.value = '';
    }, 50);
  }

  calSumRow(rcvName: string, delivery: Delivery, operation: string){
    if(operation === 'add'){
      if((delivery.stock === null || delivery.id === null)){
        if(rcvName !== 'All') {
          let rcv = this.receivers.find((el) => el.name.toLowerCase() === rcvName.toLowerCase());
          if (rcv.warn === 'no')
            rcv.warn = 'unknown';
        }
        else{
          this.receiversSumDeliveries['All'].minDelivery = null;
          this.receiversSumDeliveries['All'].maxDelivery = null;
          this.receiversSumDeliveries['All'].stock = null;
        }
      }

      this.receiversSumDeliveries[rcvName].min += delivery.min;
      this.receiversSumDeliveries[rcvName].max += delivery.max;
      // if(delivery.stock === null || delivery.id === null)
      //   this.receiversSumDeliveries[rcvName].minDelivery = null;
      // else
      if(this.receiversSumDeliveries[rcvName].minDelivery !== null)
        this.receiversSumDeliveries[rcvName].minDelivery += delivery.minDelivery;
      // if(delivery.stock === null || delivery.id === null)
      //   this.receiversSumDeliveries[rcvName].maxDelivery = null;
      // else
      if(this.receiversSumDeliveries[rcvName].maxDelivery !== null)
        this.receiversSumDeliveries[rcvName].maxDelivery += delivery.maxDelivery;
      this.receiversSumDeliveries[rcvName].realDelivery += delivery.realDelivery;
      // if(delivery.stock === null || delivery.id === null)
      //   this.receiversSumDeliveries[rcvName].stock = null;
      // else
      if(this.receiversSumDeliveries[rcvName].stock !== null)
        this.receiversSumDeliveries[rcvName].stock += delivery.stock;
    }
    else{
      this.receiversSumDeliveries[rcvName].min -= delivery.min;
      this.receiversSumDeliveries[rcvName].max -= delivery.max;
      this.receiversSumDeliveries[rcvName].minDelivery -= delivery.minDelivery;
      this.receiversSumDeliveries[rcvName].maxDelivery -= delivery.maxDelivery;
      this.receiversSumDeliveries[rcvName].realDelivery -= delivery.realDelivery;
      this.receiversSumDeliveries[rcvName].stock -= (delivery.stock === null) ? 0 : delivery.stock;
    }
  }

  waiting(){
    let wait: boolean = false;

    for(let rcv of this.receivers){
      wait = wait || this.isWaiting[rcv.name];
    }

    this.dataIsReady = !wait;
  }

  changeFilter() {
    this.overallDeliveryModel.filter = !this.showZeroDelivery;

    this.filteredDeliveries = this.overallDeliveryModel.deliveries;
    for(const name in this.receiversDeliveryModels) if(this.receiversDeliveryModels.hasOwnProperty(name)) {
      this.receiversDeliveryModels[name].filter = !this.showZeroDelivery;
      this.filteredBranchDeliveries[name] =  this.receiversDeliveryModels[name].deliveries;
    }
  }
}
