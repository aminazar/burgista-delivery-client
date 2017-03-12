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
  // productsList: Product[] = [];
  productsList: any = {};
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

    this.receiversDeliveryModels = {All: this.overallDeliveryModel};
    this.receivers = [];

    //Get receivers (branches)
    this.restService.get('unit?isBranch=true').subscribe(
      (data) => {
        for(let item of data){
          let obj = {
            id: item.uid,
            name: item.name,
            warn: 'no'
          };

          this.receivers.push(obj);
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
          let p_code = tempNameObj.substr(0, tempNameObj.indexOf('-') - 1);
          let p_name = tempNameObj.substr(tempNameObj.indexOf('-') + 2);

          let tempDelivery = new Delivery();
          tempDelivery.id = null;
          tempDelivery.productCode = p_code;
          tempDelivery.productName = p_name;
          let foundProduct: Product = this.productsList[this.receiverName].find((el) => el.code.toLowerCase() === p_code.toLowerCase());
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


    //Sort overallDeliveryModel._deliveries
    this.overallDeliveryModel._deliveries.sort((a, b) => {
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
    })
  }

  countToday(stockDate: Date){
    if(stockDate === null)
      return true;

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
    for(let delItem of deliveryModel._deliveries){
      if(delItem.realDelivery === null){
        this.msgService.warn("The product '" + delItem.productName + "' has no 'realDelivery' value");
        return;
      }
      else if(delItem.realDelivery === 0){
        this.msgService.warn("The 'realDelivery' value of " + delItem.productName + " is zero");
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
    this.printService._unitConsumer = (isAllTab) ? 'Aggregated' : this.receiverName;
    this.printService._receivers = this.receivers.map(rcv => rcv.name);
    this.printService._deliveryModels = this.receiversDeliveryModels;
    this.printService._deliveryModels['All'] = this.overallDeliveryModel;

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
            for(let item of deliveryModel._deliveries){
              item.isPrinted = true;
              this.restService.update('delivery', item.id, DeliveryModel.toAnyObject(item, item.isPrinted, null)).subscribe(
                (data) => {
                  deliveryModel._isPrinted = deliveryModel._deliveries.map(d => d.isPrinted).reduce((a, b) => a && b);

                  counter++;
                  if(counter >= deliveryModel._deliveries.length)
                    doneAllItems.next(true);
                },
                (err) => {
                  item.isPrinted = false;
                  deliveryModel._isPrinted = false;
                  noFailure = false;

                  counter++;
                  if(counter >= deliveryModel._deliveries.length)
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
      if(!this.receiversDeliveryModels[rcv.name]._isPrinted && this.receiversDeliveryModels[rcv.name]._deliveries.length > 0)
        overallCanPrinted = false;
    }

    this.overallDeliveryModel._shouldDisabled = !overallCanPrinted;
  }

  getDeliveryData(){
    let dateParam = moment(this.selectedDate).format('YYYYMMDD');

    for(let rcv of this.receivers){
      rcv.warn = 'no';

      this.restService.get('delivery/' + dateParam + '/' + rcv.id).subscribe(
        (data) => {
          console.log(data);
          this.productsList[rcv.name] = [];

          this.receiversDeliveryModels[rcv.name] = new DeliveryModel(rcv.name);

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
              if(typeof item.stock !== 'number')
                rcv.warn = 'count';

              //this.receiversDeliveryModels[rcv.name]._isPrinted = item.isPrinted;

              let tempDelivery = new Delivery();
              tempDelivery.id = item.id;
              tempDelivery.productCode = item.productCode;
              tempDelivery.productName = item.productName;
              tempDelivery.realDelivery = item.realDelivery;
              tempDelivery.min = item.min;
              tempDelivery.max = item.max;
              tempDelivery.stock = item.stock;
              tempDelivery.isPrinted = item.isPrinted;
              if(item.stockDate === null)
                tempDelivery.stockDate = this.selectedDate;
              else
                tempDelivery.stockDate = moment(item.stockDete).toDate();
              tempDelivery.state = 'exist';

              this.receiversDeliveryModels[rcv.name].add(tempDelivery);

              //Update overall list
              this.updateOverallDelivery(item.productCode, tempDelivery, 'add', 'min', tempDelivery.min);
              this.updateOverallDelivery(item.productCode, tempDelivery, 'add', 'max', tempDelivery.max);
              this.updateOverallDelivery(item.productCode, tempDelivery, 'add', 'realDelivery', tempDelivery.realDelivery);
            }
          }

          if(this.receiversDeliveryModels[rcv.name]._deliveries.length > 0)
            this.receiversDeliveryModels[rcv.name]._isPrinted = this.receiversDeliveryModels[rcv.name]._deliveries.map(d => d.isPrinted)
                                                                                                    .reduce((a, b) => a && b);
          else{
            this.receiversDeliveryModels[rcv.name]._isSubmitted = true;
            rcv.warn = 'login';
          }

          //Sort data
          this.receiversDeliveryModels[rcv.name]._deliveries.sort((a, b) => {
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
          })
        },
        (err) => {
          console.log(err.message);
        }
      )
    }
  }
}
