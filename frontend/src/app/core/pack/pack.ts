import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

const API_BASE = 'http://localhost:8080';

export type Pack = {
  id: string; // uuid
  name: string;
  owner: string;
  public: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type GetPacksResponse = {
  data: Pack[];
  meta: PaginationMeta;
};

export type CreatePackBody = {
  name: string;
  public: boolean;
};

@Injectable({ providedIn: 'root' })
export class PackService {
  private readonly base = API_BASE;

  constructor(private http: HttpClient) {}

  list(pageNumber = 1, pageSize = 10) {
    const params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));

    return this.http
      .get<GetPacksResponse>(`${this.base}/pack`, { params })
      .pipe(catchError((err) => throwError(() => err)));
  }

  create(body: CreatePackBody) {
    return this.http
      .post<Pack>(`${this.base}/pack`, body)
      .pipe(catchError((err) => throwError(() => err)));
  }

  delete(id: string) {
    return this.http
      .delete(`${this.base}/pack/${encodeURIComponent(id)}`)
      .pipe(catchError((err) => throwError(() => err)));
  }

  getById(id: string) {
    return this.http
      .get<Pack>(`${this.base}/pack/${encodeURIComponent(id)}`)
      .pipe(catchError((err) => throwError(() => err)));
  }
}
