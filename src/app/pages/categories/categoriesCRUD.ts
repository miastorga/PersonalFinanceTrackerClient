import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { catchError, forkJoin, map, of } from 'rxjs';
import { CategoriesService, Category } from '../service/categories.service';
import { PrimengConfigService } from '../service/primengconfig.service';

export interface CreateCategory {
  categoryName: string;
}

@Component({
  selector: 'app-categories-crud',
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
    InputTextModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  template: `
<!-- Nueva cabecera igual al componente de Metas Financieras -->
<div class="header-section p-4 mb-4 surface-card border-round shadow-2" style="background: var(--surface-card); border: 1px solid var(--surface-border);">
  <div class="header-content flex justify-content-between align-items-center mb-3">
    <h1 class="title text-color m-0 flex align-items-center">
      <i class="pi pi-tags text-primary mr-3" style="font-size: 1.5rem; vertical-align: middle;"></i>
      Gestión de Categorías
    </h1>
    <div class="flex gap-2 ml-auto">
      <p-button
        label="Nueva Categoría"
        icon="pi pi-plus"
        (click)="showAddCategoryDialog()"
        severity="success"
        class="p-button-raised">
      </p-button>
      <p-button
        severity="danger"
        label="Eliminar Seleccionadas"
        icon="pi pi-trash"
        outlined
        (onClick)="deleteSelectedCategories()"
        [disabled]="!selectedCategories || selectedCategories.length === 0">
      </p-button>
    </div>
  </div>
</div>

<!-- Resto del componente original -->
<div class="card">
  <p-toast
    position="top-right"
    [baseZIndex]="5000"
    [breakpoints]="{'960px': {width: '100%', right: '0', left: '0'}}">
  </p-toast>

  <p-table
    #dt1
    [value]="categoriesSignal()"
    dataKey="categoryId"
    selectionMode="multiple"
    [showCurrentPageReport]="false"
    [paginator]="false"
    [rowHover]="true"
    [showGridlines]="true"
    [globalFilterFields]="['categoryId', 'categoryName']"
    responsiveLayout="scroll"
    [(selection)]="selectedCategories"
    [tableStyle]="{ 'min-width': '50rem' }"
    [sortField]="'categoryName'"
    [sortOrder]="1"
  >
    <ng-template #caption>
      <div class="flex justify-between items-center flex-column sm:flex-row">
        <div class="flex gap-2">
          <button pButton label="Limpiar" class="p-button-outlined mb-2" icon="pi pi-filter-slash" (click)="clear(dt1)"></button>
          <p-iconfield iconPosition="left" class="ml-auto">
            <!-- <p-inputicon>
              <i class="pi pi-search"></i>
            </p-inputicon>
            <input pInputText type="text" (input)="onGlobalFilter(dt1, $event)" placeholder="Buscar categorías..." /> -->
          </p-iconfield>
        </div>
      </div>
    </ng-template>

    <ng-template #header>
      <tr>
        <th style="width: 3rem">
          <p-tableHeaderCheckbox />
        </th>
        <th style="min-width: 15rem" >
          <div class="flex justify-between items-center">
            Id
          </div>
        </th>
        <th style="min-width: 20rem" pSortableColumn="categoryName">
          <div class="flex justify-between items-center">
            Nombre de Categoría
            <p-columnFilter
              type="text"
              field="categoryName"
              display="menu"
              placeholder="Buscar por nombre"
              [matchModeOptions]="primengConfig.textFilterOptions">
            </p-columnFilter>
            <p-sortIcon field="categoryName"></p-sortIcon>
          </div>
        </th>
        <th style="min-width: 12rem">Acciones</th>
      </tr>
    </ng-template>

    <ng-template #body let-category>
      <tr>
        <td style="width: 3rem">
          <p-tableCheckbox [value]="category" />
        </td>
        <td>
          <div class="flex items-center gap-2">
            <span>{{ category.categoryId.slice(0,6) }}...</span>
          </div>
        </td>
        <td>
          <div class="flex items-center gap-2">
            <span>{{ category.categoryName }}</span>
          </div>
        </td>
        <td>
          <p-button
            icon="pi pi-pencil"
            class="mr-2"
            [rounded]="true"
            [outlined]="true"
            (click)="editCategory(category)" />
          <p-button
            icon="pi pi-trash"
            severity="danger"
            [rounded]="true"
            [outlined]="true"
            (click)="deleteCategory(category)" />
        </td>
      </tr>
    </ng-template>

    <ng-template #emptymessage>
      <tr>
        <td colspan="7" class="text-center py-12">
          <div *ngIf="categoriesSignal().length === 0 && loading == false"
            class="empty-state text-center surface-card border-round shadow-1 p-6">
              <i class="pi pi-tags text-8xl text-color-secondary mb-4 block" style="font-size: 40px;"></i>
              <h3 class="text-color font-bold mb-2">No hay categorias registradas</h3>
              <p class="text-color-secondary mb-4 line-height-3">
                Crea tu primera categoria para comenzar a gestionar tus finanzas personales
              </p>
              <p-button
                label="Nueva Categoria"
                icon="pi pi-plus"
                [outlined]="true"
                severity="success"
                (click)="showAddCategoryDialog()">
              </p-button>
          </div>
        </td>
      </tr>
    </ng-template>

  </p-table>

  <!-- SPINNER DE CARGA -->
  @if(loading == true){
    <div class="flex justify-center items-center py-8">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #6366f1;"></i>
    </div>
  }

  <!-- MODAL PARA AGREGAR/EDITAR CATEGORÍA -->
  <p-dialog
    [header]="editMode ? 'Editar Categoría' : 'Nueva Categoría'"
    [(visible)]="displayAddCategoryDialog"
    [modal]="true"
    [style]="{width: '450px'}"
    [draggable]="false"
    [resizable]="false"
    [closable]="true">

    <ng-template #content>
      <form [formGroup]="categoryForm" (ngSubmit)="onSubmitCategory()">
        <div class="grid grid-cols-1 gap-4">

          <!-- Nombre de Categoría -->
          <div class="field">
            <label for="categoryName" class="block text-sm font-medium mb-2">Nombre de Categoría *</label>
            <input
              id="categoryName"
              type="text"
              pInputText
              formControlName="categoryName"
              placeholder="Ingrese el nombre de la categoría"
              class="w-full">
            <small class="text-red-500" *ngIf="categoryForm.get('categoryName')?.invalid && categoryForm.get('categoryName')?.touched">
              El nombre de la categoría es requerido
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
          (click)="hideAddCategoryDialog()">
        </button>
        <button
          pButton
          [label]="editMode ? 'Actualizar' : 'Guardar'"
          icon="pi pi-check"
          class="p-button-success"
          [disabled]="categoryForm.invalid || savingCategory"
          [loading]="savingCategory"
          (click)="onSubmitCategory()">
        </button>
      </div>
    </ng-template>
  </p-dialog>

  <!-- Información de registros -->
  <div class="flex justify-between items-center mt-4 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
        <i class="pi pi-tags text-gray-500 dark:text-gray-400"></i>
        <span class="text-sm text-gray-600 dark:text-gray-300">
          Total de categorías:
          <span class="font-medium text-gray-800 dark:text-gray-200">{{ categoriesSignal().length }}</span>
        </span>
      </div>
    </div>
  </div>
</div>
<p-confirmdialog [style]="{ width: '450px' }" />
  `,
  styles: `
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

/* Responsive design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .title {
    font-size: 1.5rem;
  }
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
    .p-datatable-frozen-tbody {
      font-weight: bold;
    }

    .p-datatable-scrollable .p-frozen-column {
      font-weight: bold;
    }
  `,
  providers: [ConfirmationService, MessageService]
})
export class CategoriesCRUD implements OnInit {
  // Servicios inyectados
  fb = inject(FormBuilder);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  categoriesService = inject(CategoriesService);
  primengConfig = inject(PrimengConfigService);

  loading: boolean = false;
  editMode: boolean = false;
  currentCategoryId: string | null = null;

  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('dt1') dt1!: Table;

  // Signal para categorías
  categoriesSignal = signal<Category[]>([]);

  // Variables para el formulario y modal
  displayAddCategoryDialog = false;
  categoryForm!: FormGroup;
  savingCategory = false;
  selectedCategories!: Category[] | null;

  constructor() {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadCategories();
  }

  initializeForm() {
    this.categoryForm = this.fb.group({
      categoryName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
    });
  }

  loadCategories() {
    this.loading = true;
    this.categoriesService.getCategories().subscribe({
      next: (response: Category[]) => {
        this.categoriesSignal.set(response);
        this.loading = false;
      },
      error: (error) => {
        console.log(error)
        console.log(this.categoriesSignal())
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `${error} Vuelva a intentarlo mas tarde`
        });
      }
    });
  }

  // Métodos para el modal
  showAddCategoryDialog() {
    this.editMode = false;
    this.currentCategoryId = null;
    this.displayAddCategoryDialog = true;
    this.resetForm();
  }

  editCategory(category: Category) {
    this.editMode = true;
    this.currentCategoryId = category.categoryId || null;
    this.displayAddCategoryDialog = true;

    this.categoryForm.patchValue({
      categoryName: category.categoryName
    });
  }

  hideAddCategoryDialog() {
    this.displayAddCategoryDialog = false;
    this.resetForm();
  }

  resetForm() {
    this.categoryForm.reset();
    this.savingCategory = false;
  }

  onSubmitCategory() {
    if (this.categoryForm.valid) {
      this.savingCategory = true;

      const formData = this.categoryForm.value;
      const categoryData: CreateCategory = {
        categoryName: formData.categoryName
      };

      try {
        if (this.editMode) {
          // Asumiendo que tienes un método updateCategory en tu servicio
          this.categoriesService.updateCategory(this.currentCategoryId!, categoryData).subscribe({
            next: (response) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Categoría actualizada exitosamente'
              });
              this.hideAddCategoryDialog();
              this.loadCategories();
              this.savingCategory = false;
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `Error al actualizar la categoría: ${error.message}`
              });
              this.savingCategory = false;
            }
          });
        } else {
          // Asumiendo que tienes un método createCategory en tu servicio
          this.categoriesService.createCategory(categoryData).subscribe({
            next: (response) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Categoría creada exitosamente'
              });
              this.hideAddCategoryDialog();
              this.loadCategories();
              this.savingCategory = false;
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `Error al crear la categoría: ${error.message}`
              });
              this.savingCategory = false;
            }
          });
        }
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.editMode ? 'Error al actualizar la categoría' : 'Error al crear la categoría'
        });
        this.savingCategory = false;
      }
    } else {
      Object.keys(this.categoryForm.controls).forEach(key => {
        this.categoryForm.get(key)?.markAsTouched();
      });

      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos'
      });
    }
  }

  deleteCategory(category: Category) {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la categoría "${category.categoryName}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.categoriesService.removeCategory(category.categoryId).subscribe({
          next: (response) => {
            this.loadCategories();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Categoría eliminada exitosamente'
            });
          },
          error: (error) => {
            console.log(error)
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `${error}`
            });
          }
        });
      }
    });
  }

  deleteSelectedCategories() {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar las categorías seleccionadas?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deleteObservables = this.selectedCategories?.map(category =>
          this.categoriesService.removeCategory(category.categoryId).pipe(
            map(response => ({ success: true, category, response })),
            catchError(error => of({ success: false, category, error }))
          )
        );

        forkJoin(deleteObservables!).subscribe({
          next: (results) => {
            const successful = results.filter(r => r.success);
            const failed = results.filter(r => !r.success);

            if (successful.length > 0) {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: `${successful.length} categorías eliminadas exitosamente`
              });
            }

            if (failed.length > 0) {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `${failed.length} categorías no pudieron ser eliminadas`
              });
            }

            this.selectedCategories = [];
            this.loadCategories();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error inesperado al procesar las eliminaciones'
            });
            this.selectedCategories = [];
            this.loadCategories();
          }
        });
      }
    });
  }

  // Método para filtro global
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    if (this.filter?.nativeElement) {
      this.filter.nativeElement.value = '';
    }
  }
}