<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Rumah extends Model
{
    protected $table = 'rumah';

    protected $fillable = [
        'kode_rumah',
        'status',
        'baris_denah',
        'kolom_denah',
        'urutan_tampil',
    ];

    public function riwayatPenghuni(): HasMany
    {
        return $this->hasMany(
            RiwayatPenghuni::class,
            'rumah_id'
        );
    }

    public function penghuniAktif(): HasOne
    {
        return $this->hasOne(
            RiwayatPenghuni::class,
            'rumah_id'
        )->where('sedang_menempati', true);
    }
}
