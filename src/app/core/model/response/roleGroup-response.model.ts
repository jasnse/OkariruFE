//field sama kaya di postman
export interface RoleGroupResponse {
    roleGroupId: number;    
    roleId: number;
    namaGroupRole: string;
    createdAt: string;
    updatedAt: string;
}

export interface RoleGroupMemberResponse {
    employeeId: number;
    userName: string;
    email: string;
    nip: string;
}

export interface rGRoleResponse {
    role_id: number;
    nama_role: string;
    created_at: string;
    updated_at: string;
}

export interface employeNonRg{
    Id: number;
    userName: string;
    nip: string;
    email: string;
    joinedDate: string;
    updatedDate: string;
}

export interface menuAssignedResponse{
    menuGroupId: number;
    menuId: number;
    namaMenu: string;
    roleGroupId: number;
    namaGroupMenu: string;
    createdAt: string;
    updatedAt: string;
}