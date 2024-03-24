// tslint:disable:max-line-length
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], type: string, field: string, value: string): any[] {
    if (!items) {
        return [];
    } else if (!value) {
      return items;
    }
    console.log('items to filter', items);
    if (type === 'orders') {
        return items.filter(order =>
            order['ref'].toLowerCase().includes(value.toLowerCase())
            || order['from'].name.toLowerCase().includes(value.toLowerCase())
            || order['to'].name.toLowerCase().includes(value.toLowerCase())
         
        );
    } else {
        if (!field || !value) {
          return items;
        }
        return items.filter(singleItem => singleItem[field].toLowerCase().includes(value.toLowerCase()));
      }
    }
}
