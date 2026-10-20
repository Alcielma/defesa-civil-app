<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Formulario extends Model
{
    protected $fillable = [
        'user_id',

        'localidade',
        'setor',
        'titular',
        'endereco',
        'numero',

        'localizacao',
        'causas_problemas',

        'num_pavimentos',
        'area_aproximada',
        'num_comodos',
        'num_dormitorios',
        'tempo_construcao_anos',
        'piso',
        'piso_especificacao',
        'situacao_piso',
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

        'preenchido_em',
    ];

    protected $casts = [
        'causas_problemas' => 'array',
        'preenchido_em' => 'datetime',
        'data_conclusao' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
