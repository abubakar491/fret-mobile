/**
 * Created by Reda SAKHI - http://www.leconsultant.ma
 * @ngModule Utils
 * @whatItDoes Using Moment, adds a value to a date and returns result bu unit.
 * @howToUse `value | dateDiffDuration:'unit'`
 * Empty 'value' : uses current time
 * Units : days, hours, minutes, secondes, millisecondes
 *
 **/
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'dateAdd'
})
export class DateAddPipe implements PipeTransform {

  transform(value: any, amount: moment.DurationInputArg1, unit?: moment.DurationInputArg2): any {
      if (typeof amount === 'undefined' || (typeof amount === 'number' && typeof unit === 'undefined')) {
          throw new Error('AddPipe: missing required arguments');
      }
      value = (value.length) ? value : moment().format('YYYY-MM-DD HH:mm:ss').toString();
      return moment(value).add(amount, unit).format('YYYY-MM-DD HH:mm:ss');
  }

}
