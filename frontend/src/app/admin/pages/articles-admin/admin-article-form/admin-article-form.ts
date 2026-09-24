import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, switchMap, finalize } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

import { ArticleService } from '../../../../core/services/article.service';
import { SnackBarService } from '../../../../core/services/snack-bar.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { Error } from '../../../../shared/components/error/error';
import { ArticleForm } from '../../../../models/article.model';
import { generateSlug } from '../../../../utils/slug.utils';

@Component({
  selector: 'app-admin-article-form',
  standalone: true,
  imports: [LucideAngularModule, Error],
  templateUrl: './admin-article-form.html',
})
export class AdminArticleForm implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private snackBarService = inject(SnackBarService);
  private loaderService = inject(LoaderService);
  private destroyRef = inject(DestroyRef);

  loading = signal(false);
  isErrorMsg = signal(false);
  imagePreview = signal<string | null>(null);
  tagsInput = signal('');
  editingId = signal<string | null>(null);

  touched = signal<{
    title: boolean;
    image: boolean;
    excerpt: boolean;
    tags: boolean;
    content: boolean;
  }>({
    title: false,
    image: false,
    excerpt: false,
    tags: false,
    content: false,
  });

  articles = signal<ArticleForm>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    imageFile: null,
    tags: [],
    published: true,
  });

  ngOnInit(): void {
    const articleSub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get('slug');
          if (!slug) return EMPTY;
          this.loaderService.showApi();

          return this.articleService
            .getArticleBySlug(slug)
            .pipe(finalize(() => this.loaderService.hideApi()));
        }),
      )
      .subscribe({
        next: (article) => {
          this.editingId.set(article._id);
          this.articles.set({
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            content: article.content,
            imageFile: null,
            tags: article.tags || [],
            published: article.published,
          });
          this.imagePreview.set(article.image);
        },
        error: (err) => {
          this.snackBarService.error(err.error?.message || 'Article not found');
          this.isErrorMsg.set(true);
        },
      });

    this.destroyRef.onDestroy(() => {
      articleSub.unsubscribe();
    });
  }

  markTouched(field: 'title' | 'image' | 'excerpt' | 'tags' | 'content') {
    this.touched.update((t) => ({
      ...t,
      [field]: true,
    }));
  }

  isFieldInvalid(field: 'title' | 'image' | 'excerpt' | 'tags' | 'content'): boolean {
    const isTouched = this.touched()[field];
    if (!isTouched) return false;

    const form = this.articles();
    if (field === 'title') return !form.title?.trim();
    if (field === 'image') return !this.editingId() && !form.imageFile && !this.imagePreview();
    if (field === 'excerpt') return !form.excerpt?.trim();
    if (field === 'tags') return !form.tags || form.tags.length === 0;
    if (field === 'content') return !form.content?.trim();
    return false;
  }

  updateField<K extends keyof ArticleForm>(field: K, value: ArticleForm[K]) {
    this.articles.update((form) => ({
      ...form,
      [field]: value,
    }));
  }

  updateTitle(title: string) {
    this.articles.update((form) => ({
      ...form,
      title,
      slug: generateSlug(title),
    }));
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) return;

    this.articles.update((article) => ({
      ...article,
      imageFile: file,
    }));

    this.imagePreview.set(URL.createObjectURL(file));
  }

  addTags() {
    const value = this.tagsInput().trim();
    if (!value) return;

    const exists = this.articles().tags.includes(value);
    if (exists) return;

    this.articles.update((article) => ({
      ...article,
      tags: [...article.tags, value],
    }));

    this.tagsInput.set('');
  }

  removeTag(index: number) {
    this.articles.update((article) => ({
      ...article,
      tags: article.tags.filter((_, i) => i !== index),
    }));
  }

  removeImage() {
    this.articles.update((article) => ({
      ...article,
      imageFile: null,
    }));

    this.imagePreview.set(null);
  }

  submitArticle() {
    this.touched.set({
      title: true,
      image: true,
      excerpt: true,
      tags: true,
      content: true,
    });

    const form = this.articles();
    const id = this.editingId();

    if (!form.title || !form.slug || !form.excerpt || !form.content || !form.tags.length) {
      this.snackBarService.error('All fields are required');
      return;
    }

    if (!id && !form.imageFile) {
      this.snackBarService.error('Project image is required');
      return;
    }

    const formData = new FormData();

    formData.append('title', form.title);
    formData.append('slug', form.slug);
    formData.append('excerpt', form.excerpt);
    formData.append('content', form.content);
    formData.append('tags', JSON.stringify(form.tags));
    formData.append('published', String(form.published));

    if (form.imageFile) {
      formData.append('image', form.imageFile);
    }

    this.loading.set(true);
    this.loaderService.showApi();

    const articleUpdate = id
      ? this.articleService.updateArticle(id, formData)
      : this.articleService.createArticle(formData);

    const articleSub = articleUpdate.pipe(finalize(() => this.loaderService.hideApi())).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.snackBarService.success(res.message);
        this.router.navigate(['/admin/articles']);
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBarService.error(err.error?.message || 'Something went wrong');
      },
    });

    this.destroyRef.onDestroy(() => {
      articleSub.unsubscribe();
    });
  }

  onCancel() {
    this.router.navigate(['/admin/articles']);
  }
}
