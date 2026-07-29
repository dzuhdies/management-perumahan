<?php

use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\JenisIuranController;
use App\Http\Controllers\Api\LaporanController;
use App\Http\Controllers\Api\PengeluaranController;
use App\Http\Controllers\Api\PenghuniController;
use App\Http\Controllers\Api\RumahController;
use App\Http\Controllers\Api\TagihanController;
use Illuminate\Support\Facades\Route;

Route::apiResource('rumah', RumahController::class)
    ->only(['index', 'store', 'show', 'update']);

Route::get('rumah/{rumah}/pembayaran', [RumahController::class, 'pembayaran']);

Route::apiResource('penghuni', PenghuniController::class);

Route::apiResource('pengeluaran', PengeluaranController::class);

Route::apiResource('jenis-iuran', JenisIuranController::class)
    ->only(['index', 'store', 'update']);

Route::get('dashboard', [DashboardController::class, 'index']);

Route::get('tagihan', [TagihanController::class, 'index']);
Route::post('tagihan/bayar', [TagihanController::class, 'bayar']);
Route::post('tagihan/generate', [
    TagihanController::class,
    'generate',
]);

Route::prefix('laporan')->group(function () {
    Route::get('summary', [LaporanController::class, 'summary']);
    Route::get('detail', [LaporanController::class, 'detail']);
    Route::get('grafik', [LaporanController::class, 'grafik']);

});
