<?php

namespace Database\Seeders;

use App\Models\Region;
use App\Models\Theme;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ThemeRegionSeeder extends Seeder
{
    public function run(): void
    {
        $themes = [
            'Diplomatie', 'Histoire', 'Culture', 'Religion', 'Économie', 'Cartographie', 'Lettres', 'Manuscrits',
        ];
        foreach ($themes as $name) {
            Theme::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name]
            );
        }

        $regions = [
            'Fès-Meknès', 'Marrakech-Safi', 'Rabat-Salé-Kénitra', 'Casablanca-Settat', 'Tanger-Tétouan-Al Hoceïma',
            'Oriental', 'Souss-Massa', 'Drâa-Tafilalet', 'Béni Mellal-Khénifra', 'National',
        ];
        foreach ($regions as $name) {
            Region::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name]
            );
        }
    }
}
