export interface plafondAdd {
    userId: number,
    totalPlafond: number,
    deskripsiPlafond: string,
    createdBy: number | null
}

export interface plafondUpdate {
    userId: number,
    totalPlafond: number,
    deskripsiPlafond: string,
    updatedBy: number | null
}
