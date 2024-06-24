import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Observable, Observer, interval } from 'rxjs';
import { GeolocationPosition } from '../interfaces/markers.interface';


@Injectable({
  providedIn: 'root'
})
export class NativeGeolocationService {

  $intervalo = interval(800);

  constructor() {}


  async getGeolocation(): Promise<any> {
    const coordinates = await Geolocation.getCurrentPosition();
    return coordinates;
  }

  watchPosition(): Observable<GeolocationPosition>  {

    return new Observable( ( observer: Observer<any> ) => {

      this.$intervalo.subscribe( () => {
        Geolocation.getCurrentPosition().then( ( position: any ) => {

          observer.next( position )

        }, (err:any)  => {
          console.log('Error de Geololocalización: ', err);
        })
      } )

    } )
  }
}
