import { Component, Input, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Parquimetro } from '../../interfaces/markers.interface';
import { IonicModule } from '@ionic/angular';
import { GestionRutasService } from 'src/app/services/gestion-rutas.service';

@Component({
  selector: 'app-detalles-modal',
  templateUrl: './detalles-modal.component.html',
  styleUrls: ['./detalles-modal.component.scss'],
  standalone: true,
  imports: [ IonicModule ]
})
export class DetallesModalComponent implements OnInit {

  public gestionRutasService = inject( GestionRutasService );

  @Output() cerrarAlert: EventEmitter<boolean> = new EventEmitter();
  @Output() tareaRealizada: EventEmitter<Parquimetro> = new EventEmitter();
  @Input() titulo!: string;
  @Input() item!: Parquimetro;
  @Input() rutaActiva!: string;

  constructor( ) {}

  ngOnInit() {
    this.rutaActiva = this.gestionRutasService.pageActive;
  }

  async comoLlegar( marker: Parquimetro, mapa: string ) {

    if ( mapa === 'google' ) {
     Browser.open({url: `https://maps.google.com/?q=${marker.latitud},${marker.longitud}`});
    } else if ( mapa === 'apple' ) {
      Browser.open({url: `maps://maps.google.com/maps?daddr=${marker.latitud},${marker.longitud}&amp;ll=`});
    } else {
      Browser.open({url: `https://www.waze.com/ul?ll=${marker.latitud}%2C${marker.longitud}&navigate=yes&zoom=17`});
    }
  }


  closeModal( event: any ) {
    if ( event.target.className.includes('modal-background') ) {
      this.cerrarAlert.emit( true );
    }
  }

  tareaHecha( item: Parquimetro ) {
    this.tareaRealizada.emit( item );
  }

  isMobileIphone(){
    return (
      (navigator.userAgent.match(/iPhone/i)) ||
      (navigator.userAgent.match(/iPod/i)) ||
      (navigator.userAgent.match(/iPad/i))
    );
  }
}
