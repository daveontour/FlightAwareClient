import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

@Component({
  template: `
    <div class="modal-header" style="color:black">
      <h4 class="modal-title">Add Counter Allocation</h4>
    </div>
    <div class="modal-body" style="color:black" align="left">
      <table>
      <tr><td><label>First Counter:&nbsp;</label></td><td>
      <select [(ngModel)]="this.first" style="width:100px;background-color:white; color:black" >
         <option *ngFor="let counter of counters" [value]="counter.code">{{counter.code}}</option>
      </select>
      </td></tr>
      <tr><td><label>Last Counter:&nbsp;</label></td><td>
      <select [(ngModel)]="this.last" style="width:100px;background-color:white; color:black">
      <option *ngFor="let counter of counters" [value]="counter.code">{{counter.code}}</option>
   </select>
      </td></tr>

      <tr><td><label>Date:&nbsp;</label></td><td> <input class="gridinput" id = "day"  style="width:150px;background-color:white; color:black" type="date"></td></tr>
      <tr><td><label>Start Time:&nbsp;</label></td><td> <input type="time"  id = "start" style="background-color:white; color:black"></td></tr>
      <tr><td><label>End Time:&nbsp;</label></td><td> <input type="time"  id = "end" style="background-color:white; color:black"></td></tr>
      <tr><td><label>Airline:&nbsp;</label></td><td><input type="text" id = "airline" style="background-color:white; color:black"/></td></tr>
      <tr><td><label>Flight Number:&nbsp;</label></td><td><input type="text" id = "flight" style="background-color:white; color:black"/></td></tr>
      <tr><td><label>Scheduled Time:&nbsp;</label></td><td><input type="time" id = "sto" style="background-color:white; color:black"/></td></tr>
       </table>
      <p style="color:red">{{message}}</p>
    </div>
    <div class="modal-footer">
    <button type="button" class="btn btn-outline-dark" (click)="button2Click()">Cancel</button>
    <button type="button" class="btn btn-outline-dark" (click)="button1Click()">Allocate</button>
    </div>
  `
})
export class AddAllocationDialogComponent {

  @Input() message: string;
  @Input() counters: string[];

  public first: string;
  public last: string;
  public day: string;
  public start: string;
  public end: string;
  public airline: string;
  public flight: string;
  public sto: string;

  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) { }

  button1Click(): any {
    //this.first = $('#first').val().toString();
    //this.last = $('#last').val().toString();
    this.day = $('#day').val().toString();
    this.start = $('#start').val().toString();
    this.end = $('#end').val().toString();
    this.airline = $('#airline').val().toString();
    this.flight = $('#flight').val().toString();
    this.sto = $('#sto').val().toString();


   debugger;

    this.activeModal.close({ login: true, first: this.first, last: this.last, day: this.day, start: this.start, end: this.end, airline: this.airline, flight: this.flight, sto: this.sto });
  }
  button2Click(): any {

    this.activeModal.close({ login: false });
  }
}
