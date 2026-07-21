import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import {
  AntiguedadReservasRequestDto,
  AntiguedadReservasResponseDto,
} from '../models/ajuste.model';

@Injectable({ providedIn: 'root' })
export class AntiguedadReservasService extends BaseHttpService {
  obtener(): Observable<AntiguedadReservasResponseDto> {
    return this.get<AntiguedadReservasResponseDto>('ajustes/antiguedad-reservas');
  }

  actualizar(dto: AntiguedadReservasRequestDto): Observable<AntiguedadReservasResponseDto> {
    return this.put<AntiguedadReservasResponseDto>('ajustes/antiguedad-reservas', dto);
  }
}
