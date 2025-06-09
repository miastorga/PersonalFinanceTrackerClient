import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { Table, TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import { Customer, CustomerService, Representative } from '../service/customer.service';
import { Product, ProductService } from '../service/product.service';
import { QueryParametersTransaction, Transaction, TransactionResponse, TransactionsService } from '../service/transactions.service';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-table-demo',
  standalone: true,
  imports: [
    TableModule,
    ReactiveFormsModule,
    FormsModule,
    MultiSelectModule,
    SelectModule,
    InputIconModule,
    TagModule,
    InputTextModule,
    SliderModule,
    ProgressBarModule,
    ToggleButtonModule,
    ToastModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    RatingModule,
    RippleModule,
    IconFieldModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    SelectModule,
    TagModule,
    ToastModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule
  ],
  template: ` <div class="card">
            <button
                    pButton
                    label="Nueva Transacción"
                    icon="pi pi-plus"
                    class="p-button-success mb-4"
                    (click)="showAddTransactionDialog()">
                </button>
            <p-table
                #dt1
                [value]="transactionSignal()"
                dataKey="id"
                [loading]="false"
                [showCurrentPageReport]="false"
                [paginator]="false"
                [rowHover]="true"
                [showGridlines]="true"
                [globalFilterFields]="['amount', 'categoryName', 'description', 'transactionType']"
                responsiveLayout="scroll"
            >
                <ng-template #caption>
                    <div class="flex justify-between items-center flex-column sm:flex-row">
                        <button pButton label="Clear" class="p-button-outlined mb-2" icon="pi pi-filter-slash" (click)="clear(dt1)"></button>
                        <p-iconfield iconPosition="left" class="ml-auto">
                            <p-inputicon>
                                <i class="pi pi-search"></i>
                            </p-inputicon>
                            <input pInputText type="text" (input)="onGlobalFilter(dt1, $event)" placeholder="Search keyword" />
                        </p-iconfield>
                    </div>
                </ng-template>
                <ng-template #header>
                    <tr>
                        <th style="min-width: 12rem">
                            <div class="flex justify-between items-center">
                                Monto
                                <p-columnFilter type="text" field="amount" display="menu" placeholder="Search by amount"></p-columnFilter>
                            </div>
                        </th>
                        <th style="min-width: 12rem">
                            <div class="flex justify-between items-center">
                                Categoria
                                <p-columnFilter type="text" field="categoryName" display="menu" placeholder="Search by category"></p-columnFilter>
                            </div>
                        </th>
                        <th style="min-width: 14rem">
                            <div class="flex justify-between items-center">
                                Fecha
                                <p-columnFilter type="date" field="date" display="menu" placeholder="mm/dd/yyyy"></p-columnFilter>
                            </div>
                        </th>
                        <th style="min-width: 10rem">
                            <div class="flex justify-between items-center">
                                Descripción
                                <p-columnFilter type="text" field="description" display="menu" placeholder="Search by description"></p-columnFilter>
                            </div>
                        </th>
                        <th style="min-width: 10rem">
                            <div class="flex justify-between items-center">
                                Tipo de Transacción
                                <p-columnFilter type="text" field="transactionType" display="menu" placeholder="Search by type"></p-columnFilter>
                            </div>
                        </th>
                        <th style="min-width: 12rem">
                            <div class="flex justify-between items-center">
                                Cuenta
                                <p-columnFilter type="text" field="accountId" display="menu" placeholder="Search by account"></p-columnFilter>
                            </div>
                        </th>
                    </tr>
                </ng-template>
                <ng-template #body let-transaction>
                    <tr>
                        <td>
                            {{ transaction.amount | currency:'USD':'symbol':'1.2-2' }}
                        </td>
                        <td>
                            <div class="flex items-center gap-2">
                                <span>{{ transaction.categoryName }}</span>
                            </div>
                        </td>
                        <td>
                          {{transaction.date | date:'dd-MM-yyyy'}}
                        </td>
                        <td>
                            {{transaction.description}}
                        </td>
                        <td>
                            <p-tag 
                                [value]="transaction.transactionType | uppercase" 
                                [severity]="getTransactionTypeSeverity(transaction.transactionType)"
                                styleClass="dark:!bg-surface-900" 
                            />
                        </td> 
                        <td>
                            <p-tag [value]="transaction.accountId" styleClass="dark:!bg-surface-900" />
                        </td>
                    </tr>
                </ng-template>
                @if (loading == false) {
                <ng-template #emptymessage>
                    <tr>
                        <td colspan="6">No se encontraron transacciones.</td>
                    </tr>
                </ng-template>
                }

            </p-table>

            <!-- SPINNER DE CARGA -->
             @if(loading == true){
            <div *ngIf="loading" class="flex justify-center items-center py-8">
                <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #6366f1;"></i>
            </div>
             }

            <!-- PAGINACIÓN PERSONALIZADA -->
            <div class="flex justify-between items-center mt-4 p-3 border-t">
                <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-600">
                        Mostrando {{ getStartRecord() }} a {{ getEndRecord() }} de {{ paginationData().totalCount }} registros
                    </span>
                </div>
                
                <div class="flex items-center gap-2">
                    <!-- Botón Primera Página -->
                    <button 
                        pButton 
                        icon="pi pi-angle-double-left" 
                        class="p-button-text p-button-sm"
                        [disabled]="!paginationData().hasPreviousPage || loading"
                        (click)="goToFirstPage()"
                        pTooltip="Primera página">
                    </button>
                    
                    <!-- Botón Página Anterior -->
                    <button 
                        pButton 
                        icon="pi pi-angle-left" 
                        class="p-button-text p-button-sm"
                        [disabled]="!paginationData().hasPreviousPage || loading"
                        (click)="goToPreviousPage()"
                        pTooltip="Página anterior">
                    </button>
                    
                    <!-- Información de página actual -->
                    <span class="px-3 py-1 text-sm">
                        Página {{ paginationData().currentPage }} de {{ paginationData().totalPages }}
                    </span>
                    
                    <!-- Botón Página Siguiente -->
                    <button 
                        pButton 
                        icon="pi pi-angle-right" 
                        class="p-button-text p-button-sm"
                        [disabled]="!paginationData().hasNextPage || loading"
                        (click)="goToNextPage()"
                        pTooltip="Página siguiente">
                    </button>
                    
                    <!-- Botón Última Página -->
                    <button 
                        pButton 
                        icon="pi pi-angle-double-right" 
                        class="p-button-text p-button-sm"
                        [disabled]="!paginationData().hasNextPage || loading"
                        (click)="goToLastPage()"
                        pTooltip="Última página">
                    </button>
                </div>
                
                <!-- Selector de filas por página -->
                <div class="flex items-center gap-2">
                    <label class="text-sm">Filas por página:</label>
                    <p-select 
                        [options]="rowsPerPageOptions" 
                        [(ngModel)]="currentPageSize"
                        (onChange)="onRowsPerPageChange($event)"
                        [style]="{'min-width': '80px'}"
                        placeholder="3">
                    </p-select>
                </div>
            </div>
        </div>
        <!-- MODAL PARA AGREGAR TRANSACCIÓN -->
        <p-dialog
                header="Nueva Transacción"
                [(visible)]="displayAddTransactionDialog"
                [modal]="true"
                [style]="{width: '450px'}"
                [draggable]="false"
                [resizable]="false"
                [closable]="true">

                <form [formGroup]="transactionForm" (ngSubmit)="onSubmitTransaction()">
                    <div class="grid grid-cols-1 gap-4">

                        <!-- Monto -->
                        <div class="field">
                            <label for="amount" class="block text-sm font-medium mb-2">Monto *</label>
                            <p-inputNumber
                            id="amount"
                            formControlName="amount"
                            mode="decimal"
                            [useGrouping]="false"
                            [minFractionDigits]="0"
                            [maxFractionDigits]="0"
                            placeholder="0"
                            class="w-full">
                            </p-inputNumber>
                            <small class="text-red-500" *ngIf="transactionForm.get('amount')?.invalid && transactionForm.get('amount')?.touched">
                                El monto es requerido
                            </small>
                        </div>

                        <!-- Descripción -->
                        <div class="field">
                            <label for="description" class="block text-sm font-medium mb-2">Descripción *</label>
                            <input
                                id="description"
                                type="text"
                                pInputText
                                formControlName="description"
                                placeholder="Ingrese una descripción"
                                class="w-full">
                            <small class="text-red-500" *ngIf="transactionForm.get('description')?.invalid && transactionForm.get('description')?.touched">
                                La descripción es requerida
                            </small>
                        </div>

                        <!-- Fecha -->
                        <div class="field">
                            <label for="date" class="block text-sm font-medium mb-2">Fecha *</label>
                            <p-calendar
                                id="date"
                                formControlName="date"
                                dateFormat="dd/mm/yy"
                                [showIcon]="true"
                                placeholder="Seleccione una fecha"
                                class="w-full">
                            </p-calendar>
                            <small class="text-red-500" *ngIf="transactionForm.get('date')?.invalid && transactionForm.get('date')?.touched">
                                La fecha es requerida
                            </small>
                        </div>

                        <!-- Tipo de Transacción -->
                        <div class="field">
                            <label for="transactionType" class="block text-sm font-medium mb-2">Tipo de Transacción *</label>
                            <p-select
                            id="transactionType"
                            formControlName="transactionType"
                            [options]="transactionTypes"
                            placeholder="Seleccione un tipo"
                            optionLabel="label"
                            optionValue="value"
                            class="w-full"
                            [appendTo]="'body'">
                            </p-select>
                            <small class="text-red-500" *ngIf="transactionForm.get('transactionType')?.invalid && transactionForm.get('transactionType')?.touched">
                                El tipo de transacción es requerido
                            </small>
                        </div>

                        <!-- Categoría -->
                        <div class="field">
                            <label for="categoryName" class="block text-sm font-medium mb-2">Categoría *</label>
                            <p-select
                            id="categoryName"
                            formControlName="categoryName"
                            [options]="categories"
                            placeholder="Seleccione una categoría"
                            optionLabel="label"
                            optionValue="value"
                            class="w-full"
                            [appendTo]="'body'">
                            </p-select>
                            <small class="text-red-500" *ngIf="transactionForm.get('categoryName')?.invalid && transactionForm.get('categoryName')?.touched">
                                La categoría es requerida
                            </small>
                        </div>

                        <!-- Cuenta -->
                        <div class="field">
                            <label for="accountId" class="block text-sm font-medium mb-2">Cuenta *</label>
                            <p-select
                            id="accountId"
                            formControlName="accountId"
                            [options]="accounts"
                            placeholder="Seleccione una cuenta"
                            optionLabel="label"
                            optionValue="value"
                            class="w-full"
                            [appendTo]="'body'"
                            [style]="{'min-width': '100%'}">
                            </p-select>
                            <small class="text-red-500" *ngIf="transactionForm.get('accountId')?.invalid && transactionForm.get('accountId')?.touched">
                                La cuenta es requerida
                            </small>
                        </div>

                    </div>
                </form>

                <ng-template #footer>
                    <div class="flex justify-end gap-2">
                        <button
                            pButton
                            label="Cancelar"
                            icon="pi pi-times"
                            class="p-button-text"
                            (click)="hideAddTransactionDialog()">
                        </button>
                        <button
                            pButton
                            label="Guardar"
                            icon="pi pi-check"
                            class="p-button-success"
                            [disabled]="transactionForm.invalid || savingTransaction"
                            [loading]="savingTransaction"
                            (click)="onSubmitTransaction()">
                        </button>
                    </div>
                </ng-template>
        </p-dialog>
        `,
  styles: `
        .p-datatable-frozen-tbody {
            font-weight: bold;
        }

        .p-datatable-scrollable .p-frozen-column {
            font-weight: bold;
        }

        .pagination-container {
            border-top: 1px solid #e5e7eb;
            background-color: #f9fafb;
        }
    `,
  providers: [ConfirmationService, MessageService]
})
export class TableDemo implements OnInit {
  loading: boolean = false;

  @ViewChild('filter') filter!: ElementRef

  transactionSignal = signal<Transaction[]>([]);
  paginationData = signal<{
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }>({
    totalCount: 0,
    pageSize: 5,
    currentPage: 1,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  });

  transactionService = inject(TransactionsService);
  fb = inject(FormBuilder)
  messageService = inject(MessageService)

  rowsPerPageOptions = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 }
  ];

  displayAddTransactionDialog = false;
  transactionForm!: FormGroup;
  savingTransaction = false;

  transactionTypes = [
    { label: 'Ingreso', value: 'ingreso' },
    { label: 'Gasto', value: 'gasto' },
  ];

  categories = [
    { label: 'Alimentación', value: 'FOOD' },
    { label: 'Transporte', value: 'TRANSPORT' },
    { label: 'Entretenimiento', value: 'ENTERTAINMENT' },
    { label: 'Salud', value: 'HEALTH' },
    { label: 'Servicios', value: 'UTILITIES' },
    { label: 'Compras', value: 'SHOPPING' },
    { label: 'Educación', value: 'EDUCATION' },
    { label: 'Otros', value: 'OTHER' }
  ];

  accounts = [
    { label: 'Cuenta Corriente', value: 'CHECKING' },
    { label: 'Cuenta de Ahorros', value: 'SAVINGS' },
    { label: 'Tarjeta de Crédito', value: 'CREDIT_CARD' },
    { label: 'Efectivo', value: 'CASH' }
  ];

  currentPageSize = 5;

  constructor(
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    console.log('TABLE INIT');
    this.loadTransactions();
  }

  initializeForm() {
    this.transactionForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1), Validators.max(1000000000)]],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]],
      date: [new Date(), Validators.required],
      transactionType: ['', Validators.required],
      categoryName: ['', Validators.required],
      accountId: ['', Validators.required]
    });
  }

  showAddTransactionDialog() {
    this.displayAddTransactionDialog = true;
    this.resetForm();
  }

  hideAddTransactionDialog() {
    this.displayAddTransactionDialog = false;
    this.resetForm();
  }

  resetForm() {
    this.transactionForm.reset();
    this.transactionForm.patchValue({
      date: new Date()
    });
    this.savingTransaction = false;
  }

  onSubmitTransaction() {
    if (this.transactionForm.valid) {
      this.savingTransaction = true;

      const formData = this.transactionForm.value;

      const transactionData = {
        amount: formData.amount,
        description: formData.description,
        date: formData.date,
        transactionType: formData.transactionType,
        categoryName: formData.categoryName,
        accountId: formData.accountId
      };

      console.log('Datos de la transacción:', transactionData);

      // Simular llamada al servicio
      setTimeout(() => {
        try {
          // Aquí harías la llamada real a tu servicio
          // this.transactionService.createTransaction(transactionData).subscribe({
          //   next: (response) => {
          //     this.messageService.add({
          //       severity: 'success',
          //       summary: 'Éxito',
          //       detail: 'Transacción creada exitosamente'
          //     });
          //     this.hideAddTransactionDialog();
          //     this.loadTransactions(); // Recargar la tabla
          //   },
          //   error: (error) => {
          //     this.messageService.add({
          //       severity: 'error',
          //       summary: 'Error',
          //       detail: 'Error al crear la transacción'
          //     });
          //     this.savingTransaction = false;
          //   }
          // });

          // Simulación de éxito
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Transacción creada exitosamente'
          });

          this.hideAddTransactionDialog();
          // Aquí deberías recargar tus datos
          // this.loadTransactions();

        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear la transacción'
          });
          this.savingTransaction = false;
        }
      }, 1500);

    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.transactionForm.controls).forEach(key => {
        this.transactionForm.get(key)?.markAsTouched();
      });

      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos'
      });
    }
  }

  /**
   * Carga las transacciones usando la paginación del backend
   */
  loadTransactions() {
    this.loading = true;

    const query: QueryParametersTransaction = {
      page: this.paginationData().currentPage,
      results: this.paginationData().pageSize
    };

    this.transactionService.getTransactions(query).subscribe({
      next: (response: TransactionResponse) => {
        console.log('Transaction data:', response);

        this.transactionSignal.set(response.items);

        this.paginationData.set({
          totalCount: response.totalCount,
          pageSize: response.pageSize,
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          hasPreviousPage: response.hasPreviousPage,
          hasNextPage: response.hasNextPage
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Error getting transactions:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Navega a la primera página
   */
  goToFirstPage() {
    if (this.paginationData().hasPreviousPage) {
      this.paginationData.update(data => ({ ...data, currentPage: 1 }));
      this.loadTransactions();
    }
  }

  /**
   * Navega a la página anterior
   */
  goToPreviousPage() {
    if (this.paginationData().hasPreviousPage) {
      this.paginationData.update(data => ({
        ...data,
        currentPage: data.currentPage - 1
      }));
      this.loadTransactions();
    }
  }

  /**
   * Navega a la página siguiente
   */
  goToNextPage() {
    if (this.paginationData().hasNextPage) {
      this.paginationData.update(data => ({
        ...data,
        currentPage: data.currentPage + 1
      }));
      this.loadTransactions();
    }
  }

  /**
   * Navega a la última página
   */
  goToLastPage() {
    if (this.paginationData().hasNextPage) {
      this.paginationData.update(data => ({
        ...data,
        currentPage: data.totalPages
      }));
      this.loadTransactions();
    }
  }

  /**
   * Cambia el número de filas por página
   */
  onRowsPerPageChange(event: any) {
    this.paginationData.update(data => ({
      ...data,
      pageSize: event.value,
      currentPage: 1
    }));
    this.currentPageSize = event.value;
    this.loadTransactions();
  }

  /**
   * Calcula el número del primer registro mostrado
   */
  getStartRecord(): number {
    const data = this.paginationData();
    return data.totalCount === 0 ? 0 : ((data.currentPage - 1) * data.pageSize) + 1;
  }

  /**
   * Calcula el número del último registro mostrado
   */
  getEndRecord(): number {
    const data = this.paginationData();
    const end = data.currentPage * data.pageSize;
    return Math.min(end, data.totalCount);
  }

  /**
   * Maneja el filtro global
   */
  onGlobalFilter(table: Table, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
    // Aquí podrías también enviar el filtro al backend si lo necesitas
  }

  /**
   * Limpia todos los filtros
   */
  clear(table: Table) {
    table.clear();
    if (this.filter?.nativeElement) {
      this.filter.nativeElement.value = '';
    }
    this.paginationData.update(data => ({ ...data, currentPage: 1 }));
    this.loadTransactions();
  }

  /**
   * Obtiene la severidad para el tipo de transacción
   */
  getTransactionTypeSeverity(transactionType: string): string {
    switch (transactionType?.toLowerCase()) {
      case 'ingreso':
        return 'success';
      default:
        return 'danger';
    }
  }

}