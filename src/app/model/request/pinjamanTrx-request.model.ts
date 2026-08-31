export interface pinjamanTransactionUpdate {
    customerId: number,
    pinjamanId: number | null,
    nominalPinjaman: number,
    statusPengajuan: string,
    tanggalReview: string | null,
    tanggalApproval: string | null,
    noteApproval: string | null,
    rejectNote: string | null,
    lastUpdateBy: number | null
}
