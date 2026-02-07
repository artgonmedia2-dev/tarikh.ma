<?php

namespace App\Http\Controllers;

use App\Models\Document;

class HomeController extends Controller
{
    public function index()
    {
        $recentDocuments = Document::latest()
            ->take(8)
            ->get();

        return view('home', compact('recentDocuments'));
    }

    public function about()
    {
        return view('about');
    }
}
