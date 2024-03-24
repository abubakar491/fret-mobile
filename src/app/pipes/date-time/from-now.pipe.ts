/**
 * Created by Reda SAKHI - http://www.leconsultant.ma
 * @ngModule Utils
 * @whatItDoes Using Moment, returns Time Ago in the desired language.
 * @howToUse `string_expression | fromNow:lang`
 *
 **/
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'fromNow'
})
export class FromNowPipe implements PipeTransform {

  transform(value: any, lang?: any): any {
    if (typeof lang !== 'undefined') {
      moment.locale(lang);
    }
    if (value == null) { return value; }

    if (!this.supports(value)) {
      throw Error(`InvalidPipeArgument: '${value}' for pipe 'fromNow'`);
    }

    return moment(value).fromNow();
  }

  private supports(obj: any): boolean { return typeof obj === 'string'; }

}
