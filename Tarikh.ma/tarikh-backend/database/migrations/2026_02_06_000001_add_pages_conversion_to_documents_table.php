<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->unsignedInteger('pages_count')->nullable()->after('file_path');
            $table->string('pages_status', 20)->default('pending')->after('pages_count'); // pending, processing, completed, failed
            $table->timestamp('pages_converted_at')->nullable()->after('pages_status');
            $table->index(['type', 'pages_status']);
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropIndex(['type', 'pages_status']);
            $table->dropColumn(['pages_count', 'pages_status', 'pages_converted_at']);
        });
    }
};
