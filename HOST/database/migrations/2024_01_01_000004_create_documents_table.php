<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('type'); // pdf, image, carte, video, audio
            $table->string('year')->nullable(); // année ou période
            $table->foreignId('region_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('theme_id')->nullable()->constrained()->nullOnDelete();
            $table->string('language')->nullable();
            $table->text('keywords')->nullable(); // mots-clés (libre ou séparés par virgule)
            $table->string('file_path');
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamps();

            $table->index(['type', 'year', 'region_id', 'theme_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
