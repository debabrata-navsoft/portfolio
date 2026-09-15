import { DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { finalize, Observable } from 'rxjs';

import { CommentService } from '../../../core/services/comment.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { SocketService } from '../../../core/services/socket.service';
import { CommentResponse } from '../../../models/comment.model';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PUBLIC_STYLES = {
  card: 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/40',
  nested: 'border-gray-200 dark:border-gray-800',
  heading: 'text-gray-900 dark:text-white',
  body: 'text-gray-700 dark:text-gray-300',
  muted: 'text-gray-400 dark:text-gray-500',
  input:
    'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white',
  avatar: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
};

const ADMIN_STYLES = {
  card: 'border-slate-200/90 bg-white',
  nested: 'border-slate-200',
  heading: 'text-slate-900',
  body: 'text-slate-700',
  muted: 'text-slate-400',
  input: 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400',
  avatar: 'bg-blue-50 text-blue-700',
};

@Component({
  selector: 'app-article-comments',
  standalone: true,
  imports: [LucideAngularModule, TimeAgoPipe, NgTemplateOutlet, DatePipe],
  templateUrl: './article-comments.html',
})
export class ArticleComments implements OnInit {
  private commentService = inject(CommentService);
  private snackBarService = inject(SnackBarService);
  private socketService = inject(SocketService);
  private destroyRef = inject(DestroyRef);

  article = input.required<string>();
  isAdmin = input(false);
  bare = input(false);

  countChange = output<number>();

  comments = signal<CommentResponse[]>([]);
  total = signal(0);
  loading = signal(true);
  posting = signal(false);
  replyTo = signal<string | null>(null);
  editingId = signal<string | null>(null);

  form = signal({ name: '', email: '', message: '' });
  reply = signal('');
  replyName = signal('');
  editText = signal('');

  styles = computed(() => (this.isAdmin() ? ADMIN_STYLES : PUBLIC_STYLES));

  emailInvalid = computed(() => {
    const email = this.form().email.trim();
    return !!email && !EMAIL_PATTERN.test(email);
  });

  ngOnInit(): void {
    this.load();

    const liveSub = this.socketService
      .on<{ articleId: string }>('comments:changed')
      .subscribe((payload) => {
        if (payload?.articleId === this.article()) {
          this.load(true);
        }
      });

    this.destroyRef.onDestroy(() => liveSub.unsubscribe());
  }

  updateField(field: 'name' | 'email' | 'message', value: string) {
    this.form.update((form) => ({ ...form, [field]: value }));
  }

  toggleReply(id: string) {
    this.reply.set('');
    this.replyName.set(this.form().name);
    this.replyTo.update((current) => (current === id ? null : id));
  }

  post() {
    this.submit(null);
  }

  postReply(parent: string) {
    this.submit(parent);
  }

  startEdit(comment: CommentResponse) {
    this.replyTo.set(null);
    this.editText.set(comment.message);
    this.editingId.set(comment._id);
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editText.set('');
  }

  saveEdit(id: string) {
    const message = this.editText().trim();

    if (!message) {
      this.snackBarService.error('Comment cannot be empty');
      return;
    }

    this.posting.set(true);

    this.track(
      this.commentService.updateComment(id, message).pipe(finalize(() => this.posting.set(false))),
      (res) => {
        this.snackBarService.success(res.message);
        this.cancelEdit();
        this.load(true);
      },
      'Update failed',
    );
  }

  remove(id: string) {
    this.track(
      this.commentService.deleteComment(id),
      (res) => {
        this.snackBarService.success(res.message);
        this.load(true);
      },
      'Delete failed',
    );
  }

  private submit(parent: string | null) {
    const { email } = this.form();
    const message = (parent ? this.reply() : this.form().message).trim();
    const name = this.isAdmin()
      ? this.form().name.trim() || 'Author'
      : (parent ? this.replyName() : this.form().name).trim();

    if (!name) {
      this.snackBarService.error(
        parent ? 'Please add your name to reply' : 'Your name is required',
      );
      return;
    }

    if (!message) {
      this.snackBarService.error(parent ? 'Write a reply first' : 'Write a comment first');
      return;
    }

    if (this.emailInvalid()) {
      this.snackBarService.error('Enter a valid email address or leave it empty');
      return;
    }

    this.posting.set(true);

    this.track(
      this.commentService
        .createComment({
          article: this.article(),
          name,
          email: email.trim(),
          message,
          parent,
          isAuthor: this.isAdmin(),
        })
        .pipe(finalize(() => this.posting.set(false))),
      (res) => {
        this.snackBarService.success(res.message);
        this.resetBoxes(parent);
        this.load(true);
      },
      'Could not post your comment',
    );
  }

  private resetBoxes(parent: string | null) {
    if (parent) {
      this.reply.set('');
      this.replyName.set('');
      this.replyTo.set(null);
      return;
    }

    this.form.set({ name: '', email: '', message: '' });
  }

  private track<T>(source: Observable<T>, onNext: (value: T) => void, failure?: string) {
    const sub = source.subscribe({
      next: onNext,
      error: (err) => {
        if (failure) this.snackBarService.error(err.error?.message || failure);
      },
    });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  private load(silent = false) {
    if (!silent) this.loading.set(true);

    this.track(
      this.commentService.getComments(this.article()).pipe(finalize(() => this.loading.set(false))),
      (res) => {
        this.comments.set(res.items || []);
        this.total.set(res.total || 0);
        this.countChange.emit(this.total());
      },
    );
  }
}
