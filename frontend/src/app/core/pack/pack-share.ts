import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

const API_BASE = 'http://localhost:8080';

export type PackShare = {
  userId: string;
  email?: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

@Injectable({ providedIn: 'root' })
export class PackShareService {
  private readonly base = API_BASE;

  constructor(private http: HttpClient) {}

  list(packId: string) {
    return this.http
      .get<PackShare[]>(`${this.base}/pack/${encodeURIComponent(packId)}/shares`)
      .pipe(catchError((e) => throwError(() => e)));
  }

  create(
    packId: string,
    body: { email: string; canView: boolean; canEdit: boolean; canDelete: boolean },
  ) {
    return this.http
      .post(`${this.base}/pack/${encodeURIComponent(packId)}/shares`, body)
      .pipe(catchError((e) => throwError(() => e)));
  }

  update(
    packId: string,
    userId: string,
    body: { canView: boolean; canEdit: boolean; canDelete: boolean },
  ) {
    return this.http
      .patch(
        `${this.base}/pack/${encodeURIComponent(packId)}/shares/${encodeURIComponent(userId)}`,
        body,
      )
      .pipe(catchError((e) => throwError(() => e)));
  }

  remove(packId: string, userId: string) {
    return this.http
      .delete(
        `${this.base}/pack/${encodeURIComponent(packId)}/shares/${encodeURIComponent(userId)}`,
      )
      .pipe(catchError((e) => throwError(() => e)));
  }
}
