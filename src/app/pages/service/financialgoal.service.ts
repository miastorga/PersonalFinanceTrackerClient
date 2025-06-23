import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface QueryParametersFinancialGoal {
  status?: string
  priority?: string
  categoryName?: string
  period?: string
  page: number,
  results: number
}

export interface FinancialGoalResponse {
  items: FinancialGoal[]
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface FinancialGoal {
  financialGoalId: string
  categoryId: string
  name: string
  description: string
  status: 'activa' | 'completada' | 'pausada' | 'cancelada';
  priority: 'alta' | 'media' | 'baja';
  createAt: string
  goalAmount: number
  currentAmount: number
  targetDate: string
  progressPercentage: number
  isCompleted: boolean
  daysRemaining: number
}

export interface CreateFinancialGoal {
  categoryId: string
  name: string
  description: string
  status: string
  priority: string
  createAt: string
  goalAmount: number
  currentAmount: number
  targetDate: string
}

export interface CreateFinancialGoalResponse {
  financialGoalId: string
  categoryId: string
  name: string
  description: string
  status: 'activa' | 'completada' | 'pausada' | 'cancelada';
  priority: 'alta' | 'media' | 'baja';
  createAt: string
  goalAmount: number
  currentAmount: number
  targetDate: string
  progressPercentage: number
  isCompleted: boolean
  daysRemaining: number
}


@Injectable({
  providedIn: 'root'
})
export class FinancialGoalService {
  private http = inject(HttpClient)
  private URL = `${environment.apiUrl}/FinancialGoal`
  constructor() { }

  getFinancialGoals(params: QueryParametersFinancialGoal) {
    const httpParams = params ? this.objectToHttpParams(params) : undefined
    return this.http.get<FinancialGoalResponse>(this.URL, { params: httpParams }).pipe(
      catchError(this.handleError)
    )
  }

  createFinancialGoal(params: CreateFinancialGoal) {
    return this.http.post<CreateFinancialGoalResponse>(this.URL, params).pipe(
      catchError(this.handleError)
    )
  }

  removeFinancialGoal(id: string) {
    console.log(id)
    return this.http.delete<void>(`${this.URL}/${id}`).pipe(
      catchError(this.handleError)
    )
  }

  updateFinancialGoal(id: string, params: CreateFinancialGoal) {
    return this.http.put<CreateFinancialGoal>(`${this.URL}/${id}`, params).pipe(
      catchError(this.handleError)
    )
  }


  /**
   * Maneja errores HTTP
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      // Intentar extraer el mensaje del ProblemDetails
      if (error.error && typeof error.error === 'object') {
        const problemDetails = error.error;

        // Usar el detail del ProblemDetails si está disponible
        if (problemDetails.detail) {
          errorMessage = problemDetails.detail;
        } else if (problemDetails.title) {
          errorMessage = problemDetails.title;
        } else {
          // Fallback a mensajes por código de estado
          errorMessage = this.getDefaultErrorMessage(error.status);
        }
      } else {
        // Fallback a mensajes por código de estado
        errorMessage = this.getDefaultErrorMessage(error.status);
      }
    }

    console.log(errorMessage)
    return throwError(() => (errorMessage));
  }


  private objectToHttpParams(obj: any): HttpParams {
    let params = new HttpParams();
    Object.keys(obj).forEach(key => {
      if (obj[key] !== null && obj[key] !== undefined) {
        params = params.set(key, obj[key].toString());
      }
    });
    return params;
  }
  /**
   * Obtiene mensaje de error por defecto basado en el código de estado
   */
  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Solicitud inválida. Verifica los parámetros.';
      case 401:
        return 'No autorizado. Verifica tus credenciales.';
      case 404:
        return 'Recurso no encontrado.';
      case 500:
        return 'Error interno del servidor.';
      default:
        return `Error ${status}: Error del servidor`;
    }
  }
}
