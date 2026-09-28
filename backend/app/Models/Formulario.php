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

        'preenchido_em',
    ];

    protected $casts = [
        'causas_problemas' => 'array',
        'preenchido_em' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
