import { Component } from '@angular/core';
import { RegistrationFormData } from '../models/registration-form-data.model';
import { ProductService } from '../services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css'],
})
export class RegistrationFormComponent {
  authorId: string = '1723855472';
  submittingForm: boolean = false;
  toastMessage = '';
  showToast = false;
  toastClass = '';

  formData: RegistrationFormData = {
    id: '',
    name: '',
    description: '',
    logo: '',
    date_release: '',
    date_revision: '',
  };

  constructor(private productService: ProductService, private router: Router) {}

  resetForm(): void {
    this.formData = this.createEmptyFormData();
  }

  submitForm(): void {
    this.submittingForm = true;

    this.productService.verificationProduct(this.formData.id).subscribe(
      (exists) => {
        if (exists) {
          this.submittingForm = false;
          this.showToastMessage(
            'Ya existe un producto con ese ID',
            'warning',
            false
          );
        } else {
          this.productService
            .addProduct(this.authorId, this.formData)
            .subscribe(
              (response) => {
                this.submittingForm = false;

                const status = response.status;

                if (status === 200) {
                  this.showToastMessage(
                    'Producto agregado correctamente',
                    'success',
                    true
                  );
                }
              },
              (error) => {
                this.submittingForm = false;
                console.error('Error al agregar producto:', error);

                if (error.status === 400) {
                  this.showToastMessage(
                    `Error: ${error.message}`,
                    'error',
                    false
                  );
                } else if (error.status === 206) {
                  this.showToastMessage(
                    'El nombre y la descripción no deben ser nulos.',
                    'warning',
                    false
                  );
                } else {
                  this.showToastMessage(
                    'Ocurrió un error inesperado.',
                    'error',
                    false
                  );
                }
              }
            );
        }
      },
      (error) => {
        this.submittingForm = false;
        console.error('Error al verificar producto:', error);
        this.showToastMessage('Error al verificar producto.', 'error', false);
      }
    );
  }

  showToastMessage(
    message: string,
    type: string,
    navigateAfter: boolean
  ): void {
    this.toastMessage = message;
    this.toastClass = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
      if (navigateAfter) {
        this.router.navigate(['/']);
      }
    }, 3000);
  }

  onReleaseDateChange(event: any): void {
    const releaseDate = new Date(event.target.value);
    const restructuringDate = new Date(
      releaseDate.setFullYear(releaseDate.getFullYear() + 1)
    );
    this.formData.date_revision = restructuringDate.toISOString().split('T')[0];
  }

  get isReleaseDateValid(): boolean {
    if (!this.formData.date_release) return false;
    const today = new Date().toISOString().split('T')[0];
    return this.formData.date_release >= today;
  }

  get isRestructuringDateValid(): boolean {
    if (!this.formData.date_release || !this.formData.date_revision)
      return false;
    const nextYearDate = this.getNextYearDate(this.formData.date_release);
    return this.formData.date_revision === nextYearDate;
  }

  private getNextYearDate(date: string): string {
    const nextYear = new Date(date);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  }

  private createEmptyFormData(): RegistrationFormData {
    return {
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: '',
      date_revision: '',
    };
  }
}
