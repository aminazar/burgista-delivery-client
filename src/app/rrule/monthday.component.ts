import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-monthday',
  templateUrl: './monthday.component.html',
  styleUrls: ['./monthday.component.css']
})
export class MonthdayComponent implements OnInit {
  private _days:number[]=[];
  @Input()
  set days(val:number[]){
    this._days=val;
    this.daysChange.emit(val);
  }
  get days(){
    return this._days;
  }

  @Output() daysChange = new EventEmitter<number[]>();
  @Input() reverse:boolean;

  private calDays: number[][] = [];

  constructor() {
  }

  ngOnInit() {
    for (let i = 0; i < 5; i++) {
      let row: number[] = [];
      for (let j = 0; j < 6 || (i === 4 && j < 7); j++) {
        let val = i * 6 + j + 1;
        if (this.reverse)
          val = 31 - val;
        row.push(val);
      }
      this.calDays.push(row);
    }
  }

  monthDaysChange(event) {
    let val =event.value;
    if(this.reverse)
      val++;
    if (event.source.checked) {
      if (this.days.indexOf(val) === -1) {
        this.days.push(val);
      }
    }
    else {
      if (this.days.indexOf(val) !== -1) {
        this.days.splice(this.days.indexOf(val), 1)
      }
    }
    this.daysChange.emit(this._days);
  }
}
