import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CreateTransaction, QueryParametersTransaction, Transaction, TransactionResponse, TransactionsService } from '../service/transactions.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-transactions-crud',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RatingModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    CalendarModule,
    TooltipModule,
    MultiSelectModule,
    SliderModule,
    ProgressBarModule,
    ToggleButtonModule
  ],
  template: `
    <div class="card">
      <p-toolbar styleClass="mb-6">
        <ng-template #start>
          <p-button 
            label="Nueva Transacción" 
            icon="pi pi-plus" 
            severity="primary" 
            class="mr-2" 
            (onClick)="showAddTransactionDialog()" />
            <p-button
            severity="danger"
            label="Eliminar Seleccionadas"
            icon="pi pi-trash"
            outlined
            (onClick)="deleteSelectedTransactions()"
            [disabled]="!selectedTransactions || selectedTransactions.length === 0" />
        </ng-template>

        <ng-template #end>
          <p-button 
            label="Exportar" 
            icon="pi pi-upload" 
            severity="secondary" 
            (onClick)="exportCSV()" />
        </ng-template>
      </p-toolbar>

      <p-table
        #dt1
        [value]="transactionSignal()"
        dataKey="transactionId" 
        selectionMode="multiple"  
        [showCurrentPageReport]="false"
        [paginator]="false"
        [rowHover]="true"
        [showGridlines]="true"
        [globalFilterFields]="['amount', 'categoryName', 'description', 'transactionType']"
        responsiveLayout="scroll"
        [(selection)]="selectedTransactions"
        [tableStyle]="{ 'min-width': '75rem' }"
      >
        <ng-template #caption>
          <div class="flex justify-between items-center flex-column sm:flex-row">
            <h5 class="m-0">Gestión de Transacciones</h5>
            <div class="flex gap-2">
              <button pButton label="Limpiar" class="p-button-outlined mb-2" icon="pi pi-filter-slash" (click)="clear(dt1)"></button>
              <p-iconfield iconPosition="left" class="ml-auto">
                <p-inputicon>
                  <i class="pi pi-search"></i>
                </p-inputicon>
                <input pInputText type="text" (input)="onGlobalFilter(dt1, $event)" placeholder="Buscar transacciones..." />
              </p-iconfield>
            </div>
          </div>
        </ng-template>

        <ng-template #header>
          <tr>
            <th style="width: 3rem">
              <p-tableHeaderCheckbox />
            </th>
            <th style="min-width: 12rem">
              <div class="flex justify-between items-center">
                Id
                <p-columnFilter type="text" field="categoryName" display="menu" placeholder="Buscar por categoría"></p-columnFilter>
              </div>
            </th>
            <th style="min-width: 12rem">
              <div class="flex justify-between items-center">
                Monto
                <p-columnFilter type="text" field="amount" display="menu" placeholder="Buscar por monto"></p-columnFilter>
              </div>
            </th>
            <th style="min-width: 12rem">
              <div class="flex justify-between items-center">
                Categoría
                <p-columnFilter type="text" field="categoryName" display="menu" placeholder="Buscar por categoría"></p-columnFilter>
              </div>
            </th>
            <th style="min-width: 14rem">
              <div class="flex justify-between items-center">
                Fecha
                <p-columnFilter type="date" field="date" display="menu" placeholder="dd/mm/yyyy"></p-columnFilter>
              </div>
            </th>
            <th style="min-width: 10rem">
              <div class="flex justify-between items-center">
                Descripción
                <p-columnFilter type="text" field="description" display="menu" placeholder="Buscar por descripción"></p-columnFilter>
              </div>
            </th>
            <th style="min-width: 10rem">
              <div class="flex justify-between items-center">
                Tipo
                <p-columnFilter type="text" field="transactionType" display="menu" placeholder="Buscar por tipo"></p-columnFilter>
              </div>
            </th>
            <th style="min-width: 12rem">
              <div class="flex justify-between items-center">
                Cuenta
                <p-columnFilter type="text" field="accountId" display="menu" placeholder="Buscar por cuenta"></p-columnFilter>
              </div>
            </th>
            <th style="min-width: 12rem">Acciones</th>
          </tr>
        </ng-template>

        <ng-template #body let-transaction>
          <tr>
            <td style="width: 3rem">
              <p-tableCheckbox [value]="transaction" />
            </td>
            <td>
              <div class="flex items-center gap-2">
                <span>{{ transaction.transactionId.slice(0,6) }}...</span>
              </div>
            </td>
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
                [severity]=""
                styleClass="dark:!bg-surface-900" 
              />
            </td> 
            <td>
              <p-tag [value]="transaction.accountId ?? 'Sin Cuenta'" styleClass="dark:!bg-surface-900 " />
            </td>
            <td>
              <p-button 
                icon="pi pi-pencil" 
                class="mr-2" 
                [rounded]="true" 
                [outlined]="true" 
                (click)="editTransaction(transaction)" />
              <p-button 
                icon="pi pi-trash" 
                severity="danger" 
                [rounded]="true" 
                [outlined]="true" 
                (click)="deleteTransaction(transaction)" />
            </td>
          </tr>
             <!-- MODAL PARA AGREGAR/EDITAR TRANSACCIÓN -->
     
        </ng-template>

        @if (loading == false) {
          <ng-template #emptymessage>
            <tr>
              <td colspan="8">No se encontraron transacciones.</td>
            </tr>
          </ng-template>
        }
      </p-table>

      <!-- SPINNER DE CARGA -->
      @if(loading == true){
        <div class="flex justify-center items-center py-8">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #6366f1;"></i>
        </div>
      }
      <p-dialog
              [header]="editMode ? 'Editar Transacción' : 'Nueva Transacción'"
              [(visible)]="displayAddTransactionDialog"
              [modal]="true"
              [style]="{width: '450px'}"
              [draggable]="false"
              [resizable]="false"
              [closable]="true">

              <ng-template #content>
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
                        [maxFractionDigits]="2"
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
              </ng-template>

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
                    [label]="editMode ? 'Actualizar' : 'Guardar'"
                    icon="pi pi-check"
                    class="p-button-success"
                    [disabled]="transactionForm.invalid || savingTransaction"
                    [loading]="savingTransaction"
                    (click)="onSubmitTransaction()">
                  </button>
                </div>
              </ng-template>
            </p-dialog>
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
            placeholder="5">
          </p-select>
        </div>
      </div>
    </div>

 

    <p-confirmdialog [style]="{ width: '450px' }" />
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
export class TransactionsCRUD implements OnInit {
  loading: boolean = false;
  editMode: boolean = false;
  currentTransactionId: string | null = null;

  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('dt1') dt1!: Table;

  // Signals para transacciones y paginación
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

  // Servicios inyectados
  transactionService = inject(TransactionsService);
  fb = inject(FormBuilder);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  // Variables para el formulario y modal
  displayAddTransactionDialog = false;
  transactionForm!: FormGroup;
  savingTransaction = false;
  selectedTransactions!: Transaction[] | null;

  // Opciones para dropdowns
  rowsPerPageOptions = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 }
  ];

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

  // accounts = [
  //   { label: 'Cuenta Corriente', value: 'CHECKING' },
  //   { label: 'Cuenta de Ahorros', value: 'SAVINGS' },
  //   { label: 'Tarjeta de Crédito', value: 'CREDIT_CARD' },
  //   { label: 'Efectivo', value: 'CASH' }
  // ];

  currentPageSize = 5;

  constructor() {
    this.initializeForm();
  }

  ngOnInit() {
    console.log('TRANSACTIONS CRUD INIT');
    this.loadTransactions();
  }

  initializeForm() {
    this.transactionForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1), Validators.max(1000000000)]],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]],
      date: [new Date(), Validators.required],
      transactionType: ['', Validators.required],
      categoryName: ['', Validators.required],
      accountId: ['']
    });
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

  // Métodos para el modal
  showAddTransactionDialog() {
    this.editMode = false;
    this.currentTransactionId = null;
    this.displayAddTransactionDialog = true;
    this.resetForm();
  }

  editTransaction(transaction: Transaction) {
    this.editMode = true;
    this.currentTransactionId = transaction.transactionId || null;
    this.displayAddTransactionDialog = true;

    // Llenar el formulario con los datos de la transacción
    this.transactionForm.patchValue({
      amount: transaction.amount,
      description: transaction.description,
      date: new Date(transaction.date),
      transactionType: transaction.transactionType,
      categoryName: transaction.categoryName,
      accountId: transaction.accountId
    });
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

  prepareDataForSubmit() {
    const formValue = this.transactionForm.value;
    return {
      amount: Number(formValue.amount) || 0,
      transactionType: formValue.transactionType || '',
      categoryId: formValue.categoryName || '', // Ajustar según tu lógica de categorías
      date: formValue.date instanceof Date ? formValue.date.toISOString() : formValue.date,
      description: formValue.description || '',
      accountId: formValue.accountId || null
    };
  }


  onSubmitTransaction() {
    console.log('submit')
    if (this.transactionForm.valid) {
      this.savingTransaction = true;

      const formData = this.transactionForm.value;
      const transactionData: CreateTransaction = {
        amount: formData.amount,
        description: formData.description,
        date: formData.date.toISOString(),
        transactionType: formData.transactionType,
        categoryId: "96fea329-d2d2-4f8c-8c57-59159b9f5b00",
        accountId: formData.accountId
      };

      console.log('Datos del formulario:', formData);
      console.log('transactionType valor:', formData.transactionType);
      console.log('transactionType tipo:', typeof formData.transactionType);
      console.log('Datos de la transacción:', transactionData);
      try {
        if (this.editMode) {
          this.transactionService.updateTransaction(this.currentTransactionId!, transactionData).subscribe({
            next: (response) => {
              console.log('Transacción actualizada:', response);
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Transacción creada exitosamente'
              });
              this.hideAddTransactionDialog();
              this.loadTransactions();
              this.savingTransaction = false;
            },
            error: (error) => {
              console.error('Error actualizando transacción:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al actualizar la transacción'
              });
              this.savingTransaction = false;
            }
          })
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Transacción actualizada exitosamente'
          });
        } else {

          console.log('crar transaccion')
          this.transactionService.createTransaction(transactionData).subscribe({
            next: (response) => {
              console.log('Transacción creada:', response);
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Transacción creada exitosamente'
              });
              this.hideAddTransactionDialog();
              this.loadTransactions();
              this.savingTransaction = false;
            },
            error: (error) => {
              console.error('Error creando transacción:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al crear la transacción'
              });
              this.savingTransaction = false;
            }
          })
        }
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.editMode ? 'Error al actualizar la transacción' : 'Error al crear la transacción'
        });
        this.savingTransaction = false;
      }
    } else {
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

  // Métodos para eliminar transacciones
  deleteTransaction(transaction: Transaction) {
    console.log('borrar  trans')
    console.log(transaction.transactionId)
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la transacción "${transaction.description}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.transactionService.removeTransaction(transaction.transactionId).subscribe({
          next: (response) => {
            console.log('Transacción creada:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Transacción eliminada exitosamente'
            });

            this.hideAddTransactionDialog();
            this.loadTransactions();
            this.savingTransaction = false;
          },
          error: (error) => {
            console.error('Error creando transacción:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar la transacción'
            });
            this.savingTransaction = false;
          }
        })
      }
    });
  }

  deleteSelectedTransactions() {
    console.log(this.selectedTransactions)
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar las transacciones seleccionadas?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deleteObservables = this.selectedTransactions?.map(transaction =>
          this.transactionService.removeTransaction(transaction.transactionId)
        );

        forkJoin(deleteObservables!).subscribe({
          next: (responses) => {
            console.log('Todas las transacciones eliminadas:', responses);

            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `${this.selectedTransactions?.length} transacciones eliminadas exitosamente`
            });

            this.selectedTransactions = [];
            this.loadTransactions();
            this.savingTransaction = false;
          },
          error: (error) => {
            console.error('Error eliminando transacciones:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar algunas transacciones'
            });
            this.selectedTransactions = [];
            this.loadTransactions();
            this.savingTransaction = false;
          }
        });
      }
    });
  }

  // Métodos de paginación
  goToFirstPage() {
    if (this.paginationData().hasPreviousPage) {
      this.paginationData.update(data => ({ ...data, currentPage: 1 }));
      this.loadTransactions();
    }
  }

  goToPreviousPage() {
    if (this.paginationData().hasPreviousPage) {
      this.paginationData.update(data => ({
        ...data,
        currentPage: data.currentPage - 1
      }));
      this.transactionSignal.set([])
      this.loadTransactions();
    }
  }

  goToNextPage() {
    if (this.paginationData().hasNextPage) {
      this.paginationData.update(data => ({
        ...data,
        currentPage: data.currentPage + 1
      }));
      this.transactionSignal.set([])
      this.loadTransactions();
    }
  }

  goToLastPage() {
    if (this.paginationData().hasNextPage) {
      this.paginationData.update(data => ({
        ...data,
        currentPage: data.totalPages
      }));
      this.loadTransactions();
    }
  }

  onRowsPerPageChange(event: any) {
    this.paginationData.update(data => ({
      ...data,
      pageSize: event.value,
      currentPage: 1
    }));
    this.currentPageSize = event.value;
    this.loadTransactions();
  }

  getStartRecord(): number {
    const data = this.paginationData();
    return data.totalCount === 0 ? 0 : ((data.currentPage - 1) * data.pageSize) + 1;
  }

  getEndRecord(): number {
    const data = this.paginationData();
    const end = data.currentPage * data.pageSize;
    return Math.min(end, data.totalCount);
  }

  // Métodos de utilidad
  onGlobalFilter(table: Table, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    if (this.filter?.nativeElement) {
      this.filter.nativeElement.value = '';
    }
    this.paginationData.update(data => ({ ...data, currentPage: 1 }));
    this.loadTransactions();
  }

  exportCSV() {
    this.dt1.exportCSV();
  }

  getTransactionTypeSeverity(transactionType: string): string {
    switch (transactionType?.toLowerCase()) {
      case 'ingreso':
        return 'success';
      default:
        return 'danger';
    }
  }
}