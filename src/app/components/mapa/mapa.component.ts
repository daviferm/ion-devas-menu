import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Component, OnInit, Input, EventEmitter, Output, Renderer2, inject  } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';

import { MapPolygonService } from '../../services/map-polygon.service';
import { LayerBarrio, Parquimetro } from '../../interfaces/markers.interface';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { DataFormService } from 'src/app/services/data-form.service';
import { NavbarService } from '../navbar/navbar.service';
import { NativeGeolocationService } from 'src/app/services/native-geolocation.service';
import { Browser } from '@capacitor/browser';
import { PipesModule } from 'src/app/pipes/pipes.module';


@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss'],
  standalone: true,
  imports: [IonicModule, GoogleMapsModule, CommonModule, PipesModule]
})
export class MapaComponent  implements OnInit {

  public polygonService = inject( MapPolygonService );
  // private modalCtrl = inject( ModalController );
  private dataFormService = inject( DataFormService );
  private navbarService = inject( NavbarService );
  private nativeLocationService = inject( NativeGeolocationService );
  private actionSheetCtrl = inject( ActionSheetController );
  private renderer = inject( Renderer2 );

  @Input() zoomMap!: number;
  @Input() marcadores: Parquimetro[] = [];
  @Input() centroMap!: {lat: number, lng: number};
  @Input() marcador!: Parquimetro | undefined;
  @Input() mostrarMarker!: boolean;
  pinBarrios: boolean = false;
  infoMarker!: Parquimetro;

  openModal: boolean = false;

  @Output() closeMap: EventEmitter<boolean> = new EventEmitter();
  @Output() botonInfo: EventEmitter<boolean> = new EventEmitter();
  @Output() sendCoords: EventEmitter<{lat: number, lng: number}> = new EventEmitter();
  @Output() mapaItems: EventEmitter<string> = new EventEmitter();
  @Input() gpsLatLng!: {alias: string, lat: number, lng: number};

  @Input() fabricante!: string;
  @Input() barriosSelec!: LayerBarrio[];
  @Input() barriosFull: LayerBarrio[] = [];
  @Input() itemsBarrio!: Parquimetro[] | undefined;
  @Input() markerSoport!: Parquimetro;
  @Input() mapMarker!: boolean;
  vertices!: LayerBarrio[];
  tareaTitle!: string;

  imgMarcadores: string = 'assets/img/pin-marker-alias.png';
  imgBase: string = 'assets/img/pin-alias.png';
  imgPosition = 'assets/icon/marker-car.png';
  imgSoporte = 'assets/img/pin-soporte.png';

  latGps!: number;
  lngGps!: number;
  gps = false;
  textInfo = { barrio: '', numero: 0 };
  modalTop = false;
  $subscription!: Subscription;
  $obsLocation!: Subject<unknown>;
  $obsGps!: Subscription;
  $obsCenterGps!: Subscription;
  siguiendo: boolean = false;
  idxBarrioSelected!: number;
  infoWindow: boolean = false;
  btnMarker!: Parquimetro;
  botonGoogle = {
    text: 'Google Maps',
    role: 'selected',
    icon: 'map-outline',
    handler: () => {
      this.comoLlegar(this.btnMarker, 'google');
    },
  };
  botonApple =  {
    text: 'Apple Maps',
    role: 'selected',
    icon: 'navigate-outline',
    handler: () => {
      this.comoLlegar(this.btnMarker, 'apple');
    },
  };
  botonCancel = {
    text: 'Cancelar',
    role: 'destructive',
    data: {
      action: 'cancel',
    },
  };

  @Input() center: google.maps.LatLngLiteral = { lat: 40.458930, lng: -3.685516 };

  mapOptions: google.maps.MapOptions = {
    center: this.center,
    zoom : 12.5,
    disableDefaultUI: true,
    scaleControl: true,
    fullscreenControl: false,
    gestureHandling: 'greedy',
    mapTypeControl: false,
    rotateControl: true,
    streetViewControl: false,
    panControl: true,
  }
  polygonOptions: google.maps.PolygonOptions = {
    fillColor: '#5cc9f5',
    fillOpacity: .4,
    strokeColor: 'black',
    strokeWeight: 0.5,
    geodesic: true
  }
  // markerOptions: google.maps.MarkerOptions = {
  //   draggable: false,
  // };

  markerGpsOptions: google.maps.MarkerOptions = {
    draggable: false,
    zIndex: 10000
  };
  markerSoporteOptions: google.maps.MarkerOptions = {
    draggable: true,
    zIndex: 10000
  };
  // markerPosition!: google.maps.LatLngLiteral;

  constructor() {

    this.barriosFull = this.polygonService.barriosLayers;
  }


  ngOnInit(): void {
    this.infoWindow = true;
  }

  ngOnDestroy() {
    if ( this.siguiendo ) {
      this.gps = false;
      this.$subscription.unsubscribe();
    }
  }


  obtenerPosicion() {

    this.$subscription = this.nativeLocationService.watchPosition().subscribe( position => {
      if ( position ) {
        this.gps = true;
        this.latGps = Number(position.coords.latitude);
        this.lngGps = Number(position.coords.longitude);
      }
    } )
  }

  centrarPosicionGps( mapa: GoogleMap ) {
    mapa.panTo( {lat: this.latGps, lng: this.lngGps} );
  }

  cerrarMapa() {
    this.closeMap.emit( true );
    this.marcador = undefined;
    // this.navbarService.mostrarOcultarNavbar.emit( true );
    this.modalTop = false;
    this.gps = false;
  }
  cerrarToast( toas: string ) {

    this.renderer.addClass( toas, 'bounceOutUp' );
  }

  dragStart(  ) {
    // Ocultas ToastController
    this.infoWindow = false;

  }
  dragEnd( event:  google.maps.MapMouseEvent ) {
    const coords = {lat: Number(event.latLng?.lat()), lng: Number(event.latLng?.lng())};
    this.sendCoords.emit( coords );
  }


  sobrePolygon( idx: number) {
    this.barriosSelec.forEach( (v,i) => {
      v.options = {
        ...v.options,
        fillColor: '#5cc9f5',
        strokeWeight: 0.5,
        strokeColor: 'black'
      }
      if ( idx === i ) {
        v.options = {
          ...v.options,
          fillColor: 'green',
          strokeWeight: 1,
          strokeColor: 'black'
        }
      }
    } )
    const numBarrio = this.barriosSelec[idx].id.substring(0, 3);
    const barrio = this.dataFormService.obtenerNumeroParkimetros(numBarrio);
    this.textInfo.numero = barrio;
    this.textInfo.barrio = this.barriosSelec[idx].id;
    this.modalTop = true;
    this.idxBarrioSelected = idx;
  }

  mapaClick() {
    this.barriosSelec.forEach( v => {
      v.options = {
        ...v.options,
        fillColor: '#5cc9f5',
        strokeWeight: 0.5
      }
    } );
    this.modalTop = false;
  }

  changeCenter() {
    if ( this.marcador ) {
      this.obtenerPosicion();
    }
  }

  abrirModal( marker: Parquimetro ) {
    this.infoMarker = marker;
    this.openModal = true;
  }
  cerrarModalInfo( event: boolean ) {
    this.openModal = false;
  }

  mostrarBarrio() {

    this.pinBarrios = true;
    this.obtenerPosicion();
    const barrio = this.textInfo.barrio.slice(0,3);
    const centro = this.optenerCentro( barrio );
    setTimeout( () => {
      this.zoomMap = 12;
      }, 50 )

    setTimeout( () => {
      this.zoomMap = 15;
      this.centroMap = centro;
      }, 70 )

    this.itemsBarrio = this.dataFormService.obtenerBarrrio( String(barrio) );

    if ( this.itemsBarrio ) {
      this.itemsBarrio.forEach( item => {
        item.latitud = Number( item.latitud );
        item.longitud = Number( item.longitud );
      } )
    }

    this.navbarService.mostrarOcultarNavbar.emit( false );
    this.modalTop = false;
    this.botonInfo.emit( true );

  }

  volverAlMapaGeneral() {
    this.pinBarrios = false;
    this.itemsBarrio = undefined;
    this.closeMap.emit( true );
    this.barriosSelec = this.polygonService.barriosLayers;
    this.navbarService.mostrarOcultarNavbar.emit( true );
    this.modalTop = false;
    if ( this.$subscription ) {

      this.$subscription.unsubscribe();
      this.siguiendo = !this.siguiendo;

    }
    setTimeout( () => {
      this.zoomMap = this.zoomMap;
    }, 100 );
    setTimeout( () => {
      this.zoomMap = 12;
      this.centroMap = {lat: 40.459706, lng: -3.6899817};
    }, 120 );

    this.gps = false;
    this.botonInfo.emit( false );

    // this.$subscription.unsubscribe();

  }

  zoomChangeMap( mapa: GoogleMap ) {
    if ( this.itemsBarrio ) {

      if ( mapa.getZoom() === 17 ) {
        this.itemsBarrio!.forEach( item => item.idx = item.alias );
      }
      if ( mapa.getZoom() === 16 ) {
        this.itemsBarrio!.forEach( item => item.idx = '' );
      }

    }
  }

  draggableChanged() {
    // const position = this.markerSoporte.getPosition();
    // if ( position ) {
    //   this.sendCoords.emit( {lat: position.lat(), lng: position.lng()} );
    // }
  }

  //===============================================
  // Obtener centro del mapa segun el barrio
  //===============================================
  optenerCentro(barrio: string) {
    const numBarrio = Number(barrio);
    let centro;
    switch (numBarrio) {
        case 44:
            centro = { lat: 40.436347, lng: -3.667389 };
            break;
        case 45:
            centro = { lat: 40.432375, lng: -3.676183 };
            break;
        case 46:
            centro = { lat: 40.433368, lng: -3.683588 };
            break;
        case 51:
            centro = { lat: 40.445408, lng: -3.684342 };
            break;
        case 52:
            centro = { lat: 40.443262, lng: -3.669103 };
            break;
        case 53:
            centro = { lat: 40.448204, lng: -3.67265 };
            break;
        case 54:
            centro = { lat: 40.455497, lng: -3.677462 };
            break;
        case 55:
            centro = { lat: 40.461893, lng: -3.679066 };
            break;
        case 56:
            centro = { lat: 40.472714, lng: -3.677789 };
            break;
        case 61:
            centro = { lat: 40.451753, lng: -3.707646 };
            break;
        case 62:
            centro = { lat: 40.452326, lng: -3.696489 };
            break;
        case 63:
            centro = { lat: 40.459081, lng: -3.693029 };
            break;
        case 64:
            centro = { lat: 40.469211, lng: -3.69408 };
            break;
        case 65:
            centro = { lat: 40.466564, lng: -3.702468 };
            break;
        case 66:
            centro = { lat: 40.459403, lng: -3.704318 };
            break;
        case 75:
            centro = { lat: 40.441979, lng: -3.698296 };
            break;
        case 76:
            centro = { lat: 40.441833, lng: -3.71095 };
            break;
        case 84:
            centro = { lat: 40.476389, lng: -3.708886 };
            break;
        case 85:
            centro = { lat: 40.48158, lng: -3.697391 };
            break;
        case 93:
            centro = { lat: 40.449879, lng: -3.714955 };
            break;
        case 94:
          centro = { lat: 40.461083, lng: -3.710878 };
          break;
        case 151:
          centro = { lat: 40.428222, lng: -3.654680 };
          break;
        case 152:
          centro = { lat: 40.432591, lng: -3.644426 };
          break;
        case 153:
          centro = { lat: 40.434504, lng: -3.649170 };
          break;
        case 154:
          centro = { lat: 40.435913, lng: -3.654189 };
          break;
        case 155:
          centro = { lat: 40.442607, lng: -3.653534 };
          break;
        case 156:
          centro = { lat: 40.450914, lng: -3.656763 };
          break;
        case 157:
          centro = { lat: 40.456294, lng: -3.660946 };
          break;
        case 158:
          centro = { lat: 40.464079, lng: -3.666230 };
          break;
        default:
          centro = { lat: 40.459081, lng: -3.693029 };
          break;
    }
    return centro;
  }

  async presentActionSheetNavegar( marker: Parquimetro ) {
    this.btnMarker = marker;
    let botonesSheet = [];
    botonesSheet.push( this.botonGoogle );
    if ( this.isMobileIphone() ) {
      botonesSheet.push( this.botonApple );
    }
    botonesSheet.push( this.botonCancel );

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Parquímetro:' + marker.alias,
      mode: 'ios',
      animated: true,
      buttons: botonesSheet,
    });

    await actionSheet.present();
  }

 //===============================================
  // Navegación
  //===============================================
  async comoLlegar( marker: Parquimetro, mapa: string ) {

    if ( mapa === 'google' ) {
     Browser.open({url: `https://maps.google.com/?q=${marker.latitud},${marker.longitud}`});
    } else if ( mapa === 'apple' ) {
      Browser.open({url: `maps://maps.google.com/maps?daddr=${marker.latitud},${marker.longitud}&amp;ll=`});
    } else {
      Browser.open({url: `https://www.waze.com/ul?ll=${marker.latitud}%2C${marker.longitud}&navigate=yes&zoom=17`});
    }
  }

  //===============================================
  // comprobar si estamos en un Iphone
  //===============================================
  isMobileIphone(){
    return (
      (navigator.userAgent.match(/iPhone/i)) ||
      (navigator.userAgent.match(/iPod/i)) ||
      (navigator.userAgent.match(/iPad/i))
    );
  }


}
