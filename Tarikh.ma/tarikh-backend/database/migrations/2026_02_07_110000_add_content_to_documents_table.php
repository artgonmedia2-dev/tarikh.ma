<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->longText('content')->nullable()->after('keywords');
        });

        // Add FULLTEXT index for MySQL (ignored by SQLite)
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            Schema::table('documents', function (Blueprint $table) {
                $table->fullText(['title', 'description', 'keywords', 'content'], 'documents_fulltext_idx');
            });
        }
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            Schema::table('documents', function (Blueprint $table) {
                $table->dropFullText('documents_fulltext_idx');
            });
        }

        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn('content');
        });
    }
};
