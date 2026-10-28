import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, shareReplay, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';

// Helper para validar y parsear fechas seguras
const parseSafeDate = (dateStr: string | undefined): Date => {
  if (!dateStr) return new Date();
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? new Date() : date;
};

// Helper para formatear fecha a YYYY-MM-DD de forma segura
const formatSafeDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  const date = parseSafeDate(dateStr);
  return date.toISOString().split('T')[0];
};

export interface RateData {
  date: string;
  usd: number;
}

export interface CurrentRateResponse {
  current: { date: string; usd: number };
  changePercentage: { usd: number };
}

// ==========================================
// Nuevas interfaces para /my-rate y tasas custom
// ==========================================

export interface MyRateResponse {
  type: 'bcv' | 'custom';
  rate: number;
  source: 'BCV' | 'CUSTOM';
  date?: string;
  bcvRate?: number;
  bcvDate?: string;
  note?: string;
}

export interface CustomPreferencesResponse {
  useCustomRate: boolean;
  customExchangeRate: number | null;
  canEdit: boolean;
}

export interface SetCustomRateRequest {
  rate: number;
}

export interface SetCustomRateResponse {
  success: boolean;
  message: string;
  rate: number;
  date: string;
}

// ==========================================
// Interfaces para la API externa (fallback)
// ==========================================

export interface ExternalRateResponse {
  current: { date: string; usd: number; eur?: number };
  previous: { date: string; usd: number; eur?: number };
}

@Injectable({ providedIn: 'root' })
export class ExchangeRateService {
  private apiUrl = `${environment.apiUrl}/exchange-rates`;
  // API externa de respaldo para cuando la BD está vacía
  private externalApiUrl = 'https://rates.dolarvzla.com/bcv';

  // Estado de tasa BCV general (pública)
  private currentRate = signal<CurrentRateResponse | null>(null);
  private isLoading = signal(false);
  private error = signal<string | null>(null);
  private historyCache$: Observable<RateData[]> | null = null;

  // Estado de tasa aplicable al usuario (con soporte para custom Premium)
  private myRate = signal<MyRateResponse | null>(null);
  private customPreferences = signal<CustomPreferencesResponse | null>(null);
  private myRateLoading = signal(false);

  constructor(private http: HttpClient) {}

  // ==========================================
  // Endpoints públicos con fallback a API externa
  // ==========================================

  getCurrentRate(): Observable<CurrentRateResponse> {
    this.isLoading.set(true);
    return this.http.get<CurrentRateResponse>(`${this.apiUrl}/current`).pipe(
      tap(response => {
        this.currentRate.set(response);
        this.isLoading.set(false);
      }),
      catchError(() => {
        // Fallback a API externa si la BD está vacía
        return this.getExternalCurrentRate().pipe(
          tap(response => {
            this.currentRate.set(response);
            this.isLoading.set(false);
          }),
          catchError(() => {
            this.error.set('No se pudo cargar la tasa del día');
            this.isLoading.set(false);
            return of(null as any);
          })
        );
      })
    );
  }

  getRecentHistory(days: number = 4): Observable<RateData[]> {
    if (!this.historyCache$) {
      this.historyCache$ = this.http.get<RateData[]>(`${this.apiUrl}/history?days=${days}`).pipe(
        shareReplay(1),
        catchError(() => {
          // Fallback a API externa si la BD está vacía
          return this.getExternalHistory(days).pipe(shareReplay(1));
        })
      );
    }
    return this.historyCache$;
  }

  getRateByDate(year: number, month: number, day: number): Observable<RateData | null> {
    // Validar parámetros antes de formar el dateStr
    if (!year || !month || !day) {
      return of(null);
    }

    const y = Number(year);
    const m = Number(month);
    const d = Number(day);

    // Validar rangos válidos
    if (y < 1900 || y > 2100) {
      return of(null);
    }
    if (m < 1 || m > 12) {
      return of(null);
    }
    if (d < 1 || d > 31) {
      return of(null);
    }

    // Validar que sea una fecha real válida (ej: no febrero 30)
    const testDate = new Date(y, m - 1, d);
    if (
      testDate.getFullYear() !== y ||
      testDate.getMonth() !== m - 1 ||
      testDate.getDate() !== d
    ) {
      return of(null);
    }

    const formattedMonth = String(m).padStart(2, '0');
    const formattedDay = String(d).padStart(2, '0');
    const dateStr = `${y}-${formattedMonth}-${formattedDay}`;

    return this.http.get<RateData | null>(`${this.apiUrl}/${dateStr}`).pipe(
      catchError(() => of(null))
    );
  }

  // ==========================================
  // Métodos privados de fallback a API externa
  // ==========================================

  private getExternalCurrentRate(): Observable<CurrentRateResponse> {
    return this.http.get<ExternalRateResponse>(`${this.externalApiUrl}/current.json`).pipe(
      map((data: ExternalRateResponse) => {
        const safeCurrentDate = formatSafeDate(data.current.date);
        const response: CurrentRateResponse = {
          current: {
            date: safeCurrentDate,
            usd: data.current.usd,
          },
          changePercentage: {
            usd: data.previous?.usd
              ? ((data.current.usd - data.previous.usd) / data.previous.usd) * 100
              : 0,
          },
        };
        return response;
      })
    );
  }

  private getExternalHistory(days: number = 4): Observable<RateData[]> {
    return forkJoin({
      current: this.http.get<ExternalRateResponse>(`${this.externalApiUrl}/current.json`),
      previous: this.http.get<ExternalRateResponse>(`${this.externalApiUrl}/previous.json`),
    }).pipe(
      map(({ current, previous }) => {
        // Combinar todas las fechas disponibles y eliminar duplicados usando fechas seguras
        const allRates = [
          current.current,
          current.previous,
          previous.current,
          previous.previous,
        ];

        const uniqueRates = allRates.filter(
          (rate, index, self) =>
            index === self.findIndex((r) => formatSafeDate(r.date) === formatSafeDate(rate.date))
        );

        return uniqueRates
          .sort(
            (a, b) =>
              parseSafeDate(b.date).getTime() - parseSafeDate(a.date).getTime()
          )
          .slice(0, days)
          .map((r) => ({ date: formatSafeDate(r.date), usd: r.usd }));
      })
    );
  }

  // ==========================================
  // Nuevos endpoints: Tasa aplicable al usuario
  // ==========================================

  /** Obtiene la tasa que debe usar el usuario logueado (BCV o custom si es PREMIUM) */
  getMyRate(): Observable<MyRateResponse> {
    this.myRateLoading.set(true);
    return this.http.get<MyRateResponse>(`${this.apiUrl}/my-rate`).pipe(
      tap(response => {
        this.myRate.set(response);
        this.myRateLoading.set(false);
      }),
      catchError(err => {
        // Si falla el backend, intentar obtener tasa BCV externa como fallback
        this.myRateLoading.set(false);
        return this.getExternalCurrentRate().pipe(
          map((bcvRate) => {
            const safeDate = formatSafeDate(bcvRate.current.date);
            const fallback: MyRateResponse = {
              type: 'bcv',
              rate: bcvRate.current.usd,
              source: 'BCV',
              date: safeDate,
              note: 'Tasa BCV (fallback - BD temporalmente vacía)',
            };
            this.myRate.set(fallback);
            return fallback;
          }),
          catchError(() => {
            this.error.set('No se pudo cargar la tasa aplicable');
            return of(null as any);
          })
        );
      })
    );
  }

  /** Obtiene las preferencias de tasa custom del usuario (para mostrar en UI) */
  getCustomPreferences(): Observable<CustomPreferencesResponse> {
    return this.http.get<CustomPreferencesResponse>(`${this.apiUrl}/custom-preferences`).pipe(
      tap(response => {
        this.customPreferences.set(response);
      }),
      catchError(() => of({
        useCustomRate: false,
        customExchangeRate: null,
        canEdit: false,
      } as CustomPreferencesResponse))
    );
  }

  /** Establece una tasa personalizada (solo PREMIUM y ADMIN) */
  setCustomRate(rate: number): Observable<SetCustomRateResponse> {
    this.myRateLoading.set(true);
    return this.http.put<SetCustomRateResponse>(`${this.apiUrl}/custom`, { rate }).pipe(
      tap(response => {
        this.myRateLoading.set(false);
        // Invalidar caché de my-rate para que se recargue
        this.myRate.set(null);
      }),
      catchError(err => {
        this.myRateLoading.set(false);
        this.error.set(err.error?.message || 'No se pudo guardar la tasa personalizada');
        return of(null as any);
      })
    );
  }

  /** Desactiva la tasa personalizada y vuelve a la tasa oficial del BCV */
  disableCustomRate(): Observable<{ success: boolean; message: string }> {
    this.myRateLoading.set(true);
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/custom/disable`, {}).pipe(
      tap(response => {
        this.myRateLoading.set(false);
        this.customPreferences.set({
          useCustomRate: false,
          customExchangeRate: null,
          canEdit: true,
        });
        this.myRate.set(null);
      }),
      catchError(err => {
        this.myRateLoading.set(false);
        this.error.set(err.error?.message || 'No se pudo desactivar la tasa personalizada');
        return of(null as any);
      })
    );
  }

  // ==========================================
  // Helpers y getters reactivos
  // ==========================================

  public currentRate$ = computed(() => this.currentRate());
  public isLoading$ = computed(() => this.isLoading());
  public error$ = computed(() => this.error());

  // Getters para la tasa del usuario
  public myRate$ = computed(() => this.myRate());
  public customPreferences$ = computed(() => this.customPreferences());
  public myRateLoading$ = computed(() => this.myRateLoading());

  /** Devuelve true si el usuario está usando una tasa personalizada */
  public isUsingCustomRate = computed(() => this.customPreferences()?.useCustomRate ?? false);

  /** Devuelve la tasa numérica aplicable (útil para cálculos rápidos en templates) */
  public applicableRate = computed(() => this.myRate()?.rate ?? null);
}