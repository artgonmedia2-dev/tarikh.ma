import { Outlet } from 'react-router-dom';

/**
 * Layout minimal pour la page document : fond blanc, contenu rendu par l’Outlet (DocumentView).
 */
export function DocumentLayout() {
  return (
    <div className="min-h-screen h-screen bg-white font-display text-slate-900 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0 w-full">
        <Outlet />
      </div>
    </div>
  );
}
