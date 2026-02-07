import { Link } from 'react-router-dom';

export function APropos() {
  return (
    <div className="relative flex flex-col overflow-x-hidden bg-white">
      {/* Hero Section */}
      <section className="relative h-[420px] sm:h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Bibliothèque historique"
            className="w-full h-full object-cover opacity-20 grayscale brightness-75"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMAiUkLX4Ef90560Doe2G93v3yek3cb0Ui2NXaou2ZmdA-JaRLKqN5iQj6K-JouT3lxAWl4qKtnZ3GwYkE2gjjn6fLtK2dH3DcTrf0fizOeK2eCS5zaJNyb5DBiCCJTGNHdxfoMHjh4eINssVYHRipFMpN4S6OJu6Kgl6gEqp2_NgSPr6RsgULGJdGlK3z240igcdNUF-FjAZow4CjH_efTaMRC6qffLZdfHnmZ0V0lgRG-JqWqCGxVHkpLE9bmeP3Mzm_dgybSmPu"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
        </div>
        <div className="relative z-10 max-w-4xl px-6 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-6">
            Institutionnel
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight text-slate-900">
            Notre Mission : <br />
            <span className="text-primary italic font-serif">Porter l&apos;Héritage</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Tarikh.ma est la sentinelle numérique du patrimoine marocain. Nous œuvrons pour que chaque manuscrit,
            chaque carte et chaque récit trouve sa place dans la mémoire du futur.
          </p>
        </div>
      </section>

      {/* Mission Cards */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 py-16 sm:py-24 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">hub</span>
            </div>
            <h3 className="font-bold text-xl mb-3 text-slate-900">Centralisation</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Unification des archives dispersées pour créer un corpus national cohérent et accessible.
            </p>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">public</span>
            </div>
            <h3 className="font-bold text-xl mb-3 text-slate-900">Accessibilité</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Démocratisation du savoir historique pour les chercheurs, les étudiants et les curieux du monde entier.
            </p>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">devices</span>
            </div>
            <h3 className="font-bold text-xl mb-3 text-slate-900">Expérience Moderne</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Interfaces intuitives et outils de visualisation avancés pour une exploration fluide de l&apos;histoire.
            </p>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">encrypted</span>
            </div>
            <h3 className="font-bold text-xl mb-3 text-slate-900">Sécurité</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Protection cryptographique et pérennité numérique des documents sensibles et rares.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section — fond clair */}
      <section className="bg-parchment sm:bg-slate-50/80 py-16 sm:py-24 px-6 sm:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14 sm:mb-20">
            <h2 className="text-3xl font-black mb-4 text-slate-900">Genèse du Projet</h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </div>
          <div className="relative space-y-12 sm:space-y-16">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 timeline-line" />
            {/* Step 1 */}
            <div className="relative flex items-start gap-8 sm:gap-12 group">
              <div className="z-10 flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white shadow-lg ring-8 ring-white sm:ring-parchment transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-2xl">lightbulb</span>
              </div>
              <div className="pt-2 min-w-0">
                <span className="text-primary font-black text-sm uppercase tracking-tighter">
                  2021 — Phase d&apos;étude
                </span>
                <h4 className="text-xl font-bold mt-1 mb-3 text-slate-900">Éclosion de la vision</h4>
                <p className="text-slate-600 leading-relaxed">
                  Une équipe pluridisciplinaire d&apos;historiens, d&apos;archivistes et d&apos;ingénieurs se réunit pour
                  définir les standards de numérisation du patrimoine marocain.
                </p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="relative flex items-start gap-8 sm:gap-12 group">
              <div className="z-10 flex items-center justify-center w-16 h-16 rounded-full bg-white text-primary border-4 border-primary shadow-lg ring-8 ring-white sm:ring-parchment transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-2xl">handshake</span>
              </div>
              <div className="pt-2 min-w-0">
                <span className="text-primary font-black text-sm uppercase tracking-tighter">
                  2022 — Alliances Stratégiques
                </span>
                <h4 className="text-xl font-bold mt-1 mb-3 text-slate-900">Partenariats Institutionnels</h4>
                <p className="text-slate-600 leading-relaxed">
                  Signature d&apos;accords historiques avec les Archives Nationales et les bibliothèques universitaires
                  pour centraliser plus de 500&nbsp;000 documents rares.
                </p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="relative flex items-start gap-8 sm:gap-12 group">
              <div className="z-10 flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white shadow-lg ring-8 ring-white sm:ring-parchment transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-2xl">rocket_launch</span>
              </div>
              <div className="pt-2 min-w-0">
                <span className="text-primary font-black text-sm uppercase tracking-tighter">
                  2023 — Déploiement
                </span>
                <h4 className="text-xl font-bold mt-1 mb-3 text-slate-900">Lancement de la plateforme</h4>
                <p className="text-slate-600 leading-relaxed">
                  Mise en ligne de Tarikh.ma avec son moteur de recherche sémantique et ses outils de visualisation
                  cartographique du Maroc à travers les âges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Split Heritage Section — fond blanc : image gauche, bloc droit clair */}
      <section className="flex flex-col lg:flex-row min-h-[500px] sm:min-h-[600px] bg-white">
        <div className="lg:w-1/2 relative min-h-[320px] sm:min-h-[400px]">
          <img
            alt="Manuscrit marocain"
            className="absolute inset-0 w-full h-full object-cover grayscale"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUi5BOTSw9nRYZNMewX2G9maChHwU9aq9HL0CWgvk_n4b2wMh3uLoz88z6dhm2WVwMoboRK19O6u9pdrFVZF9NsRnlHYsPVE-X2G_Fq71ltP3xQN1ARq2xoUACzOW8BPOFc-MriNGeID6QaFu7cSdrUGxQLYkLV0JYP6clwtNRSJ4QRKdE-ZOG21Vs7M7zzTvHdTSUEaZYwrUxZjVqZoveQg07siRWnIXI-EFulrrYpBXFo6F6JxmyVHqi44Ml8Bc6MPD1ahKYTfYp"
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
        </div>
        <div className="lg:w-1/2 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-center p-8 sm:p-12 lg:p-24 space-y-6 sm:space-y-8">
          <h2 className="text-3xl sm:text-4xl font-black font-serif italic text-primary">Un devoir de mémoire</h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light italic">
            &laquo;&nbsp;La culture est ce qui reste quand on a tout oublié. En préservant les traces de notre passé,
            nous ne faisons pas que regarder en arrière, nous construisons les fondations d&apos;un avenir plus conscient
            et plus fier de son identité plurielle.&nbsp;&raquo;
          </p>
          <div className="pt-6 border-t border-slate-200">
            <p className="font-bold text-slate-900 tracking-widest uppercase text-sm mb-1">Dr. Ahmed El Mansouri</p>
            <p className="text-primary text-xs font-semibold">Conservateur en Chef, Projet Tarikh</p>
          </div>
        </div>
      </section>

      {/* CTA — fond blanc */}
      <section className="py-16 sm:py-24 px-6 sm:px-10 text-center bg-white">
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
          <div className="text-primary">
            <span className="material-symbols-outlined text-5xl sm:text-6xl">menu_book</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Prêt à explorer notre histoire ?</h2>
          <p className="text-slate-500">
            Plongez dans des siècles de savoir, de culture et de découvertes. Rejoignez les milliers de citoyens et
            chercheurs qui redécouvrent le Maroc chaque jour.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/archives"
              className="w-full sm:w-auto bg-primary text-white px-10 py-4 rounded-xl font-bold hover:shadow-lg hover:brightness-110 transition-all text-center"
            >
              Explorer les archives
            </Link>
            <Link
              to="/archives"
              className="w-full sm:w-auto border-2 border-slate-200 px-10 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all text-center text-slate-800"
            >
              Devenir partenaire
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
