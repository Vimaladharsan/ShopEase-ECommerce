import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'signup',
        pathMatch: 'full'
    },
    {
        path: 'signup',
        loadComponent: () => import('./pages/signup/signup').then(m => m.Signup)
    },
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then(m => m.Home),
        canActivate: [authGuard]
    },
    {
        path: 'content',
        loadComponent: () => import('./pages/content/content').then(m => m.Content),
        canActivate: [authGuard]
    },
    {
        path: 'product-details',
        loadComponent: () => import('./pages/product-details/product-details').then(m => m.ProductDetails),
        canActivate: [authGuard]
    },
    {
        path: 'checkout',
        loadComponent: () => import('./pages/checkout/checkout').then(m => m.Checkout),
        canActivate: [authGuard]
    },
    {
        path: 'bill',
        loadComponent: () => import('./pages/bill/bill').then(m => m.Bill),
        canActivate: [authGuard]
    },
    {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
        canActivate: [authGuard]
    },
    {
        path: 'history',
        loadComponent: () => import('./pages/history/history').then(m => m.History),
        canActivate: [authGuard]
    }
];
