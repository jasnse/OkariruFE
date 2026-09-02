export interface pinjamanTransactionUpdate {
    customerId: number,
    pinjamanId: number | null,
    nominalPinjaman: number,
    tenor: number | null,
    statusPengajuan: string,
    tanggalReview: string | null,
    tanggalApproval: string | null,
    noteMarketing: string | null
    noteBm: string | null
    noteBackOffice: string | null
    lastUpdateBy: number | null
}
