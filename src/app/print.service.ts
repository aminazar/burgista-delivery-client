/**
 * Created by Ali on 3/8/2017.
 */
import {Injectable, AfterViewInit} from "@angular/core";
import {WindowRef} from './WindowRef';
import {MessageService} from "./message.service";
import * as moment from 'moment';

@Injectable()
export class PrintService {
  _unitSupplier: string = '';
  _unitConsumer: string = '';
  _isOverallPrint: boolean = false;
  _receivers: string[] = [];
  _deliveryModels: any = {};
  _showWarningMessage: boolean = true;
  currentDate: Date = new Date();
  _window: any;

  constructor(private messageService: MessageService, private winRef: WindowRef) {
    this._window = winRef.nativeWindow;
  }

  getItems(): any[] {
    if (this._isOverallPrint)
      return this.overallItems();
    else
      return this.eachUnitItems();
  }

  private eachUnitItems(): any[] {
    let result: any[] = [];
    let counter: number = 0;

    for (let item of this._deliveryModels[this._unitConsumer].deliveries) {
      counter++;

      let obj = {};

      obj['productCode'] = item.productCode;
      obj['productName'] = item.productName;
      obj['realDelivery'] = item.realDelivery;
      obj['currentStock'] = item.stock;
      obj['stockAfterDelivery'] = item.realDelivery + item.stock;
      obj['minDelivery'] = item.minDelivery;
      obj['daysToNext'] = item.untilNextCountingDay;

      result.push(obj);
    }
    return result;
  }

  private overallItems(): any[] {
    let result: any[] = [];
    let counter: number = 0;

    for (let item of this._deliveryModels['All'].deliveries) {
      counter++;
      let obj:any = {};

      obj['productCode'] = item.productCode;
      obj['productName'] = item.productName;

      let totalDelivery = 0;
      let totalStockSurplusDeficit = 0;
      let totalMinDelivery = 0;

      for (let rcvName of this._receivers) {
        let tempProduct = this._deliveryModels[rcvName].deliveries.find((el) => {
          return el.productCode.toLowerCase() === item.productCode.toLowerCase();
        });

        if (tempProduct === undefined)
          obj[rcvName] = '-';
        else {
          obj[rcvName] = tempProduct.realDelivery;
          totalDelivery += tempProduct.realDelivery;
          totalMinDelivery += tempProduct.minDelivery;
          totalStockSurplusDeficit += (tempProduct.realDelivery - tempProduct.minDelivery);
        }
      }

      obj['totalDelivery'] = totalDelivery;
      obj['totalMinDelivery'] = totalMinDelivery;

      result.push(obj);
    }

    return result;
  }

  printData() {
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

    if (this._isOverallPrint) {
      contentTable = `<table class="table">
                      <thead>
                      <tr>
                      <th>#</th>
                      <th>Product Code</th>
                      <th>Product Name</th>
                      <th>Total Delivery</th>
                      <th>Total Min Delivery</th>`;

      for (let rcvName of this._receivers) {
        contentTable += '<th>' + rcvName + '</th>';
      }

      contentTable += `
        </tr>
        </thead>
        <tbody class="data">`;
    }
    else {
      contentTable = `<table class="table">
        <thead>
        <tr>
        <th>#</th>
        <th>Product Code</th>
        <th>Product Name</th>
        <th>Real Delivery</th>
        <th>Current Stock</th>
        <th>Stock After Delivery</th>
        <th>Min Delivery</th>
        <th>Days to Next Count</th>
        </tr>
        </thead>
        <tbody class="data">`;
    }

    let innerContentTable = '';
    let rowNum = 0;
    if (this._isOverallPrint) {
      for (let item of this.getItems()) {
        rowNum++;
        const cl = rowNum % 2 ? '' : ' class="highlight"';
        innerContentTable += `
<tr>
  <td${cl}>${rowNum}</td>
  <td${cl}>${item.productCode}</td>
  <td${cl} style="min-width: 250px">${item.productName}</td>
  <td${cl}>${item.totalDelivery}</td>
  <td${cl}>${item.totalMinDelivery}</td>`;
        for (let rcvName of this._receivers)
          innerContentTable += `
  <td${cl}>${item[rcvName]}</td>`;

        innerContentTable += `
</tr>`;
      }
    } else {
      for (let item of this.getItems()) {
        rowNum++;
        const cl = rowNum % 2 ? '' : ' class="highlight"';

        innerContentTable += `
<tr>
  <td${cl}>${rowNum}</td>
  <td${cl}>${item.productCode}</td>
  <td${cl} style="min-width: 250px">${item.productName}</td>
  <td${cl}>${item.realDelivery}</td>
  <td${cl}>${item.currentStock === null ? 'N/A' : item.currentStock}</td>
  <td${cl}>${item.currentStock === null ? 'N/A' : item.stockAfterDelivery}</td>
  <td${cl}>${item.minDelivery === null ? 'N/A' : item.minDelivery}</td>
  <td${cl}>${item.daysToNext === null ? 'N/A' : item.daysToNext}</td>
</tr>`;
      }
    }

    contentTable += innerContentTable
      + '</tbody>'
      + '</table>';

    printContents += '<div>' + header + '</div>';
    printContents += '<div>' + contentTable + '</div>';

    let popup = this._window.open('', '_blank',
      'width=1000,height=600,scrollbars=no,menubar=no,toolbar=no,'
      + 'location=no,status=no,titlebar=no');
    if (!popup) {
      this.messageService.warn('Print pop-up is blocked by browser. Enable pop-ups from this page.')
    }
    else {
      popup.window.focus();
      popup.document.write('<!DOCTYPE><html><head>'
        + '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"  media="screen, print" />'
        + '<style type="text/css" media="print, screen">'
        + '@page{margin: 2mm;  /* this affects the margin in the printer settings */} html{color: black;margin: 5px;  /* this affects the margin on the html before sending to printer */} body{margin: 2mm 5mm 2mm 5mm; /* margin you want for the content */-webkit-print-color-adjust: exact;} .title{font-size: 1.5em;font-weight: normal;}.subtitle{font-size: 2em}.highlight{background-color: #eeeeee !important;}.normal{background-color: white !important;}.table .highlight{background-color: #eeeeee !important;}table{font-size:75%}td{padding:2px !important;}.data td{border:1px solid #adadad !important;}'
        + '</style>'
        + '</head><body onload="window.print()"><div class="container">'
        + printContents + '</div></body></html>');

      popup.document.close();
    }
  }

  private

  getMonthName(monthNo
                 :
                 number
  ) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return months[monthNo + 1];
  }
}
