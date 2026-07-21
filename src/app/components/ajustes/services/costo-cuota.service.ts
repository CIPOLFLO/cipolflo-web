import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { CostoCuotaRequestDto, CostoCuotaResponseDto } from '../models/ajuste.model';

@Injectable({ providedIn: 'root' })
export class CostoCuotaService extends BaseHttpService {
  obtener(): Observable<CostoCuotaResponseDto> {
    return this.get<CostoCuotaResponseDto>('ajustes/costo-cuota');
  }

  actualizar(dto: CostoCuotaRequestDto): Observable<CostoCuotaResponseDto> {
    return this.put<CostoCuotaResponseDto>('ajustes/costo-cuota', dto);
  }
}
