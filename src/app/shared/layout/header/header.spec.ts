import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { of } from 'rxjs';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            user$: of({ name: 'Camila Ruiz', email: 'camila@cipolflo.com' }),
            logout: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('enlaza el ícono de ayuda a /ayuda', () => {
    const help = (fixture.nativeElement as HTMLElement).querySelector('.header__help');

    expect(help?.getAttribute('href')).toBe('/ayuda');
    expect(help?.querySelector('.pi-question-circle')).toBeTruthy();
  });
});
