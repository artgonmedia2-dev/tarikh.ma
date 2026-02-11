<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * @mixin \Illuminate\Database\Eloquent\Builder
 */
class Article extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'content',
        'status',
        'category_id',
        'cover_image',
        'admin_comment',
        'tags',
        'sources',
        'published_at',
    ];

    protected $casts = [
        'tags' => 'array',
        'published_at' => 'datetime',
    ];

    protected $appends = ['cover_image_url'];

    public const STATUSES = ['draft', 'pending_review', 'approved', 'rejected'];

    // Auto-generate slug from title
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($article) {
            if (empty($article->slug)) {
                $article->slug = Str::slug($article->title) . '-' . Str::random(6);
            }
        });
    }

    public function getCoverImageUrlAttribute(): ?string
    {
        if (! $this->cover_image) {
            return null;
        }
        return route('api.articles.cover', ['article' => $this->id]);
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ArticleCategory::class, 'category_id');
    }

    // Scopes
    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', 'approved');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending_review');
    }

    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('status', 'draft');
    }

    public function scopeRejected(Builder $query): Builder
    {
        return $query->where('status', 'rejected');
    }

    public function scopeByUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    // Helper methods
    public function isOwnedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }

    public function canBeEdited(): bool
    {
        return in_array($this->status, ['draft', 'rejected']);
    }

    public function canBeSubmitted(): bool
    {
        return $this->status === 'draft';
    }

    public function submit(): void
    {
        $this->update(['status' => 'pending_review']);
    }

    public function approve(): void
    {
        $this->update([
            'status' => 'approved',
            'published_at' => now(),
            'admin_comment' => null,
        ]);
    }

    public function reject(string $comment): void
    {
        $this->update([
            'status' => 'rejected',
            'admin_comment' => $comment,
        ]);
    }
}
