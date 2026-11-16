<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FormularioController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/formularios',                      [FormularioController::class, 'store']);
    Route::get('/formularios',                       [FormularioController::class, 'index']);
    Route::get('/formularios/{id}',                  [FormularioController::class, 'show']);
    Route::put('/formularios/{id}',                  [FormularioController::class, 'update']);
    Route::patch('/formularios/{id}',                [FormularioController::class, 'update']);
    Route::delete('/formularios/{id}',               [FormularioController::class, 'destroy']);

    Route::post('/formularios/{id}/pdf',             [FormularioController::class, 'uploadPdf']);
    Route::get('/formularios/{id}/pdf',              [FormularioController::class, 'downloadPdf']);
    Route::delete('/formularios/{id}/pdf',           [FormularioController::class, 'deletePdf']);

    Route::post('/formularios/{id}/fotos',           [FormularioController::class, 'uploadFotos']);
    Route::delete('/formularios/{id}/fotos/{campo}', [FormularioController::class, 'deleteFoto']);
});
