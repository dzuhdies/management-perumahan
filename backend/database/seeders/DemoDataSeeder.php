<?php

namespace Database\Seeders;

use App\Models\JenisIuran;
use App\Models\Pengeluaran;
use App\Models\Penghuni;
use App\Models\RiwayatPenghuni;
use App\Models\Rumah;
use App\Models\Tagihan;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $hariIni = CarbonImmutable::today();
        $tahunAwal = $hariIni->year - 2;

        $names = [
            'Budi Santoso',
            'Siti Rahma',
            'Agus Setiawan',
            'Dewi Lestari',
            'Rizky Pratama',
            'Nur Aisyah',
            'Andi Wijaya',
            'Maya Putri',
            'Fajar Nugroho',
            'Rina Kartika',
            'Dedi Irawan',
            'Lina Marlina',
            'Hendra Gunawan',
            'Fitri Handayani',
            'Yoga Saputra',
        ];

        $rumah = Rumah::orderBy('urutan_tampil')->take(15)->get();
        $jenisIuran = JenisIuran::all();

        foreach ($rumah as $index => $unit) {
            $riwayat = RiwayatPenghuni::query()
                ->where('rumah_id', $unit->id)
                ->where('sedang_menempati', true)
                ->first();

            if (! $riwayat) {
                $nomorTelepon = '081200000'.str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT);
                $penghuni = Penghuni::updateOrCreate(
                    ['nomor_telepon' => $nomorTelepon],
                    [
                        'nama_lengkap' => $names[$index],
                        'foto_ktp' => null,
                        'status_penghuni' => 'tetap',
                        'status_menikah' => $index % 3 !== 0,
                    ]
                );

                $riwayat = RiwayatPenghuni::create([
                    'rumah_id' => $unit->id,
                    'penghuni_id' => $penghuni->id,
                    'tanggal_masuk' => CarbonImmutable::create($tahunAwal)->startOfYear()->toDateString(),
                    'sedang_menempati' => true,
                ]);
            }

            $unit->update(['status' => 'dihuni']);

            for ($tahun = $tahunAwal; $tahun <= $hariIni->year; $tahun++) {
                $bulanTerakhir = $tahun === $hariIni->year ? $hariIni->month : 12;

                for ($bulan = 1; $bulan <= $bulanTerakhir; $bulan++) {
                    foreach ($jenisIuran as $iuran) {
                        $lunas = $tahun < $hariIni->year
                            || $bulan < $hariIni->month
                            || $index < 10;

                        Tagihan::updateOrCreate(
                            [
                                'riwayat_penghuni_id' => $riwayat->id,
                                'jenis_iuran_id' => $iuran->id,
                                'bulan' => $bulan,
                                'tahun' => $tahun,
                            ],
                            [
                                'nominal' => $iuran->nominal,
                                'nominal_dibayar' => $lunas ? $iuran->nominal : 0,
                                'tanggal_bayar' => $lunas
                                    ? CarbonImmutable::create($tahun, $bulan, 5, 9)
                                    : null,
                                'keterangan' => $tahun < $hariIni->year
                                    ? 'Data pembayaran historis dummy.'
                                    : null,
                            ]
                        );
                    }
                }
            }
        }

        $namaPenghuniHistoris = [
            'Ahmad Fauzi',
            'Bambang Supriyadi',
            'Candra Wijaya',
            'Darman Hidayat',
            'Eko Prasetyo',
            'Ferdiansyah',
            'Gunawan Saputra',
            'Hari Kurniawan',
            'Irfan Maulana',
            'Joko Susilo',
            'Kurniawan',
            'Lukman Hakim',
            'Muhammad Ridwan',
            'Nanda Permana',
            'Oscar Mahendra',
            'Prasetyo Utomo',
            'Qomaruddin',
            'Rudi Hartono',
            'Surya Dharma',
            'Taufik Hidayat',
            'Ujang Suhendra',
            'Vino Pratama',
            'Wahyu Ramadhan',
            'Yudi Setiawan',
            'Zainal Abidin',
        ];

        $periodeHistoris = [];

        for ($tahun = $tahunAwal; $tahun <= $hariIni->year; $tahun++) {
            foreach ([[1, 6], [7, 12]] as [$bulanMasuk, $bulanKeluar]) {
                $tanggalMasuk = CarbonImmutable::create($tahun, $bulanMasuk)->startOfMonth();
                $tanggalKeluar = CarbonImmutable::create($tahun, $bulanKeluar)->endOfMonth();

                if ($tanggalKeluar->lessThan($hariIni)) {
                    $periodeHistoris[] = [
                        'tanggal_masuk' => $tanggalMasuk,
                        'tanggal_keluar' => $tanggalKeluar,
                    ];
                }
            }
        }

        $rumahDenganRiwayat = Rumah::query()
            ->orderBy('urutan_tampil')
            ->skip(15)
            ->take(5)
            ->get();

        foreach ($rumahDenganRiwayat as $rumahIndex => $unit) {
            foreach ($periodeHistoris as $periodeIndex => $periode) {
                $namaIndex = ($rumahIndex * count($periodeHistoris) + $periodeIndex)
                    % count($namaPenghuniHistoris);
                $nomorTelepon = '0813999'
                    .str_pad((string) ($rumahIndex + 1), 2, '0', STR_PAD_LEFT)
                    .str_pad((string) ($periodeIndex + 1), 2, '0', STR_PAD_LEFT);

                $penghuni = Penghuni::updateOrCreate(
                    ['nomor_telepon' => $nomorTelepon],
                    [
                        'nama_lengkap' => $namaPenghuniHistoris[$namaIndex],
                        'foto_ktp' => null,
                        'status_penghuni' => 'kontrak',
                        'status_menikah' => ($rumahIndex + $periodeIndex) % 2 === 0,
                    ]
                );

                $riwayat = RiwayatPenghuni::updateOrCreate(
                    [
                        'rumah_id' => $unit->id,
                        'penghuni_id' => $penghuni->id,
                        'tanggal_masuk' => $periode['tanggal_masuk'],
                    ],
                    [
                        'tanggal_keluar' => $periode['tanggal_keluar'],
                        'sedang_menempati' => false,
                    ]
                );

                $periodeTagihan = $periode['tanggal_masuk'];

                while ($periodeTagihan->lessThanOrEqualTo($periode['tanggal_keluar'])) {
                    foreach ($jenisIuran as $iuran) {
                        Tagihan::updateOrCreate(
                            [
                                'riwayat_penghuni_id' => $riwayat->id,
                                'jenis_iuran_id' => $iuran->id,
                                'bulan' => $periodeTagihan->month,
                                'tahun' => $periodeTagihan->year,
                            ],
                            [
                                'nominal' => $iuran->nominal,
                                'nominal_dibayar' => $iuran->nominal,
                                'tanggal_bayar' => $periodeTagihan->startOfMonth()->addDays(4)->setHour(9),
                                'keterangan' => 'Pembayaran penghuni historis dummy.',
                            ]
                        );
                    }

                    $periodeTagihan = $periodeTagihan->addMonth();
                }
            }

            if (! $unit->riwayatPenghuni()->where('sedang_menempati', true)->exists()) {
                $unit->update(['status' => 'kosong']);
            }
        }

        for ($tahun = $tahunAwal; $tahun <= $hariIni->year; $tahun++) {
            $bulanTerakhir = $tahun === $hariIni->year ? $hariIni->month : 12;

            for ($bulan = 1; $bulan <= $bulanTerakhir; $bulan++) {
                $tanggalGaji = CarbonImmutable::create($tahun, $bulan, 10);

                Pengeluaran::updateOrCreate(
                    [
                        'tanggal_pengeluaran' => $tanggalGaji,
                        'judul' => 'Gaji satpam',
                    ],
                    [
                        'nominal' => 1500000,
                        'deskripsi' => 'Pengeluaran rutin bulanan.',
                    ]
                );

                if ($bulan % 2 === 1) {
                    $tanggalToken = CarbonImmutable::create($tahun, $bulan, 15);

                    Pengeluaran::updateOrCreate(
                        [
                            'tanggal_pengeluaran' => $tanggalToken,
                            'judul' => 'Token listrik pos',
                        ],
                        [
                            'nominal' => 200000,
                            'deskripsi' => 'Pembelian token listrik pos keamanan.',
                        ]
                    );
                }
            }
        }
    }
}
