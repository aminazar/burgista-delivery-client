import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import { RRule, RRuleSet, RRuleStrOptions } from 'rrule';
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
  options: any;
  rule: RRule;
  freqs = ['Daily', 'Weekly', 'Monthly', 'Never'];
  freqsConst: any[] = [RRule.DAILY, RRule.WEEKLY, RRule.MONTHLY, null];
  freqsName = ['day', 'week', 'month'];
  weekdays = ['Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat', 'Sun'];
  weekdaysConst: any[] = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];
  weekpos = [1, 2, 3, 4, -1];
  weekposName = ['First', 'Second', 'Third', 'Fourth', 'Last'];
  byweekday = [];
  text = '';
  showWeekdays = false;
  showMonthOptions = false;
  monthlyInputMode = '';
  monthDaysOption = [];
  monthDaysPast= [];
  monthDaysRemained = [];
  bymonthday = [];
  showMonthDaysPast: boolean;
  showMonthDaysRemained: boolean;
  bysetpos = [];
  freq = '';

  constructor() {
  }

  ngOnInit() {
    this.rule = RRule.fromString(this.RRuleStr);
    this.options = this.rule.options;
    this.freq = this.options.freq;
    if (this.options.bysetpos)
      this.bysetpos = this.options.bysetpos;
    if (this.options.bymonthday)
      this.bymonthday = this.options.bymonthday;
    if (this.options.byweekday && (this.options.byweekday).length)
      this.byweekday = (this.options.byweekday).map(r => this.weekdaysConst[r]);
    else if (this.options.byweekday)
      this.byweekday = this.options.byweekday;
    if (this.bysetpos.length > 0)
      this.monthlyInputMode = 'week';
    else if (this.bymonthday.length > 0)
      this.monthlyInputMode = 'month';

    this.calcPastOrRemained();
  }

  onChange() {
    try {
      for (let key in this.options)
        if (!this.options[key] || this.options[key].length === 0 || ['bynmonthday', 'bynweeday', 'bynsetpos', 'byhour', 'byminute', 'bysecond'].indexOf(key) !== -1)
          delete this.options[key];

      if (this.options.freq !== this.freq) {
        this.options.freq = this.freq;
        if (this.options.freq === RRule.DAILY) {
          delete this.options.byweekday;
          delete this.options.bysetpos;
          this.bysetpos = [];
          this.byweekday = [];
          delete this.options.bymonthday;
          this.bymonthday = [];
          this.monthDaysPast = [];
          this.monthDaysRemained = [];
        }
        else if (this.options.freq === RRule.WEEKLY) {
          delete this.options.bysetpos;
          this.bysetpos = [];
          delete this.options.bymonthday;
          this.bymonthday = [];
          this.monthDaysPast = [];
          this.monthDaysRemained = [];
        }
        else if (this.options.freq === RRule.MONTHLY) {
          delete this.options.byweekday;
          delete this.options.bysetpos;

          if (this.monthlyInputMode === 'month'){
            this.bymonthday = [moment().get('D')];
            this.options.bymonthday = this.bymonthday;
          }
          else {
            delete this.options.bymonthday;
            this.bymonthday = [];
          }
          this.bysetpos = [];
          this.byweekday = [];
        }
      } else this.options.freq = this.freq;
      this.options.bymonth = [];
      this.rule = new RRule(this.options);
      this.rule.options.bymonth = [];
      this.calcPastOrRemained();
      this.emitChange();
      this.showMonthOptions = this.options.freq === RRule.MONTHLY;
      this.showWeekdays = this.options.freq === RRule.WEEKLY || (this.options.freq === RRule.MONTHLY && this.monthlyInputMode === 'week');
      if (!this.showWeekdays)
        this.options.byweekday = [];
      this.populateNextOccurrences()
    } catch (err) {
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
    this.RRuleStrChange.emit({value: this.rule.options.freq ? this.rule.toString() : '', error: this.validate()});
  }

  private populateNextOccurrences() {
    if (this.rule.options.freq) {
      let d = new Date();
      let d2 = moment(d).add(366, 'd').toDate();
      this.text = this.rule.between(d, d2).map(r => moment(r).format('ddd DD-MMM-YY')).splice(0, 10).concat([this.rule.toString()]).join('\n');
    }
    else {
      this.text = '';
    }
  }

  validate() {
    let v = '';
    if (this.options.freq === RRule.WEEKLY && !this.byweekday.length) {
      v = 'choose a weekday';
    }
    else if (this.rule.options.freq === RRule.MONTHLY && this.monthlyInputMode === 'week') {
      if (this.bysetpos.length && !this.byweekday.length) {
        v = 'choose weekdays';
      }
      else if (this.options.freq === RRule.MONTHLY && this.byweekday.length && !this.bysetpos.length) {
        v = 'choose week numbers in month';
      }
      else if (!this.byweekday.length && !this.bysetpos.length) {
        v = 'choose week numbers and weekdays';
      }
    }
    else if (this.rule.options.freq === RRule.MONTHLY && this.monthlyInputMode === 'month') {
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
    this.onChange();
  }

  byweekdayChange(event) {
    this.multipleChoice(event, 'byweekday');
    this.options.byweekday = this.byweekday;
    delete this.options.bymonthday;
    this.onChange();
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
    this.onChange();
  }

  monthDaysRemainedChange(event) {
    this.monthDaysRemained = event;
    this.bymonthday = this.bymonthday.filter(r => r > 0).concat(this.monthDaysRemained.map(r => -r));
    if (this.options.bymonthday !== this.bymonthday) {
      this.options.bymonthday = this.bymonthday;
      this.onChange();
    }
  }

  monthDaysPastChange(event) {
    this.monthDaysPast = event;
    this.bymonthday = this.bymonthday.filter(r => r < 0).concat(this.monthDaysPast);
    if (this.options.bymonthday !== this.bymonthday) {
      this.options.bymonthday = this.bymonthday;
      this.onChange();
    }
  }

  weekposChange(event) {
    this.multipleChoice(event, 'bysetpos');
    this.options.bysetpos = this.bysetpos;
    delete this.options.bymonthday;
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
