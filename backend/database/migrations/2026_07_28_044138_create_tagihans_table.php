<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tagihan', function (Blueprint $table) {

            $table->id();

            $table->foreignId('riwayat_penghuni_id')
                ->constrained('riwayat_penghuni')
                ->cascadeOnDelete();

            $table->foreignId('jenis_iuran_id')
                ->constrained('jenis_iuran')
                ->cascadeOnDelete();

            $table->unsignedTinyInteger('bulan');

            $table->year('tahun');

            $table->decimal('nominal', 12, 2);

            $table->decimal('nominal_dibayar', 12, 2)
                ->default(0);

            $table->dateTime('tanggal_bayar')
                ->nullable();

            $table->text('keterangan')
                ->nullable();

            $table->timestamps();

            $table->unique([
                'riwayat_penghuni_id',
                'jenis_iuran_id',
                'bulan',
                'tahun',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tagihan');
    }
};
