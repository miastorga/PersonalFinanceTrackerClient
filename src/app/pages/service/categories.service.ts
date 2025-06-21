import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Category {
  categoryId: string
  categoryName: string
}

export interface CreateCategory {
  categoryName: string
}

export interface CreateCategoryResponse {
  categoryId: string
  categoryName: string
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private http = inject(HttpClient)
  private URL = `${environment.apiUrl}/Category`
  constructor() { }

  getCategories() {
    return this.http.get<Category[]>(this.URL).pipe(
      catchError(this.handleError)
    )
  }

  createCategory(params: CreateCategory) {
    return this.http.post<CreateCategoryResponse>(this.URL, { name: params["categoryName"] }).pipe(
      catchError(this.handleError)
    )
  }

  removeTransaction(id: string) {
    console.log(id)
    return this.http.delete<void>(`${this.URL}/${id}`).pipe(
      catchError(this.handleError)
    )
  }

  updateCategory(id: string, params: CreateCategory) {

    return this.http.put<CreateCategory>(`${this.URL}/${id}`, { name: params["categoryName"] }).pipe(
      catchError(this.handleError)
    )
  }

  removeCategory(id: string) {
    return this.http.delete<void>(`${this.URL}/${id}`).pipe(
      catchError(this.handleError)
    )
  }
  /**
   * Maneja errores HTTP
   */
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
