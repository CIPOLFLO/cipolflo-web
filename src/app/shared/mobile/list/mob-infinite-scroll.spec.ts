import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MobInfiniteScroll } from './mob-infinite-scroll';

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  observed: Element[] = [];
  disconnected = false;

  constructor(private readonly cb: IntersectionObserverCallback) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(el: Element): void {
    this.observed.push(el);
  }

  disconnect(): void {
    this.disconnected = true;
  }

  emit(isIntersecting: boolean): void {
    this.cb(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

@Component({
  selector: 'app-scroll-host',
  imports: [MobInfiniteScroll],
  template: `<div appMobInfiniteScroll (scrolled)="onScrolled()"></div>`,
})
class ScrollHost {
  scrolledCount = 0;
  onScrolled(): void {
    this.scrolledCount++;
  }
}

describe('MobInfiniteScroll', () => {
  const originalIO = globalThis.IntersectionObserver;
  let fixture: ComponentFixture<ScrollHost>;

  beforeEach(async () => {
    FakeIntersectionObserver.instances = [];
    globalThis.IntersectionObserver =
      FakeIntersectionObserver as unknown as typeof IntersectionObserver;

    await TestBed.configureTestingModule({ imports: [ScrollHost] }).compileComponents();
    fixture = TestBed.createComponent(ScrollHost);
    fixture.detectChanges();
  });

  afterEach(() => {
    globalThis.IntersectionObserver = originalIO;
  });

  it('observa el elemento anfitrión', () => {
    const [observer] = FakeIntersectionObserver.instances;
    const host = fixture.debugElement.query(By.directive(MobInfiniteScroll)).nativeElement;
    expect(observer.observed).toContain(host);
  });

  it('emite scrolled cuando el elemento entra en viewport', () => {
    FakeIntersectionObserver.instances[0].emit(true);
    expect(fixture.componentInstance.scrolledCount).toBe(1);
  });

  it('no emite cuando el elemento no está intersecando', () => {
    FakeIntersectionObserver.instances[0].emit(false);
    expect(fixture.componentInstance.scrolledCount).toBe(0);
  });

  it('desconecta el observer al destruir', () => {
    const observer = FakeIntersectionObserver.instances[0];
    fixture.destroy();
    expect(observer.disconnected).toBe(true);
  });

  it('no falla en entornos sin IntersectionObserver', () => {
    globalThis.IntersectionObserver = undefined as unknown as typeof IntersectionObserver;
    const extra = TestBed.createComponent(ScrollHost);
    expect(() => extra.detectChanges()).not.toThrow();
  });
});
