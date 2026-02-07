import { Link } from 'react-router-dom';

const EPOQUES = [
  {
    id: 'antiquite',
    titre: 'Antiquité',
    dates: 'VIIIe s. av. J.-C. — Ve s. ap. J.-C.',
    icon: 'museum',
    description:
      'Phéniciens, Carthage, Rome et Maurétanie. Les ports de Lixus, Tingis et Volubilis témoignent des échanges méditerranéens et de l\'intégration du Maroc dans l\'Empire romain.',
  },
  {
    id: 'idrissides',
    titre: 'Islamisation & Idrissides',
    dates: '788 — Xe siècle',
    icon: 'mosque',
    description:
      'Fondation de Fès par Idriss Ier et Idriss II. Émergence d\'un État musulman et d\'un foyer de savoir (Qarawiyyin) au cœur du Maghreb.',
  },
  {
    id: 'almoravides-almohades',
    titre: 'Almoravides & Almohades',
    dates: '1040 — 1269',
    icon: 'fort',
    description:
      'Empires berbères unificateurs. Marrakech comme capitale, expansion andalouse et diffusion du savoir (Averroès, Ibn Tufayl). Architecture et manuscrits de cette ère sont au cœur de nos archives.',
  },
  {
    id: 'merinides',
    titre: 'Mérinides & Wattasides',
    dates: '1244 — 1549',
    icon: 'account_balance',
    description:
      'Fès redevient capitale. Médersas, bibliothèques et arts du livre. Une période clé pour les fonds que Tarikh.ma préserve et numérise.',
  },
  {
    id: 'saadiens',
    titre: 'Saadiens',
    dates: '1549 — 1659',
    icon: 'military_tech',
    description:
      'Âge d\'or de Marrakech, bataille des Trois Rois, relations avec l\'Europe et l\'Afrique subsaharienne. Traités, cartes et récits de voyage abondent dans les collections.',
  },
  {
    id: 'alaouites',
    titre: 'Alaouites',
    dates: '1666 — à nos jours',
    icon: 'diversity_3',
    description:
      'Dynastie régnante. Construction du Maroc moderne, protectorat, indépendance. Archives diplomatiques, dahirs et documents d\'État forment une part essentielle du patrimoine numérisé.',
  },
];

export function Epoques() {
  return (
    <div className="relative flex flex-col overflow-x-hidden bg-white">
      {/* Hero Section */}
      <section className="relative h-[420px] sm:h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Patrimoine historique du Maroc"
            className="w-full h-full object-cover opacity-20 grayscale brightness-75"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMAiUkLX4Ef90560Doe2G93v3yek3cb0Ui2NXaou2ZmdA-JaRLKqN5iQj6K-JouT3lxAWl4qKtnZ3GwYkE2gjjn6fLtK2dH3DcTrf0fizOeK2eCS5zaJNyb5DBiCCJTGNHdxfoMHjh4eINssVYHRipFMpN4S6OJu6Kgl6gEqp2_NgSPr6RsgULGJdGlK3z240igcdNUF-FjAZow4CjH_efTaMRC6qffLZdfHnmZ0V0lgRG-JqWqCGxVHkpLE9bmeP3Mzm_dgybSmPu"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
        </div>
        <div className="relative z-10 max-w-4xl px-6 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-6">
            Chronologie
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight text-slate-900">
            Les Époques : <br />
            <span className="text-primary italic font-serif">Parcourir l&apos;histoire</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Du littoral phénicien aux dynasties islamiques et au Maroc contemporain, explorez les grandes périodes qui
            ont façonné le Royaume. Tarikh.ma met à portée de clic les archives de chaque époque.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-4xl mx-auto px-6 sm:px-10 py-12 sm:py-16 text-center bg-white">
        <p className="text-slate-600 leading-relaxed text-base sm:text-lg">
          La chronologie ci-dessous structure nos fonds par grandes époques. Chaque période renvoie vers des documents
          numérisés — manuscrits, cartes, traités, correspondances — pour une exploration thématique et temporelle du
          patrimoine marocain.
        </p>
      </section>

      {/* Cartes Époques */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 py-16 sm:py-24 bg-white">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl font-black mb-4 text-slate-900">Chronologie du Maroc</h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {EPOQUES.map((ep) => (
            <div
              key={ep.id}
              className="bg-white p-6 sm:p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">{ep.icon}</span>
              </div>
              <span className="text-primary font-bold text-xs uppercase tracking-wider">{ep.dates}</span>
              <h3 className="font-bold text-xl mb-3 text-slate-900 mt-1">{ep.titre}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{ep.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Citation / Contexte patrimonial — même style que À propos */}
      <section className="flex flex-col lg:flex-row min-h-[400px] sm:min-h-[500px] bg-white">
        <div className="lg:w-1/2 relative min-h-[280px] sm:min-h-[360px] order-2 lg:order-1">
          <img
            alt="Carte ou manuscrit historique"
            className="absolute inset-0 w-full h-full object-cover grayscale"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-HG_QfToneskngg-ELq5_XKEx5HwOrGeuqRxBd86g8l61RneEIOR4tzB3kpa0PtM7hxZBhIVz5B0UtSRSu-agnt8oV8cmaOXxdsy2y_j4HcTijyEWTFUo3A5rRjrsjtoU412bKr_A2QcDEnA2Ggzu8_bWy44atKHxiTTS7bmftqPnR7d_vA1q3XGnZNP-pbTHOz66u0pNoz5uIceZQ4RCi0vfMXIDrNCqiAw5ew-u26bfGDBqTLUlyslv6ksG2QdNwqlGEFVoL6OS"
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
        </div>
        <div className="lg:w-1/2 bg-slate-50 border-t lg:border-t-0 lg:border-r border-slate-200 flex flex-col justify-center p-8 sm:p-12 lg:p-24 space-y-6 order-1 lg:order-2">
          <h2 className="text-3xl sm:text-4xl font-black font-serif italic text-primary">
            Une histoire en archives
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light italic">
            &laquo;&nbsp;Chaque époque laisse des traces : parchemins, cartes, décrets, lettres. Tarikh.ma ne se contente
            pas de les conserver — il les rend lisibles, interrogeables et partagées, pour que chercheurs et citoyens
            puissent écrire ensemble l&apos;histoire du Maroc.&nbsp;&raquo;
          </p>
          <div className="pt-6 border-t border-slate-200">
            <p className="font-bold text-slate-900 tracking-widest uppercase text-sm mb-1">Projet Tarikh.ma</p>
            <p className="text-primary text-xs font-semibold">Plateforme nationale du patrimoine numérisé</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-6 sm:px-10 text-center bg-white">
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
          <div className="text-primary">
            <span className="material-symbols-outlined text-5xl sm:text-6xl">history_edu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Explorer les archives par époque
          </h2>
          <p className="text-slate-500">
            Utilisez la chronologie dans les filtres des archives pour retrouver les documents par période et thématique.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/archives"
              className="w-full sm:w-auto bg-primary text-white px-10 py-4 rounded-xl font-bold hover:shadow-lg hover:brightness-110 transition-all text-center"
            >
              Accéder aux archives
            </Link>
            <Link
              to="/a-propos"
              className="w-full sm:w-auto border-2 border-slate-200 px-10 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all text-center text-slate-800"
            >
              Découvrir Tarikh.ma
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
