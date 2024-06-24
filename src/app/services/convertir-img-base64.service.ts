import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConvertirImgBase64Service {

  imagenBase64: string | null = null;

  constructor() { }

  ngOnInit(): void {
    // Ruta de la imagen (puedes cargarla desde un servicio, etc.)
    const rutaImagen = 'ruta/a/tu/imagen.jpg';

    // Llamada a la función para convertir la imagen a Base64
    this.convertirImagenABase64(rutaImagen);
  }

  convertirImagenABase64(rutaImagen: string): void {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);

        // Obtener la representación en Base64
        this.imagenBase64 = canvas.toDataURL('image/jpeg'); // Puedes cambiar 'image/jpeg' según el formato de tu imagen

        // Imprimir la representación en consola (opcional)
        console.log('Imagen en Base64:', this.imagenBase64);
      }
    };

    img.src = rutaImagen;
  }
}
