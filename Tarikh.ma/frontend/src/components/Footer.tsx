import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white text-slate-800 pt-20 pb-10 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-accent-gold text-2xl">auto_stories</span>
            <h2 className="text-slate-900 text-2xl font-black italic">Tarikh.ma</h2>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            La plateforme numérique de référence dédiée à la sauvegarde et à la diffusion du patrimoine documentaire du Royaume du Maroc.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-accent-gold hover:text-white text-slate-600 transition-colors"
              aria-label="Partager"
            >
              <span className="material-symbols-outlined text-xl">share</span>
            </a>
            <a
              href="mailto:contact@tarikh.ma"
              className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-accent-gold hover:text-white text-slate-600 transition-colors"
              aria-label="Email"
            >
              <span className="material-symbols-outlined text-xl">mail</span>
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-accent-gold uppercase tracking-widest text-xs">Explorer</h4>
          <ul className="space-y-4 text-sm text-slate-600">
            <li><Link to="/archives?type=manuscrit" className="hover:text-slate-900 transition-colors">Manuscrits Rares</Link></li>
            <li><Link to="/archives?type=carte" className="hover:text-slate-900 transition-colors">Cartes Historiques</Link></li>
            <li><Link to="/archives?type=photo" className="hover:text-slate-900 transition-colors">Photothèque</Link></li>
            <li><a href="#" className="hover:text-slate-900 transition-colors">Généalogies</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-accent-gold uppercase tracking-widest text-xs">l'Héritage de platforme</h4>
          <ul className="space-y-4 text-sm text-slate-600">
            <li><a href="#epoques" className="hover:text-slate-900 transition-colors">Ère Idriside</a></li>
            <li><a href="#epoques" className="hover:text-slate-900 transition-colors">Dynastie Almohade</a></li>
            <li><a href="#epoques" className="hover:text-slate-900 transition-colors">Règne Saadien</a></li>
            <li><a href="#epoques" className="hover:text-slate-900 transition-colors">Archives Alaouites</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-accent-gold uppercase tracking-widest text-xs">Newsletter</h4>
          <p className="text-xs text-slate-500 mb-4">Recevez les nouveaux trésors numérisés directement par email.</p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="votre@email.com"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 px-3 py-2 focus:ring-accent-gold focus:border-accent-gold outline-none"
            />
            <button type="submit" className="bg-accent-gold px-4 py-2 rounded-lg text-xs font-bold text-white hover:brightness-110 transition-all">
              Ok
            </button>
          </form>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest text-center md:text-left">
          © {new Date().getFullYear()} Tarikh.ma - Tous droits réservé. Developped by ArtgonMEDIA
        </p>
        <div className="flex gap-8 text-[10px] text-slate-400 uppercase tracking-widest">
          <a href="#" className="hover:text-accent-gold transition-colors">Mentions Légales</a>
          <a href="#" className="hover:text-accent-gold transition-colors">Confidentialité</a>
          <a href="#" className="hover:text-accent-gold transition-colors">Partenariats</a>
        </div>
      </div>
    </footer>
  );
}
