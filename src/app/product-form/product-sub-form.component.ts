import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Observable} from "rxjs";
import {Product} from "./product";
import {ProductModel} from "./product.model";
import {ActionEnum} from "../unit-form/actionEnum";
import {RestService} from "../rest.service";
import {MessageService} from "../message.service";

@Component({
  selector: 'app-product-sub-form',
  templateUrl: './product-sub-form.component.html',
  styleUrls: ['./product-sub-form.component.css']
})
export class ProductSubFormComponent implements OnInit {
  @Input() isAdd: boolean = true;
  @Input() isAdding: Observable<boolean>;
  @Input() actionIsSuccess: Observable<boolean>;
  @Input() //productModel: ProductModel;
  set productModel(val: ProductModel){
    this.tempProductModel = val;
    this.ngOnInit();
  }
  get productModel(): ProductModel {
    return this.tempProductModel;
  }
  @Output() action = new EventEmitter();


  tempProductModel: ProductModel;
  hasCountingRuleError: boolean = false;
  countingRuleError: string = '';
  _isAdding: boolean;
  _isUpdating: boolean;
  _isDeleting: boolean;
  formTitle: string = '';
  product: Product;
  ae = ActionEnum;
  addIsDisable: boolean = false;
  updateIsDisable: boolean = false;
  deleteIsDisable: boolean = false;
  measuringUnits = ['Kg', 'gr', 'L', 'lb', 'oz', 'fl oz', 'mL', 'units', 'packs', 'dozens', 'barrels'];
  prepUnits = [];

  constructor(private restService: RestService, private messageService: MessageService) {
  }

  ngOnInit() {
    this.product = new Product();

    this.restService.get('unit?isBranch=false').subscribe(
      (data) => {
        this.prepUnits = [];

        for (let unit of data) {
          let tempObj = {
            id: unit.uid,
            name: unit.name
          };

          this.prepUnits.push(tempObj);
        }
      },
      (err) => {
        console.log(err);
      }
    );

    this.actionIsSuccess.subscribe(
      (data) => {
        if (data === true) {
          if (this.isAdd === true) {
            this.product.id = -1;
            this.product.name = '';
            this.product.code = '';
            this.product.size = null;
            this.product.measuringUnit = null;
            this.product.prep_unit_id = null;
            this.product.minQty = -12345678;
            this.product.maxQty = null;
            this.product.price = null;

            for (let day in this.product.coefficients) {
              this.product.coefficients[day] = 1;
            }

            this.product.countingRecursion = '';
          }

          this.disabilityStatus();
        }
      },
      (err) => {
        console.log(err.message);
      }
    );

    if (this.isAdd) {
      this.isAdding.subscribe(
        (data) => {
          this._isAdding = data;

          this.disabilityStatus();
        },
        (err) => {
          console.log(err.message);
        }
      );

      this.formTitle = 'New Product';

      this.product.id = -1;
      this.product.name = '';
      this.product.code = '';
      this.product.size = null;
      this.product.measuringUnit = null;
      this.product.prep_unit_id = null;
      this.product.countingRecursion = '';
      this.product.minQty = null;
      this.product.maxQty = null;
      this.product.price = null;

      for (let day in this.product.coefficients) {
        this.product.coefficients[day] = 1;
      }
    } else {
      this.productModel.waiting.subscribe(
        (data) => {
          this._isUpdating = data.updating;
          this._isDeleting = data.deleting;

          this.disabilityStatus();
        },
        (err) => {
          console.log(err.message);
        }
      );

      this.product.id = this.tempProductModel._product.id;
      this.product.name = this.tempProductModel._product.name;
      this.product.code = this.tempProductModel._product.code;
      this.product.size = this.tempProductModel._product.size;
      this.product.measuringUnit = this.tempProductModel._product.measuringUnit;
      this.product.prep_unit_id = this.tempProductModel._product.prep_unit_id;
      this.product.maxQty = this.tempProductModel._product.maxQty;
      this.product.minQty = this.tempProductModel._product.minQty;
      this.product.price = this.tempProductModel._product.price;

      for (let day in this.tempProductModel._product.coefficients) {
        this.product.coefficients[day] = this.tempProductModel._product.coefficients[day];
      }

      this.product.countingRecursion = this.tempProductModel._product.countingRecursion;

      this.formTitle = this.product.name;
    }

    this.disabilityStatus();
  }

  actionEmitter(clickType) {
    let value = {
      type: clickType,
      data: this.product
    };
    this.action.emit(value);
  }

  disabilityStatus() {
    if (this.isAdd)
      this.addIsDisable = this.shouldDisableAddBtn();
    else {
      this.deleteIsDisable = this.shouldDisableDeleteBtn();
      this.updateIsDisable = this.shouldDisableUpdateBtn();
    }
  }

  isCorrectFormData() {
    for (let day in this.product.coefficients) {
      if (this.product.coefficients[day] < 0)
        this.product.coefficients[day] = 1;

      if (this.product.coefficients[day] > 99999)
        this.product.coefficients[day] = 99999;

      if (this.product.coefficients[day] === 0 || this.product.coefficients[day] === null)
        return false;
    }

    //Set limitation to numerical inputs
    if (this.product.size < 0)
      this.product.size = 1;

    if (this.product.size > 99999)
      this.product.size = 99999;

    if (this.product.name !== ''
      && this.product.code !== ''
      && this.product.size !== null && this.product.size !== 0
      && this.product.measuringUnit !== null
      && this.product.prep_unit_id !== null
      && !this.hasCountingRuleError)
      return true;
    else
      return false;
  }

  shouldDisableAddBtn(): boolean {
    if (this._isAdding === true)
      return true;
    else
      return !this.isCorrectFormData();
  }

  shouldDisableUpdateBtn(): boolean {
    if (this._isUpdating === true) {
      return true;
    } else {
      if (this.productModel.isDifferent(this.product) === true) {
        return !this.isCorrectFormData();
      } else {
        return true;
      }
    }
  }

  shouldDisableDeleteBtn(): boolean {
    if (this._isDeleting === true)
      return true;
    else
      return false;
  }

  countingRuleErrorHandler(message) {
    if (message) {
      this.messageService.warn(message);
      this.hasCountingRuleError = true;
    }
    else
      this.hasCountingRuleError = false;
    this.disabilityStatus();
  }

}
