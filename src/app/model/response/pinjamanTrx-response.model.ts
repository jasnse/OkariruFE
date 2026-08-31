export interface pinjamanTrxGet {
    transPinjamanId: number
    kodeTransaksi: string
    customerId: number,
    customerName: string,
    pinjamanId: number,
    tanggalPengajuan: string
    tanggalReview: string | null,
    tanggalApproval: string | null,
    nominalPinjaman: number,
    statusPengajuan: string
    noteApproval: string
    rejectNote: string
    lastUpdate: string
    lastUpdateBy: string
}
