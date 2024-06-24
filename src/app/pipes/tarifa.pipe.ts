import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tarifa'
})
export class TarifaPipe implements PipeTransform {

  transform(value: string, ): string {

    return ( value === 'AR' ) ? 'Alta rotación.' : 'Tarifa normal.'
  }

}
