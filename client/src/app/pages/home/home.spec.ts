import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Home,
        RouterTestingModule // Für RouterModule dependency
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call window.open when joinServer is called', () => {
    spyOn(window, 'open');
    component.joinServer();
    expect(window.open).toHaveBeenCalledWith('https://discord.gg/your-server-invite', '_blank');
  });

  it('should scroll to features section when learnMore is called', () => {
    // Mock querySelector
    const mockElement = { scrollIntoView: jasmine.createSpy('scrollIntoView') };
    spyOn(document, 'querySelector').and.returnValue(mockElement as any);
    
    component.learnMore();
    
    expect(document.querySelector).toHaveBeenCalledWith('.features-section');
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
});
