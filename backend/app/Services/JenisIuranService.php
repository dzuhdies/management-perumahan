<?php

namespace App\Services;

use App\Models\JenisIuran;

class JenisIuranService
{
    public function getAll()
    {
        return JenisIuran::query()
            ->withCount('tagihan')
            ->orderBy('nama_iuran')
            ->get();
    }

    public function store(array $data)
    {
        return JenisIuran::create($data)->loadCount('tagihan');
    }

    public function update(JenisIuran $jenisIuran, array $data)
    {
        $jenisIuran->update($data);

        return $jenisIuran->loadCount('tagihan');
    }
}
