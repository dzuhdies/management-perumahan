<?php

namespace App\Services;

use App\Models\Pengeluaran;

class PengeluaranService
{
    public function getAll()
    {
        return Pengeluaran::latest('tanggal_pengeluaran')->get();
    }

    public function store(array $data)
    {
        return Pengeluaran::create($data);
    }

    public function update(Pengeluaran $pengeluaran, array $data)
    {
        $pengeluaran->update($data);

        return $pengeluaran;
    }

    public function delete(Pengeluaran $pengeluaran)
    {
        $pengeluaran->delete();
    }
}
