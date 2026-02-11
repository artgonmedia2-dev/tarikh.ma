import { Link } from 'react-router-dom';

export function Contributeurs() {
    return (
        <div className="relative flex flex-col overflow-x-hidden bg-white">
            {/* Hero Section */}
            <section className="relative h-[500px] flex items-center justify-center overflow-hidden bg-background-dark">
                <div className="absolute inset-0 z-0">
                    <img
                        alt="Collaboration historique"
                        className="w-full h-full object-cover opacity-50 grayscale"
                        src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1973&auto=format&fit=crop"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                </div>
                <div className="relative z-10 max-w-4xl px-6 text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-accent-gold/20 text-accent-gold font-bold text-xs uppercase tracking-widest mb-6 border border-accent-gold/30">
                        Espace Collaborative
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight text-slate-900 serif">
                        Écrivons l&apos;Histoire <br />
                        <span className="text-accent-gold italic text-shadow-sm">Ensemble</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed serif italic">
                        Partagez vos archives, manuscrits et recherches pour enrichir le patrimoine numérique du Maroc. Chaque document compte.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="bg-accent-gold text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-accent-gold/20 hover:scale-105 transition-all"
                        >
                            Devenir Contributeur
                        </Link>
                        <Link
                            to="/login"
                            className="bg-white border-2 border-slate-200 text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 hover:border-accent-gold/30 transition-all"
                        >
                            Accéder au Dashboard
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why Contribute? */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <div className="w-14 h-14 bg-accent-gold/10 rounded-2xl flex items-center justify-center text-accent-gold shadow-sm">
                            <span className="material-symbols-outlined text-3xl">protected_policy</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 serif">Protection & Préservation</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Assurez la pérennité de vos documents physiques en les numérisant et en les intégrant dans une archive nationale sécurisée.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-14 h-14 bg-accent-gold/10 rounded-2xl flex items-center justify-center text-accent-gold shadow-sm">
                            <span className="material-symbols-outlined text-3xl">visibility</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 serif">Visibilité Mondiale</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Offrez une plateforme à vos recherches. Vos contributions seront consultables par des chercheurs et passionnés du monde entier.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-14 h-14 bg-accent-gold/10 rounded-2xl flex items-center justify-center text-accent-gold shadow-sm">
                            <span className="material-symbols-outlined text-3xl">groups</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 serif">Communauté Active</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Échangez avec d&apos;autres collectionneurs et historiens pour authentifier et contextrualiser les trésors du passé.
                        </p>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="bg-slate-50 py-24 border-y border-slate-100">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-16 serif italic">Comment ça marche ?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white border border-accent-gold/20 rounded-full flex items-center justify-center text-accent-gold font-black text-xl mx-auto mb-6 shadow-sm">1</div>
                            <h4 className="font-bold text-slate-900 mb-2">Inscription</h4>
                            <p className="text-sm text-slate-500">Créez un compte "Contributeur" en quelques secondes.</p>
                        </div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white border border-accent-gold/20 rounded-full flex items-center justify-center text-accent-gold font-black text-xl mx-auto mb-6 shadow-sm">2</div>
                            <h4 className="font-bold text-slate-900 mb-2">Publication</h4>
                            <p className="text-sm text-slate-500">Uploadez vos fichiers et renseignez les métadonnées (époque, région, type).</p>
                        </div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white border border-accent-gold/20 rounded-full flex items-center justify-center text-accent-gold font-black text-xl mx-auto mb-6 shadow-sm">3</div>
                            <h4 className="font-bold text-slate-900 mb-2">Validation</h4>
                            <p className="text-sm text-slate-500">Notre équipe valide l&apos;authenticité avant publication officielle.</p>
                        </div>
                        {/* Connector Line (Desktop) */}
                        <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-slate-200 z-0"></div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-24 px-6 text-center">
                <div className="max-w-3xl mx-auto bg-background-dark p-12 sm:p-20 rounded-[40px] relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 opacity-10 grayscale paper-texture"></div>
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-3xl md:text-5xl font-black text-white px-4 serif">Prêt à préserver notre héritage ?</h2>
                        <p className="text-slate-300 text-lg font-light serif italic">
                            Rejoignez les dizaines de contributeurs qui œuvrent chaque jour pour la mémoire du Royaume.
                        </p>
                        <div className="pt-4">
                            <Link
                                to="/register"
                                className="bg-accent-gold text-white px-12 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl shadow-accent-gold/20 inline-block"
                            >
                                Commencer maintenant
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
