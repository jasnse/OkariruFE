import { Routes } from '@angular/router';
import { roleGuard } from './auth/auth.guards';
import { Title } from '@angular/platform-browser';




export const routes: Routes = [

    { path: '', redirectTo: 'login', pathMatch: 'full' },


    {
        path: 'login',
        loadComponent: () => import('./component/login/login').then(m => m.Login)
    },
    {

        path: 'master',
        canActivate: [roleGuard(['SUPERADMIN'])],
        loadComponent: () => import('./layout/layout-superAdmin/group-layout-admin/group-layout-admin')
            .then(m => m.GroupLayoutAdmin),
        children: [
            {
                path: 'dashboard', loadComponent: () => import('./component/dashboard/dashboard').then(m => m.Dashboard),
                data: {title: "Dashboard - Admin"} },
            {
                path: 'master-user', loadComponent: () => import('./component/component-admin/master-user/master-user').then(m => m.MasterUser),
                data: {title: "Master user"}},
            {
                path: 'master-menu', loadComponent: () => import('./component/component-admin/master-menu/master-menu').then(m => m.MasterMenu),
                data: {title: "Master Menu"}
            }   
        ]
    }
];
