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

export interface Account {
  accountId: string
  accountName: string
  accountType: string
  currentBalance: number
  initialBalance: 0
}

export interface CreateTransaction {
  amount: number;
  transactionType: "gasto" | "ingreso";
  categoryId: string;
  date: string;
  description: string;
  accountId: string | null;
}

export interface CreateTransactionResponse {
  transactionId: string
  amount: number;
  transactionType: "gasto" | "ingreso";
  categoryId: string;
  categoryName: string;
  date: string;
  description: string;
  accountId: string | null;
  accountName: string | null;
}

// export interface CategoryResponse {
//   items: Transaction[];
// }

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  private http = inject(HttpClient)
  private URL = "http://localhost:5022/api/v1/Account"
  constructor() { }

  getAccounts() {
    return this.http.get<Account[]>(this.URL).pipe(
      catchError(this.handleError)
    )
  }

  createTransaction(params: CreateTransaction) {
    console.log(params)
    return this.http.post<CreateTransactionResponse>(this.URL, params).pipe(
      catchError(this.handleError)
    )
  }

  removeTransaction(id: string) {
    return this.http.delete<void>(`${this.URL}/${id}`).pipe(
      catchError(this.handleError)
    )
  }

  updateTransaction(id: string, params: CreateTransaction) {
    console.log(id)
    console.log(params)
    return this.http.put<CreateTransaction>(`${this.URL}/${id}`, params).pipe(
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
