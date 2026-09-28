<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('formularios', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->string('localidade');
            $table->string('setor')->nullable();
            $table->string('titular');
            $table->string('endereco');
            $table->string('numero')->nullable();

            $table->string('localizacao');

            $table->json('causas_problemas')->nullable();

            $table->integer('num_pavimentos')->nullable();
            $table->decimal('area_aproximada', 8, 2)->nullable();
            $table->integer('num_comodos')->nullable();
            $table->integer('num_dormitorios')->nullable();
            $table->integer('tempo_construcao_anos')->nullable();

            $table->string('piso');

            $table->string('piso_especificacao')->nullable();

            $table->string('situacao_piso');

            $table->timestamp('preenchido_em')->nullable();

            $table->timestamps(); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('formularios');
    }
};
