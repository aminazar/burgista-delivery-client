import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import { MonthdayComponent } from './monthday.component';
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {MaterialModule} from "@angular/material";
import {DebugElement} from "@angular/core";

describe('MonthdayComponent', () => {
  let component: MonthdayComponent;
  let fixture: ComponentFixture<MonthdayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthdayComponent ],
      imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        MaterialModule.forRoot(),
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthdayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compose 31 toggle buttons', async(()=>{
    let de : DebugElement = fixture.debugElement.queryAllNodes(By.css('div'));
    let toggleList = de.filter(r=>r.nativeElement.className.indexOf('button-toggle')!==-1);
    expect(toggleList.length).toBe(31);
    expect(toggleList.map(r=>r.nativeElement.innerHTML).indexOf('11')).not.toBe(-1);
  }))
});
