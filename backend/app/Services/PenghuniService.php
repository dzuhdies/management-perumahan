<?php

namespace App\Services;

use App\Models\Penghuni;
use App\Models\RiwayatPenghuni;
use App\Models\Rumah;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PenghuniService
{
    public function getAll()
    {
        return Penghuni::with([
            'riwayatPenghuni.rumah',
        ])->get();
    }

    public function store(array $data)
    {
        return DB::transaction(function () use ($data) {

            $rumah = Rumah::findOrFail($data['rumah_id']);

            if ($rumah->status == 'dihuni') {
                abort(422, 'Rumah sudah dihuni.');
            }

            if (isset($data['foto_ktp'])) {
                $data['foto_ktp'] = $data['foto_ktp']->store('ktp', 'public');
            }

            $penghuni = Penghuni::create([
                'nama_lengkap' => $data['nama_lengkap'],
                'nomor_telepon' => $data['nomor_telepon'],
                'foto_ktp' => $data['foto_ktp'] ?? null,
                'status_penghuni' => $data['status_penghuni'],
                'status_menikah' => $data['status_menikah'],
            ]);

            RiwayatPenghuni::create([
                'rumah_id' => $rumah->id,
                'penghuni_id' => $penghuni->id,
                'tanggal_masuk' => $data['tanggal_masuk'],
                'sedang_menempati' => true,
            ]);

            $rumah->update([
                'status' => 'dihuni',
            ]);

            return $penghuni;
        });
    }

    public function update(Penghuni $penghuni, array $data)
    {
        if (isset($data['foto_ktp'])) {
            $fotoLama = $penghuni->foto_ktp;
            $data['foto_ktp'] = $data['foto_ktp']->store('ktp', 'public');

            if ($fotoLama) {
                Storage::disk('public')->delete($fotoLama);
            }
        }

        $penghuni->update($data);

        return $penghuni->load('riwayatPenghuni.rumah');
    }

    public function destroy(Penghuni $penghuni)
    {
        DB::transaction(function () use ($penghuni) {

            $riwayat = RiwayatPenghuni::where('penghuni_id', $penghuni->id)
                ->where('sedang_menempati', true)
                ->first();

            if ($riwayat) {

                $riwayat->update([
                    'sedang_menempati' => false,
                    'tanggal_keluar' => now(),
                ]);

                $riwayat->rumah->update([
                    'status' => 'kosong',
                ]);
            }

        });
    }
}
