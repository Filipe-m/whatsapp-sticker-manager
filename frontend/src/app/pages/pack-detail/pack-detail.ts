import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { PackService, Pack } from '../../core/pack/pack';
import { StickerService, Sticker } from '../../core/sticker/sticker';

@Component({
  selector: 'app-pack-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
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

  addForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private packService: PackService,
    public stickerService: StickerService,
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

        this.stickerService.list(this.packId).subscribe({
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
}
