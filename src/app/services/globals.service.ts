import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {

  public minutesPerPixel = 1000 / 400;
  public zeroTime = moment().subtract(120, 'm');
  public rangeMode = 'offset';
  public offsetFrom = -120;
  public offsetTo = 240;
  public airports: any;

  constructor() { }
}
