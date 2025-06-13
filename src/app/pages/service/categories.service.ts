import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

export interface QueryParametersSummary {
  startDate?: string | null;
  endDate?: string | null;
  period?: string | null;
}

export interface QueryParametersTransaction {
  page: number,
  results: number
  startDate?: string | null;
  endDate?: string | null;
  categoryName?: string
  transactionType?: string
}

export interface SummaryResponse {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  startDate: string;
  endDate: string;
  period: string;
  expensesByCategory: { [key: string]: number };
  incomeByCategory: { [key: string]: number };
  balanceByAccount: { [key: string]: number };
  transactionCount: number;
  averageTransactionAmount: number;
  topExpenseCategory: string;
  topIncomeCategory: string;
  previousPeriodBalance: number;
  balanceChange: number;
  balanceChangePercentage: number;
}

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

// export interface CategoryResponse {
//   items: Transaction[];
// }

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private http = inject(HttpClient)
  private URL = "http://localhost:5022/api/v1/Category"
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
