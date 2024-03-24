import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'minuteToHour'
})
export class MinuteToHourPipe implements PipeTransform {

  transform(value: number): string {
    var div=parseInt(value/60+"");
    var mod=parseInt(value%60+"");
    if(div!=0 && mod!=0)
      return div+'h'+mod;
    else if(mod==0)
    return div+'h';
    else if(div==0)
    return mod+'min';
    
  }

}
