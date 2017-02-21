import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import * as Rrule from 'rrule';
import * as moment from 'moment';

@Component({
  selector: 'app-rrule',
  templateUrl: './rrule.component.html',
  styleUrls: ['./rrule.component.css']
})
export class RRuleComponent implements OnInit {
  @Input() RRuleStr: string;
  @Output() RRuleStrChange = new EventEmitter<string>();
  private options: Rrule.Options;
  private rule: Rrule;
  private freqs = ['Daily', 'Weekly', 'Monthly'];
  private freqsConst = [Rrule.DAILY, Rrule.WEEKLY, Rrule.MONTHLY];
  private freqsName = ['day', 'week', 'month'];
  private weekdays = ['Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat', 'Sun'];
  private weekdaysConst = [Rrule.MO, Rrule.TU, Rrule.WE, Rrule.TH, Rrule.FR, Rrule.SA, Rrule.SU];
  private weekpos = [1, 2, 3, 4, -1];
  private weekposName = ['First', 'Second', 'Third', 'Fourth', 'Last'];
  private byweekday: Rrule.Weekday[] = [];
  private text = '';
  private showWeekdays = false;
  private showMonthOptions = false;
  private monthlyChooseByWeek = false;
  private monthDaysOption = [];
  private monthDaysPast: number[] = [];
  private monthDaysRemained: number[] = [];
  private bymonthday: number[] = [];
  private showMonthDaysPast: boolean;
  private showMonthDaysRemained: boolean;
  private bysetpos: number[] = [];

  constructor() {
  }

  ngOnInit() {
    this.byweekday = [Rrule.MO, Rrule.FR];
    this.rule = Rrule.fromString(this.RRuleStr);
//    delete this.rule.options.dtstart;
    this.options = this.rule.options;
    if (<number[]>this.options.bysetpos)
      this.bysetpos = <number[]>this.options.bysetpos;
    if (<number[]>this.options.bymonthday)
      this.bymonthday = <number[]>this.options.bymonthday;
    if (<Array<Rrule.Weekday>>this.options.byweekday)
      this.byweekday = (<Array<Rrule.Weekday>>this.options.byweekday);
    this.monthlyChooseByWeek = this.bysetpos.length > 0;
    this.monthDaysPast = this.bymonthday.filter(r => r > 0);
    if (this.monthDaysPast.length) {
      this.monthDaysOption.push('past');
    }
    this.monthDaysRemained = this.bymonthday.filter(r => r < 0);
    if (this.monthDaysRemained.length)
      this.monthDaysOption.push('remained');
  }

  onChange() {
    try {
      if (this.options.freq === Rrule.DAILY) {
        delete this.options.byweekday;
        delete this.options.bysetpos;
        this.bysetpos = [];
        this.byweekday = [];
        delete this.options.bymonthday;
        this.bymonthday = [];
        this.monthDaysPast = [];
        this.monthDaysRemained = [];
      }
      else if (this.options.freq === Rrule.WEEKLY) {
        delete this.options.bysetpos;
        this.bysetpos = [];
        delete this.options.bymonthday;
        this.bymonthday = [];
        this.monthDaysPast = [];
        this.monthDaysRemained = [];
      }
      else if (this.monthlyChooseByWeek) {
        delete this.options.bymonthday;
        this.bymonthday = [];
        this.monthDaysPast = [];
        this.monthDaysRemained = [];
      }
      else {
        delete this.options.byweekday;
        delete this.options.bysetpos;
        this.bysetpos = [];
        this.byweekday = [];
      }
      this.showWeekdays = this.options.freq === Rrule.WEEKLY || (this.options.freq === Rrule.MONTHLY && this.monthlyChooseByWeek);
      this.showMonthOptions = this.options.freq === Rrule.MONTHLY;
      this.showMonthDaysPast = this.monthDaysOption.indexOf('past') !== -1;
      this.showMonthDaysRemained = this.monthDaysOption.indexOf('remained') !== -1;


      if (!this.showWeekdays)
        this.options.byweekday = [];

      for (let key in this.options)
        if (!this.options[key] || this.options[key].length === 0 || [ 'bynmonthday', 'bynweeday', 'bynsetpos', 'byhour', 'byminute', 'bysecond'].indexOf(key) !== -1)
          delete this.options[key];

      this.rule = new Rrule(this.options);
      let d = new Date();
      let d2 = moment(d).add(366,'d').toDate();
      this.text = this.rule.between(d,d2).map(r=>moment(r).format('ddd DD-MMM-YY')).splice(0,10).join('\n');
      this.RRuleStr = this.rule.toString();
      this.RRuleStrChange.emit(this.RRuleStr);
    }
    catch (err) {
      console.log(err);
    }
  }

  byweekdayChange(event) {
    this.multipleChoice(event, 'byweekday');
    this.options.byweekday = this.byweekday;
    this.onChange();
  }

  monthDaysPastOrRemainedChange(event) {
    this.multipleChoice(event, 'monthDaysOption');
    if (this.monthDaysOption.indexOf('past') === -1) {
      this.monthDaysPast = [];
      this.bymonthday = this.bymonthday.filter(r => r < 0);
      this.options.bymonthday = this.bymonthday;
    }
    if (this.monthDaysOption.indexOf('remained') === -1) {
      this.monthDaysRemained = [];
      this.bymonthday = this.bymonthday.filter(r => r > 0);
      this.options.bymonthday = this.bymonthday;
    }
    this.onChange();
  }

  monthDaysRemainedChange() {
    this.bymonthday = this.bymonthday.filter(r => r > 0).concat(this.monthDaysRemained.map(r => -r));
    this.options.bymonthday = this.bymonthday;
    this.onChange();
  }

  monthDaysPastChange() {
    this.bymonthday = this.bymonthday.filter(r => r < 0).concat(this.monthDaysPast);
    this.options.bymonthday = this.bymonthday;
    this.onChange();
  }

  weekposChange(event) {
    this.multipleChoice(event, 'bysetpos');
    this.options.bysetpos = this.bysetpos;
    this.onChange();
  }

  multipleChoice(event, member) {
    if (event.source.checked) {
      if (this[member].indexOf(event.value) === -1)
        this[member].push(event.value)
    }
    else {
      if (this[member].indexOf(event.value) !== -1)
        this[member].splice(this[member].indexOf(event.value), 1);
    }
  }
}
