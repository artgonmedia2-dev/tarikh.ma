<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    /**
     * List all articles (admin view with filters).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Article::with(['category:id,name,slug', 'user:id,name,email'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        return response()->json($query->paginate($request->get('per_page', 20)));
    }

    /**
     * List pending articles only.
     */
    public function pending(Request $request): JsonResponse
    {
        $articles = Article::with(['category:id,name,slug', 'user:id,name,email'])
            ->pending()
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json($articles);
    }

    /**
     * Show a single article for review.
     */
    public function show(Article $article): JsonResponse
    {
        return response()->json($article->load(['category', 'user:id,name,email']));
    }

    /**
     * Approve an article.
     */
    public function approve(Request $request, Article $article): JsonResponse
    {
        if ($article->status !== 'pending_review') {
            return response()->json(['message' => 'Only pending articles can be approved'], 422);
        }

        $article->approve();

        return response()->json([
            'message' => 'Article approuvé et publié',
            'article' => $article->fresh()->load('category'),
        ]);
    }

    /**
     * Reject an article with comment.
     */
    public function reject(Request $request, Article $article): JsonResponse
    {
        if ($article->status !== 'pending_review') {
            return response()->json(['message' => 'Only pending articles can be rejected'], 422);
        }

        $validated = $request->validate([
            'comment' => 'required|string|max:1000',
        ]);

        $article->reject($validated['comment']);

        return response()->json([
            'message' => 'Article rejeté',
            'article' => $article->fresh()->load('category'),
        ]);
    }

    /**
     * Get article statistics for dashboard.
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => Article::count(),
            'draft' => Article::draft()->count(),
            'pending' => Article::pending()->count(),
            'approved' => Article::approved()->count(),
            'rejected' => Article::rejected()->count(),
        ]);
    }
}
