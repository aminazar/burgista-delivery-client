"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var rrule_1 = require('rrule');
var RruleComponent = (function () {
    function RruleComponent() {
        this.RRuleStrChange = new core_1.EventEmitter();
        this.rule = new rrule_1.RRule({ freq: 1 });
        this.freqs = ['Daily', 'Weekly', 'Monthly'];
    }
    RruleComponent.prototype.ngOnInit = function () {
        this.options = { freq: rrule_1.RRule.DAILY };
        this.rule = new rrule_1.RRule(this.options);
        this.freqsConst = [rrule_1.RRule.DAILY, rrule_1.RRule.WEEKLY, rrule_1.RRule.MONTHLY];
    };
    RruleComponent.prototype.onChange = function () {
        this.rule = new rrule_1.RRule(this.options);
        this.RRuleStrChange.emit(this.rule.toString());
    };
    __decorate([
        core_1.Input()
    ], RruleComponent.prototype, "RRuleStr");
    __decorate([
        core_1.Output()
    ], RruleComponent.prototype, "RRuleStrChange");
    RruleComponent = __decorate([
        core_1.Component({
            selector: 'app-RRule',
            templateUrl: './RRule.component.html',
            styleUrls: ['./RRule.component.css']
        })
    ], RruleComponent);
    return RruleComponent;
}());
exports.RruleComponent = RruleComponent;
