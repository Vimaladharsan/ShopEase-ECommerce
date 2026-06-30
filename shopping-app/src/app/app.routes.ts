import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Signup } from './pages/signup/signup';
import { Content } from './pages/content/content';
import { Checkout } from './pages/checkout/checkout';
import { Bill } from './pages/bill/bill';
import { Profile } from './pages/profile/profile';
import { History } from './pages/history/history';

export const routes: Routes = [
    {
        path:'',
        redirectTo:'signup',
        pathMatch:'full'
    },
    {
        path:'signup',
        component:Signup
    },
    {
        path:'home',
        component:Home
    },
    {
        path:'content',
        component:Content
    },
    {
        path:'checkout',
        component:Checkout
    },
    {
        path:'bill',
        component:Bill
    },
    {
        path:'profile',
        component:Profile
    },
    {
        path:'history',
        component:History
    }
];
