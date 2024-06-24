import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { ListaInteface } from '../../interfaces/markers.interface';
import { IonButton, AnimationController, IonicModule } from '@ionic/angular';


@Component({
  selector: 'app-upload-img',
  templateUrl: './upload-img.component.html',
  styleUrls: ['./upload-img.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class UploadImgComponent implements OnInit {

  base64Image: string | null = null;


  @ViewChild('botomImg') botomImg!: ElementRef;
  @ViewChild('mdlUpload') mdlUpload!: ElementRef;

  @Input() Tarea!: ListaInteface;
  @Input() idxItem!: number;
  @Output() cerrarModalUpload: EventEmitter<ListaInteface> = new EventEmitter<ListaInteface>();
  @Output() actualizarStorage: EventEmitter<ListaInteface> = new EventEmitter<ListaInteface>();
  imagen: any;
  botomGuardar!: IonButton;

  constructor( private renderer: Renderer2,
               private animationCtrl: AnimationController ) { }

  ngOnInit() {
    this.imagen = this.Tarea!.items[this.idxItem].urlImg;

    setTimeout( () => {
      this.botomGuardar = this.botomImg.nativeElement.firstChild;
    }, 100 )
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      this.convertToBase64(file).then((base64: string) => {
        this.base64Image = base64;
      }).catch(error => {
        console.error('Error al convertir la imagen a base64:', error);
      });
    }
  }

  private convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }




  // onFileChanged( file: any ) {
  //   console.log(file);
  //   if ( file ) {
  //     this.renderer.setAttribute( this.botomGuardar, 'disabled', 'false' );
  //     this.imagen = file[0].base64;
  //   }
  // }

  guardarImagen() {

    if ( this.base64Image ) {
      this.Tarea!.items[this.idxItem].urlImg = this.base64Image;
      const modalUpload = this.animationCtrl.create()
        .addElement( this.mdlUpload.nativeElement )
        .duration(400)
        .fill('forwards')
        .fromTo('opacity', 1, 0)

      modalUpload.play();

      setTimeout( () => {
        this.cerrarModalUpload.emit( this.Tarea! );
      }, 400);
    }
  }

  eliminarImg() {
    this.Tarea!.items[this.idxItem].urlImg = undefined;
    this.imagen = null;
  }

  cerrarModal( e: any, close?: boolean ) {

    if ( e.target.className.includes('fondo-negro') || close ) {

      const modalUpload = this.animationCtrl.create()
        .addElement( this.mdlUpload.nativeElement )
        .duration(400)
        .fill('forwards')
        .fromTo('opacity', 1, 0)

      modalUpload.play();

      setTimeout( () => {
        this.cerrarModalUpload.emit( this.Tarea! );
      }, 400);
    }
  }


}
