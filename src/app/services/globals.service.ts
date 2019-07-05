import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {

  public minutesPerPixel = 1000 / 300;
  public zeroTime = moment().subtract(120, 'm');
  public rangeMode = 'offset';
  public offsetFrom: number;

  constructor() { }
}
