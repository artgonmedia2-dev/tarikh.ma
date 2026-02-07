<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $stats = [
            'documents_count' => Document::count(),
            'views_total' => Document::sum('views_count'),
            'users_count' => User::count(),
        ];

        $most_viewed = Document::orderByDesc('views_count')
            ->take(10)
            ->get(['id', 'title', 'type', 'views_count']);

        return response()->json([
            'stats' => $stats,
            'most_viewed' => $most_viewed,
        ]);
    }
}
