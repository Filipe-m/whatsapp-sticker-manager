import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:8080';

export type Sticker = {
  id: string;
  name?: string;
  packId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
};

@Injectable({ providedIn: 'root' })
export class StickerService {
  private readonly base = API_BASE;

  constructor(private http: HttpClient) {}

  list(packId: string, search = '') {
    let params = new HttpParams().set('packId', packId);

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<any>(`${this.base}/sticker`, { params }).pipe(
      map((res) => {
        // Caso 1: backend retorna array direto
        if (Array.isArray(res)) return res as Sticker[];

        // Caso 2: backend retorna { data: [...] }
        if (res && Array.isArray(res.data)) return res.data as Sticker[];

        // Caso 3: backend retorna { items: [...] }
        if (res && Array.isArray(res.items)) return res.items as Sticker[];

        return [];
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  fileUrl(stickerId: string) {
    return `${this.base}/sticker/${encodeURIComponent(stickerId)}/file`;
  }

  create(packId: string, name: string, file: File) {
    const fd = new FormData();
    fd.append('packId', packId);
    fd.append('name', name);
    fd.append('file', file);

    return this.http
      .post(`${this.base}/sticker`, fd)
      .pipe(catchError((err) => throwError(() => err)));
  }

  delete(stickerId: string) {
    return this.http
      .delete(`${this.base}/sticker/${encodeURIComponent(stickerId)}`)
      .pipe(catchError((err) => throwError(() => err)));
  }
}
