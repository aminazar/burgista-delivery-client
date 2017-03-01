import {Component, OnInit, isDevMode, ViewChild} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {FormControl} from "@angular/forms";

import {Product} from "./product";
import {ProductModel} from "./product.model";
import {ActionEnum} from "../unit-form/actionEnum";
import {RestService} from "../rest.service";
import {MessageService} from "../message.service";

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
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
  selectedIndex: number = 0;

  @ViewChild('autoNameCode') autoNameCode;

  constructor(private restService: RestService, private messageService: MessageService) {
  }

  ngOnInit() {
    this.restService.get('product').subscribe(
      (data) => {
        this.productModels = [];

        for (let productObj of data) {
          let tempProduct = ProductModel.fromAnyObject(productObj);

          let tempProductModel = new ProductModel(tempProduct);

          this.productModels.push(tempProductModel);

          // this.productName_Code.unshift(tempProduct.name);
          // this.productName_Code.push(tempProduct.code);

          if (!this.productNames.find((n) => n === tempProduct.name))
            this.productNames.push(tempProduct.name);

          if (!this.productCodes.find((c) => c === tempProduct.code))
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
        if (data.length === 1) {
          this.filteredProductModel = this.getProduct(data);
          this.isFiltered = true;
        }
        else
          this.isFiltered = false;
      },
      (err) => {
        console.log(err.message);
      }
    );

    this.productModelCtrl.valueChanges.subscribe(
      (data) => {
        let fullMatch = this.productModels.find((el) => {
          return (el._product.name.toLowerCase() == this.productModelCtrl.value.toLowerCase())
            || (el._product.code.toLowerCase() == this.productModelCtrl.value.toLowerCase());
        });

        if (fullMatch !== null && fullMatch !== undefined) {
          this.filteredProductModel = fullMatch;
          this.isFiltered = true;
        }
        else
          this.isFiltered = false;
      },
      (err) => {
        console.log(err.message);
      }
    );
  }

  doClickedAction(value) {
    let clickType: ActionEnum = value.type;
    let clickData: Product = value.data;

    //Disable respective button
    this.disableEnable(clickData.id, clickType, true);

    //Do update, delete or add
    switch (clickType) {
      case ActionEnum.add:
        this.addProduct(clickData);
        break;
      case ActionEnum.delete:
        this.deleteProduct(clickData.id);
        break;
      case ActionEnum.update:
        this.updateProduct(clickData.id, clickData);
        break;
    }
  }

  private addProduct(product: Product) {
    let foundByName = this.productModels.find((el) => {
      return el._product.name.toLowerCase() ===  product.name.toLowerCase();
    });

    if(foundByName !== null && foundByName !== undefined){
      this.messageService.warn(`The '${foundByName._product.name}' name is already exist.`);
      this.disableEnable(product.id, ActionEnum.add, false);
      return;
    }

    let foundByCode = this.productModels.find((el) => {
      return el._product.code.toLowerCase() === product.code.toLowerCase();
    });

    if(foundByCode !== null && foundByCode !== undefined){
      this.messageService.warn(`The '${foundByCode._product.code}' code is already exist.`);
      this.disableEnable(product.id, ActionEnum.add, false);
      return;
    }

    let name = product.name;
    this.restService.insert('product', ProductModel.toAnyObject(product)).subscribe(
      (data) => {
        //Adding new product to productModels list
        product.id = data;
        let tempProductModel = new ProductModel(product);

        this.actionIsSuccess.next(true);

        this.productModels.push(tempProductModel);
        this.productNames.push(tempProductModel._product.name);
        this.productCodes.push(tempProductModel._product.code);

        this.productNames.sort();
        this.productCodes.sort();

        this.productName_Code = [];
        this.productName_Code = this.productName_Code.concat(this.productNames);
        this.productName_Code = this.productName_Code.concat(this.productCodes);

        //Sort productModels
        // this.sortProductModelList();

        this.disableEnable(product.id, ActionEnum.add, false);

        this.actionIsSuccess.next(false);
        this.messageService.message(`'${name}' is added to products.`);
      },
      (error) => {
        this.messageService.error(error);
        if (isDevMode())
          console.log(error);

        this.disableEnable(product.id, ActionEnum.add, false);
      }
    );
  }

  private deleteProduct(productId: number) {
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

        this.messageService.message(`Product is deleted.`);
        //ToDo: adding prop message
      },
      (error) => {
        this.messageService.error(error);
        if (isDevMode())
          console.log(error);

        this.disableEnable(productId, ActionEnum.delete, false);
      }
    );
  }

  private updateProduct(productId: number, product: Product) {
    let foundByName = this.productModels.find((el) => {
      return el._product.name.toLowerCase() ===  product.name.toLowerCase();
    });

    if((foundByName !== null  && foundByName !== undefined) && product.name !== this.filteredProductModel._product.name){
      this.messageService.warn(`The '${foundByName._product.name}' name is already exist.`);
      this.disableEnable(productId, ActionEnum.update, false);
      return;
    }

    let foundByCode = this.productModels.find((el) => {
      return el._product.code.toLowerCase() === product.code.toLowerCase();
    });

    if((foundByCode !== null && foundByCode !== undefined) && product.code !== this.filteredProductModel._product.code){
      this.messageService.warn(`The '${foundByCode._product.code}' code is already exist.`);
      this.disableEnable(productId, ActionEnum.update, false);
      return;
    }

    let index: number = this.productModels.findIndex(function (element) {
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
        this.messageService.message(`'${name}' is updated in products.`);

        this.actionIsSuccess.next(false);
      },
      (error) => {
        this.messageService.error(error);
        if (isDevMode())
          console.log(error);

        this.disableEnable(productId, ActionEnum.update, false);
      }
    )
  }

  private disableEnable(productId: number, btnType: ActionEnum, isDisable: boolean) {
    let tempProductModel: ProductModel = this.productModels.find(function (element) {
      return element._product.id == productId;
    });


    let tempWaitingObj = tempProductModel ? tempProductModel.waiting.getValue() : null;


    switch (btnType) {
      case ActionEnum.update:
        tempWaitingObj.updating = isDisable;
        break;
      case ActionEnum.delete:
        tempWaitingObj.deleting = isDisable;
        break;
      case ActionEnum.add:
        this.isAdding.next(isDisable);
        break;
    }

    if (tempProductModel)
      tempProductModel.waiting.next(tempWaitingObj);
  }

  filterProducts(val: string) {
    return val ? this.productName_Code.filter((p) => new RegExp(val, 'gi').test(p)) : this.productName_Code;
  }

  getProduct(nameCode: string) {
    console.log(nameCode);
    console.log(nameCode[0].toLowerCase());

    let tempProductModel: ProductModel;

    tempProductModel = this.productModels.find((p) => {
      return p._product.name.toLowerCase() == nameCode[0].toLowerCase();
    });

    if (tempProductModel !== null && tempProductModel !== undefined)
      return tempProductModel;

    return this.productModels.find((p) => {
      return p._product.code.toLowerCase() == nameCode[0].toLowerCase();
    });
  }
}
