import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../../../../core/services/user.service';
import { MobPageHeader } from './mob-page-header';

const mockAuthService = {
  user$: of({ name: 'Juan Perez', email: 'juan@example.com' }),
};

describe('MobPageHeader', () => {
  let fixture: ComponentFixture<MobPageHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobPageHeader],
      providers: [UserService, { provide: AuthService, useValue: mockAuthService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MobPageHeader);
    fixture.componentRef.setInput('title', 'Reservas');
    fixture.detectChanges();
  });

  it('should render the title', () => {
    const el = fixture.nativeElement.querySelector('.mob-header__title');
    expect(el.textContent.trim()).toBe('Reservas');
  });

  it('should render the subtitle when provided', () => {
    fixture.componentRef.setInput('subtitle', 'Paso 1 de 3');
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.mob-header__subtitle');
    expect(el).toBeTruthy();
    expect(el.textContent.trim()).toBe('Paso 1 de 3');
  });

  it('should not render the subtitle when not provided', () => {
    const el = fixture.nativeElement.querySelector('.mob-header__subtitle');
    expect(el).toBeNull();
  });

  it('should render the userInitials from UserService in the avatar', () => {
    const el = fixture.nativeElement.querySelector('.mob-header__avatar');
    expect(el.textContent.trim()).toBe('JP');
  });

  it('should emit menuToggled when the menu button is clicked', () => {
    let emitted = false;
    fixture.componentInstance.menuToggled.subscribe(() => (emitted = true));

    const btn = fixture.nativeElement.querySelector('.mob-header__menu-btn');
    btn.click();

    expect(emitted).toBe(true);
  });
});
