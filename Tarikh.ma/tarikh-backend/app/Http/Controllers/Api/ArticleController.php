<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ArticleController extends Controller
{
    /**
     * List current user's articles.
     */
    public function myArticles(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Article::with(['category:id,name,slug'])
            ->byUser($user->id)
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate($request->get('per_page', 20)));
    }

    /**
     * Create a new article (draft).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'nullable|exists:article_categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'sources' => 'nullable|string',
            'cover' => 'nullable|image|max:5120',
        ]);

        $user = $request->user();

        $article = new Article();
        $article->user_id = $user->id;
        $article->title = $validated['title'];
        $article->slug = Str::slug($validated['title']) . '-' . Str::random(6);
        $article->content = $validated['content'];
        $article->category_id = $validated['category_id'] ?? null;
        $article->tags = $validated['tags'] ?? null;
        $article->sources = $validated['sources'] ?? null;
        $article->status = 'draft';

        if ($request->hasFile('cover')) {
            $article->cover_image = $request->file('cover')->store('articles/covers', 'local');
        }

        $article->save();

        return response()->json($article->load('category'), 201);
    }

    /**
     * Show a single article (user must own it or be admin).
     */
    public function show(Request $request, Article $article): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'admin' && !$article->isOwnedBy($user)) {
            abort(403, 'Unauthorized');
        }

        return response()->json($article->load(['category', 'user:id,name,email']));
    }

    /**
     * Update an article.
     */
    public function update(Request $request, Article $article): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'admin' && (!$article->isOwnedBy($user) || !$article->canBeEdited())) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'nullable|exists:article_categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'sources' => 'nullable|string',
            'cover' => 'nullable|image|max:5120',
        ]);

        $article->title = $validated['title'];
        $article->content = $validated['content'];
        $article->category_id = $validated['category_id'] ?? null;
        $article->tags = $validated['tags'] ?? null;
        $article->sources = $validated['sources'] ?? null;

        if ($request->hasFile('cover')) {
            if ($article->cover_image) {
                Storage::disk('local')->delete($article->cover_image);
            }
            $article->cover_image = $request->file('cover')->store('articles/covers', 'local');
        }

        // If rejected, reset to draft when user edits
        if ($article->status === 'rejected') {
            $article->status = 'draft';
            $article->admin_comment = null;
        }

        $article->save();

        return response()->json($article->load('category'));
    }

    /**
     * Delete an article (only drafts for regular users).
     */
    public function destroy(Request $request, Article $article): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'admin' && (!$article->isOwnedBy($user) || $article->status !== 'draft')) {
            abort(403, 'Unauthorized');
        }

        if ($article->cover_image) {
            Storage::disk('local')->delete($article->cover_image);
        }

        $article->delete();

        return response()->json(null, 204);
    }

    /**
     * Submit article for review.
     */
    public function submit(Request $request, Article $article): JsonResponse
    {
        $user = $request->user();

        if (!$article->isOwnedBy($user) || !$article->canBeSubmitted()) {
            abort(403, 'Cannot submit this article');
        }

        $article->submit();

        return response()->json([
            'message' => 'Article soumis pour validation',
            'article' => $article->fresh(),
        ]);
    }

    /**
     * List article categories.
     */
    public function categories(): JsonResponse
    {
        return response()->json(ArticleCategory::all());
    }

    /**
     * Stream cover image.
     */
    public function cover(Article $article): StreamedResponse
    {
        if (!$article->cover_image || !Storage::disk('local')->exists($article->cover_image)) {
            abort(404);
        }

        $path = $article->cover_image;
        $fullPath = Storage::disk('local')->path($path);
        $mime = mime_content_type($fullPath) ?: 'image/jpeg';

        return response()->streamDownload(function () use ($path) {
            $stream = Storage::disk('local')->readStream($path);
            fpassthru($stream);
            if (is_resource($stream)) {
                fclose($stream);
            }
        }, basename($path), ['Content-Type' => $mime], 'inline');
    }

    /**
     * List approved articles (public).
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $query = Article::with(['category:id,name,slug', 'user:id,name'])
            ->approved()
            ->latest('published_at');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return response()->json($query->paginate($request->get('per_page', 20)));
    }

    /**
     * Show a public article by slug.
     */
    public function publicShow(string $slug): JsonResponse
    {
        $article = Article::with(['category', 'user:id,name'])
            ->approved()
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json($article);
    }
}
