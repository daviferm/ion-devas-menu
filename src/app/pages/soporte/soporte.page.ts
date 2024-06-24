import { Component, ElementRef, OnInit, ViewChild, Renderer2, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { DataFormService } from '../../services/data-form.service';
import { LayerBarrio, Parquimetro } from '../../interfaces/markers.interface';
import { GestionRutasService } from '../../services/gestion-rutas.service';
import { NavbarService } from '../../components/navbar/navbar.service';
import { NativeGeolocationService } from '../../services/native-geolocation.service';
import { ToastController, AlertController } from '@ionic/angular';
import { MapPolygonService } from 'src/app/services/map-polygon.service';
import { Browser } from '@capacitor/browser';
import { MapaComponent } from 'src/app/components/mapa/mapa.component';

@Component({
  selector: 'app-soporte',
  templateUrl: './soporte.page.html',
  styleUrls: ['./soporte.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NavbarComponent, MapaComponent]
})
export class SoportePage implements OnInit {

  public dataFormService = inject( DataFormService );
  public polygonService = inject( MapPolygonService );
  public gestioRutasService = inject( GestionRutasService );
  public navbarService = inject( NavbarService );
  public geolocationService = inject( NativeGeolocationService );
  public renderer = inject( Renderer2 );
  public toastController = inject( ToastController );
  public alertCtrl = inject( AlertController );


  @ViewChild('update') btnUpdate!: ElementRef;


  slideOpts = {
    initialSlide: 0,
    speed: 400
  };
  alias!: number;
  zoomMap: number = 12;
  marcador: Parquimetro = {
    alias: '',
    barrio: '',
    direccion: '',
    empresa: '',
    estado: '',
    fabricante: '',
    latitud: 0,
    longitud: 0,
    tarifa: '',
    idx: ''
  }
  centroMapa!: { lat: number, lng: number };
  selectedBarrio!: LayerBarrio | undefined;
  mapSearch!: boolean;
  pageSelected = 'soporte';
  coordGps: any;
  lat!: number;
  lng!: number;


  numSearch!: number;
  checkNuevo: boolean = false;

  constructor( ) {

    this.gestioRutasService.pageActive = 'soporte';

  }

  ngOnInit() {

    this.geolocationService.getGeolocation()
            .then( (response:any) => this.coordGps = response );

    this.dataFormService.enviarPageSoporte.subscribe( (item: Parquimetro) => {
      if ( item ) {
        this.zoomMap = 12;
        this.marcador = item;
        this.marcador.latitud = Number(this.marcador.latitud);
        this.marcador.longitud = Number(this.marcador.longitud);
        this.centroMapa = { lat: Number(item.latitud), lng: Number(item.longitud) };
        // this.selectedBarrio = [];
        this.selectedBarrio = this.polygonService.getBarrio( item.barrio.slice(0,3) );

        this.mapSearch = true;
        this.gestioRutasService.soportePage = true;
        setTimeout( () => {
          this.zoomMap = 14;
        }, 100 );
        this.navbarService.mostrarOcultarNavbar.emit( false );
      }
    });


    this.gestioRutasService.getLocation.subscribe( (resp: boolean) => {
      if ( this.mapSearch ) {
        // this.navbarService.mostrarOcultarNavbar.emit( false );
      }
      if ( resp ) {
        this.geolocationService.getGeolocation()
            .then( (response:any) => this.coordGps = response );
      }
    } )
  }

  // ionViewWillEnter() {
  //   console.log('ionViewWillEnter');
  // }
  // ionViewDidEnter() {
  //   console.log('ionViewDidEnter');
  // }
  // ionViewWillLeave() {
  //   console.log('ionViewWillLeave');
  // }
  // ionViewDidLeave() {
  //   console.log('ionViewDidLeave');
  // }


  changeInput( event: any ) {
    this.alias = event.detail.value;
  }

  mostrarMapa() {

    const aliasStr = String( this.alias );

    if ( aliasStr.length != 10 ){
      console.log('El número debe tener 10 dígitos!!');
      this.presentToastWithOptions('El número debe tener 10 dígitos!')
    } else {
      this.centroMapa = { lat: Number( this.coordGps.coords.latitude ), lng: Number( this.coordGps.coords.longitude ) };
      this.lat = Number( this.coordGps.coords.latitude );
      this.lng = Number( this.coordGps.coords.longitude );
      this.marcador.alias = String(this.alias);
      this.marcador.latitud = this.lat;
      this.marcador.longitud = this.lng;
      this.zoomMap = 12;
      this.mapSearch = true;
      this.gestioRutasService.soportePage = true;
      this.navbarService.mostrarOcultarNavbar.emit( false );
      setTimeout( () => {
        this.zoomMap = 14;
      }, 100 );
    }
  }

  cerrarMana( event: any ) {
    this.mapSearch = false;
    this.navbarService.mostrarOcultarNavbar.emit( true );
    this.gestioRutasService.soportePage = false;
    this.marcador = {
      alias: '',
      barrio: '',
      direccion: '',
      empresa: '',
      estado: '',
      fabricante: '',
      latitud: 0,
      longitud: 0,
      tarifa: '',
      idx: ''
    }
  }

  getCoords( coords: {lat:number,lng:number} ) {
    this.marcador.latitud = coords.lat;
    this.marcador.longitud = coords.lng;
  }
  enviarPosicion() {

    const tlf = '34638372031';
    const url = `https://api.whatsapp.com/send?phone=${tlf}&text=Soporte-App-Devas:%20Número:%20${this.marcador.alias},%20latitud:${this.marcador.latitud},%20longitud:${this.marcador.longitud}`;

    // this.iab.create( url );
    Browser.open( {url: url} );

  }

  ionChangeSearch( event: any ) {
    this.numSearch = event.detail.value;
  }

  buscarItem() {

    const strNumber = String( this.numSearch );

    if ( strNumber.length == 10 ) {
      // Combertir en string
      const numeroStr = String( this.numSearch );
      // Comprobar si el barrio tiene 3 o 2 dígitos
      const barrio = (numeroStr.substring( 2, 3 ) == '0') ? numeroStr.substring( 3, 5 ) : numeroStr.substring( 2, 5 );
      const alias = numeroStr.substring( 6, numeroStr.length );
      // Buscar parquímetro
      const item = this.dataFormService.getParkimetro( barrio, alias );

      if ( item ) {
        this.marcador = { ...item };
      }

    }
  }


  ionChangeCheckbox( check: any ) {

    this.checkNuevo = check.detail.checked;

    console.log(this.checkNuevo);
  }

   // =================================================
  // Mensaje Toast en la parte superior
  // =================================================
  async presentToastWithOptions(mensage: string) {
    const toast = await this.toastController.create({
      message: mensage,
      position: 'top',
      duration: 2000,
      cssClass: 'mytoast',
      buttons: [
        {
          side: 'start',
          icon: 'map-outline',
        }, {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          }
        }
      ]
    });
    await toast.present();
  }

  nextSlide() {
    this.mapSearch = false;
    this.navbarService.mostrarOcultarNavbar.emit( true );
    this.gestioRutasService.soportePage = false;
  }

   // ==============================================================
  // Mensaje Alert cuando no hay permiso de acceso a la base de daos
  // ===============================================================
  async presentAlert() {
    const alert = await this.alertCtrl.create({
      cssClass: 'alert-custom-class',
      header: 'PERMISO DENEGADO',
      subHeader: `Para acceder a la base de datos!!`,
      buttons: ['OK']
    });
    await alert.present();
  }



}
