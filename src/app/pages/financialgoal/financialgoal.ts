// Angular Core
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

// PrimeNG Services
import { MessageService, ConfirmationService } from 'primeng/api';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { CategoriesService, Category } from '../service/categories.service';
import { CreateFinancialGoal, FinancialGoal, FinancialGoalService } from '../service/financialgoal.service';
import { PaginationService } from '../service/pagination.service';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule,
    CardModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    DialogModule,
    ProgressBarModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    DialogModule,
    TagModule,

    ConfirmDialogModule,
    TooltipModule
  ],
  selector: 'app-financial-goals',
  template: `
<div class="financial-goals-container">
  <!-- Header -->
  <div class="header-section p-4 mb-4 surface-ground border-round">
    <div class="header-content flex justify-content-between align-items-center mb-3">
      <h1 class="title text-color m-0 flex align-items-center">
        <i class="pi pi-bullseye text-primary mr-3" style="font-size: 1.5rem;"></i>
        Metas Financieras
      </h1>
      <p-button
        label="Nueva Meta"
        icon="pi pi-plus"
        (click)="openNew()"
        severity="success"
        class="p-button-raised">
      </p-button>
    </div>

    <!-- Filtros -->
    <div class="filters flex gap-3 flex-wrap">
      <p-dropdown
        [options]="statusOptions"
        [(ngModel)]="selectedStatus"
        placeholder="Filtrar por estado"
        [showClear]="true"
        optionLabel="label"
        optionValue="value"
        class="filter-dropdown">
      </p-dropdown>
    </div>
  </div>

  <!-- Timeline -->
  <div class="timeline-container">
    <div *ngFor="let goal of filteredGoals; let i = index"
         class="timeline-item mb-4">

      <!-- Timeline Line -->
      <div class="timeline-line">
        <div class="timeline-progress"
             [style.width.%]="goal.progressPercentage"></div>
      </div>

      <!-- Timeline Node -->
      <div class="timeline-node flex align-items-center justify-content-center border-circle"
           [ngClass]="{
             'completed': goal.status === 'completada',
             'overdue': goal.isCompleted && goal.status !== 'completada',
             'active': goal.status === 'activa',
             'paused': goal.status === 'pausada',
             'cancelled': goal.status === 'cancelada'
           }">
        <i class="pi text-white"
           [ngClass]="{
             'pi-check': goal.status === 'completada',
             'pi-clock': goal.status === 'activa',
             'pi-pause': goal.status === 'pausada',
             'pi-times': goal.status === 'cancelada'
           }"></i>
      </div>

      <!-- Goal Card -->
      <div class="goal-card surface-card border-round shadow-2 p-4 flex-1">
        <div class="goal-header flex justify-content-between align-items-start mb-3">
          <div class="goal-title-section flex-1">
            <h3 class="goal-title text-color font-bold m-0 mb-2">
              {{goal.name}}
            </h3>
            <p class="goal-description text-color-secondary m-0 mb-3 line-height-3">
              {{goal.description}}
            </p>
            <div class="goal-tags flex flex-wrap gap-2">
              <p-tag
                [value]="goal.status"
                [severity]="getStatusSeverity(goal.status)"
                class="text-sm">
              </p-tag>
              <p-tag
                [value]="goal.priority"
                [severity]="getPrioritySeverity(goal.priority)"
                class="text-sm">
              </p-tag>
              <p-tag
                [value]="getCategoryName(goal.categoryId)"
                severity="info"
                class="text-sm">
              </p-tag>
            </div>
          </div>

          <div class="goal-actions flex gap-2 ml-3">
            <p-button
              icon="pi pi-pencil"
              [outlined]="true"
              size="small"
              (click)="editGoal(goal)"
              pTooltip="Editar"
              tooltipPosition="top"
              class="p-button-text">
            </p-button>
            <p-button
              icon="pi pi-trash"
              [outlined]="true"
              severity="danger"
              size="small"
              (click)="deleteGoal(goal)"
              pTooltip="Eliminar"
              tooltipPosition="top"
              class="p-button-text">
            </p-button>
          </div>
        </div>

        <!-- Progress Section -->
        <div class="progress-section mb-4">
          <div class="progress-header flex justify-content-between align-items-center mb-2">
            <span class="progress-label text-color font-medium">Progreso</span>
            <span class="progress-percentage text-primary font-bold">
              {{goal.progressPercentage | number:'1.0-1'}}%
            </span>
          </div>

          <div class="progress-bar-container mb-2">
            <div class="progress-bar surface-border border-round overflow-hidden">
              <div class="progress-fill border-round transition-all transition-duration-300"
                   [style.width.%]="goal.progressPercentage"
                   [ngStyle]="{'background': getProgressColor(goal.progressPercentage!)}">
              </div>
            </div>
          </div>

          <div class="progress-amounts flex justify-content-between">
            <span class="current-amount text-color font-medium">
              {{ goal.currentAmount | currency:'COP':'symbol':'1.0-0' }}
            </span>
            <span class="goal-amount text-color-secondary">
              {{ goal.goalAmount | currency:'COP':'symbol':'1.0-0' }}
            </span>
          </div>
        </div>

        <!-- Time Info -->
        <div class="time-section mb-4">
          <div class="time-item flex align-items-center gap-2 mb-2">
            <i class="pi pi-calendar text-color-secondary"></i>
            <span class="text-color">{{goal.targetDate | date:'dd/MM/yyyy'}}</span>
          </div>
          <div class="time-item flex align-items-center gap-2"
               [ngClass]="{'overdue': goal.isCompleted}">
            <i class="pi pi-clock"
               [ngClass]="goal.isCompleted ? 'text-red-500' : 'text-color-secondary'"></i>
            <span [ngClass]="goal.isCompleted ? 'text-red-500' : 'text-color'">
              {{goal.isCompleted ? 'Vencida hace ' + Math.abs(goal.daysRemaining!) + ' días' :
                goal.daysRemaining + ' días restantes'}}
            </span>
          </div>
        </div>

        <!-- Quick Update -->
        <div class="quick-update surface-50 border-round p-3">
          <label class="block text-color font-medium mb-2">Actualizar monto:</label>
          <div class="update-controls flex gap-2 align-items-center">
            <p-inputNumber
              [(ngModel)]="goal.currentAmount"
              mode="currency"
              currency="COP"
              locale="es-CO"
              [min]="0"
              [max]="goal.goalAmount"
              size="small"
              (onBlur)="updateProgress(goal)"
              class="flex-1">
            </p-inputNumber>
            <p-button
              icon="pi pi-check"
              size="small"
              [outlined]="true"
              severity="success"
              (click)="updateProgress(goal)"
              pTooltip="Confirmar actualización"
              tooltipPosition="top">
            </p-button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div *ngIf="filteredGoals.length === 0"
       class="empty-state text-center surface-card border-round shadow-1 p-6">
    <i class="pi pi-inbox text-6xl text-color-secondary mb-4 block"></i>
    <h3 class="text-color font-bold mb-2">No hay metas financieras</h3>
    <p class="text-color-secondary mb-4 line-height-3">
      Crea tu primera meta para comenzar a ahorrar y alcanzar tus objetivos financieros
    </p>
    <p-button
      label="Crear Meta"
      icon="pi pi-plus"
      [outlined]="true"
      severity="success"
      (click)="openNew()">
    </p-button>
  </div>
</div>

<!-- Dialog -->
<p-dialog
  [header]="isEditMode ? 'Editar Meta' : 'Nueva Meta'"
  [(visible)]="goalDialog"
  [modal]="true"
  [style]="{width: '550px'}"
  [draggable]="false"
  [resizable]="false"
  [closable]="true"
  styleClass="goal-dialog">

  <form [formGroup]="goalForm" (ngSubmit)="saveGoal()">
    <div class="grid grid-cols-1 gap-4">

      <!-- Nombre de Meta -->
      <div class="field">
        <label for="goalName" class="block text-color font-medium mb-2">
          Nombre de Meta *
        </label>
        <input
          id="goalName"
          type="text"
          pInputText
          formControlName="goalName"
          placeholder="Ingrese el nombre de la meta"
          class="w-full p-inputtext"
          [class.p-invalid]="goalForm.get('goalName')?.invalid && goalForm.get('goalName')?.touched">
        <small class="p-error block mt-1"
               *ngIf="goalForm.get('goalName')?.invalid && goalForm.get('goalName')?.touched">
          <span *ngIf="goalForm.get('goalName')?.errors?.['required']">
            El nombre de la meta es requerido
          </span>
          <span *ngIf="goalForm.get('goalName')?.errors?.['minlength']">
            El nombre debe tener al menos 3 caracteres
          </span>
        </small>
      </div>

      <!-- Descripción -->
      <div class="field">
        <label for="description" class="block text-color font-medium mb-2">
          Descripción
        </label>
        <textarea
          id="description"
          pInputTextarea
          formControlName="description"
          placeholder="Ingrese una descripción (opcional)"
          rows="3"
          class="w-full">
        </textarea>
      </div>

      <!-- Categoría y Prioridad -->
      <div class="grid grid-cols-2 gap-4">
        <div class="field">
          <label for="category" class="block text-color font-medium mb-2">
            Categoría *
          </label>
          <p-dropdown
            id="category"
            [options]="categoriesSignal()"
            formControlName="categoryId"
            optionLabel="categoryName"
            optionValue="categoryId"
            placeholder="Seleccionar categoría"
            class="w-full"
            [class.p-invalid]="goalForm.get('categoryId')?.invalid && goalForm.get('categoryId')?.touched">
          </p-dropdown>
          <small class="p-error block mt-1"
                 *ngIf="goalForm.get('categoryId')?.invalid && goalForm.get('categoryId')?.touched">
            La categoría es requerida
          </small>
        </div>

        <div class="field">
          <label for="priority" class="block text-color font-medium mb-2">
            Prioridad
          </label>
          <p-dropdown
            id="priority"
            [options]="priorityOptions"
            formControlName="priority"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar prioridad"
            class="w-full">
          </p-dropdown>
        </div>
      </div>

      <!-- Monto Meta y Monto Actual -->
      <div class="grid grid-cols-2 gap-4">
        <div class="field">
          <label for="goalAmount" class="block text-color font-medium mb-2">
            Monto Meta *
          </label>
          <p-inputNumber
            id="goalAmount"
            formControlName="goalAmount"
            mode="currency"
            currency="COP"
            locale="es-CO"
            [min]="1"
            placeholder="0"
            class="w-full"
            [class.p-invalid]="goalForm.get('goalAmount')?.invalid && goalForm.get('goalAmount')?.touched">
          </p-inputNumber>
          <small class="p-error block mt-1"
                 *ngIf="goalForm.get('goalAmount')?.invalid && goalForm.get('goalAmount')?.touched">
            <span *ngIf="goalForm.get('goalAmount')?.errors?.['required']">
              El monto meta es requerido
            </span>
            <span *ngIf="goalForm.get('goalAmount')?.errors?.['min']">
              El monto debe ser mayor a 0
            </span>
          </small>
        </div>

        <div class="field">
          <label for="currentAmount" class="block text-color font-medium mb-2">
            Monto Actual
          </label>
          <p-inputNumber
            id="currentAmount"
            formControlName="currentAmount"
            mode="currency"
            currency="COP"
            locale="es-CO"
            [min]="0"
            placeholder="0"
            class="w-full"
            [class.p-invalid]="goalForm.get('currentAmount')?.invalid && goalForm.get('currentAmount')?.touched">
          </p-inputNumber>
          <small class="p-error block mt-1"
                 *ngIf="goalForm.get('currentAmount')?.invalid && goalForm.get('currentAmount')?.touched">
            El monto actual no puede ser negativo
          </small>
        </div>
      </div>

      <!-- Fecha Objetivo -->
      <div class="field">
        <label for="targetDate" class="block text-color font-medium mb-2">
          Fecha Objetivo *
        </label>
        <p-calendar
          id="targetDate"
          formControlName="targetDate"
          dateFormat="dd/mm/yy"
          [minDate]="minDate"
          placeholder="Seleccionar fecha"
          class="w-full"
          [class.p-invalid]="goalForm.get('targetDate')?.invalid && goalForm.get('targetDate')?.touched">
        </p-calendar>
        <small class="p-error block mt-1"
               *ngIf="goalForm.get('targetDate')?.invalid && goalForm.get('targetDate')?.touched">
          La fecha objetivo es requerida
        </small>
      </div>

      <!-- Estado (solo en modo edición) -->
      <div class="field" *ngIf="isEditMode">
        <label for="status" class="block text-color font-medium mb-2">
          Estado
        </label>
        <p-dropdown
          id="status"
          [options]="statusOptions.slice(1)"
          formControlName="status"
          optionLabel="label"
          optionValue="value"
          [appendTo]="'body'"
          placeholder="Seleccionar estado"
          class="w-full">
        </p-dropdown>
      </div>

    </div>
  </form>

  <ng-template pTemplate="footer">
    <div class="flex justify-content-end gap-2">
      <p-button
        label="Cancelar"
        icon="pi pi-times"
        [text]="true"
        severity="secondary"
        (click)="hideDialog()">
      </p-button>
      <p-button
        [label]="isEditMode ? 'Actualizar' : 'Guardar'"
        icon="pi pi-check"
        [disabled]="goalForm.invalid || savingGoal"
        [loading]="savingGoal"
        severity="success"
        (click)="saveGoal()">
      </p-button>
    </div>
  </ng-template>
</p-dialog>

<p-confirmDialog></p-confirmDialog>
<p-toast></p-toast>
  `,
  styles: [`
        .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: var(--surface-ground);
      min-height: 100vh;
    }

    .header-section {
      margin-bottom: 2rem;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      padding: 1.5rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .title {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-color);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
    }

    .timeline-container {
      position: relative;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 3rem;
      padding-left: 4rem;
    }

    .timeline-line {
      position: absolute;
      left: 1.5rem;
      top: 2rem;
      width: 4px;
      height: calc(100% + 1rem);
      background: var(--surface-border);
      border-radius: 2px;
    }

    .timeline-progress {
      height: 100%;
      background: linear-gradient(to bottom, var(--primary-color), var(--primary-color));
      border-radius: 2px;
      transition: width 0.5s ease;
    }

    .timeline-node {
      position: absolute;
      left: 0.75rem;
      top: 1rem;
      width: 2.5rem;
      height: 2.5rem;
      background: var(--surface-card);
      border: 3px solid var(--primary-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
      font-weight: bold;
      z-index: 2;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .timeline-node.completed {
      background: var(--green-500);
      border-color: var(--green-500);
      color: white;
    }

    .timeline-node.overdue {
      background: var(--red-500);
      border-color: var(--red-500);
      color: white;
    }

    .timeline-node.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
    }

    .timeline-node.paused {
      background: var(--yellow-500);
      border-color: var(--yellow-500);
      color: white;
    }

    .timeline-node.cancelled {
      background: var(--surface-400);
      border-color: var(--surface-400);
      color: white;
    }

    .goal-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 12px;
      box-shadow: var(--shadow-2);
      padding: 1.5rem;
      border-left: 4px solid var(--primary-color);
      transition: all 0.3s ease;
    }

    .goal-card:hover {
      box-shadow: var(--shadow-4);
      transform: translateY(-2px);
    }

    .goal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .goal-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: var(--text-color);
    }

    .goal-description {
      color: var(--text-color-secondary);
      margin: 0 0 1rem 0;
      line-height: 1.6;
    }

    .goal-tags {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .goal-actions {
      display: flex;
      gap: 0.5rem;
    }

    .progress-section {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: var(--surface-50);
      border-radius: 8px;
      border: 1px solid var(--surface-border);
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .progress-label {
      font-weight: 600;
      color: var(--text-color);
    }

    .progress-percentage {
      font-weight: 700;
      color: var(--primary-color);
    }

    .progress-bar-container {
      margin-bottom: 0.5rem;
    }

    .progress-bar {
      height: 1rem;
      background: var(--surface-200);
      border-radius: 0.5rem;
      overflow: hidden;
      border: 1px solid var(--surface-border);
    }

    .progress-fill {
      height: 100%;
      border-radius: 0.5rem;
      transition: width 0.5s ease;
    }

    .progress-amounts {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
    }

    .current-amount {
      color: var(--text-color);
      font-weight: 600;
    }

    .goal-amount {
      color: var(--text-color-secondary);
    }

    .time-section {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: var(--surface-50);
      border-radius: 8px;
      border: 1px solid var(--surface-border);
    }

    .time-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-color);
      margin-bottom: 0.5rem;
    }

    .time-item:last-child {
      margin-bottom: 0;
    }

    .time-item.overdue {
      color: var(--red-500);
      font-weight: 600;
    }

    .time-item i {
      width: 1rem;
      text-align: center;
    }

    .quick-update {
      background: var(--surface-100);
      border: 1px solid var(--surface-border);
      padding: 1rem;
      border-radius: 8px;
    }

    .quick-update label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .update-controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-color-secondary);
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 12px;
    }

    .empty-state i {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: var(--text-color-secondary);
    }

    .empty-state h3 {
      color: var(--text-color);
      margin-bottom: 1rem;
    }

    .goal-form .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    /* Dark mode specific adjustments */
    :host-context(.dark) {
      .progress-bar {
        background: var(--surface-700);
      }
      
      .timeline-line {
        background: var(--surface-600);
      }
      
      .timeline-node {
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }
      
      .goal-card {
        border-left-color: var(--primary-color);
      }
      
      .goal-card:hover {
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }
      
      .header-content {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }
      
      .timeline-item {
        padding-left: 3rem;
      }
      
      .timeline-node {
        left: 0.5rem;
        width: 2rem;
        height: 2rem;
      }
      
      .timeline-line {
        left: 1.25rem;
      }
      
      .goal-header {
        flex-direction: column;
        gap: 1rem;
      }
      
      .goal-actions {
        align-self: flex-end;
      }
      
      .goal-form .form-row {
        grid-template-columns: 1fr;
      }
      
      .title {
        font-size: 1.5rem;
      }
    }

    /* Animaciones adicionales */
    .goal-card {
      animation: fadeInUp 0.5s ease-out;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .timeline-node {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(var(--primary-color-rgb), 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0);
      }
    }
    
    .timeline-node.completed {
      animation: none;
    }
  `],
  providers: [MessageService, ConfirmationService]
})
export class FinancialGoalsComponent implements OnInit {
  goals: FinancialGoal[] = [];
  savingGoal = false;
  categoriesSignal = signal<Category[]>([]);
  financialGoalService = inject(FinancialGoalService);

  goalDialog = false;
  goal: FinancialGoal = this.getEmptyGoal();
  isEditMode = false;

  statusOptions = [
    { label: 'Todas', value: null },
    { label: 'Activa', value: 'activa' },
    { label: 'Completada', value: 'completada' },
    { label: 'Pausada', value: 'pausada' },
    { label: 'Cancelada', value: 'cancelada' }
  ];

  priorityOptions = [
    { label: 'Alta', value: 'alta' },
    { label: 'Media', value: 'media' },
    { label: 'Baja', value: 'baja' }
  ];

  selectedStatus: string | null = null;
  Math = Math;
  minDate = new Date();
  goalForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private categoryService: CategoriesService
  ) { }

  ngOnInit() {
    this.loadGoals();
    this.loadCategories();
    this.initializeForm();
  }

  initializeForm() {
    this.goalForm = this.fb.group({
      goalName: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      categoryId: ['', Validators.required],
      priority: ['media', Validators.required],
      goalAmount: [0, [Validators.required, Validators.min(1)]],
      currentAmount: [0, [Validators.min(0)]],
      targetDate: ['', Validators.required],
      status: ['activa']
    });
  }

  loadGoals() {
    this.financialGoalService.getFinancialGoals({ page: 1, results: 100 }).subscribe({
      next: (response) => {
        this.goals = response.items;
        this.processGoalsData();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Error al cargar las metas: ${error.message || 'Error desconocido'}`
        });
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categoriesSignal.set(res);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las categorías'
        });
      }
    });
  }

  processGoalsData() {
    this.goals.forEach(goal => {
      goal.progressPercentage = Math.min((goal.currentAmount / goal.goalAmount) * 100, 100);

      const today = new Date();
      const timeDiff = new Date(goal.targetDate).getTime() - today.getTime();
      goal.daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      goal.isCompleted = goal.daysRemaining < 0 && goal.status !== 'completada';
    });
  }

  getEmptyGoal(): FinancialGoal {
    return {
      financialGoalId: '',
      name: '',
      description: '',
      status: 'activa',
      priority: 'media',
      createAt: '',
      categoryId: '',
      goalAmount: 0,
      currentAmount: 0,
      targetDate: '',
      progressPercentage: 0,
      isCompleted: false,
      daysRemaining: 0
    };
  }

  openNew() {
    this.goal = this.getEmptyGoal();
    this.isEditMode = false;
    this.goalForm.reset({
      goalName: '',
      description: '',
      categoryId: '',
      priority: 'media',
      goalAmount: 0,
      currentAmount: 0,
      targetDate: '',
      status: 'activa'
    });
    this.goalDialog = true;
  }

  editGoal(goal: FinancialGoal) {
    this.goal = { ...goal };
    this.isEditMode = true;

    this.goalForm.patchValue({
      goalName: goal.name,
      description: goal.description,
      categoryId: goal.categoryId,
      priority: goal.priority,
      goalAmount: goal.goalAmount,
      currentAmount: goal.currentAmount,
      targetDate: new Date(goal.targetDate),
      status: goal.status
    });

    this.goalDialog = true;
  }

  deleteGoal(goal: FinancialGoal) {
    this.confirmationService.confirm({
      message: `¿Eliminar la meta "${goal.name}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.financialGoalService.removeFinancialGoal(goal.financialGoalId).subscribe({
          next: () => {
            this.goals = this.goals.filter(g => g.financialGoalId !== goal.financialGoalId);
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Meta eliminada correctamente'
            });
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar la meta'
            });
          }
        });
      }
    });
  }

  saveGoal() {
    if (this.goalForm.invalid) {
      Object.keys(this.goalForm.controls).forEach(key => {
        this.goalForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.savingGoal = true;
    const formValue = this.goalForm.value;

    const goalData: CreateFinancialGoal = {
      name: formValue.goalName,
      description: formValue.description,
      categoryId: formValue.categoryId,
      priority: formValue.priority,
      goalAmount: formValue.goalAmount,
      currentAmount: formValue.currentAmount,
      targetDate: formValue.targetDate.toISOString(),
      status: formValue.status,
      createAt: new Date().toISOString()
    };

    if (this.isEditMode) {
      this.financialGoalService.updateFinancialGoal(this.goal.financialGoalId, goalData).subscribe({
        next: () => {
          this.loadGoals();
          this.goalDialog = false;
          this.savingGoal = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'Meta actualizada correctamente'
          });
        },
        error: (error) => {
          this.savingGoal = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar la meta'
          });
        }
      });
    } else {
      this.financialGoalService.createFinancialGoal(goalData).subscribe({
        next: () => {
          this.loadGoals();
          this.goalDialog = false;
          this.savingGoal = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Guardado',
            detail: 'Meta creada correctamente'
          });
        },
        error: (error) => {
          this.savingGoal = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear la meta'
          });
        }
      });
    }
  }

  hideDialog() {
    this.goalDialog = false;
    this.goalForm.reset();
  }

  updateProgress(goal: FinancialGoal) {
    const updateData: CreateFinancialGoal = {
      name: goal.name,
      description: goal.description,
      categoryId: goal.categoryId,
      priority: goal.priority,
      goalAmount: goal.goalAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate,
      status: goal.currentAmount >= goal.goalAmount ? 'completada' : goal.status,
      createAt: goal.createAt
    };

    this.financialGoalService.updateFinancialGoal(goal.financialGoalId, updateData).subscribe({
      next: () => {
        this.processGoalsData();
        this.messageService.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: `Progreso actualizado para ${goal.name}`
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar el progreso'
        });
      }
    });
  }

  getCategoryName(categoryId: string): string {
    const category = this.categoriesSignal().find(c => c.categoryId === categoryId);
    return category ? category.categoryName : categoryId;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'completada': return 'success';
      case 'pausada': return 'warning';
      case 'cancelada': return 'danger';
      default: return 'info';
    }
  }

  getPrioritySeverity(priority: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (priority) {
      case 'alta': return 'danger';
      case 'media': return 'warning';
      case 'baja': return 'info';
      default: return 'info';
    }
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 75) return '#10b981';
    if (percentage >= 50) return '#f59e0b';
    if (percentage >= 25) return '#f97316';
    return '#ef4444';
  }

  get filteredGoals() {
    if (!this.selectedStatus) {
      return this.goals;
    }
    return this.goals.filter(goal => goal.status === this.selectedStatus);
  }
}