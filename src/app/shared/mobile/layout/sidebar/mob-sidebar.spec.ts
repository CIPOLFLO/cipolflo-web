import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MobSidebar } from './mob-sidebar';
import { NavItem } from './sidebar.models';

const navItems: NavItem[] = [
  { label: 'Reservas', route: '/reservas', icon: 'pi pi-calendar' },
  { label: 'Clientes', route: '/clientes', icon: 'pi pi-users' },
  { label: 'Estadísticas', route: '/estadisticas', icon: 'pi pi-chart-bar' },
  { label: 'Finanzas', route: '/finanzas', icon: 'pi pi-wallet' },
  { label: 'Servicios', route: '/servicios', icon: 'pi pi-building' },
];

describe('MobSidebar', () => {
  let fixture: ComponentFixture<MobSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobSidebar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MobSidebar);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('orgName', 'Círculo Policial');
    fixture.componentRef.setInput('orgInitials', 'CP');
    fixture.componentRef.setInput('orgSubtitle', 'de Flores');
    fixture.componentRef.setInput('userEmail', 'juan.perez@email.com');
    fixture.componentRef.setInput('userInitials', 'JP');
    fixture.componentRef.setInput('navItems', navItems);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('con visible false no debería mostrar el drawer', () => {
    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();

    const drawer = document.body.querySelector('.mob-sidebar');
    expect(drawer).toBeNull();
  });

  it('con visible true debería mostrar el drawer y los datos principales', () => {
    const drawer = document.body.querySelector('.mob-sidebar');

    expect(drawer).toBeTruthy();
    expect(drawer?.textContent).toContain('Círculo Policial');
    expect(drawer?.textContent).toContain('juan.perez@email.com');
  });

  it('debería renderizar tantos ítems de navegación como elementos recibe', () => {
    const items = document.body.querySelectorAll('.mob-sidebar__nav-item');

    expect(items.length).toBe(navItems.length);
  });

  it('debería emitir closed al cerrar el drawer', () => {
    let emitted = false;
    fixture.componentInstance.closed.subscribe(() => (emitted = true));

    fixture.componentInstance.closed.emit();

    expect(emitted).toBe(true);
  });

  it('debería emitir logoutClicked al hacer click en Cerrar Sesión', () => {
    let emitted = false;
    fixture.componentInstance.logoutClicked.subscribe(() => (emitted = true));

    const button = document.body.querySelector('.mob-sidebar__logout') as HTMLButtonElement;
    button.click();

    expect(emitted).toBe(true);
  });
});
