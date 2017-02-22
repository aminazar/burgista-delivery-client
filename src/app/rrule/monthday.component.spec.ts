import {async, ComponentFixture, TestBed, tick, fakeAsync} from '@angular/core/testing';
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
  }));

  it('should have 31 toggle buttons as checkboxes', fakeAsync(() => {
    let de : DebugElement = fixture.debugElement.queryAllNodes(By.css('input'));
    let toggleList = de.filter(r=>r.nativeElement.type==='checkbox');
    expect(toggleList.length).toBe(31);
  }));

  it('should change multiple days on multiple clicks', fakeAsync(()=>{
    let de : DebugElement = fixture.debugElement.queryAllNodes(By.css('input'));
    let toggleList = de.filter(r=>r.nativeElement.type==='checkbox');
    toggleList[1].nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    tick();
    expect(component.days).toContain(2);
    toggleList[2].nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    tick();
    expect(component.days.length).toBe(2);
    expect(component.days).toContain(3);
  }));
});
