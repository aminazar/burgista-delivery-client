import {Component, OnInit, isDevMode, ViewChild, ElementRef} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {FormControl} from "@angular/forms";

import {Product} from "./product";
import {ProductModel} from "./product.model";
import {ActionEnum} from "../unit-form/actionEnum";
import {RestService} from "../rest.service";
import {MessageService} from "../message.service";
import {isNullOrUndefined} from "util";
import {constructDependencies} from "@angular/core/src/di/reflective_provider";

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
  filteredName: any;
  filteredCode: any;
  isFiltered: boolean = false;
  productModelCtrlName: FormControl;
  productModelCtrlCode: FormControl;
  productName_Code: string[] = [];
  productNames: string[] = [];
  productCodes: string[] = [];
  selectedIndex: number = 0;
  nameChose: boolean = false;
  codeChose: boolean = false;

  @ViewChild('autoNameInput') autoNameInput;

  constructor(private restService: RestService, private messageService: MessageService, private elementRef: ElementRef) {
  }

  ngOnInit() {
    this.restService.get('product').subscribe(
      (data) => {
        this.productModels = [];

        for (let productObj of data) {
          let tempProduct = ProductModel.fromAnyObject(productObj);

          let tempProductModel = new ProductModel(tempProduct);

          this.productModels.push(tempProductModel);

          if (!this.productNames.find((n) => n === tempProduct.name))
            this.productNames.push(tempProduct.name);

          if (!this.productCodes.find((c) => c === tempProduct.code))
            this.productCodes.push(tempProduct.code);
        }

        this.refreshProductsDropDown();
      },
      (err) => {
        console.log(err.message);
      }
    );

    this.productModelCtrlName = new FormControl();
    this.productModelCtrlCode = new FormControl();

    this.filteredName = this.productModelCtrlName.valueChanges
      .startWith(null)
      .map((name) => this.filterProducts(name, 'name'));
    this.filteredCode = this.productModelCtrlCode.valueChanges
      .startWith(null)
      .map((code) => this.filterProducts(code, 'code'));

    let oneItemInList: boolean = false;

    this.filteredName.subscribe(
      (data) => {
        if (data.length === 1) {
          if(!oneItemInList) {
            this.codeChose = false;
            this.nameChose = false;
          }

          this.isFiltered = false;
          // if(this.filteredProductModel == null)
          //   this.filteredProductModel = new ProductModel(this.getProduct(data));
          // else
          //   this.filteredProductModel.setProduct(this.getProduct(data));

          this.filteredProductModel = this.getProduct(data, 'name');
          this.nameChose = true;
          oneItemInList = true;

          if(!this.codeChose)
            this.productModelCtrlCode.setValue(this.filteredProductModel._product.code);

          this.isFiltered = true;
        }
        else{
          this.nameChose = false;
          this.isFiltered = false;
          oneItemInList = false;
        }
      },
      (err) => {
        console.log(err.message);
      }
    );

    this.filteredCode.subscribe(
        (data) => {
          if (data.length === 1) {
            if(!oneItemInList) {
              this.codeChose = false;
              this.nameChose = false;
            }

            this.isFiltered = false;
            // if(this.filteredProductModel == null)
            //   this.filteredProductModel = new ProductModel(this.getProduct(data));
            // else
            //   this.filteredProductModel.setProduct(this.getProduct(data));

            this.filteredProductModel = this.getProduct(data, 'code');
            console.log(this.filteredProductModel);
            this.codeChose = true;
            oneItemInList = true;

            if(!this.nameChose)
              this.productModelCtrlName.setValue(this.filteredProductModel._product.name);

            this.isFiltered = true;
          }
          else{
            this.codeChose = false;
            this.isFiltered = false;
            oneItemInList = false;
          }
        },
        (err) => {
          console.log(err.message);
        }
    );

    this.productModelCtrlName.valueChanges.subscribe(
      (data) => {
        if(!oneItemInList) {
          let fullMatch = this.productModels.find((el) => {
            return (el._product.name.toLowerCase() == this.productModelCtrlName.value.toLowerCase());
          });

          if (fullMatch !== null && fullMatch !== undefined) {
            this.isFiltered = false;

            this.filteredProductModel = fullMatch;
            this.nameChose = true;
            if(!this.codeChose)
              this.productModelCtrlCode.setValue(this.filteredProductModel._product.code);
            // if (this.filteredProductModel == null)
            //   this.filteredProductModel = fullMatch;
            // else
            //   this.filteredProductModel =fullMatch._product);

            this.isFiltered = true;
          }
          else {
            this.isFiltered = false;
            this.nameChose = false;
          }
        }
      },
      (err) => {
        console.log(err.message);
      }
    );

    this.productModelCtrlCode.valueChanges.subscribe(
        (data) => {
          if(!oneItemInList) {
            let fullMatch = this.productModels.find((el) => {
              return (el._product.code.toLowerCase() == this.productModelCtrlCode.value.toLowerCase());
            });

            if (fullMatch !== null && fullMatch !== undefined) {
              this.isFiltered = false;

              this.filteredProductModel = fullMatch;
              this.codeChose = true;
              if(!this.nameChose)
                this.productModelCtrlName.setValue(this.filteredProductModel._product.name);
              // if (this.filteredProductModel == null)
              //   this.filteredProductModel = fullMatch;
              // else
              //   this.filteredProductModel =fullMatch._product);

              this.isFiltered = true;
            }
            else {
              this.isFiltered = false;
              this.codeChose = false;
            }
          }
        },
        (err) => {
          console.log(err.message);
        }
    );
  }

  private refreshProductsDropDown() {
    this.productName_Code = [];
    // this.productNames.forEach((el, ind) => this.productName_Code.push(`[${this.productCodes[ind]}] ${el}`));

    this.productNames.forEach((el) => this.productName_Code.push(el));
    this.productCodes.forEach((el) => this.productName_Code.push(el));
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

        this.refreshProductsDropDown();

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

        this.refreshProductsDropDown();

        this.isFiltered = false;
        this.filteredProductModel = null;
        this.productModelCtrlName.setValue('');

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

        this.refreshProductsDropDown();

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

  filterProducts(val: string, filterKind) {
    let res = [];

    if(filterKind === 'name'){
      res = val ? this.productNames.filter((p) => new RegExp(val.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'gi').test(p)) : this.productNames;
      if(res.length > 0){
        // console.log('Names:', res);
        // console.log(this.filteredCode);
        this.filteredCode.source = this.getProductCode(res);
        // console.log('Get Codes:', this.getProductCode(res));
      }
    }
    else if(filterKind === 'code'){
      res = val ? this.productCodes.filter((p) => new RegExp(val.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'gi').test(p)) : this.productCodes;
      if(res.length > 0) {
        // console.log('Codes:', res);
        this.filteredName.source = this.getProductName(res);
        // console.log('Get Names:', this.getProductName(res));
      }
    }

    return res;
  }

  getProductName(list){
    let result = [];

    list.forEach((el) => {
      result.push(this.productModels.find((pm) => pm._product.code == el)._product.name);
    });

    return result;
  }

  getProductCode(list){
    let result = [];

    list.forEach((el) => {
      result.push(this.productModels.find((pm) => pm._product.name == el)._product.code);
    });

    return result;
  }

  getProduct(nameCode: string, selectorKind) {
    let tempProductModel: ProductModel;

    if(selectorKind === 'name')
      tempProductModel = this.productModels[this.productName_Code.findIndex(nc=>nameCode[0]===nc)];
    else if(selectorKind === 'code')
      tempProductModel = this.productModels[this.productName_Code.findIndex(nc=>nameCode[0]===nc) - this.productNames.length];

    return tempProductModel;
  }

  showProductList($event, filterKind){
    if(filterKind === 'name'){
      if(this.productModelCtrlName.value === null){
        this.productModelCtrlName.setValue('');
      }
      else{
        $event.target.select();
      }
    }
    else if(filterKind === 'code'){
      if(this.productModelCtrlCode.value === null) {
        this.productModelCtrlCode.setValue('');
      }
      else{
        $event.target.select();
      }
    }
  }
}
