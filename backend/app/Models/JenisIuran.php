<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JenisIuran extends Model
{
    protected $table = 'jenis_iuran';

    protected $fillable = [
        'nama_iuran',
        'nominal',
    ];

    public function tagihan(): HasMany
    {
        return $this->hasMany(Tagihan::class);
    }
}
