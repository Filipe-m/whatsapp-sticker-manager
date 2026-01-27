import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  FormsModule,
} from '@angular/forms';

import { PackService, Pack } from '../../core/pack/pack';
import { StickerService, Sticker } from '../../core/sticker/sticker';
import { UserService, User } from '../../core/user/user';
import { AuthService } from '../../core/auth/auth';

@Component({
  selector: 'app-pack-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pack-detail.html',
  styleUrls: ['./pack-detail.css'],
})
export class PackDetailComponent {
  loading = false;
  errorMsg = '';

  packId = '';
  pack?: Pack;

  stickers: Sticker[] = [];
  selectedFile: File | null = null;
  searchQuery = '';
  searchTimeout: any = null;

  showShareModal = false;
  shareUsers: User[] = [];
  shareSearchQuery = '';
  shareSearchTimeout: any = null;
  selectedUserIds: Set<string> = new Set();
  sharePermissions: { [key: string]: { canEdit: boolean; canDelete: boolean } } = {};
  sharedUsers: any[] = [];
  shareLoading = false;
  shareError = '';

  addForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private packService: PackService,
    public stickerService: StickerService,
    private userService: UserService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    this.addForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigateByUrl('/packs');
      return;
    }
    this.packId = id;
    this.load();
  }

  load() {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.packService.getById(this.packId).subscribe({
      next: (pack) => {
        this.pack = pack;
        this.cdr.detectChanges();

        this.stickerService.list(this.packId, this.searchQuery).subscribe({
          next: (res) => {
            const all = Array.isArray(res) ? res : [];

            // tenta filtrar por vários nomes comuns de campo
            this.stickers = all.filter(
              (s: any) =>
                s.packId === this.packId ||
                s.pack_id === this.packId ||
                s.pack?.id === this.packId ||
                s.pack === this.packId,
            );

            this.loading = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Não foi possível carregar o pack.';
        this.cdr.detectChanges();
      },
    });
  }

  voltar() {
    this.router.navigateByUrl('/packs');
    this.cdr.detectChanges();
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files && input.files.length > 0 ? input.files[0] : null;
    this.cdr.detectChanges();
  }

  adicionarSticker() {
    this.errorMsg = '';

    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    if (!this.selectedFile) {
      this.errorMsg = 'Selecione um arquivo (.png ou .webp).';
      this.cdr.detectChanges();
      return;
    }

    const name = String(this.addForm.value.name ?? '').trim();

    this.loading = true;
    this.cdr.detectChanges();

    this.stickerService.create(this.packId, name, this.selectedFile).subscribe({
      next: () => {
        this.addForm.reset({ name: '' });
        this.selectedFile = null;
        this.loading = false;
        this.cdr.detectChanges();
        this.load();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Não foi possível adicionar o sticker.';
        this.cdr.detectChanges();
      },
    });
  }

  deletarSticker(sticker: Sticker) {
    this.errorMsg = '';
    this.loading = true;
    this.cdr.detectChanges();

    this.stickerService.delete(sticker.id).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.load();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Não foi possível deletar o sticker.';
        this.cdr.detectChanges();
      },
    });
  }

  onSearchChange(query: string) {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.load();
    }, 500);
  }

  openShareModal() {
    this.showShareModal = true;
    this.shareError = '';
    this.loadSharedUsers();
    this.loadShareUsers();
  }

  closeShareModal() {
    this.showShareModal = false;
    this.shareSearchQuery = '';
    this.selectedUserIds.clear();
    this.sharePermissions = {};
    this.cdr.detectChanges();
  }

  loadShareUsers() {
    this.shareLoading = true;
    this.cdr.detectChanges();

    this.userService.list(1, 100, this.shareSearchQuery).subscribe({
      next: (res) => {
        this.shareUsers = res?.data ?? [];
        this.shareLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.shareLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadSharedUsers() {
    if (!this.pack?.sharedPacks) {
      this.sharedUsers = [];
      return;
    }
    this.sharedUsers = this.pack.sharedPacks || [];
    this.cdr.detectChanges();
  }

  onShareSearchChange(query: string) {
    if (this.shareSearchTimeout) {
      clearTimeout(this.shareSearchTimeout);
    }

    this.shareSearchTimeout = setTimeout(() => {
      this.loadShareUsers();
    }, 500);
  }

  toggleUserSelection(userId: string) {
    if (this.selectedUserIds.has(userId)) {
      this.selectedUserIds.delete(userId);
      delete this.sharePermissions[userId];
    } else {
      this.selectedUserIds.add(userId);
      this.sharePermissions[userId] = { canEdit: false, canDelete: false };
    }
    this.cdr.detectChanges();
  }

  togglePermission(userId: string, permission: 'canEdit' | 'canDelete') {
    if (this.sharePermissions[userId]) {
      this.sharePermissions[userId][permission] = !this.sharePermissions[userId][permission];
      this.cdr.detectChanges();
    }
  }

  shareWithSelected() {
    if (this.selectedUserIds.size === 0) {
      this.shareError = 'Selecione pelo menos um usuário.';
      this.cdr.detectChanges();
      return;
    }

    this.shareLoading = true;
    this.shareError = '';
    this.cdr.detectChanges();

    const shareRequests = Array.from(this.selectedUserIds).map((userId) => {
      const perms = this.sharePermissions[userId] || { canEdit: false, canDelete: false };
      return this.packService.share(this.packId, userId, perms.canEdit, perms.canDelete);
    });

    Promise.all(shareRequests.map((req) => req.toPromise()))
      .then(() => {
        this.shareLoading = false;
        this.selectedUserIds.clear();
        this.sharePermissions = {};
        this.load();
        this.cdr.detectChanges();
      })
      .catch((err) => {
        this.shareLoading = false;
        this.shareError = err?.error?.message || 'Erro ao compartilhar.';
        this.cdr.detectChanges();
      });
  }

  removeShare(userId: string) {
    this.shareLoading = true;
    this.shareError = '';
    this.cdr.detectChanges();

    this.packService.unshare(this.packId, userId).subscribe({
      next: () => {
        this.shareLoading = false;
        this.load();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.shareLoading = false;
        this.shareError = err?.error?.message || 'Erro ao remover compartilhamento.';
        this.cdr.detectChanges();
      },
    });
  }

  isOwner(): boolean {
    return this.pack?.owner === this.auth.current?.user?.id;
  }
}
