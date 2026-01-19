import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export type SessionResponse = {
  user: any; // ajuste se você tiver tipos
  session: any; // ajuste se você tiver tipos
};

export type SignUpEmailBody = {
  name: string;
  email: string;
  password: string;
  image?: string;
  callbackURL?: string;
  rememberMe?: boolean;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = environment.apiBaseUrl.replace(/\/$/, '');
  private readonly session$ = new BehaviorSubject<SessionResponse | null>(null);

  readonly currentSession$ = this.session$.asObservable();
  get current() {
    return this.session$.value;
  }

  constructor(private http: HttpClient) {}

  getSession() {
    return this.http.get<SessionResponse>(`${this.base}/auth/get-session`).pipe(
      tap((s) => this.session$.next(s)),
      map(() => true),
      catchError((err) => {
        // se não tiver sessão, o middleware faz status(401)
        this.session$.next(null);
        return of(false);
      }),
    );
  }

  signInEmail(emailOrUser: string, password: string) {
    // Ajuste o body conforme seu backend espera (email/username/etc)
    const body = { email: emailOrUser, password };

    return this.http.post(`${this.base}/auth/sign-in/email`, body).pipe(
      // após login, buscamos a sessão (cookie já veio no Set-Cookie)
      tap(() => {}),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  signUpEmail(emailOrUser: string, password: string) {
    const body = { email: emailOrUser, password };

    return this.http.post(`${this.base}/auth/sign-up/email`, body).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  signUpEmailFull(body: SignUpEmailBody) {
    return this.http.post(`${this.base}/auth/sign-up/email`, body).pipe(
      map(() => true),
      catchError((err) => throwError(() => err)),
    );
  }

  signOut() {
    return this.http.post(`${this.base}/auth/sign-out`, {}).pipe(
      tap(() => this.session$.next(null)),
      map(() => true),
      catchError(() => of(false)),
    );
  }
}
