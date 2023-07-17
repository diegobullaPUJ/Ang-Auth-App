import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, pipe, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environments';
import { User } from '../interfaces/user.interface';
import { AuthStatus } from '../interfaces/auth-status.enum';
import { LoginResponse } from '../interfaces/login-response.interface';
import { CheckTokenResponse } from '../interfaces/check-token.response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl: string = environment.baseUrl

  private http = inject( HttpClient );

  private _currentUser = signal<User|null>(null);
  private _authStatus = signal<AuthStatus>( AuthStatus.checking );

  public currentUser = computed( () => this._currentUser() );
  public authStatus = computed( () => this._authStatus() );

  constructor() {
    this.checkStatus().subscribe();
  }

  private setAuthentication (user: User, token: string): boolean {
    this._currentUser.set( user );
    this._authStatus.set( AuthStatus.authenticated );
    localStorage.setItem('token', token);
    return true;
  }

  register( name: string, email:string, password: string ):Observable<LoginResponse>{

    const url = `${ this.baseUrl }/auth/register`;
    const body = { name: name, email: email, password:password };

    return this.http.post<LoginResponse>( url, body )
      .pipe(
        catchError( err => throwError( () => err.error.message )),
      )
  }


  login( email: string, password: string ):Observable<boolean> {

    const url = `${ this.baseUrl }/auth/login`;
    const body = { email: email, password: password };

    return this.http.post<LoginResponse>( url, body )
      .pipe(
        map( ({ user, token }) => this.setAuthentication( user,token )),

        catchError( err => throwError( () => err.error.message )),
      );
  }

  checkStatus ():Observable<boolean> {

    const url   = `${ this.baseUrl }/auth/check-token`;
    const token = localStorage.getItem('token');

    if( !token ) {
      this.logout();
      return of(false);
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

      return this.http.get<CheckTokenResponse>( url, { headers } )
        .pipe(
          map( ({ user, token }) => this.setAuthentication( user,token )),
          //Error
          catchError( () => {
            this._authStatus.set( AuthStatus.notAuthenticated );
            return of(false);
          })
        )
  }

  logout() {
    localStorage.removeItem('token');
    this._currentUser.set( null );
    this._authStatus.set(AuthStatus.notAuthenticated);
  }





}
