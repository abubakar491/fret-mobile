// tslint:disable:max-line-length
/**
 * Created by Reda SAKHI - http://www.leconsultant.ma
 * @ngModule Utils
 * @whatItDoes Using Moment, returns duration from time by unit.
 * @howToUse `value | dateDiffDuration:'unit'`
 * Units : days, hours, minutes, secondes, millisecondes
 *
 **/
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';


@Pipe({
  name: 'dateDiffDuration'
})
export class DateDiffDurationPipe implements PipeTransform {

  transform(value: any, ...args: string[]): any {
    if (typeof args === 'undefined' || args.length !== 1) {
      throw new Error('DurationPipe: missing required time unit argument');
    }
    const valueToPass = ((value < 0) ? value * (-1) : value);
    const days = moment.duration(valueToPass, args[0] as moment.unitOfTime.DurationConstructor).asDays().toFixed();
    const hours = Math.floor(moment.duration(valueToPass, args[0] as moment.unitOfTime.DurationConstructor).asHours() % 24);
    const minutes = Math.floor(moment.duration(valueToPass, args[0] as moment.unitOfTime.DurationConstructor).asMinutes() % 60);

    return ((value < 0) ? '-' : '') + ((+days > 0) ? days + 'j' : '') + ((+hours > 0) ? hours + 'h' : '') + ((+minutes > 0) ? minutes + 'm' : '');
  }

}
