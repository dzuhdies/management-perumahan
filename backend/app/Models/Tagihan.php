<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tagihan extends Model
{
    protected $table = 'tagihan';

    protected $fillable = [
        'riwayat_penghuni_id',
        'jenis_iuran_id',
        'bulan',
        'tahun',
        'nominal',
        'nominal_dibayar',
        'tanggal_bayar',
        'keterangan',
    ];

    protected $casts = [
        'tanggal_bayar' => 'datetime',
    ];

    public function riwayatPenghuni(): BelongsTo
    {
        return $this->belongsTo(RiwayatPenghuni::class);
    }

    public function jenisIuran(): BelongsTo
    {
        return $this->belongsTo(JenisIuran::class);
    }
}
