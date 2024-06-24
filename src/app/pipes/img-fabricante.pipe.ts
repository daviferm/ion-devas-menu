import { Pipe, PipeTransform } from '@angular/core';
import { Parquimetro } from '../interfaces/markers.interface';

@Pipe({
  name: 'imgFabricante'
})
export class ImgFabricantePipe implements PipeTransform  {

  transform(value: Parquimetro): string {

    const fabricante = value.fabricante;
    if ( fabricante === 'Parkeon' ) {
      return 'assets/img/parkeon.png';
    }
    if ( fabricante === 'Parkare' ) {
      return 'assets/img/parkare.png';
    }
    if ( fabricante === 'WisePark' ) {
      return 'assets/img/wispark.png';
    }


    return 'assets/img/icono-verde.png';
  }

}
