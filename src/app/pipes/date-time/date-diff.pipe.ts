/**
 * Created by Reda SAKHI - http://www.leconsultant.ma
 * @ngModule Utils
 * @whatItDoes Using Moment, returns Date Difference between two given dates.
 * @howToUse `dateFrom | dateDiff : dateTo : 'unit' : true}}`
 * Units : days, hours, minutes, secondes, millisecondes
 *
 **/
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

// under systemjs, moment is actually exported as the default export, so we account for that
const momentConstructor: (value?: any) => moment.Moment = (<any>moment).default || moment;

@Pipe({
  name: 'dateDiff'
})
export class DateDiffPipe implements PipeTransform {

  transform(value: Date | moment.Moment, otherValue: Date | moment.Moment, unit?: moment.unitOfTime.Diff, precision?: boolean): number {
      const date = momentConstructor(value);
      const date2 = (otherValue !== null) ? momentConstructor(otherValue) : momentConstructor();
      return date.diff(date2, unit, precision);
    }

}
