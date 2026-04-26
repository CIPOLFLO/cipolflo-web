import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseHttpService } from '../../core/services/base-http.service';
import { ServicioRespuestaDto } from '../models/servicio.model';

const PLACEHOLDER_SERVICIOS: ServicioRespuestaDto[] = [
  { id: 1, nombre: 'Servicio A' },
  { id: 2, nombre: 'Servicio B' },
];

@Injectable({ providedIn: 'root' })
export class ServicioService extends BaseHttpService {

  getServicios(): Observable<ServicioRespuestaDto[]> {
    // TODO: reemplazar con llamada real cuando el backend esté disponible
    // return this.get<Servicio[]>('servicios');
    return of(PLACEHOLDER_SERVICIOS);
  }
}
