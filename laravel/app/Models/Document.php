<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @mixin \Illuminate\Database\Eloquent\Builder
 */
class Document extends Model
{
    protected $fillable = [
        'title',
        'description',
        'type',
        'year',
        'region_id',
        'theme_id',
        'language',
        'keywords',
        'file_path',
        'views_count',
    ];

    protected $casts = [
        'views_count' => 'integer',
    ];

    public const TYPES = ['pdf', 'image', 'carte', 'video', 'audio'];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function theme(): BelongsTo
    {
        return $this->belongsTo(Theme::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'document_tag');
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }
}
