import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface PaginationData {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginationResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PaginationService<T> {
  private _paginationData = signal<PaginationData>({
    totalCount: 0,
    pageSize: 5,
    currentPage: 1,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  });

  private _loading = signal<boolean>(false);
  private _items = signal<T[]>([]);

  // Getters públicos
  get paginationData() { return this._paginationData.asReadonly(); }
  get loading() { return this._loading.asReadonly(); }
  get items() { return this._items.asReadonly(); }

  // Opciones de filas por página
  readonly rowsPerPageOptions = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '35', value: 35 },
    { label: '50', value: 50 }
  ];

  constructor() { }

  /**
   * Inicializa la paginación con configuración personalizada
   */
  initialize(initialPageSize: number = 5) {
    this._paginationData.update(data => ({
      ...data,
      pageSize: initialPageSize,
      currentPage: 1
    }));
  }
  /**
   * Actualiza los datos de paginación desde una respuesta del servidor
   */
  updateFromResponse(response: PaginationResponse<T>) {
    const transformedItems = response.items.map((item: any) => ({
      ...item,
      date: typeof item.date === 'string' && item.date ? new Date(item.date) : item.date
    }));

    this._items.set(transformedItems);
    this._paginationData.set({
      totalCount: response.totalCount,
      pageSize: response.pageSize,
      currentPage: response.currentPage,
      totalPages: response.totalPages,
      hasPreviousPage: response.hasPreviousPage,
      hasNextPage: response.hasNextPage
    });
  }

  /**
   * Carga datos usando una función de fetch personalizada
   */
  loadData(fetchFunction: (page: number, pageSize: number) => Observable<PaginationResponse<T>>) {
    this._loading.set(true);
    this._items.set([]); // Limpiar items durante carga

    const currentData = this._paginationData();

    return fetchFunction(currentData.currentPage, currentData.pageSize).subscribe({
      next: (response) => {
        this.updateFromResponse(response);
        this._loading.set(false);
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this._loading.set(false);
      }
    });
  }

  // Métodos de navegación
  goToFirstPage() {
    if (this._paginationData().hasPreviousPage) {
      this._paginationData.update(data => ({ ...data, currentPage: 1 }));
      return true;
    }
    return false;
  }

  goToPreviousPage() {
    const currentData = this._paginationData();
    if (currentData.hasPreviousPage) {
      this._paginationData.update(data => ({ ...data, currentPage: data.currentPage - 1 }));
      return true;
    }
    return false;
  }

  goToNextPage() {
    const currentData = this._paginationData();
    if (currentData.hasNextPage) {
      this._paginationData.update(data => ({ ...data, currentPage: data.currentPage + 1 }));
      return true;
    }
    return false;
  }

  goToLastPage() {
    const currentData = this._paginationData();
    if (currentData.hasNextPage) {
      this._paginationData.update(data => ({ ...data, currentPage: data.totalPages }));
      return true;
    }
    return false;
  }

  changePageSize(newPageSize: number) {
    this._paginationData.update(data => ({
      ...data,
      pageSize: newPageSize,
      currentPage: 1
    }));
  }

  // Métodos de utilidad
  getStartRecord(): number {
    const data = this._paginationData();
    return data.totalCount === 0 ? 0 : ((data.currentPage - 1) * data.pageSize) + 1;
  }

  getEndRecord(): number {
    const data = this._paginationData();
    const end = data.currentPage * data.pageSize;
    return Math.min(end, data.totalCount);
  }

  reset() {
    this._paginationData.update(data => ({
      ...data,
      currentPage: 1,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false
    }));
    this._items.set([]);
  }
}