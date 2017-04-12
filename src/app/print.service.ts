/**
 * Created by Ali on 3/8/2017.
 */
import {Injectable, AfterViewInit} from "@angular/core";
import { WindowRef } from './WindowRef';
import {MessageService} from "./message.service";
import * as moment from 'moment';

@Injectable()
export class PrintService{
  _unitSupplier: string = '';
  _unitConsumer: string = '';
  _isOverallPrint: boolean = false;
  _receivers: string[] = [];
  _deliveryModels: any = {};
  _showWarningMessage: boolean = true;
  currentDate: Date = new Date();
  _window:any;

  constructor(private messageService:MessageService, private winRef: WindowRef) {
    this._window = winRef.nativeWindow;
  }

  getItems(): any[]{
    if(this._isOverallPrint)
      return this.overallItems();
    else
      return this.eachUnitItems();
  }

  private eachUnitItems(): any[]{
    let result: any[] = [];
    let counter: number = 0;

    for(let item of this._deliveryModels[this._unitConsumer]._deliveries){
      counter++;

      let obj = {};

      obj['rowNum'] = counter;
      obj['productCode'] = item.productCode;
      obj['productName'] = item.productName;
      obj['realDelivery'] = item.realDelivery;
      obj['currentStock'] = item.stock;
      obj['stockAfterDelivery'] = item.realDelivery + item.stock;
      obj['stockSurplusDeficit'] = item.realDelivery - item.minDelivery;

      result.push(obj);
    }

    console.log('Counter:' + counter);
    console.log('Result:' + result);
    return result;
  }

  private overallItems(): any[]{
    let result: any[] = [];
    let counter: number = 0;

    for(let item of this._deliveryModels['All']._deliveries){
      counter++;
      let obj = {};

      obj['rowNum'] = counter;
      obj['productCode'] = item.productCode;
      obj['productName'] = item.productName;

      let totalDelivery = 0;
      let totalStockSurplusDeficit = 0;

      for(let rcvName of this._receivers){
        let tempProduct = this._deliveryModels[rcvName]._deliveries.find((el) => {
          return el.productCode.toLowerCase() === item.productCode.toLowerCase();
        });

        if(tempProduct === undefined)
          obj[rcvName] = '-';
        else {
          obj[rcvName] = tempProduct.realDelivery;
          totalDelivery += tempProduct.realDelivery;
          totalStockSurplusDeficit += (tempProduct.realDelivery - tempProduct.minDelivery);
        }
      }

      obj['totalDelivery'] = totalDelivery;
      obj['totalStockSurplusDeficit'] = totalStockSurplusDeficit;

      result.push(obj);
    }

    return result;
  }

  printData(){
    let printContents: string = '';

    //Set Title
    let dateFormatted = moment(this.currentDate).format('ddd D MMM YYYY');
    let header = `<table width="100%">
                  <tr>
                  <td width="70%" style="float: left; text-align: left; vertical-align: top"><label class="title">Burgista Bros - ${this._unitSupplier}</label></td>
                  <td width="30%" style="float: right; text-align: right; vertical-align: top"><label class="title">${dateFormatted}</label></td>
                  </tr>
                  <tr>
                  <td style="float: left; text-align: left"><label class="subtitle">${this._unitConsumer} Delivery Note</label></td>
                  </tr>
                  </table>`;

    let contentTable = '';

    if(this._isOverallPrint){
      contentTable = `<table class="table">
                      <thead>
                      <tr>
                      <td>#</td>
                      <td>Product Code</td>
                      <td>Product Name</td>
                      <td>Total Delivery</td>`;

      for(let rcvName of this._receivers){
        contentTable += '<td>' + rcvName + '</td>';
      }

      contentTable += '<td>Total Stock surplus/deficit</td>'
                   + '</tr>'
                   + '</thead>'
                   + '<tbody>';
    }
    else{
      contentTable = '<table class="table">'
                   + '<thead>'
                   + '<tr>'
                   + '<td>#</td>'
                   + '<td>Product Code</td>'
                   + '<td>Product Name</td>'
                   + '<td>Real Delivery</td>'
                   + '<td>Current Stock</td>'
                   + '<td>Stock After Delivery</td>'
                   + '<td>Stock surplus/deficit</td>'
                   + '</tr>'
                   + '</thead>'
                   + '<tbody>';
    }



    let innerContentTable = '';

    if(this._isOverallPrint){
      for(let item of this.getItems()){
        if(item.rowNum % 2 == 1){
          innerContentTable += '<tr>'
                            + '<td>' + item.rowNum + '</td>'
                            + '<td>' + item.productCode + '</td>'
                            + '<td>' + item.productName + '</td>'
                            + '<td>' + item.totalDelivery + '</td>';

          for(let rcvName of this._receivers)
            innerContentTable += '<td>' + item[rcvName] + '</td>';

          innerContentTable += '<td>' + item.totalStockSurplusDeficit + '</td>'
                            + '</tr>';
        }
        else{
          innerContentTable += '<tr>'
                            + '<td class="highlight">' + item.rowNum + '</td>'
                            + '<td class="highlight">' + item.productCode + '</td>'
                            + '<td class="highlight">' + item.productName + '</td>'
                            + '<td class="highlight">' + item.totalDelivery + '</td>';

          for(let rcvName of this._receivers)
            innerContentTable += '<td class="highlight">' + item[rcvName] + '</td>';

          innerContentTable += '<td class="highlight">' + item.totalStockSurplusDeficit + '</td>'
                            + '</tr>';
        }
      }
    }
    else{
      for(let item of this.getItems()){
        if(item.rowNum % 2 == 1){
          innerContentTable += `<tr>
                                <td>${item.rowNum}</td>
                                <td>${item.productCode}</td>
                                <td>${item.productName}</td>
                                <td>${item.realDelivery}</td>
                                <td>${item.currentStock === null ? 'N/A' : item.currentStock}</td>
                                <td>${item.currentStock === null ? 'N/A' :item.stockAfterDelivery}</td>
                                <td>${item.currentStock === null ? 'N/A' :item.stockSurplusDeficit}</td>
                                </tr>`;
        }
        else {
          innerContentTable += `<tr>
                                <td class="highlight">${item.rowNum}</td>
                                <td class="highlight">${item.productCode}</td>
                                <td class="highlight">${item.productName}</td>
                                <td class="highlight">${item.realDelivery}</td>
                                <td class="highlight">${item.currentStock === null ? 'N/A' : item.currentStock}</td>
                                <td class="highlight">${item.currentStock === null ? 'N/A' :item.stockAfterDelivery}</td>
                                <td class="highlight">${item.currentStock === null ? 'N/A' :item.stockSurplusDeficit}</td>
                                </tr>`;
        }
      }
    }

    contentTable += innerContentTable
                  + '</tbody>'
                  + '</table>';

    printContents += '<div>' + header + '</div>';
    printContents += '<div>' + contentTable + '</div>';

    let popup = this._window.open('', '_blank',
      'width=1000,height=600,scrollbars=no,menubar=no,toolbar=no,'
      +'location=no,status=no,titlebar=no');
    if(!popup) {
      this.messageService.warn('Print pop-up is blocked by browser. Enable pop-ups from this page.')
    }
    else {
      popup.window.focus();
      popup.document.write('<!DOCTYPE><html><head>'
        + '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"  media="screen, print" />'
        + '<style type="text/css" media="print, screen">'
        + '@page{margin: 2mm;  /* this affects the margin in the printer settings */} html{color: black;margin: 5px;  /* this affects the margin on the html before sending to printer */} body{margin: 2mm 5mm 2mm 5mm; /* margin you want for the content */-webkit-print-color-adjust: exact;} .title{font-size: 2em;font-weight: normal;}.subtitle{font-size: 2em;font-weight: bold;}.highlight{background-color: #adadad !important;}.normal{background-color: white !important;}.table .highlight{background-color: #adadad !important;}'
        + '</style>'
        + '</head><body onload="window.print()"><div class="container">'
        + printContents + '</div></body></html>');

      popup.document.close();
    }
  }

  private getMonthName(monthNo: number){
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return months[monthNo + 1];
  }
}
