import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

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
  private URL = "https://financetrackerapi.happyisland-59300aa5.brazilsouth.azurecontainerapps.io/api/v1/Category"
  // private URL = 'http://localhost:5022/api/v1/Category'
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
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud inválida. Verifica los parámetros.';
          break;
        case 401:
          errorMessage = 'No autorizado. Verifica tus credenciales.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    console.error('Error en TransactionsService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
