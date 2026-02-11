<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $period = $request->get('period', '30j');

        $stats = [
            'documents_count' => Document::count(),
            'views_total' => (int) Document::sum('views_count'),
            'users_count' => User::count(),
        ];

        $startDate = match ($period) {
            'trimestre' => Carbon::now()->subMonths(3),
            'annee' => Carbon::now()->subYear(),
            default => Carbon::now()->subDays(30),
        };
        $stats['new_documents_in_period'] = Document::where('created_at', '>=', $startDate)->count();

        $daysInPeriod = (int) $startDate->diffInDays(Carbon::now());
        $previousStart = $startDate->copy()->subDays($daysInPeriod);
        $previousPeriodCount = Document::whereBetween('created_at', [$previousStart, $startDate])->count();
        $currentPeriodCount = $stats['new_documents_in_period'];
        if ($previousPeriodCount > 0) {
            $stats['new_documents_change_percent'] = round((($currentPeriodCount - $previousPeriodCount) / $previousPeriodCount) * 100, 1);
        } elseif ($currentPeriodCount > 0) {
            $stats['new_documents_change_percent'] = 100;
        } else {
            $stats['new_documents_change_percent'] = null;
        }

        $monthLabels = [];
        $countByMonth = [];
        $current = Carbon::now()->subMonths(11)->startOfMonth();
        $end = Carbon::now();
        while ($current <= $end) {
            $monthLabels[] = $current->locale('fr')->translatedFormat('M');
            $countByMonth[] = Document::whereBetween('created_at', [
                $current->copy()->startOfMonth(),
                $current->copy()->endOfMonth(),
            ])->count();
            $current->addMonth();
        }

        $typeRaw = Document::query()
            ->selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->get();
        $totalDocs = $typeRaw->sum('count');
        $typeDistribution = $typeRaw->map(function ($r) use ($totalDocs) {
            $pct = $totalDocs > 0 ? round(((int) $r->count / $totalDocs) * 100, 0) : 0;
            return [
                'type' => $r->type,
                'count' => (int) $r->count,
                'percentage' => $pct,
            ];
        })->values()->all();

        $mostViewed = Document::orderByDesc('views_count')
            ->take(10)
            ->get(['id', 'title', 'type', 'views_count']);

        return response()->json([
            'stats' => $stats,
            'traffic_by_month' => [
                'labels' => $monthLabels,
                'data' => $countByMonth,
            ],
            'type_distribution' => $typeDistribution,
            'most_viewed' => $mostViewed,
        ]);
    }
}
