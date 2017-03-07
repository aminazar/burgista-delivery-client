import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import * as Rrule from 'rrule';
import * as moment from 'moment';

@Component({
  selector: 'app-rrule',
  templateUrl: './rrule.component.html',
  styleUrls: ['./rrule.component.css']
})
export class RRuleComponent implements OnInit {
  private _rstr;

  @Input()
  set RRuleStr(val) {
    if (val === '' || !this._rstr) {
      this._rstr = val;
      this.ngOnInit();
      this.text = '';
    }
  };

  get RRuleStr() {
    return this._rstr;
  }

  @Output() RRuleStrChange = new EventEmitter<any>();
  options: Rrule.Options;
  rule: Rrule;
  freqs = ['Daily', 'Weekly', 'Monthly', 'Never'];
  freqsConst = [Rrule.DAILY, Rrule.WEEKLY, Rrule.MONTHLY, null];
  freqsName = ['day', 'week', 'month'];
  weekdays = ['Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat', 'Sun'];
  weekdaysConst = [Rrule.MO, Rrule.TU, Rrule.WE, Rrule.TH, Rrule.FR, Rrule.SA, Rrule.SU];
  weekpos = [1, 2, 3, 4, -1];
  weekposName = ['First', 'Second', 'Third', 'Fourth', 'Last'];
  byweekday: Rrule.Weekday[] = [];
  text = '';
  showWeekdays = false;
  showMonthOptions = false;
  monthlyInputMode = '';
  monthDaysOption = [];
  monthDaysPast: number[] = [];
  monthDaysRemained: number[] = [];
  bymonthday: number[] = [];
  showMonthDaysPast: boolean;
  showMonthDaysRemained: boolean;
  bysetpos: number[] = [];

  constructor() {
  }

  ngOnInit() {
    this.rule = Rrule.fromString(this.RRuleStr);
    this.options = this.rule.options;
    if (<number[]>this.options.bysetpos)
      this.bysetpos = <number[]>this.options.bysetpos;
    if (<number[]>this.options.bymonthday)
      this.bymonthday = <number[]>this.options.bymonthday;
    if (<Array<number>>this.options.byweekday && (<Array<number>>this.options.byweekday).length)
      this.byweekday = (<Array<number>>this.options.byweekday).map(r => this.weekdaysConst[r]);
    else if (<Array<Rrule.Weekday>>this.options.byweekday)
      this.byweekday = (<Array<Rrule.Weekday>>this.options.byweekday);
    if (this.bysetpos.length > 0)
      this.monthlyInputMode = 'week';
    else if (this.bymonthday.length > 0)
      this.monthlyInputMode = 'month';

    this.calcPastOrRemained();
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
      else this.onMonthlyInputModeChange(this.monthlyInputMode);
      this.showWeekdays = this.options.freq === Rrule.WEEKLY;
      this.showMonthOptions = this.options.freq === Rrule.MONTHLY;
      this.calcPastOrRemained();

      if (!this.showWeekdays)
        this.options.byweekday = [];

      this.emitChange();
    }
    catch (err) {
      console.log(err);
    }
  }

  private calcPastOrRemained() {
    this.monthDaysPast = this.bymonthday.filter(r => r > 0);
    if (this.monthDaysPast.length && this.monthDaysOption.indexOf('past')) {
      this.monthDaysOption.push('past');
    }
    this.monthDaysRemained = this.bymonthday.filter(r => r < 0);
    if (this.monthDaysRemained.length)
      this.monthDaysOption.push('remained');
    this.showMonthDaysPast = this.monthDaysOption.indexOf('past') !== -1;
    this.showMonthDaysRemained = this.monthDaysOption.indexOf('remained') !== -1;
  }

  private emitChange() {
    for (let key in this.options)
      if (!this.options[key] || this.options[key].length === 0 || ['bynmonthday', 'bynweeday', 'bynsetpos', 'byhour', 'byminute', 'bysecond'].indexOf(key) !== -1)
        delete this.options[key];

    this.rule = new Rrule(this.options);
    if(this.rule.options.freq) {
      let d = new Date();
      let d2 = moment(d).add(366, 'd').toDate();
      this.text = this.rule.between(d, d2).map(r => moment(r).format('ddd DD-MMM-YY')).splice(0, 10).join('\n');
    }
    else {
      this.text = '';
    }
    this.RRuleStrChange.emit({value: this.rule.toString(), error: this.validate()});
  }

  validate() {
    let v = '';
    if (this.options.freq === Rrule.WEEKLY && !this.byweekday.length) {
      v = 'choose a weekday';
    }
    else if (this.rule.options.freq === Rrule.MONTHLY && this.monthlyInputMode === 'week') {
      if (this.bysetpos.length && !this.byweekday.length) {
        v = 'choose weekdays';
      }
      else if (this.byweekday.length && !this.bysetpos.length) {
        v = 'choose week numbers in month';
      }
      else if (!this.byweekday.length && !this.bysetpos.length) {
        v = 'choose week numbers and weekdays';
      }
    }
    else if (this.rule.options.freq === Rrule.MONTHLY && this.monthlyInputMode === 'month') {
      if (this.showMonthDaysPast && !this.monthDaysPast.length) {
        v = 'No days past month is chosen';
      }
      else if (this.showMonthDaysRemained && !this.monthDaysRemained.length) {
        v = 'No days from month remainder is chosen';
      }
      else if (!this.showMonthDaysRemained && !this.showMonthDaysPast) {
        v = 'choose a day';
      }
    }
    return v;
  }

  onMonthlyInputModeChange(event) {
    delete this.options.byweekday;
    delete this.options.bysetpos;

    if (event === 'month'){
      this.bymonthday = [moment().get('D')];
      this.options.bymonthday = this.bymonthday;
    }
    else {
      delete this.options.bymonthday;
      this.bymonthday = [];
    }
    this.bysetpos = [];
    this.byweekday = [];
    this.calcPastOrRemained();

    this.emitChange();
  }

  byweekdayChange(event) {
    this.multipleChoice(event, 'byweekday');
    this.options.byweekday = this.byweekday;
    delete this.options.bymonthday;
    this.emitChange();
  }

  monthDaysPastOrRemainedChange(event) {
    this.multipleChoice(event, 'monthDaysOption');
    if (this.monthDaysOption.indexOf('past') === -1) {
      this.monthDaysPast = [];
      this.bymonthday = this.bymonthday.filter(r => r < 0);
    }
    if (this.monthDaysOption.indexOf('remained') === -1) {
      this.monthDaysRemained = [];
      this.bymonthday = this.bymonthday.filter(r => r > 0);
    }

    this.options.bymonthday = this.bymonthday;
    this.calcPastOrRemained();
    this.emitChange();
  }

  monthDaysRemainedChange(event) {
    this.monthDaysRemained = event;
    this.bymonthday = this.bymonthday.filter(r => r > 0).concat(this.monthDaysRemained.map(r => -r));
    if (this.options.bymonthday !== this.bymonthday) {
      this.options.bymonthday = this.bymonthday;
      this.emitChange();
    }
  }

  monthDaysPastChange(event) {
    this.monthDaysPast = event;
    this.bymonthday = this.bymonthday.filter(r => r < 0).concat(this.monthDaysPast);
    if (this.options.bymonthday !== this.bymonthday) {
      this.options.bymonthday = this.bymonthday;
      this.emitChange();
    }
  }

  weekposChange(event) {
    this.multipleChoice(event, 'bysetpos');
    this.options.bysetpos = this.bysetpos;
    delete this.options.bymonthday;
    this.emitChange();
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
