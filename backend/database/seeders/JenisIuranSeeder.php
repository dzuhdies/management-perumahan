<?php

namespace Database\Seeders;

use App\Models\JenisIuran;
use Illuminate\Database\Seeder;

class JenisIuranSeeder extends Seeder
{
    public function run(): void
    {
        JenisIuran::insert([
            [
                'nama_iuran' => 'Satpam',
                'nominal' => 100000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_iuran' => 'Kebersihan',
                'nominal' => 15000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
