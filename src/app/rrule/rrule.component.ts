import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import * as Rrule from 'rrule';

@Component({
  selector: 'app-rrule',
  templateUrl: './rrule.component.html',
  styleUrls: ['./rrule.component.css']
})
export class RRuleComponent implements OnInit {
  @Input() RRuleStr:string;
  @Output() RRuleStrChange = new EventEmitter<string>();
  private options:Rrule.Options;
  private rule:Rrule;
  private freqs = ['Daily', 'Weekly', 'Monthly'];
  private freqsConst=[Rrule.DAILY, Rrule.WEEKLY, Rrule.MONTHLY];
  private text = '';

  constructor() {
  }

  ngOnInit() {
   this.options = {    freq: Rrule.WEEKLY,
     interval: 5,
     byweekday: [Rrule.MO, Rrule.FR],
     dtstart: new Date(2012, 1, 1, 10, 30),
     until: new Date(2012, 12, 31)
   };
   this.rule = new Rrule(this.options);
   this.freqsConst =[ Rrule.DAILY, Rrule.WEEKLY, Rrule.MONTHLY];
  }

  onChange(){
    try {
      //this.RRuleStrChange.emit(this.rule.toString());
      this.text = JSON.stringify(this.options);//
      for(let key in this.options)
        if(!this.options[key] || this.options[key].length===0)
          delete this.options[key];
      this.rule = new Rrule(this.options);
      this.text = this.rule.toText();
    }
    catch(err) {
      console.log(err);
    }
  }
}
