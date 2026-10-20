<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('formularios', function (Blueprint $table) {
            $table->string('piso')->nullable()->change();
            $table->string('situacao_piso')->nullable()->change();

            $table->string('estrutura')->nullable();
            $table->string('vedacao')->nullable();
            $table->string('vedacao_especificacao')->nullable();
            $table->string('situacao_parede')->nullable();

            $table->string('revestimento_externo')->nullable();
            $table->string('revestimento_externo_especificacao')->nullable();
            $table->string('percentual_revestimento_interno')->nullable();
            $table->string('revestimento_interno')->nullable();
            $table->string('revestimento_interno_especificacao')->nullable();
            $table->string('cobertura')->nullable();
            $table->string('cobertura_especificacao')->nullable();

            $table->string('conservacao_cobertura')->nullable();
            $table->string('conservacao_edificacao')->nullable();
            $table->string('instalacao_eletrica')->nullable();
            $table->string('sanitario')->nullable();
            $table->string('sanitario_especificacao')->nullable();

            $table->string('destino_esgoto_primario')->nullable();
            $table->string('destino_esgoto_primario_especificacao')->nullable();
            $table->string('destino_aguas_servidas')->nullable();
            $table->string('destino_aguas_servidas_especificacao')->nullable();
            $table->string('destino_lixo')->nullable();
            $table->string('destino_lixo_especificacao')->nullable();

            $table->string('intervencao_parede')->nullable();
            $table->string('intervencao_coberta')->nullable();
            $table->string('indicacao_atuacao')->nullable();
            $table->string('indicacao_demolicao')->nullable();
            $table->string('intervencao_piso')->nullable();

            $table->text('observacoes')->nullable();

            $table->string('motivo_remocao')->nullable();
            $table->string('motivo_remocao_especificacao')->nullable();
            $table->string('encaminhamentos')->nullable();

            $table->string('grau_risco')->nullable();

            $table->string('analista_tecnico')->nullable();
            $table->string('chefia_gerente')->nullable();
            $table->date('data_conclusao')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('formularios', function (Blueprint $table) {
            $table->dropColumn([
                'estrutura',
                'vedacao',
                'vedacao_especificacao',
                'situacao_parede',
                'revestimento_externo',
                'revestimento_externo_especificacao',
                'percentual_revestimento_interno',
                'revestimento_interno',
                'revestimento_interno_especificacao',
                'cobertura',
                'cobertura_especificacao',
                'conservacao_cobertura',
                'conservacao_edificacao',
                'instalacao_eletrica',
                'sanitario',
                'sanitario_especificacao',
                'destino_esgoto_primario',
                'destino_esgoto_primario_especificacao',
                'destino_aguas_servidas',
                'destino_aguas_servidas_especificacao',
                'destino_lixo',
                'destino_lixo_especificacao',
                'intervencao_parede',
                'intervencao_coberta',
                'indicacao_atuacao',
                'indicacao_demolicao',
                'intervencao_piso',
                'observacoes',
                'motivo_remocao',
                'motivo_remocao_especificacao',
                'encaminhamentos',
                'grau_risco',
                'analista_tecnico',
                'chefia_gerente',
                'data_conclusao',
            ]);
        });
    }
};
