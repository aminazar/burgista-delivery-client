import { Component, OnInit } from '@angular/core';
import {BehaviorSubject} from "rxjs";

import {Product} from "./product";
import {ProductModel} from "./product.model";
import {ActionEnum} from "../unit-form/actionEnum";
import {RestService} from "../rest.service";

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  isAdding: boolean = false;
  actionIsSuccess: BehaviorSubject<boolean> = new BehaviorSubject(false);
  productModels: ProductModel[] = [];

  constructor(private restService: RestService) { }

  ngOnInit() {
    this.restService.get('product').subscribe(
      (data) => {
        this.productModels = [];

        for(let productObj of data){
          let tempProduct = ProductModel.fromAnyObject(productObj);

          let tempProductModel = new ProductModel(tempProduct);

          this.productModels.push(tempProductModel);
        }

        this.sortProductModelList();

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

        //Sort productModels
        this.sortProductModelList();

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
        this.productModels = this.productModels.filter(function (elemenet) {
          return elemenet._product.id !== productId;
        });

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

    this.restService.update('product', productId, ProductModel.toAnyObject(this.productModels[index].getDifferentValues(product))).subscribe(
      (data) => {
        this.actionIsSuccess.next(true);

        //Update this product in productModels list
        this.productModels[index].setProduct(product);

        //Sort productModels
        this.sortProductModelList();

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

    switch (btnType){
      case ActionEnum.update: tempProductModel.waiting.updating = isDisable;
        break;
      case ActionEnum.delete: tempProductModel.waiting.deleting = isDisable;
        break;
      case ActionEnum.add: this.isAdding = isDisable;
        break;
    }
  }

  sortProductModelList(){
    this.productModels.sort(function(a, b){
      if(a._product.name > b._product.name)
        return 1;
      else if(a._product.name < b._product.name)
        return -1;
      else{
        if(a._product.code > b._product.code)
          return 1;
        else if(a._product.code < b._product.code)
          return -1;
        else
          return 0;
      }
    });
  }

}
