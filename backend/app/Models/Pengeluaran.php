<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengeluaran extends Model
{
    protected $table = 'pengeluaran';

    protected $fillable = [
        'tanggal_pengeluaran',
        'judul',
        'nominal',
        'deskripsi',
    ];

    protected $casts = [
        'tanggal_pengeluaran' => 'date',
    ];
}
