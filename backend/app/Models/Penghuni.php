<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Penghuni extends Model
{
    protected $table = 'penghuni';

    protected $fillable = [
        'nama_lengkap',
        'nomor_telepon',
        'foto_ktp',
        'status_penghuni',
        'status_menikah',
    ];

    protected $casts = [
        'status_menikah' => 'boolean',
    ];

    public function riwayatPenghuni(): HasMany
    {
        return $this->hasMany(RiwayatPenghuni::class);
    }
}
