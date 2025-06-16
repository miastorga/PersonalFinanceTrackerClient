import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

export interface Account {
  accountId: string
  accountName: string
  accountType: string
  currentBalance: number
  initialBalance: number
}

export interface CreateAccount {
  accountName: string
  accountType: string
  currentBalance: number
  initialBalance: number
}

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  private http = inject(HttpClient)
  private URL = "https://financetrackerapi.happyisland-59300aa5.brazilsouth.azurecontainerapps.io/api/v1/Account"
  // private URL = 'http://localhost:5022/api/v1/Account'
  constructor() { }

  getAccounts() {
    return this.http.get<Account[]>(this.URL).pipe(
      catchError(this.handleError)
    )
  }

  createAccounts(params: CreateAccount) {
    console.log(params)
    return this.http.post<Account>(this.URL, params).pipe(
      catchError(error => this.handleError(error))
    )
  }

  removeAccount(id: string) {
    return this.http.delete<void>(`${this.URL}/${id}`).pipe(
      catchError(this.handleError)
    )
  }

  updateAccount(id: string, params: CreateAccount) {
    console.log(id)
    console.log(params)
    return this.http.put<Account>(`${this.URL}/${id}`, params).pipe(
      catchError(this.handleError)
    )
  }


  /**
   * Maneja errores HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';

    if (error.error && error.error.errors) {
      const validationErrors = error.error.errors;
      const errorMessages: string[] = [];

      Object.keys(validationErrors).forEach(field => {
        const fieldName = this.translateFieldName(field);
        validationErrors[field].forEach((message: string) => {
          errorMessages.push(`${fieldName}: ${message}`);
        });
      });

      errorMessage = errorMessages.join('\n');
    }

    return throwError(() => new Error(errorMessage));
  }

  private translateFieldName(fieldName: string): string {
    const translations: { [key: string]: string } = {
      'accountName': 'Nombre de la cuenta',
      'AccountName': 'Nombre de la cuenta',
      'accountType': 'Tipo de cuenta',
      'AccountType': 'Tipo de cuenta',
      'currentBalance': 'Saldo actual',
      'CurrentBalance': 'Saldo actual',
      'initialBalance': 'Saldo inicial',
      'InitialBalance': 'Saldo inicial'
    };

    return translations[fieldName] || fieldName;
  }
}
