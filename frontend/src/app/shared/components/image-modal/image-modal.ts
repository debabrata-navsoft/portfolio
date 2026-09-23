import {
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.5; // buttons and keys; the wheel moves half a step

type Point = { x: number; y: number };

@Component({
  selector: 'app-image-modal',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './image-modal.html',
  styleUrl: './image-modal.css',
})
export class ImageModal {
  isOpen = model<boolean>(false);
  src = input<string | null | undefined>('');
  alt = input<string>('Fullscreen Image Preview');
  closed = output<void>();

  readonly step = ZOOM_STEP;
  readonly maxZoom = MAX_ZOOM;

  // Untransformed box around the image — its centre is the image's resting centre.
  private frame = viewChild<ElementRef<HTMLElement>>('frame');

  zoom = signal(MIN_ZOOM);
  offset = signal<Point>({ x: 0, y: 0 });
  // Pointer position minus the offset at drag start; null when not dragging.
  private dragAnchor = signal<Point | null>(null);

  isZoomed = computed(() => this.zoom() > MIN_ZOOM);
  isDragging = computed(() => this.dragAnchor() !== null);
  transform = computed(() => {
    const { x, y } = this.offset();
    return `translate(${x}px, ${y}px) scale(${this.zoom()})`;
  });

  constructor() {
    // Every opening (and every new image) starts at fit-to-screen.
    effect(() => {
      this.isOpen();
      this.src();
      this.reset();
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown({ key }: KeyboardEvent): void {
    if (!this.isOpen()) return;

    if (key === 'Escape') this.close();
    else if (key === '+' || key === '=') this.zoomBy(ZOOM_STEP);
    else if (key === '-') this.zoomBy(-ZOOM_STEP);
    else if (key === '0') this.reset();
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  reset(): void {
    this.zoom.set(MIN_ZOOM);
    this.offset.set({ x: 0, y: 0 });
  }

  /**
   * Zooms by `step`, keeping the image point under `at` (the cursor) fixed on screen.
   * Without `at` it zooms around the resting centre, i.e. the current view scales in place.
   */
  zoomBy(step: number, at?: Point): void {
    const current = this.zoom();
    const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current + step));

    if (zoom === current) return;
    if (zoom === MIN_ZOOM) return this.reset(); // nothing to pan at fit size

    const rect = at && this.frame()?.nativeElement.getBoundingClientRect();
    const px = rect ? at.x - rect.left - rect.width / 2 : 0;
    const py = rect ? at.y - rect.top - rect.height / 2 : 0;
    const ratio = zoom / current;

    this.zoom.set(zoom);
    this.offset.update(({ x, y }) => ({ x: px - (px - x) * ratio, y: py - (py - y) * ratio }));
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    this.zoomBy((event.deltaY < 0 ? 1 : -1) * (ZOOM_STEP / 2), pointOf(event));
  }

  /** Double-click jumps between fit and 2x, centred on the clicked spot. */
  toggleZoom(event: MouseEvent): void {
    if (this.isZoomed()) this.reset();
    else this.zoomBy(2 - MIN_ZOOM, pointOf(event));
  }

  startDrag(event: PointerEvent): void {
    if (!this.isZoomed()) return;

    event.preventDefault();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);

    const { x, y } = this.offset();
    this.dragAnchor.set({ x: event.clientX - x, y: event.clientY - y });
  }

  drag(event: PointerEvent): void {
    const anchor = this.dragAnchor();
    if (anchor) this.offset.set({ x: event.clientX - anchor.x, y: event.clientY - anchor.y });
  }

  endDrag(): void {
    this.dragAnchor.set(null);
  }
}

const pointOf = (event: MouseEvent): Point => ({ x: event.clientX, y: event.clientY });
