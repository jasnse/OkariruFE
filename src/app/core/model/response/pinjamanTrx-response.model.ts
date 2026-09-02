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
    tenor: number | null,
    statusPengajuan: string
    noteMarketing: string | null
    noteBm: string | null
    noteBackOffice: string | null
    lastUpdate: string
    lastUpdateBy: string
}
