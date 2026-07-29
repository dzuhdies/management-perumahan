<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TagihanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,

            'riwayat_penghuni_id' => $this->riwayat_penghuni_id,

            'jenis_iuran_id' => $this->jenis_iuran_id,

            'rumah' => $this->riwayatPenghuni
                ->rumah
                ->kode_rumah,

            'penghuni' => $this->riwayatPenghuni
                ->penghuni
                ->nama_lengkap,

            'jenis_iuran' => $this->jenisIuran
                ->nama_iuran,

            'bulan' => $this->bulan,

            'tahun' => $this->tahun,

            'nominal' => (float) $this->nominal,

            'nominal_dibayar' => (float) $this->nominal_dibayar,

            'status' => $this->tanggal_bayar
                ? 'Lunas'
                : 'Belum Lunas',

            'tanggal_bayar' => $this->tanggal_bayar,
        ];
    }
}
