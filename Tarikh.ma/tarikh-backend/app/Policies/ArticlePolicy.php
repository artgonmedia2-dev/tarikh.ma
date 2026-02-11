<?php

namespace App\Policies;

use App\Models\Article;
use App\Models\User;

class ArticlePolicy
{
    /**
     * Determine if the user can view any articles.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine if the user can view the article.
     */
    public function view(User $user, Article $article): bool
    {
        // Users can view their own articles
        // Admins can view any article
        return $user->role === 'admin' || $article->isOwnedBy($user);
    }

    /**
     * Determine if the user can create articles.
     */
    public function create(User $user): bool
    {
        return true; // Any authenticated user can create
    }

    /**
     * Determine if the user can update the article.
     */
    public function update(User $user, Article $article): bool
    {
        // Admin can update any article
        if ($user->role === 'admin') {
            return true;
        }

        // User can only update their own articles that are not approved
        return $article->isOwnedBy($user) && $article->canBeEdited();
    }

    /**
     * Determine if the user can delete the article.
     */
    public function delete(User $user, Article $article): bool
    {
        // Admin can delete any article
        if ($user->role === 'admin') {
            return true;
        }

        // User can only delete their own drafts
        return $article->isOwnedBy($user) && $article->status === 'draft';
    }

    /**
     * Determine if the user can submit the article for review.
     */
    public function submit(User $user, Article $article): bool
    {
        return $article->isOwnedBy($user) && $article->canBeSubmitted();
    }

    /**
     * Determine if the user can approve/reject articles.
     */
    public function moderate(User $user, Article $article): bool
    {
        return $user->role === 'admin';
    }
}
