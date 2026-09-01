import { Routes } from '@angular/router';
import { roleGuard } from './auth/auth.guards';
import { Title } from '@angular/platform-browser';
import { menuAccessGuard } from './auth/menu-access.guards';




export const routes: Routes = [

    { path: '', redirectTo: 'login', pathMatch: 'full' },

// roleguard: cek role sesuai
// menuaccess: cek menu di assign sesuai role

    {
        path: 'login',
        loadComponent: () => import('./component/login/login').then(m => m.Login)
    },
    {

        path: 'master',
        canActivate: [roleGuard(['SUPERADMIN', 'BACKOFFICE', 'MARKETING', 'BRANCH_MANAGER'])],
        loadComponent: () => import('./layout/layout-superAdmin/group-layout-admin/group-layout-admin')
            .then(m => m.GroupLayoutAdmin),
        children: [
            {
                path: 'dashboard', loadComponent: () => import('./component/dashboard/dashboard').then(m => m.Dashboard),
                data: {title: "Dashboard - Admin"} },
            {
                path: 'master-user', canActivate: [menuAccessGuard], loadComponent: () => import('./component/component-admin/master-user/master-user').then(m => m.MasterUser),
                data: {title: "Master User"}},
            {
                path: 'master-menu', canActivate: [menuAccessGuard], loadComponent: () => import('./component/component-admin/master-menu/master-menu').then(m => m.MasterMenu),
                data: {title: "Master Menu"}},
            // {
            //     path: 'master-role', canActivate: [menuAccessGuard], loadComponent: () => import('./component/component-admin/master-role/master-role').then(m => m.MasterRole),
            //     data: {title: "Master Role"}},
            {
                path: 'role-group', canActivate: [menuAccessGuard], loadComponent: () => import('./component/component-admin/role-group/role-group').then(m => m.RoleGroup),
                data: {title: "Access Permission"}},
            {
                path: 'role-group/:id', canActivate: [menuAccessGuard], loadComponent: () => import('./component/component-admin/role-group-detail/role-group-detail').then(m => m.RoleGroupDetail),
                data: {title: "Access Permission"}},
            {
                path: 'master-pinjaman', canActivate: [menuAccessGuard], loadComponent: () => import('./component/component-admin/master-pinjaman/master-pinjaman').then(m => m.MasterPinjaman),
                data: {title: "Master Pinjaman"}},
            {
                path: 'review-pengajuan', canActivate: [menuAccessGuard], loadComponent: () => import('./component/component-loan/review-pengajuan/review-pengajuan').then(m => m.ReviewPengajuan),
                data: {title: "Review Pengajuan"}},
            {
                path: 'approval-pengajuan', canActivate: [menuAccessGuard], loadComponent: () => import('./component/component-loan/approval-pengajuan/approval-pengajuan').then(m => m.ApprovalPengajuan),
                data: {title: "Approval Pengajuan"}},
            {
                path: 'disburse-pengajuan', canActivate: [menuAccessGuard], loadComponent: () => import('./component/component-loan/disburse-pengajuan/disburse-pengajuan').then(m => m.DisbursePengajuan),
                data: {title: "Pencairan Pengajuan"}
            }
        ]
    }
];


