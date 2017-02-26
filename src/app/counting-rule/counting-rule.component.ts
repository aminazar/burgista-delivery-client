import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-counting-rule',
  templateUrl: './counting-rule.component.html',
  styleUrls: ['./counting-rule.component.css']
})
export class CountingRuleComponent implements OnInit {
  @Input() coefficients;
  @Input() minQty;
  @Input() maxQty;
  @Input() recursionRule;
  @Output() changed = new EventEmitter();
  @Output() coefficientsChange = new EventEmitter();
  @Output() minQtyChange = new EventEmitter();
  @Output() maxQtyChange = new EventEmitter();
  @Output() recursionRuleChange = new EventEmitter();
  @Output() hasError = new EventEmitter();

  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Usage'];

  constructor() { }

  ngOnInit() {
  }


  changeOccur(){
    this.checkDataCorrectness();

    this.coefficientsChange.next(this.coefficients);
    this.minQtyChange.next(this.minQty);
    this.maxQtyChange.next(this.maxQty);
    this.recursionRuleChange.next(this.recursionRule);

    this.changed.emit();
  }

  checkDataCorrectness(){
    let isCorrect: boolean = true;
    let errorMessage: string = "";

    if(this.minQty < 0)
      this.minQty = 0;

    if(this.maxQty < 0)
      this.maxQty = 0;

    if(this.minQty > 99998)
      this.minQty = 99998;

    if(this.maxQty > 99999)
      this.maxQty  = 99999;

    if(this.recursionRule === null || this.recursionRule === ""){
      isCorrect = false;
      errorMessage = 'Please choose at least one recursion rule';
    }

    for(let day in this.coefficients){
      if(this.coefficients[day] === null || this.coefficients[day] === ""){
        isCorrect = false;
        errorMessage = 'The ' + day + ' value should not be empty';
      }
    }

    if(this.minQty >= this.maxQty){
      isCorrect = false;
      errorMessage = 'The minQty should be less than maxQty';
    }

    if(this.maxQty === null || this.maxQty === ""){
      isCorrect = false;
      errorMessage = 'The maxQty should not has empty value';
    }

    if(this.minQty === null || this.minQty === ""){
      isCorrect = false;
      errorMessage = 'The minQty should not has empty value';
    }

    this.hasError.emit({
      hasError: !isCorrect,
      message: ((isCorrect) ? '' : errorMessage)
    });
  }

}
