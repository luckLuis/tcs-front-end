import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl =
    'https://tribu-ti-staffing-desarrollo-afangwbmcrhucqfh.z01.azurefd.net/ipf-msa-productosfinancieros/bp/products';

  private apiUrlVerification =
    'https://tribu-ti-staffing-desarrollo-afangwbmcrhucqfh.z01.azurefd.net/ipf-msa-productosfinancieros/bp/products';

  constructor(private http: HttpClient) {}

  getProducts(authorId: string): Observable<any[]> {
    const headers = new HttpHeaders().set('authorId', authorId);
    return this.http
      .get<any[]>(this.apiUrl, { headers })
      .pipe(catchError(this.handleError));
  }

  verificationProduct(id: string): Observable<any> {
    const url = `${this.apiUrlVerification}/verification?id=${id}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  addProduct(
    authorId: string,
    productData: any
  ): Observable<HttpResponse<any>> {
    const headers = new HttpHeaders().set('authorId', authorId);
    return this.http
      .post<any>(this.apiUrl, productData, { headers, observe: 'response' })
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response;
          } else if (response.status === 400) {
            throw new HttpErrorResponse({
              error: 'Bad Request',
              status: response.status,
              statusText: response.statusText,
              //message: 'Detalles de la solicitud son incorrectos.',
            });
          } else if (response.status === 206) {
            throw new HttpErrorResponse({
              error: 'Partial Content',
              status: response.status,
              statusText: response.statusText,
              //message: 'El nombre y la descripción no deben ser nulos.',
            });
          } else {
            throw new HttpErrorResponse({
              error: 'Unexpected response status',
              status: response.status,
              statusText: response.statusText,
            });
          }
        }),
        catchError(this.handleError)
      );
  }

  updateProduct(
    authorId: string,
    productId: number,
    productData: any
  ): Observable<any> {
    const headers = new HttpHeaders().set('authorId', authorId);
    const url = `${this.apiUrl}`;
    return this.http
      .put<any>(url, productData, { headers })
      .pipe(catchError(this.handleError));
  }

  deleteProduct(
    authorId: string,
    productId: string
  ): Observable<HttpResponse<any>> {
    const headers = new HttpHeaders().set('authorId', authorId);
    const url = `${this.apiUrl}?id=${productId}`;

    return this.http.delete<any>(url, { headers, observe: 'response' }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 200) {
          return throwError(() => new Error('Producto eliminado exitosamente'));
        }

        return throwError(() => error);
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
