import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";

import {RestService} from "../rest.service";
import {AuthService} from "../auth.service";
import {ProductModel} from "../product-form/product.model";
import {ActionEnum} from "../unit-form/actionEnum";
import {MessageService} from "../message.service";
import {Product} from "../product-form/product";

@Component({
  selector: 'app-override-form',
  templateUrl: './override-form.component.html',
  styleUrls: ['./override-form.component.css']
})
export class OverrideFormComponent implements OnInit {
  @ViewChild('autoNameCode') autoNameCode;

  is_kitchen = true;
  branchData;
  isAdmin = false;
  productModels: ProductModel[] = [];
  filteredProductModel: ProductModel;
  filteredNameCode: any;
  isFiltered: boolean = false;
  productModelCtrl: FormControl;
  productName_Code: string[] = [];
  productNames: string[] = [];
  productCodes: string[] = [];
  branchList: any[] = [];
  addIsDisable: boolean = false;
  updateIsDisable: boolean = false;
  deleteIsDisable: boolean = false;
  selectedIndex: number = 0;
  hasCountingRuleError: boolean = false;
  selectedProduct: string = '';
  ae = ActionEnum;

  constructor(private restService: RestService, private authService: AuthService, private messageService: MessageService,
              private msg: MessageService) {
  }

  ngOnInit() {
    this.isAdmin = (this.authService.userType === 'admin') ? true : false;

    if (this.isAdmin) { // Fetch all branches and products (with/without overridden values)
      this.restService.get('unit?isBranch=true').subscribe(
        (data) => {
          this.branchData = data.map(r => {return {id: r.uid, name: r.name, is_kitchen: r.is_kitchen};});
          this.branchList = this.branchData.filter(r => r.is_kitchen === this.is_kitchen);

          this.loadBranchProducts();
        },
        (err) => {
          console.log(err.message);
        }
      );
    } else {// get products (with overridden values) for branch;
      this.restService.get('override?uid=' + this.authService.unit_id).subscribe(
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

          this.refreshDropDown();

        },
        (err) => {
          console.log(err.message);
        }
      );
    }

    this.checkDisabilityStatus();

    this.productModelCtrl = new FormControl();
    this.filteredNameCode = this.productModelCtrl.valueChanges
      .startWith(null)
      .map((name_code) => this.filterProducts(name_code));

    let oneItemInList: boolean = false;

    this.filteredNameCode.subscribe(
      (data) => {
        if (data.length === 1) {
          if (this.filteredProductModel == null) {
            this.filteredProductModel = new ProductModel(this.getProduct(data));
          } else {
            this.filteredProductModel.setProduct(this.getProduct(data));
          }

          this.selectedProduct = `[${this.filteredProductModel._product.code}] ${this.filteredProductModel._product.name}`;
          this.isFiltered = true;
          oneItemInList = true;
        } else {
          this.selectedProduct = '';
          this.isFiltered = false;
          oneItemInList = false;
        }
      },
      (err) => {
        console.log(err.message);
      }
    );

    this.productModelCtrl.valueChanges.subscribe(
      (data) => {
        if (!oneItemInList) {
          let fullMatch;
          if (this.productModelCtrl.value) {
            fullMatch = this.productModels.find((el) => {
              return (el._product.name.toLowerCase() == this.productModelCtrl.value.toLowerCase())
                || (el._product.code.toLowerCase() == this.productModelCtrl.value.toLowerCase());
            });
          }

          if (fullMatch !== null && fullMatch !== undefined) {
            if(this.filteredProductModel == null)
              this.filteredProductModel = new ProductModel(fullMatch._product);
            else
              this.filteredProductModel.setProduct(fullMatch._product);

            this.selectedProduct = this.filteredProductModel._product.name;
            this.isFiltered = true;
          } else {
            this.selectedProduct = '';
            this.isFiltered = false;
          }
        }
      },
      (err) => {
        console.log(err.message);
      }
    );
  }

  private refreshDropDown() {
    this.productName_Code = [];
    this.productNames.forEach((el, ind) => this.productName_Code.push(`[${this.productCodes[ind]}] ${el}`));
    this.productModelCtrl.reset();
  }

  doClickedAction(type: ActionEnum) {
    if(!this.isFiltered || this.filteredProductModel === null){
      this.messageService.message('You should first choose product to override');
      return;
    }

    this.setWaiting(type, true);

    switch (type) {
      case ActionEnum.add: this.add_updateOverride(true);
        break;
      case ActionEnum.update: this.add_updateOverride(false);
        break;
      case ActionEnum.delete: this.deleteOverride();
        break;
    }
  }

  private add_updateOverride(isAdd: boolean) {
    let restUrl = '';
    if(this.isAdmin){
      restUrl = '?uid=' + this.branchList[this.selectedIndex].id;
    }

    let tempProductModel = this.productModels.filter((pm) => {
      return pm._product.id === this.filteredProductModel._product.id;
    });

    if(tempProductModel[0] === null){
      console.log('Cannot match id!!!');
      this.messageService.message('Unexpected error has occurred. Please reload your page');
      return;
    }

    this.restService.update('override', this.filteredProductModel._product.id + restUrl,
                            ProductModel.toAnyObjectOverride(tempProductModel[0].getDifferentValues(this.filteredProductModel._product))).subscribe(
      (data) => {
        this.filteredProductModel._product.isOverridden = true;

        //Update productModels list
        tempProductModel[0].setProduct(this.filteredProductModel._product);

        (isAdd) ? this.setWaiting(ActionEnum.add, false) : this.setWaiting(ActionEnum.update, false);
        this.checkDisabilityStatus();

        this.messageService.message(`Counting rule for '${tempProductModel[0]._product.name}' has been overridden in '${this.branchList[this.selectedIndex].name}'.`);
      },
      (err) => {
        console.log(err.message);
        this.checkDisabilityStatus();
      }
    )
  }

  private deleteOverride() {
    let restUrl = '';
    if(this.isAdmin){
      restUrl = '?uid=' + this.branchList[this.selectedIndex].id;
    }

    let tempProductModel = this.productModels.filter((pm) => {
      return pm._product.id === this.filteredProductModel._product.id;
    });

    if(tempProductModel[0] === null){
      console.log('Cannot match id!!!');
      this.messageService.message('Unexpected error has occurred. Please reload your page');
      return;
    }

    this.restService.delete('override', this.filteredProductModel._product.id + restUrl).subscribe(
      (data) => {
        this.filteredProductModel._product.isOverridden = false;

        tempProductModel[0].setProduct(ProductModel.fromAnyObject(data.json()));
        this.filteredProductModel.setProduct(ProductModel.fromAnyObject(data.json()));

        this.setWaiting(ActionEnum.delete, false);
        this.checkDisabilityStatus();
      },
      (err) => {
        console.log(err.message);
        this.checkDisabilityStatus();
      }
    )
  }

  checkDisabilityStatus(){
    this.addIsDisable = (this.isFiltered) ? this.shouldAddBtnDisable() : true;
    this.updateIsDisable = (this.isFiltered) ? this.shouldUpdateBtnDisable() : true;
    this.deleteIsDisable = (this.isFiltered) ? this.shouldDeleteBtnDisable() : true;
  }

  shouldAddBtnDisable() : boolean{
    if(this.filteredProductModel.waiting.getValue().adding || this.hasCountingRuleError)
      return true;

    let tempProductModel = this.productModels.filter((pm) => {
      return pm._product.id === this.filteredProductModel._product.id;
    });

    if(tempProductModel[0] === null){
      console.log('Id changed!!!');
      return true;
    }

    if(!tempProductModel[0].isDifferent(this.filteredProductModel._product))
      return true;

    return false;
  }

  shouldUpdateBtnDisable() : boolean{
    if(this.filteredProductModel.waiting.getValue().updating || this.hasCountingRuleError)
      return true;

    let tempProductModel = this.productModels.filter((pm) => {
      return pm._product.id === this.filteredProductModel._product.id;
    });

    if(tempProductModel[0] === null){
      console.log('Id changed!!!');
      return true;
    }

    if(!tempProductModel[0].isDifferent(this.filteredProductModel._product))
      return true;

    return false;
  }

  shouldDeleteBtnDisable() : boolean{
    if(this.filteredProductModel.waiting.getValue().deleting || this.hasCountingRuleError)
      return true;

    return false;
  }

  changedTab(){
    this.filteredProductModel = null;
    this.isFiltered = false;
    const sp = this.selectedProduct
    this.loadBranchProducts(()=>{
      if(sp !== null && sp !== ''){
        this.selectedProduct = sp;
        this.productModelCtrl.setValue(this.selectedProduct);
        this.productModelCtrl.markAsTouched();
      }
    });
  }

  loadBranchProducts(callback= () => {}) {
    if (this.isAdmin) {
      this.restService.get('override?uid=' + this.branchList[this.selectedIndex].id).subscribe(
        (data) => {
          this.productModels = [];
          this.productNames = [];
          this.productCodes = [];

          for (let productObj of data) {
            let tempProduct = ProductModel.fromAnyObject(productObj);
            let tempProductModel = new ProductModel(tempProduct);
            this.productModels.push(tempProductModel);
            this.productNames.push(tempProduct.name);
            this.productCodes.push(tempProduct.code);
          }

          this.refreshDropDown();
          callback();
        },
        (err) => {
          console.log(err.message);
        }
      );
    }
  }

  countingRuleErrorHandler(message){
    if (message) {
      this.messageService.warn(message);
      this.hasCountingRuleError = true;
    }
    else
      this.hasCountingRuleError = false;

    this.checkDisabilityStatus();
  }

  setWaiting(type: ActionEnum, isWaiting: boolean){
    let tempWaitingObj = {
      adding: false,
      updating: false,
      deleting: false
    };

    switch (type) {
      case ActionEnum.add: tempWaitingObj.adding = isWaiting;
        break;
      case ActionEnum.update: tempWaitingObj.updating = isWaiting;
        break;
      case ActionEnum.delete: tempWaitingObj.deleting = isWaiting;
        break;
    }

    this.filteredProductModel.waiting.next(tempWaitingObj);
  }

  filterProducts(val: string) {
    return val ? this.productName_Code.filter((p) => new RegExp(val.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'gi').test(p))
      : this.productName_Code;
  }

  getProduct(nameCode: string) : Product{
    let tempProductModel: ProductModel;

    tempProductModel = this.productModels[this.productName_Code.findIndex(nc=>nameCode[0]===nc)];
    return tempProductModel._product;
  }

  showProductList($event){
    if(this.productModelCtrl.value === null)
      this.productModelCtrl.setValue('');
    else{
      $event.target.select();
    }
  }

  changeFilter() {
    this.branchList = this.branchData.filter(r => r.is_kitchen === this.is_kitchen)
  }
}
