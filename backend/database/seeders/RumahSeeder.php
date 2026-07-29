<?php

namespace Database\Seeders;

use App\Models\Rumah;
use Illuminate\Database\Seeder;

class RumahSeeder extends Seeder
{
    public function run(): void
    {
        $rumah = [];

        // Baris A
        for ($i = 1; $i <= 10; $i++) {
            $rumah[] = [
                'kode_rumah' => 'A'.$i,
                'status' => 'kosong',
                'baris_denah' => 1,
                'kolom_denah' => $i,
                'urutan_tampil' => $i,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Baris B
        for ($i = 1; $i <= 10; $i++) {
            $rumah[] = [
                'kode_rumah' => 'B'.$i,
                'status' => 'kosong',
                'baris_denah' => 2,
                'kolom_denah' => $i,
                'urutan_tampil' => $i + 10,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        Rumah::insert($rumah);
    }
}
