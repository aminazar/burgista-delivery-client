import { Component, OnInit } from '@angular/core';
import {MdDialogRef} from "@angular/material";

import {PrintService} from "../print.service";

@Component({
  selector: 'app-print-viewer',
  templateUrl: './print-viewer.component.html',
  styleUrls: ['./print-viewer.component.css']
})
export class PrintViewerComponent implements OnInit {
  unitName_title: string = '';
  unitName_subTitle: string = '';
  isOverallPrint: boolean = false;
  currentDate: Date = new Date();
  itemList: any[] = [];

  constructor(public dialogRef: MdDialogRef<PrintViewerComponent>, private printService: PrintService) { }

  ngOnInit() {
    this.unitName_title = this.printService._unitSupplier;
    this.unitName_subTitle = this.printService._unitConsumer;

    this.itemList = this.printService.getItems();
  }

}
