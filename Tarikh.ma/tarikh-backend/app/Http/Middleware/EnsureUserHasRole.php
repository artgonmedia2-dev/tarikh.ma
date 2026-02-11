<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Non authentifié.'], 401);
            }
            return redirect()->route('login');
        }

        if (!in_array($request->user()->role, $roles)) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Accès non autorisé.'], 403);
            }
            abort(403, 'Accès non autorisé.');
        }

        return $next($request);
    }
}
