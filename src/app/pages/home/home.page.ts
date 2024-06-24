import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { NavbarService } from 'src/app/components/navbar/navbar.service';
import { LayerBarrio, Parquimetro } from 'src/app/interfaces/markers.interface';
import { DataFormService } from 'src/app/services/data-form.service';
import { GestionRutasService } from 'src/app/services/gestion-rutas.service';
import { MapPolygonService } from 'src/app/services/map-polygon.service';
import { ModalInfoComponent } from 'src/app/components/modal-info/modal-info.component';
import { MapaComponent } from 'src/app/components/mapa/mapa.component';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, NavbarComponent, ModalInfoComponent, MapaComponent]
})
export class HomePage implements OnInit {

  private dataFormService = inject( DataFormService );
  private mapPolygonService = inject( MapPolygonService );
  private navbarService = inject( NavbarService );
  public gestionRutasService = inject( GestionRutasService );

  centroMap: {lat: number, lng: number} = {lat: 40.459706, lng: -3.6899817};
  zoomMap: number = 12;
  barriosSelec: LayerBarrio[] = [];
  zoomMapItem: number = 12;
  centroMapItem!: {lat: number, lng: number};
  marcador!: Parquimetro;
  selectedBarrio!: any;
  // mapSearch: boolean = false;
  mostrarMarker: boolean = false;
  mostrarBtnInfo: boolean = true;
  modalOpen: boolean = false;


  constructor() {
      this.barriosSelec = this.mapPolygonService.barriosLayers;
      this.gestionRutasService.pageActive = 'home';
  }

  ngOnInit() {
    //=====================================
    // Muestra el parquímetro que buscamos
    //=====================================
    this.dataFormService.enviarPageHome.subscribe( (mark: Parquimetro) => {
      this.navbarService.mostrarOcultarNavbar.emit( false );
      this.mostrarMarker = true;
      this.mostrarBtnInfo = false;
      mark.latitud = Number(mark.latitud);
      mark.longitud = Number(mark.longitud);
      this.zoomMap = 12;
      this.marcador = mark;
      this.centroMap = { lat: Number(mark.latitud), lng: Number(mark.longitud) };
      this.barriosSelec = [];
      const barrio = this.mapPolygonService.getBarrio( mark.barrio.slice(0,3) );
      this.barriosSelec.push( barrio! );
      setTimeout( () => {
        this.zoomMap = 14;
      }, 100 );
    } )
  }

  //=====================================
  // Volver al mapa principal
  //=====================================
  volverMapaGeneral( event: any ) {
    if ( event ) {
      this.mostrarMarker = false;
      this.mostrarBtnInfo = true;
    }
  }

  openModalInfo() {
    this.modalOpen = true;
  }

  closeModalInfo(event: boolean) {
    this.modalOpen = false;
  }

  mostrarBotonInfo(event: boolean) {
    if ( event ) {
      // Quetar boton info
      this.mostrarBtnInfo = false;
    } else {
      // Mostrar boton info
      this.mostrarBtnInfo = true;
    }
  }


}
