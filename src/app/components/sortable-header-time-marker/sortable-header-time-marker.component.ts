import { MessengerService } from './../../services/messenger.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sortable-header-time-marker',
  templateUrl: './sortable-header-time-marker.component.html',
  styleUrls: ['./sortable-header-time-marker.component.scss']
})
export class SortableHeaderTimeMarkerComponent implements OnInit {

  public left: number;
  public val: string;
  public top: boolean;

  constructor( private messenger: MessengerService) {

   }

  ngOnInit() {
  }

  setInput(left: number, val: string, top: boolean) {

    this.left = left;
    this.val = val;
    this.top = top;
  }

}
