<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = [
        'title',
        'image_path',
        'link_url',
        'is_active',
        'order',
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        return $this->image_path ? asset('storage/' . $this->image_path) : null;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('order')->orderBy('created_at', 'desc');
    }
}
