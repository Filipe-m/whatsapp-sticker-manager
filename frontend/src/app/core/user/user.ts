import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

const API_BASE = 'http://localhost:8080';

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type GetUsersResponse = {
  data: User[];
  meta: PaginationMeta;
};

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly base = API_BASE;

  constructor(private http: HttpClient) {}

  list(pageNumber = 1, pageSize = 25, search = '') {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http
      .get<GetUsersResponse>(`${this.base}/user`, { params })
      .pipe(catchError((err) => throwError(() => err)));
  }
}
