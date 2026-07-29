<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RiwayatPenghuni extends Model
{
    protected $table = 'riwayat_penghuni';

    protected $fillable = [
        'rumah_id',
        'penghuni_id',
        'tanggal_masuk',
        'tanggal_keluar',
        'sedang_menempati',
    ];

    protected $casts = [
        'tanggal_masuk' => 'date',
        'tanggal_keluar' => 'date',
        'sedang_menempati' => 'boolean',
    ];

    public function rumah(): BelongsTo
    {
        return $this->belongsTo(
            Rumah::class,
            'rumah_id'
        );
    }

    public function penghuni(): BelongsTo
    {
        return $this->belongsTo(
            Penghuni::class,
            'penghuni_id'
        );
    }

    public function tagihan(): HasMany
    {
        return $this->hasMany(
            Tagihan::class,
            'riwayat_penghuni_id'
        );
    }
}
