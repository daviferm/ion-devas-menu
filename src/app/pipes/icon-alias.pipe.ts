import { Pipe, PipeTransform } from '@angular/core';
import { GestionRutasService } from '../services/gestion-rutas.service';

@Pipe({
  name: 'iconAlias'
})
export class IconAliasPipe implements PipeTransform {

  constructor( private gestionRutasService: GestionRutasService ) {

  }

  transform(value: string): string {

    const ruta = this.gestionRutasService.pageActive;

    if ( ruta === 'alta-rotacion' ) {
      return value.slice(7,10);
    } else {
      return value.slice(6,10);
    }

  }

}
