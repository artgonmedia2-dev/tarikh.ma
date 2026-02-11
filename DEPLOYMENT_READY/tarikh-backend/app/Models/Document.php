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
        'author',
        'description',
        'type',
        'year',
        'region_id',
        'theme_id',
        'language',
        'keywords',
        'file_path',
        'thumbnail_path',
        'views_count',
        'pages_count',
        'pages_status',
        'pages_converted_at',
        'content',
        'is_rare',
    ];

    protected $appends = ['thumbnail_url'];

    protected $casts = [
        'views_count' => 'integer',
        'pages_count' => 'integer',
        'pages_converted_at' => 'datetime',
    ];

    public function getThumbnailUrlAttribute(): ?string
    {
        if (! $this->thumbnail_path) {
            return null;
        }

        return route('api.documents.thumbnail', ['document' => $this->id]);
    }

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
