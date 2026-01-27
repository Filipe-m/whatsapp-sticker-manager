import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

const API_BASE = 'http://localhost:8080';

export type SharedPack = {
  id: string;
  packId: string;
  userId: string;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

export type Pack = {
  id: string;
  name: string;
  owner: string;
  public: boolean;
  createdAt: string;
  updatedAt: string;
  sharedPacks?: SharedPack[];
  ownerUser?: {
    id: string;
    name: string;
    email: string;
  };
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

  list(
    pageNumber = 1,
    pageSize = 10,
    filters: { owned?: boolean; public?: boolean; shared?: boolean } = {},
    search = ''
  ) {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));

    if (filters.owned !== undefined) {
      params = params.set('owned', String(filters.owned));
    }
    if (filters.public !== undefined) {
      params = params.set('public', String(filters.public));
    }
    if (filters.shared !== undefined) {
      params = params.set('shared', String(filters.shared));
    }
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

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

  share(packId: string, userId: string, canEdit: boolean, canDelete: boolean) {
    return this.http
      .post(`${this.base}/pack/${encodeURIComponent(packId)}/share`, {
        userId,
        canEdit,
        canDelete,
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

  unshare(packId: string, userId: string) {
    return this.http
      .delete(`${this.base}/pack/${encodeURIComponent(packId)}/share/${encodeURIComponent(userId)}`)
      .pipe(catchError((err) => throwError(() => err)));
  }
}
