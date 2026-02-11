<?php

namespace Database\Seeders;

use App\Models\ArticleCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ArticleCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Histoire', 'description' => 'Articles sur l\'histoire du Maroc'],
            ['name' => 'Personnalités', 'description' => 'Biographies de personnalités historiques'],
            ['name' => 'Archives', 'description' => 'Analyse de documents d\'archives'],
            ['name' => 'Événements', 'description' => 'Événements historiques majeurs'],
            ['name' => 'Culture', 'description' => 'Patrimoine culturel et traditions'],
            ['name' => 'Géographie', 'description' => 'Histoire des régions et villes'],
        ];

        foreach ($categories as $cat) {
            ArticleCategory::firstOrCreate(
                ['slug' => Str::slug($cat['name'])],
                [
                    'name' => $cat['name'],
                    'description' => $cat['description'],
                ]
            );
        }
    }
}
