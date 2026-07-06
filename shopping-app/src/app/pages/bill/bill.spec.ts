import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UserService } from '../../services/user';
import { Bill } from './bill';

describe('Bill', () => {
  let component: Bill;
  let fixture: ComponentFixture<Bill>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bill],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: { username: 'Vimal', password: '123' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Bill);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
