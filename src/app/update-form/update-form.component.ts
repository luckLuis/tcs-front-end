import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-update-form',
  templateUrl: './update-form.component.html',
  styleUrls: ['./update-form.component.css'],
})
export class UpdateFormComponent implements OnInit {
  productId: string = '';
  authorId: string = '1723855472';
  formData: any = {
    id: '',
    name: '',
    description: '',
    logo: '',
    date_release: '',
    date_revision: '',
  };
  submittingForm: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  toastClass: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.productId = params.get('id') || '';

      const productData = JSON.parse(params.get('data') || '');
      if (productData) {
        this.formData.id = productData.id;
        this.formData.name = productData.name;
        this.formData.description = productData.description;
        this.formData.logo = productData.logo;
        if (productData.date_release) {
          const releaseDateParts = productData.date_release.split('/');
          if (releaseDateParts.length === 3) {
            const day = parseInt(releaseDateParts[0], 10);
            const month = parseInt(releaseDateParts[1], 10) - 1;
            const year = parseInt(releaseDateParts[2], 10);
            const releaseDate = new Date(year, month, day);

            if (!isNaN(releaseDate.getTime())) {
              this.formData.date_release = releaseDate
                .toISOString()
                .split('T')[0];
              this.updateRestructuringDate();
            } else {
              console.error(
                'Fecha de liberación inválida:',
                productData.date_release
              );
            }
          } else {
            console.error(
              'Formato de fecha de liberación inválido:',
              productData.date_release
            );
          }
        }
      }
    });
  }

  updateProduct(): void {
    this.submittingForm = true;

    const { id, ...productData } = this.formData;

    this.productService.updateProduct(this.authorId, id, productData).subscribe(
      (response) => {
        this.submittingForm = false;
        this.showToastMessage('Datos actualizados correctamente', 'success');
        this.router.navigate(['/product-list']);
      },
      (error) => {
        this.submittingForm = false;
        this.showToastMessage('Error al actualizar los datos', 'error');
        console.error('Error updating product:', error);
      }
    );
  }

  resetForm(): void {
    this.formData = {
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: '',
      date_revision: '',
    };
  }

  showToastMessage(message: string, type: string): void {
    this.toastMessage = message;
    this.toastClass = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  onReleaseDateChange(event: any): void {
    const inputValue = event.target.value;
    if (inputValue) {
      this.formData.date_release = inputValue;
      this.updateRestructuringDate();
    }
  }

  private updateRestructuringDate(): void {
    if (this.formData.date_release) {
      const releaseDate = new Date(this.formData.date_release);
      if (!isNaN(releaseDate.getTime())) {
        const restructuringDate = new Date(releaseDate);
        restructuringDate.setFullYear(restructuringDate.getFullYear() + 1);
        this.formData.date_revision = restructuringDate
          .toISOString()
          .split('T')[0];
      } else {
        this.formData.date_revision = '';
      }
    } else {
      this.formData.date_revision = '';
    }
  }
}
