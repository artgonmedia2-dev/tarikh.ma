<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HeritageSection;
use Illuminate\Http\Request;

class HeritageSectionController extends Controller
{
    public function index()
    {
        return HeritageSection::where('is_active', true)
            ->orderBy('order')
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
