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
    jenisPinjaman: string | null

    // snapshot: data customer & pinjaman PADA SAAT pengajuan dibuat -- dipakai di modal detail
    // supaya tidak berubah walau profil customer / master data pinjaman diupdate belakangan
    customerNik: string | null
    customerTempatLahir: string | null
    customerTanggalLahir: string | null
    customerGender: string | null
    customerAlamat: string | null
    customerPekerjaan: string | null
    customerPendapatan: number | null
    customerMaritalStatus: string | null
    customerNoRekening: string | null
    deskripsiPinjaman: string | null
    bunga: number | null
    biayaLainnya: number | null
}
