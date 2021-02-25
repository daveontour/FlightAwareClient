import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  template: `
    <div class="modal-header" style="color:black">
      <h4 class="modal-title">Delete Allocation</h4>
    </div>
    <div class="modal-body" style="color:black" align="left">
    
    Delete Allocation <strong>{{alloc.airline}}{{+alloc.flightNumber}} Start Time: {{alloc.startTime}},  End Time: {{alloc.endTime}}</strong> ?
    
    </div>
    <div class="modal-footer">
    <button type="button" class="btn btn-outline-dark" (click)="button2Click()">Cancel</button>
    <button type="button" class="btn btn-outline-dark" (click)="button1Click()">Delete</button>
    </div>
  `
})
export class DeleteDialogComponent  {

  @Input() alloc: any;

  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) { }

  button1Click(): any {
    this.activeModal.close({ login: true, allocation:this.alloc});
  }
  button2Click(): any {
    this.activeModal.close({ login: false });
  }
}
