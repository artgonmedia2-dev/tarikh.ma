<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'documents_count' => Document::count(),
            'views_total' => Document::sum('views_count'),
            'users_count' => User::count(),
        ];

        $mostViewed = Document::orderByDesc('views_count')->take(10)->get();

        return \view('admin.dashboard', compact('stats', 'mostViewed'));
    }
}
