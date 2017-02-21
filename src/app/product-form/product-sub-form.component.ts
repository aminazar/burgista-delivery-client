import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Observable} from "rxjs";

import {Product} from "./product";
import {ProductModel} from "./product.model";
import {ActionEnum} from "../unit-form/actionEnum";
import {RestService} from "../rest.service";

@Component({
  selector: 'app-product-sub-form',
  templateUrl: './product-sub-form.component.html',
  styleUrls: ['./product-sub-form.component.css']
})
export class ProductSubFormComponent implements OnInit {
  @Input() isAdd: boolean = true;
  @Input() isAdding: boolean = false;
  @Input() productModel : ProductModel;
  @Input() actionIsSuccess: Observable<boolean>;
  @Output() action = new EventEmitter();

  formTitle: string = '';
  product: Product;
  ae = ActionEnum;
  addIsDisable: boolean = false;
  updateIsDisable: boolean = false;
  deleteIsDisable: boolean = false;
  measuringUnits = ['Kg', 'Liter'];
  prepUnits = [];
  days = ['Monday', 'Sunday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Usage'];

  constructor(private restService: RestService) { }

  ngOnInit() {
    this.restService.get('unit?isBranch=false').subscribe(
      (data) => {
        this.prepUnits = [];

        for(let unit of data){
          // if(unit.name === 'admin')
          //   continue;

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
        if(data === true){
          if(this.isAdd === true){
            this.product.id = -1;
            this.product.name = '';
            this.product.code = '';
            this.product.size = null;
            this.product.measuringUnit = null;
            this.product.prep_unit_id = null;
            this.product.countingRecursion = '';
          }
        }
      },
      (err) => {
        console.log(err.message);
      }
    );

    this.product = new Product();

    if(this.isAdd){
      this.formTitle = 'New Product';

      this.product.id = -1;
      this.product.name = '';
      this.product.code = '';
      this.product.size = null;
      this.product.measuringUnit = null;
      this.product.prep_unit_id = null;
      this.product.countingRecursion = '';
    }
    else{
      this.formTitle = this.productModel._product.name;

      this.product.id = this.productModel._product.id;
      this.product.name = this.productModel._product.name;
      this.product.code = this.productModel._product.code;
      this.product.size = this.productModel._product.size;
      this.product.measuringUnit = this.productModel._product.measuringUnit;
      this.product.prep_unit_id = this.productModel._product.prep_unit_id;
      this.product.maxQty = this.productModel._product.maxQty;
      this.product.minQty = this.productModel._product.minQty;

      //Copy coefficients
      for(let day in this.productModel._product.coefficients){
        this.product.coefficients[day] = this.productModel._product.coefficients[day];
      }
      // this.product.coefficients = this.productModel._product.coefficients;
      this.product.countingRecursion = this.productModel._product.countingRecursion;
    }

    this.disabilityStatus();
  }

  actionEmitter(clickType){
    let value = {
      type : clickType,
      data : this.product
    };
    this.action.emit(value);
  }

  disabilityStatus(){
    if(this.isAdd)
      this.addIsDisable = this.shouldDisableAddBtn();
    else{
      this.deleteIsDisable = this.shouldDisableDeleteBtn();
      this.updateIsDisable = this.shouldDisableUpdateBtn();
    }
  }

  isCorrectFormData(){
    for(let day in this.product.coefficients){
      if(this.product.coefficients[day] === 0 || this.product.coefficients[day] === null)
        return false;
    }

    if(this.product.name !== ''
    && this.product.code !== ''
    && this.product.size !== null && this.product.size !== 0
    && this.product.measuringUnit !== null
    && this.product.prep_unit_id !== null
    && this.product.minQty !== null && this.product.minQty !== 0
    && this.product.maxQty !== null && this.product.maxQty !== 0 && this.product.maxQty >= this.product.maxQty
    && this.product.countingRecursion !== null && this.product.countingRecursion !== '')
      return true;
    else
      return false;
  }

  shouldDisableAddBtn() : boolean{
    if(this.isAdding === true)
      return true;
    else
      return !this.isCorrectFormData();
  }

  shouldDisableUpdateBtn() : boolean{
    if(this.productModel.waiting.updating === true)
      return true;
    else{
      if(this.productModel.isDifferent(this.product) === true)
        return !this.isCorrectFormData();
      else
        return true;
    }
  }

  shouldDisableDeleteBtn() : boolean{
    if(this.productModel.waiting.deleting === true)
      return true;
    else
      return false;
  }

}
