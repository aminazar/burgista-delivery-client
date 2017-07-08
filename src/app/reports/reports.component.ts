import {Component, OnInit, isDevMode} from '@angular/core';
import {RestService} from '../rest.service';
import {ProductModel} from '../product-form/product.model';
let fileSaver = require('file-saver/FileSaver.min.js');
import {MessageService} from '../message.service';
import {UnitModel} from '../unit-form/unit.model';
import {Unit} from '../unit-form/unit';
import * as moment from 'moment';
import {sendRequest} from "selenium-webdriver/http";
// import {Product} from '../product-form/product';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  productModels: ProductModel[] = [];
  unitModels: UnitModel[] = [];
  branchesWithoutAllOption;
  branches = [];
  branchIdForProductReport = 0;
  branchIdForInventoryReport: number;
  branchIdForDeliveryReport = 0;
  startDate: Date;
  endDate: Date;
  deliveryReportBtnDisabled = true;
  inventoryReportBtnDisabled = true;
  constructor(private restService: RestService, private messageService: MessageService) {
  }

  ngOnInit() {
    this.restService.get('unit?isBranch=true').subscribe(
      (data) => {
        this.unitModels = [];

        for (let unitData of data) {

          let unit = new Unit();
          unit.id = unitData.uid;
          unit.name = unitData.name;
          unit.username = unitData.username;
          unit.password = '';
          unit.is_branch = unitData.is_branch;
          unit.is_kitchen = unitData.is_kitchen;

          let unitModel = new UnitModel(unit);

          this.unitModels.push(unitModel);
        }

        this.branches = this.unitModels.map(unit => {
          return unit._unit;
        });

        this.branchesWithoutAllOption = this.branches.map(item =>{
          return item;
        });

        // defining default branch
        let u = new Unit();
        u.id = 0;
        u.name = 'All';
        this.branches.push(u);
      },
      (error) => {
        this.messageService.error(error);
        if (isDevMode()) {
          console.log(error);
        }
      }
    );
  }

  loadDataForProductsReport () {
    let today = moment().format('YYYY-MM-DD');
    if (this.branchIdForProductReport === 0) { // no branch selected -> all products
      this.restService.get('reports/all_products/').subscribe(
        (data) => {
          this.downloadCSV(this.convertAllProductsToCSV(data), 'all-products-' + today + '.csv');
        },
        (err) => {
          console.log(err.message);
        }
      );
    } else { // a branch is selected
      this.restService.get('reports/products/' + this.branchIdForProductReport).subscribe(
        (data) => {
          let branch = this.branches.find(unit => {
            return unit.id === this.branchIdForProductReport;
          });
          let filename = branch.name + '-products-' + today + '.csv';
          this.downloadCSV(this.convertBranchProductsToCSV(data, branch), filename);
        },
        (err) => {
          console.error(err.message);
        }
      );
    }
  }

  prepareInventoryCountingReport() {
    if (!this.branchIdForInventoryReport) {
      alert('Please select a branch');
      return;
    }
    this.restService.get('reports/inventory_counting/' + this.branchIdForInventoryReport).subscribe(
      (data) => {
        console.log(data);
        let branch = this.branches.find(unit => {
          return unit.id === this.branchIdForInventoryReport;
        });
        let today = moment().format('YYYY-MM-DD');
        let filename = branch.name + '-inventory-counting-report-' + today + '.csv';
        this.downloadCSV(this.wrapInventoryCountingReportResults(data), filename);
      },
      (error) => {
        console.log(error);
      }
    );

  }

  wrapInventoryCountingReportResults(rows) {
    let keys = ['Product Name', 'Product Code', 'Last Counted', 'Inventory Count', 'Next Count Date',
      'Estimate Stock Availability', 'Branch Name'];
    let data = rows.map(r => {
      return {
        'Product Name': r.product_name,
        'Product Code': r.product_code,
        'Branch Name': r.branch_name,
        'Last Counted': moment(r.last_counted).format('ddd DD MMM YYYY'),
        'Inventory Count': r.product_count,
        'Next Count Date': moment(r.next_count_date).format('ddd DD MMM YYYY'),
        'Estimate Stock Availability': r.estimate
      };
    });
    console.log(data);
    return this.convertToCSV(keys, data);
  }

  checkDisabilityStatus() {
    if (this.startDate && this.endDate) {
      this.deliveryReportBtnDisabled = false;
    } else {
      this.deliveryReportBtnDisabled = true;
    }
    if (this.branchIdForInventoryReport) {
      this.inventoryReportBtnDisabled = false;
    } else {
      this.inventoryReportBtnDisabled = true;
    }
  }

  prepareDeliveryReport() {
    if (!this.startDate || !this.endDate) {
      alert('Please select a date range');
      return;
    }
    let start_date = moment(this.startDate).format('YYYY-MM-DD');
    let end_date = moment(this.endDate).format('YYYY-MM-DD');
    let url: string;
    if (this.branchIdForDeliveryReport === 0) { // no branch selected, query for all branches
        url = 'reports/delivery/' + start_date + '/' + end_date;
    } else {
        url = 'reports/branch_delivery/' + this.branchIdForDeliveryReport + '/' + start_date + '/' + end_date;
    }
    this.restService.get(url).subscribe(
      (data) => {
        this.downloadCSV(this.wrapDeliveryReportResults(data), 'delivery-report-' + start_date + '-' + end_date + '.csv');
      },
      (error) => {
        console.log(error);
      }
    );
  }

  wrapDeliveryReportResults(rows) {
    let keys = ['Product Name', 'Product Code', 'Delivered To', 'Date', 'Quantity', 'Product Price', 'Subtotal'];
    let data = rows.map(r => {
      return {
        'Product Name': r.product_name,
        'Product Code': r.product_code,
        'Delivered To': r.branch_name,
        'Date' : moment(r.counting_date).format('YYYY-MM-DD'),
        'Quantity': r.real_delivery,
        'Product Price': r.product_price ? '£' + r.product_price : '',
        'Subtotal': r.subtotal ? '£' + r.subtotal : 0,
      };
    });
    let total = rows.reduce((sum, r) => { // finding total
      return sum + (r.subtotal ? parseInt(r.subtotal, 10) : 0);
    }, 0);
    data.push({
      'Product Name': 'Total',
      'Subtotal': '£' + total
    });
    return this.convertToCSV(keys, data);
  }

  convertBranchProductsToCSV(products, branch) {
    // removing not related products
    products = products.filter(product => {
      return product.prep_unit_is_kitchen === branch.is_kitchen;
    });
    let keys = ['Product Id', 'Name', 'Code', 'Size', 'Measuring Unit', 'Price', 'Preparing Unit Name', 'Min Quantity', 'Max Quantity',
      'Usage', 'Is Overridden', 'Monday Coef.', 'Tuesday Coef.', 'Wednesday Coef.', 'Thursday Coef.', 'Friday Coef.', 'Friday Coef.',
      'Saturday Coef.', 'Sunday Coef.', 'Inventory Counting Recursion'];
    let data = products.map(p => {
      return {
        'Product Id': p.pid,
        'Name': p.name,
        'Code': p.code,
        'Size': p.size,
        'Measuring Unit': p.measuring_unit,
        'Price': p.price ? '£' + p.price.substring(1) : '',
        'Preparing Unit Name': p.prep_unit_name,
        'Min Quantity': p.default_min,
        'Max Quantity': p.default_max,
        'Is Overridden': typeof p.isOverridden !== 'undefined' ? p.isOverridden : false,
        'Inventory Counting Recursion': p.recursion,
        'Usage': p.default_usage,
        'Monday Coef.': p.default_mon_multiple,
        'Tuesday Coef.': p.default_tue_multiple,
        'Wednesday Coef.': p.default_wed_multiple,
        'Thursday Coef.': p.default_thu_multiple,
        'Friday Coef.': p.default_fri_multiple,
        'Saturday Coef.': p.default_sat_multiple,
        'Sunday Coef.': p.default_sun_multiple,
      };
    });

    return this.convertToCSV(keys, data);

  }

  convertAllProductsToCSV(products) {
    let keys = ['Product Id', 'Name', 'Code', 'Size', 'Measuring Unit', 'Price', 'Preparing Unit Name', 'Min Quantity', 'Max Quantity',
      'Usage', 'Monday Coef.', 'Tuesday Coef.', 'Wednesday Coef.', 'Thursday Coef.', 'Friday Coef.', 'Friday Coef.',
      'Saturday Coef.', 'Sunday Coef.', 'Inventory Counting Recursion'];
    let data = products.map(p => {
      return {
        'Product Id': p.pid,
        'Name': p.name,
        'Code': p.code,
        'Size': p.size,
        'Measuring Unit': p.measuring_unit,
        'Price': p.price ? '£' + p.price.substring(1) : '',
        'Preparing Unit Name': p.prep_unit_name,
        'Min Quantity': p.default_min,
        'Max Quantity': p.default_max,
        'Usage': p.default_usage,
        'Monday Coef.': p.default_mon_multiple,
        'Tuesday Coef.': p.default_tue_multiple,
        'Wednesday Coef.': p.default_wed_multiple,
        'Thursday Coef.': p.default_thu_multiple,
        'Friday Coef.': p.default_fri_multiple,
        'Saturday Coef.': p.default_sat_multiple,
        'Sunday Coef.': p.default_sun_multiple,
        'Inventory Counting Recursion': p.recursion,
      };
    });
    return this.convertToCSV(keys, data);
  }

  convertToCSV(keys, data) {
    let result, ctr, columnDelimiter, lineDelimiter;

    columnDelimiter = ',';
    lineDelimiter = '\n';

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function (item) {
      ctr = 0;
      keys.forEach(function (key) {
        if (ctr > 0) {
          result += columnDelimiter;
        }

        result += typeof item[key] !== 'undefined' ? item[key] : '';
        ctr++;
      });
      result += lineDelimiter;
    });

    return result;
  }

  downloadCSV(data, filename) {
    if (typeof data === 'undefined') {
      console.error('no data set for creating file');
      return;
    }
    let blob = new Blob([data], {type: 'text/csv;charset=utf-8'});
    fileSaver.saveAs(blob, filename);
  }
}
