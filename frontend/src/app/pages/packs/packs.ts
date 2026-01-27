import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  FormsModule,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { PackService, Pack, PaginationMeta } from '../../core/pack/pack';
import { AuthService } from '../../core/auth/auth';

@Component({
  selector: 'app-packs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, DatePipe, FormsModule],
  templateUrl: './packs.html',
  styleUrls: ['./packs.css'],
})
export class PacksComponent {
  loading = false;
  errorMsg = '';

  packs: Pack[] = [];
  meta: PaginationMeta = { page: 1, pageSize: 10, total: 0, totalPages: 0 };
  activeFilter: 'all' | 'owned' | 'public' | 'shared' = 'all';
  searchQuery = '';
  searchTimeout: any = null;

  createForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private packService: PackService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      public: [false],
    });
  }

  ngOnInit() {
    this.load();
  }

  load(page = this.meta.page, pageSize = this.meta.pageSize) {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    const filters = this.getFiltersForActive();
    this.packService.list(page, pageSize, filters, this.searchQuery).subscribe({
      next: (res) => {
        this.packs = res?.data ?? [];
        this.meta = res?.meta ?? { page: 1, pageSize, total: 0, totalPages: 0 };
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Não foi possível carregar os packs.';
        this.cdr.detectChanges();
      },
    });
  }

  criarPack() {
    this.errorMsg = '';

    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    const name = String(this.createForm.value.name ?? '').trim();
    const isPublic = Boolean(this.createForm.value.public);

    this.loading = true;
    this.cdr.detectChanges();

    this.packService.create({ name, public: isPublic }).subscribe({
      next: () => {
        this.createForm.reset({ name: '', public: false });
        this.loading = false;
        this.cdr.detectChanges();
        // volta pra primeira página (opcional) ou recarrega a atual
        this.load(1, this.meta.pageSize);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Não foi possível criar o pack.';
        this.cdr.detectChanges();
      },
    });
  }

  deletarPack(p: Pack) {
    this.errorMsg = '';
    this.loading = true;
    this.cdr.detectChanges();

    this.packService.delete(p.id).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.detectChanges();
        // recarrega página atual; se ficou vazia, volta uma página
        const willBeEmpty = this.packs.length === 1 && this.meta.page > 1;
        const targetPage = willBeEmpty ? this.meta.page - 1 : this.meta.page;
        this.load(targetPage, this.meta.pageSize);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Não foi possível deletar o pack.';
        this.cdr.detectChanges();
      },
    });
  }

  anterior() {
    if (this.meta.page <= 1 || this.loading) return;
    this.load(this.meta.page - 1, this.meta.pageSize);
  }

  proxima() {
    if (this.meta.totalPages && this.meta.page >= this.meta.totalPages) return;
    if (this.loading) return;
    this.load(this.meta.page + 1, this.meta.pageSize);
  }

  setPageSize(size: number) {
    this.load(1, size);
  }

  setFilter(filter: 'all' | 'owned' | 'public' | 'shared') {
    this.activeFilter = filter;
    this.load(1, this.meta.pageSize);
  }

  getFiltersForActive(): { owned?: boolean; public?: boolean; shared?: boolean } {
    switch (this.activeFilter) {
      case 'owned':
        return { owned: true };
      case 'public':
        return { public: true };
      case 'shared':
        return { shared: true };
      case 'all':
      default:
        return {};
    }
  }

  onSearchChange(query: string) {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.load(1, this.meta.pageSize);
    }, 500);
  }

  sair() {
    this.auth.signOut().subscribe(() => {
      this.router.navigateByUrl('/');
      this.cdr.detectChanges();
    });
  }

  abrirPack(id: string) {
    this.router.navigateByUrl(`/packs/${id}`);
    this.cdr.detectChanges();
  }
}
