import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-counting-rule',
  templateUrl: './counting-rule.component.html',
  styleUrls: ['./counting-rule.component.css']
})
export class CountingRuleComponent implements OnInit {
  @Input() isOverridden: boolean = false;
  @Input() coefficients;
  private _mq: any;

  @Input() //To have a trigger to redo validation after blanking the form after add
  set minQty(val) {

    if (val === -12345678){
      this._mq = null;
      this.ngOnInit()
    }
    else
      this._mq = val;
  }

  get minQty() {
    return this._mq;
  }

  @Input() maxQty;
  @Input() recursionRule;

  @Output() coefficientsChange = new EventEmitter<any>();
  @Output() minQtyChange = new EventEmitter<number>();
  @Output() maxQtyChange = new EventEmitter<number>();
  @Output() recursionRuleChange = new EventEmitter<string>();
  @Output() hasError = new EventEmitter<string>();

  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Usage'];
  private errorMessage = {};
  private showMessage: string;

  constructor() {
  }

  ngOnInit() {
  }

  coeffChange() {
    this.coefficientsChange.emit(this.coefficients);
    let i = 0;
    for (let day in this.coefficients) {
      i++;
      if(this.coefficients[day] < 0)
        this.coefficients[day] = 0;

      if (!this.coefficients[day]) {
        this.sendError(`${day} coefficient should be a non-zero number`, 10 + i);
      }
      else {
        this.sendError('', 10 + i);
      }

    }
  }

  minChange() {
    if(this.minQty < 0)
      this.minQty = 0;

    this.minQtyChange.emit(this.minQty);
    // if (this.minQty !== 0 && !this.minQty) {
    //   this.sendError('The Min Qty should not be blank', 0);
    // }
    // else this.sendError('', 0);
    this.sendError('', 0);
    this.checkMinMax()
  }

  maxChange() {
    if(this.maxQty < 0)
      this.maxQty = 0;

    this.maxQtyChange.emit(this.maxQty);
    // if (this.maxQty!==0&&!this.maxQty) {
    //   this.sendError('The Max Qty should not be blank', 1);
    // }
    // else this.sendError('', 1);
    this.sendError('', 1);
    this.checkMinMax()
  }

  recurChange(event) {
    this.recursionRuleChange.emit(event.value);

    if(event.error)
      this.sendError(`Recursion rule warning: ${event.error}`, 2);
    else
      this.sendError('', 2);
  }

  checkMinMax() {
    if(this.minQty !== null && this.maxQty !== null) {
      if (this.minQty > this.maxQty) {
        this.sendError('The Min Qty should be less than or equal to Max Qty', 3);
      }
      else this.sendError('', 3);
    }
  }

  sendError(msg, index) {
    this.errorMessage[index] = msg;
    if (msg)
      this.hasError.emit(msg);
    else {
      for (let key in this.errorMessage)
        if (this.errorMessage[key])
          msg = this.errorMessage[key];
      this.hasError.emit(msg);
    }
    this.showMessage = msg;
  }

}
