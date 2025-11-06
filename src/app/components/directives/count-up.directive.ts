import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appCountUp]'
})
export class CountUpDirective implements OnInit, OnDestroy {
  @Input() start = 0;
  @Input({ required: true }) end!: number;
  @Input() duration = 1500; // ms
  @Input() suffix = '';

  private observer?: IntersectionObserver;
  private started = false;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    if (typeof this.end !== 'number' || isNaN(this.end)) {
      return;
    }
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !this.started) {
          this.started = true;
          this.startAnimation();
          this.observer?.disconnect();
        }
      }
    }, { threshold: 0.3 });
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private startAnimation(): void {
    const startTs = performance.now();
    const from = Number(this.start) || 0;
    const to = Number(this.end);
    const dur = Math.max(200, Number(this.duration) || 1500);

    const step = (now: number) => {
      const elapsed = now - startTs;
      const progress = Math.min(elapsed / dur, 1);
      const current = Math.floor(from + (to - from) * progress);
      this.el.nativeElement.textContent = `${current.toLocaleString('pt-BR')}${this.suffix}`;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }
}
