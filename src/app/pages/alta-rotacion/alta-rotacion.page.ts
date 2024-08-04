import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { Parquimetro } from 'src/app/interfaces/markers.interface';
import { DataFormService } from 'src/app/services/data-form.service';
import { StorageService } from '../../services/starage.service';
import { GestionRutasService } from 'src/app/services/gestion-rutas.service';
import { MapItemsComponent } from 'src/app/components/map-items/map-items.component';


interface AltaRotacion {
  barrio: string,
  items: Parquimetro[]
}

@Component({
  selector: 'app-alta-rotacion',
  templateUrl: './alta-rotacion.page.html',
  styleUrls: ['./alta-rotacion.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    NavbarComponent,
    MapItemsComponent
  ]
})
export class AltaRotacionPage implements OnInit {

  private dataFormService = inject( DataFormService );
  private storageService = inject( StorageService );
  public gestionRutasService = inject( GestionRutasService );

  itemsAltaRotacion!: Parquimetro[];
  barriosSort: AltaRotacion[] = [];
  verMapa: boolean = false;
  iconPin = 'assets/img/pin-marker-alias.png';
  centroMap: {lat: number, lng: number} = {lat: 40.459706, lng: -3.6899817};
  zoomMap: number = 12;

  constructor() {
                localStorage.setItem('page', 'alta-rotacion');
    this.dataFormService.obtenerItemsAltaRotacion();
    this.gestionRutasService.pageActive = 'alta-rotacion';
    }

  ngOnInit() {
    this.getLogacStorage();
    this.verMapa = false;
  }

  getLogacStorage() {
    const storaString = String(this.storageService.getLocalStorage('itemsAR'));
    const itemsRotacion = JSON.parse( storaString );
    this.itemsAltaRotacion = Object.values( itemsRotacion );
    this.barriosSort = JSON.parse( String(localStorage.getItem('barriosAR')) );
    for ( let element of this.itemsAltaRotacion ) {
      element.latitud = Number(element.latitud);
      element.longitud = Number(element.longitud);
    }
}

  mostrarMapa() {
    this.zoomMap = 12;
    // this.centroMap = {lat: 40.459706, lng: -3.6899817};
    this.verMapa = true;
    setTimeout( () => {
      this.zoomMap = 13;
    }, 200)
  }

  cerrarMapa(event: any) {
    this.verMapa = false;
  }

}
