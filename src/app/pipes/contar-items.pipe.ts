import { Pipe, PipeTransform } from '@angular/core';
import { BarrioInterface } from '../interfaces/markers.interface';

@Pipe({
  name: 'contarItems',
  pure: false // Escucha cualquier cambio en el componente
})
export class ContarItemsPipe implements PipeTransform {

  transform(value: BarrioInterface): string {


    const items = value.items;
    let realizados = 0;

    items.forEach(elem => {
      if ( elem.hecho ) {
        realizados ++;
      }

    });
    const resultado = ` ${items.length - realizados}/${items.length} `;

    return resultado;
  }

}
