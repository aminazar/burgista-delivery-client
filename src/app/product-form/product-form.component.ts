import {Component, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {FormControl} from "@angular/forms";

import {Product} from "./product";
import {ProductModel} from "./product.model";
import {ActionEnum} from "../unit-form/actionEnum";
import {RestService} from "../rest.service";
import {isUndefined} from "util";

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  // isAdding: boolean = false;
  isAdding: BehaviorSubject<boolean> = new BehaviorSubject(false);
  actionIsSuccess: BehaviorSubject<boolean> = new BehaviorSubject(false);
  productModels: ProductModel[] = [];
  filteredProductModel: ProductModel;
  filteredNameCode: any;
  isFiltered: boolean = false;
  productModelCtrl: FormControl;
  productName_Code: string[] = [];
  productNames: string[] = [];
  productCodes: string[] = [];

  @ViewChild('autoNameCode') autoNameCode;

  constructor(private restService: RestService) { }

  ngOnInit() {
    this.restService.get('product').subscribe(
      (data) => {
        this.productModels = [];

        for(let productObj of data){
          let tempProduct = ProductModel.fromAnyObject(productObj);

          let tempProductModel = new ProductModel(tempProduct);

          this.productModels.push(tempProductModel);

          // this.productName_Code.unshift(tempProduct.name);
          // this.productName_Code.push(tempProduct.code);

          if(!this.productNames.find((n) => n === tempProduct.name))
            this.productNames.push(tempProduct.name);

          if(!this.productCodes.find((c) => c === tempProduct.code))
            this.productCodes.push(tempProduct.code);
        }

        this.productNames.sort();
        this.productCodes.sort();

        this.productName_Code = [];
        this.productName_Code = this.productName_Code.concat(this.productNames);
        this.productName_Code = this.productName_Code.concat(this.productCodes);
        // this.sortProductModelList();

      },
      (err) => {
        console.log(err.message);
      }
    );

    this.productModelCtrl = new FormControl();
    this.filteredNameCode = this.productModelCtrl.valueChanges
      .startWith(null)
      .map((name_code) => this.filterProducts(name_code));

    this.filteredNameCode.subscribe(
      (data) => {
        if(data.length === 1){
          this.filteredProductModel = this.getProduct(data);
          this.isFiltered = true;
        }
        else
          this.isFiltered = false;
      },
      (err) => {
        console.log(err.message);
      }
    )
  }

  doClickedAction(value){
    let clickType : ActionEnum = value.type;
    let clickData : Product = value.data;

    //Disable respective button
    this.disableEnable(clickData.id, clickType, true);

    //Do update, delete or add
    switch (clickType){
      case ActionEnum.add: this.addProduct(clickData);
        break;
      case ActionEnum.delete: this.deleteProduct(clickData.id);
        break;
      case ActionEnum.update: this.updateProduct(clickData.id, clickData);
        break;
    }
  }

  private addProduct(product: Product){
    this.restService.insert('product', ProductModel.toAnyObject(product)).subscribe(
      (data) => {
        //Adding new product to productModels list
        product.id = data;
        let tempProductModel = new ProductModel(product);

        this.actionIsSuccess.next(true);

        this.productModels.push(tempProductModel);
        this.productName_Code.push(tempProductModel._product.name);
        this.productName_Code.push(tempProductModel._product.code);

        //Sort productModels
        // this.sortProductModelList();

        this.disableEnable(product.id, ActionEnum.add, false);

        this.actionIsSuccess.next(false);
        //ToDo: adding prop message
      },
      (error) => {
        console.log(error);

        this.disableEnable(product.id, ActionEnum.add, false);
        //ToDo: adding prop message
      }
    );
  }

  private deleteProduct(productId: number){
    this.restService.delete('product', productId).subscribe(
      (data) => {
        //Deleting this product from productModels list
        let deletedProductModel = this.productModels.filter(function (element) {
          return element._product.id === productId;
        });

        this.productModels = this.productModels.filter(function (elemenet) {
          return elemenet._product.id !== productId;
        });

        //Delete name and code from productNames, productCodes and productName_Code lists
        this.productNames = this.productNames.filter((el) => {
          return el !== deletedProductModel[0]._product.name;
        });

        this.productCodes = this.productCodes.filter((el) => {
          return el !== deletedProductModel[0]._product.code;
        });

        this.productName_Code = [];
        this.productName_Code = this.productName_Code.concat(this.productNames);
        this.productName_Code = this.productName_Code.concat(this.productCodes);

        this.isFiltered = false;
        this.filteredProductModel = null;
        this.productModelCtrl.setValue('');

        //ToDo: adding prop message
      },
      (error) => {
        console.log(error);

        this.disableEnable(productId, ActionEnum.delete, false);
        //ToDo: adding prop message
      }
    );
  }

  private updateProduct(productId: number, product: Product){
    let index : number = this.productModels.findIndex(function (element) {
      return element._product.id == productId;
    });
    let lastCode: string = this.productModels[index]._product.code;
    let lastName: string = this.productModels[index]._product.name;

    this.restService.update('product', productId, ProductModel.toAnyObject(this.productModels[index].getDifferentValues(product))).subscribe(
      (data) => {
        this.actionIsSuccess.next(true);

        //Update this product in productModels list
        this.productModels[index].setProduct(product);

        //Sort productModels
        // this.sortProductModelList();

        //Update name and code from productNames, productCodes and productName_Code lists
        let tempNameIndex = this.productNames.findIndex((el) => el === lastName);
        this.productNames[tempNameIndex] = product.name;
        let tempCodeIndex = this.productCodes.findIndex((el) => el === lastCode);
        this.productCodes[tempCodeIndex] = product.code;

        this.productName_Code = [];
        this.productNames.sort();
        this.productCodes.sort();
        this.productName_Code = this.productName_Code.concat(this.productNames);
        this.productName_Code = this.productName_Code.concat(this.productCodes);


        this.disableEnable(productId, ActionEnum.update, false);
        //ToDo: adding prop message

        this.actionIsSuccess.next(false);
      },
      (error) => {
        console.log(error);

        this.disableEnable(productId, ActionEnum.update, false);
        //ToDo: adding prop message
      }
    )
  }

  private disableEnable(productId: number, btnType : ActionEnum, isDisable: boolean){
    let tempProductModel : ProductModel = this.productModels.find(function (element) {
      return element._product.id == productId;
    });

    let tempWaitingObj;

    if(btnType !== ActionEnum.add)
      tempWaitingObj = tempProductModel.waiting.getValue();

    switch (btnType){
      case ActionEnum.update: tempWaitingObj.updating = isDisable;
        break;
      case ActionEnum.delete: tempWaitingObj.deleting = isDisable;
        break;
      case ActionEnum.add: this.isAdding.next(isDisable);
        break;
    }

    if(btnType !== ActionEnum.add)
      tempProductModel.waiting.next(tempWaitingObj);
  }

  // sortProductModelList(){
  //   this.productModels.sort(function(a, b){
  //     if(a._product.name > b._product.name)
  //       return 1;
  //     else if(a._product.name < b._product.name)
  //       return -1;
  //     else{
  //       if(a._product.code > b._product.code)
  //         return 1;
  //       else if(a._product.code < b._product.code)
  //         return -1;
  //       else
  //         return 0;
  //     }
  //   });
  // }

  filterProducts(val: string) {
    return val ? this.productName_Code.filter((p) => new RegExp(val, 'gi').test(p)) : this.productName_Code;
  }

  getProduct(nameCode: string){
    let tempProductModel: ProductModel[] = null;

    tempProductModel = this.productModels.filter((p) => {
      return p._product.name == nameCode;
    });

    console.log(tempProductModel);

    if(tempProductModel !== null && tempProductModel.length !== 0)
      return tempProductModel[0];

    return this.productModels.filter((p) => {
      return p._product.code == nameCode;
    })[0];
  }
}
