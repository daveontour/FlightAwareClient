import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  template: `
    <div class="modal-header" style="color:black">
      <h4 class="modal-title">Upload Schedule File</h4>
    </div>
    <div class="modal-body" style="color:black" align="left">
      <table>
       <tr><td><label>Schedule File:&nbsp;</label></td><td><input type="file"  (change)="handleFileInput($event.target.files)" id = "file" style="background-color:white; color:black"/></td></tr>
      </table>
      <p style="color:red">{{message}}</p>
    </div>
    <div class="modal-footer">
    <button type="button" class="btn btn-outline-dark" (click)="button2Click()">Cancel</button>
    <button type="button" class="btn btn-outline-dark" (click)="button1Click()">Load File</button>
    </div>
  `
})
export class UploadFileDialogComponent  {

  @Input() message: string;
  public fileToUpload: File = null;

  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) { }

  button1Click(): any {
    this.activeModal.close({ login: true, file: this.fileToUpload });
  }
  button2Click(): any {
    this.activeModal.close({ login: false });
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }
}
