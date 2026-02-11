<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(ThemeRegionSeeder::class);

        User::factory()->create([
            'name' => 'Admin Tarikh',
            'email' => 'admin@tarikh.ma',
            'role' => 'admin',
        ]);
    }
}
