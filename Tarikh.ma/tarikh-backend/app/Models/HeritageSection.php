<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class HeritageSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'icon',
        'image_path',
        'link_url',
        'order',
        'is_active'
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        if (!$this->image_path) return null;
        if (str_starts_with($this->image_path, 'http')) return $this->image_path;
        return asset('storage/' . $this->image_path);
    }
}
