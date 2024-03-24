/**
 * Created by Reda SAKHI - http://www.leconsultant.ma
 * @ngModule Utils
 * @whatItDoes Using Moment, returns Date in the desired language & Format.
 * @howToUse `string_expression | dateFormat : lang : format`
 *
 **/
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  transform(value: any, lang?: any, format?: any): any {

    const _lang = (typeof lang === 'undefined' || lang === '') ? 'fr' : lang;
    moment.locale(_lang);

    if (value == null) { return value; }

    if (!this.supports(value)) {
      throw Error(`InvalidPipeArgument: '${value}' for pipe 'dateFormat'`);
    }

    const _format = (typeof format === 'undefined' || format === '') ? 'DD/MM/YYYY' : format;
    // console.log('Sort Date: ', value, ', Format; ', _format);
    return moment(value).format(_format);
  }

  private supports(obj: any): boolean { return typeof obj === 'string'; }


}
