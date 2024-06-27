import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  totalProducts: number = 0;
  authorId: string = '1723855472';
  searchTerm: string = '';
  deletingProductId: string | null = null;
  deleteSuccessMessage: string = '';
  showToast: boolean = false;
  toastMessage: string = '';
  toastClass: string = '';
  rowsPerPage: number = 5;
  displayedProducts: any[] = [];

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts(this.authorId).subscribe(
      (data) => {
        this.products = data.map((product) => ({
          ...product,
          date_release: this.formatDate(product.date_release),
          date_revision: this.formatDate(product.date_revision),
        }));
        this.totalProducts = this.products.length;
        this.updateDisplayedProducts();
      },
      (error) => {
        console.error('Error fetching products', error);
      }
    );
  }

  addProduct(): void {
    this.router.navigate(['/add-product']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  dropdownOpen: string | null = null;

  toggleDropdown(productId: string) {
    if (this.dropdownOpen === productId) {
      this.dropdownOpen = null;
    } else {
      this.dropdownOpen = productId;
    }
  }

  updateProduct(product: any): void {
    this.router.navigate([
      '/update-product',
      { id: product.id, data: JSON.stringify(product) },
    ]);
  }

  deleteProduct(productId: string): void {
    this.deletingProductId = productId;

    this.productService.deleteProduct(this.authorId, productId).subscribe(
      (response) => {
        console.log(`Producto con ID ${productId} eliminado correctamente.`);
        this.showToastMessage(
          `Producto con ID ${productId} eliminado correctamente.`,
          'success'
        );
        this.loadProducts();
      },
      (error) => {
        this.showToastMessage(`${error.message}`, 'success');
        this.loadProducts();
        this.deletingProductId = null;
      }
    );
  }

  showToastMessage(message: string, type: string): void {
    this.toastMessage = message;
    this.toastClass = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  changeRowsPerPage(event: any): void {
    this.rowsPerPage = +event.target.value;
    this.updateDisplayedProducts();
  }

  updateDisplayedProducts(): void {
    this.displayedProducts = this.products.slice(0, this.rowsPerPage);
  }
}
