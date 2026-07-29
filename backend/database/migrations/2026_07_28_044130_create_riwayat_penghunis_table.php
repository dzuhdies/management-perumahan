<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('riwayat_penghuni', function (Blueprint $table) {

            $table->id();

            $table->foreignId('rumah_id')
                ->constrained('rumah')
                ->cascadeOnDelete();

            $table->foreignId('penghuni_id')
                ->constrained('penghuni')
                ->cascadeOnDelete();

            $table->date('tanggal_masuk');

            $table->date('tanggal_keluar')
                ->nullable();

            $table->boolean('sedang_menempati')
                ->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('riwayat_penghuni');
    }
};
