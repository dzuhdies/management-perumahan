<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rumah', function (Blueprint $table) {
            $table->id();

            $table->string('kode_rumah')->unique();

            $table->enum('status', ['dihuni', 'kosong'])
                ->default('kosong');

            $table->unsignedTinyInteger('baris_denah');
            $table->unsignedTinyInteger('kolom_denah');

            $table->unsignedInteger('urutan_tampil');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rumah');
    }
};
