import { Component, OnInit, Input } from '@angular/core';
import { MessengerService } from 'src/app/services/messenger.service';

@Component({
  selector: 'app-gantt-item',
  templateUrl: './gantt-item.component.html',
  styleUrls: ['./gantt-item.component.scss']
})
export class GanttItemComponent implements OnInit {
  public start: number;
  public width: number;
  public isItem  = true;
  public isHourMarker = true;
  public resource: string;
  public statusText: string;
  public stand: string;

  constructor( private messenger: MessengerService) {

    const that = this;
    messenger.updateNow$.subscribe(data => {
      if (that.isItem || this.isHourMarker) {

      } else {
        // Updates the now indicator
        that.start = data.left;
      }
    });
   }

  ngOnInit() {
  }

  setInput(start: number, width: number, resource: string, isItem: boolean, isHourMarker: boolean, statusText: string, stand: string) {

    this.start = start;
    this.width = width;
    this.resource = resource;
    this.isItem = isItem;
    this.isHourMarker = isHourMarker;
    this.statusText = statusText;
    this.stand = stand;
  }

  getClass() {

    if (this.stand.startsWith('Unassigned')) {
      return 'Unassigned';
    }
    if (this.statusText.startsWith('SH')) {
      return 'SH';
    }
    if (this.statusText.startsWith('OB')) {
      return 'OB';
    }
  }

}
