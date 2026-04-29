// Sirve para marcar esta clase como un servicio inyectable 
// (es decir, que Angular puede crearla y usarla automáticamente 
// en otros componentes o servicios).
import { Injectable } from '@angular/core';

//s la herramienta de Angular para hacer peticiones HTTP (GET, POST, etc.).
// Básicamente, esto es lo que te permite comunicarte con tu backend.
import { HttpClient } from '@angular/common/http';

// Un Observable es una estructura para manejar datos asíncronos (respuestas 
// que llegan después, como las de una API).
import { Observable } from 'rxjs';

// @Injectable le dice a Angular: esta clase puede ser inyectada.
// providedIn: 'root' significa:
// Angular crea una sola instancia global del servicio.
// Puedes usarlo en cualquier parte sin registrarlo manualmente.
@Injectable({
  providedIn: 'root',
})

//Define una clase llamada UsuarioService.
// export permite usarla en otros archivos.
export class UsuarioService {


  //Variable privada (private) → solo se usa dentro del servicio.
  // Guarda la URL base de tu backend.
  // Todas las peticiones se construirán a partir de esta.
  private apiUrl = 'http://localhost:8000/usuario';


  //Aquí Angular inyecta automáticamente el HttpClient.
  // private http:
  // Crea una propiedad llamada http.
  // La puedes usar en toda la clase.
  // No estás creando HttpClient, Angular lo hace por ti.
  constructor(private http:HttpClient){}

  //Define un método.
  // Retorna un Observable<any>:
  // Observable → porque la respuesta es asíncrona.
  // any → no estás tipando la respuesta 
  //Hace una petición GET a:
  // http://localhost:8000/usuario/
  // this.http.get(...) devuelve un Observable.
  // No ejecuta la petición hasta que alguien se suscriba (subscribe()).
  obtenerUsuarios(): Observable<any>{
    return this.http.get(this.apiUrl + "/");
  }

  crearUsuario(usuario:any){
  return this.http.post(this.apiUrl + "/", usuario);
}
}
