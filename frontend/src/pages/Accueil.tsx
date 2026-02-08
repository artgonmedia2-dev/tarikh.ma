import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { documentsApi, bannersApi, type DocumentItem, type BannerItem } from '@/api/client';

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBpIX9eFdB_PDh8VX_XwGjMSnshbOdlEt_5DyZZTzLhWCu14dvdgOfYRVHufwRim5HWN-y5zws2t_cehuoOgq8wbPGmbFt0MiSYdskfKDVjfyDnjHab714Df_83fOcvuf1-aFvJf3SF8i-LTMyjeRU9QNdkAz76uFM2RfX9-kCpBN2IZ2rc3bcaaum0R0-rYZtIJ2HZ0l4Fqzj5DJBkkYXeqxZN5cLU-zySzFI1G7niZ0Xs3-fUUUrMkBwjFTFdQY4XJrC_3-Wn6__B';

const CATEGORIES = [
  {
    title: 'Documents & Manuscrits',
    description: "Traités, dahirs et manuscrits précieux qui ont forgé l'histoire du Royaume.",
    icon: 'description',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBITFIPrXlrK_sX4lzqs74yHeyyg_ir4qWIb-0yMHo8UhqWcnpM4F_mWn1ZPWA5wMPRNvlfqGS_8u7IekgzfxGgdU5tYOx9LEXDSFzZesVBvxOrr34Cgzd7EStCxoqfZQ7CvqZ7yGKQBcoacGj09vrLW5hJ-x4SZnJBMzVfQJCcGkYFvtGiDGCMLcy4XBhDNT3YTEDBdPTwask6uOJFQQ_ioDkzV51u8Vygi0YlcHy2NDF3gU8ipR5OAXOJbwUti5X_JlUQf6MPBeHe',
    to: '/archives?type=pdf',
  },
  {
    title: 'Photographies & Images',
    description: 'Un voyage visuel à travers les siècles, des premières gravures aux clichés historiques.',
    icon: 'image',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhELtUk_EWB0svCP1CPN5I7_GjmSkaruom8rn-0NGIC9XWgHPHbmHNweG07Eh_bDyo1_iHvXNb47cJWohcfMM5SFh0ZyaMQcG76trgeHe7vPXj-pBxlsLBmABAFgjS0Ut1E7Qj7aJqk-zn2jcDtK51e8vwc7BBAz6doa3krqxYLN_WawebcbKvsNVhyGNr_W0U9wqvmjuDtNbX9M4zPBPZcyEtYyKPsi-baMAJLyk2lY05y7BlU7xrLrkeBdAzRrj4oNa88HjxG8hO',
    to: '/archives?type=image',
  },
  {
    title: 'Cartographie Royale',
    description: "Explorez l'évolution du territoire et des cités à travers des plans et cartes séculaires.",
    icon: 'map',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNl4A1QMa3XiOj2YLC-rPfz3YGjhDuA6IYuV5v53NFIlqTEWoPDZYS3lT2mHqFbLTApk3qZQbYlpCew2T6tfoDZrzBB5nw7_8M9_O3TQZOHBHt4nf6oy16c4rbNVxn6gslN5IJn-j5v9W6MT0YGi0tI6WIZPI0c8hi-mR5qplyULQ8vXlDJTv1BSR7Qqocc1Yh7lnq5ZOFU8MsH3fQlusRFJk2Iug6oEKsm0FACTJOL2hIC-3VG0CXpjTM5-lQOFZBJ3UpbHutM2OL',
    to: '/archives?type=carte',
  },
  {
    title: 'Archives Vidéos',
    description: 'Documents cinématographiques et films d\'époque rares témoignant du passé.',
    icon: 'movie',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800',
    to: '/archives?type=video',
  },
  {
    title: 'Patrimoine Sonore',
    description: 'Enregistrements historiques, chants et témoignages audio du patrimoine national.',
    icon: 'audio_file',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
    to: '/archives?type=audio',
  },
  {
    title: 'Presse & Journaux',
    description: 'Consultez les périodiques et journaux historiques qui ont relaté notre histoire.',
    icon: 'newspaper',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800',
    to: '/archives?type=newspaper',
  },
];

const TRESORS = [
  { badge: 'Dynastie Saadienne', meta: '16ème Siècle', title: "L'Art de la calligraphie à Marrakech", description: "Étude détaillée sur les styles de transcription utilisés sous le règne d'Ahmed al-Mansur.", image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7IYapK4EGetsL_RnTQwBUvwHL5a5B-qIjLOumYxyvWjE_JDl8rKzx0dljC3v_BkCs65Rw12yGxvrpqcboQPdZBp1UBYiBubcOz-u_hPBp5BH3_Wem9xWRsBv8U0oSLvoRsKfrvQuiiGJ-4F1EibEogb5Hz0KscEJNDk_XBa49-ZG0r32EVY6CaCk0QQ7m19zWjd1N3YWPOpVdHluSJUdvBh6OwEpxH29OtKX9Qp5cgNPFomhLOhMFF53VZ9nKHx_elUkIMOIKfj3x' },
  { badge: 'Architecture', meta: 'Fès Médina', title: 'Les Plans de la Mosquée Al-Qarawiyyin', description: "Reconstitution numérique des plans d'expansion originaux de la célèbre université.", image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4pX_5kvwy0ARvBEUidUNSjjFHqT1yuDAs5o-XrdneM15Ki4vIyB5sM83L7IkyCEl7wbVyN05Eyli3UQ1T-yY3ggBvxi401drFGGis2Gzeoy3t1T6esMPzO5bqAv1NZQSXnO2XTSDeMJE-WaCHJ8I_ht-Y9lEpp7k13W-l70od9BwbWMpNnvKE99RQaFWFWt-1Z-D0L9e_xAYAw-uteguwY_qv6aAa7BTI1AUaUl6mCXYMNrbN0V1qNhKKpvbpkB09YhGn4mHwCKsN' },
  { badge: 'Documents Royaux', meta: 'Rabat, 1894', title: 'Lettres Diplomatiques de Moulay Hassan I', description: 'Correspondances inédites avec les puissances européennes à la fin du XIXe siècle.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACH6QP68BU4m47rEjeCbIejMaopwz4l2eJQxDv51xyCxkVHdWs_bDpb1-3ihRyvPPlsOxumuQu_rDNB2n9eEEixouW9H3o_DJQDyZrrjd9Rgdjn0bECC51D10l_MLT5jOcV81r4WXcpDOZkitCNIa-Gsz_2EFWIO5CB_KoNXzzwaj_yGxGWcf-cn7lM6PR7Uv9LuAOLQ1qayjybRSXSjq2s8rcfGD2TX2H4qdEik-iWFMGG6Qeziv0-bx9pUlP4U2Rj0ERcJqKQre0' },
];

export function Accueil() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [latestDocs, setLatestDocs] = useState<DocumentItem[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [rareDocs, setRareDocs] = useState<DocumentItem[]>([]);
  const [loadingRare, setLoadingRare] = useState(true);
  const [banners, setBanners] = useState<BannerItem[]>([]);

  useEffect(() => {
    documentsApi
      .list({ per_page: 6, page: 1 })
      .then((res) => setLatestDocs(res.data))
      .catch((err) => console.error('Erreur chargement archives:', err))
      .finally(() => setLoadingLatest(false));

    documentsApi
      .list({ per_page: 4, is_rare: true })
      .then((res) => setRareDocs(res.data))
      .catch((err) => console.error('Erreur chargement documents rares:', err))
      .finally(() => setLoadingRare(false));

    bannersApi
      .list()
      .then(setBanners)
      .catch((err) => console.error('Erreur chargement bannières:', err));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/archives?q=${encodeURIComponent(search.trim())}`);
    else navigate('/archives');
  };

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[95vh] md:min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 hero-gradient z-10" />
          <img
            src={HERO_IMAGE}
            alt="Patrimoine manuscrit marocain"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-20 max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-gold/20 border border-accent-gold/30 text-accent-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-8 animate-fade-in">
            <span className="material-symbols-outlined text-sm">verified</span>
            Patrimoine National Numérisé
          </div>
          <h1 className="text-white text-6xl md:text-8xl lg:text-9xl font-black leading-[1.05] mb-8 tracking-tighter vintage-text-shadow serif">
            Préserver l&apos;Histoire, <br />
            <span className="text-accent-gold italic">Éclairer l&apos;Avenir</span>
          </h1>
          <p className="text-parchment/90 text-xl md:text-2xl font-light mb-12 max-w-3xl mx-auto leading-relaxed serif underline decoration-accent-gold/20 decoration-1 underline-offset-[12px]">
            Explorez les archives impériales du Royaume. Une collection unique de manuscrits rares, traités séculaires et photographies d&apos;époque.
          </p>
          <div className="relative max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center bg-black/30 backdrop-blur-xl border border-white/10 p-2 rounded-xl gap-2 shadow-2xl">
              <div className="flex flex-1 items-center px-4 gap-3 w-full">
                <span className="material-symbols-outlined text-accent-gold">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un manuscrit, une ville, une dynastie..."
                  className="w-full bg-transparent border-none text-white placeholder:text-white/40 focus:ring-0 text-base py-3 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto bg-accent-gold hover:bg-yellow-700 text-background-dark font-black px-8 py-3 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-tighter"
              >
                Explorer
              </button>
            </form>
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-parchment/60 text-xs">
              <span>Tendances :</span>
              <Link to="/archives?q=almohades" className="hover:text-accent-gold transition-colors underline decoration-accent-gold/40">Manuscrits Almohades</Link>
              <Link to="/archives?q=Fès" className="hover:text-accent-gold transition-colors underline decoration-accent-gold/40">Cartographie de Fès</Link>
              <Link to="/archives?q=traités" className="hover:text-accent-gold transition-colors underline decoration-accent-gold/40">Traités diplomatiques</Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background-dark to-transparent pointer-events-none" />
      </section>

      {/* Bannière Publicitaire Dynamique */}
      {banners.length > 0 && (
        <section className="bg-background-light py-8 px-6 border-b border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
              {banners.map((banner) => (
                <a
                  key={banner.id}
                  href={banner.link_url || '#'}
                  target={banner.link_url ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="min-w-full md:min-w-[800px] lg:min-w-full h-32 md:h-48 rounded-2xl overflow-hidden snap-center block relative group border-2 border-accent-gold/5 hover:border-accent-gold/20 transition-all shadow-lg hover:shadow-xl"
                >
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent flex items-center p-8 md:p-12">
                    <div className="max-w-xl">
                      <h3 className="text-white text-xl md:text-3xl font-black serif drop-shadow-lg group-hover:translate-x-2 transition-transform">
                        {banner.title}
                      </h3>
                    </div>
                  </div>
                  {banner.link_url && (
                    <div className="absolute bottom-4 right-8 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold flex items-center gap-2 group-hover:bg-white group-hover:text-primary transition-all">
                      En savoir plus <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Explorer par Catégorie */}
      <section className="py-24 px-6 bg-parchment paper-texture zellij-pattern" id="categories">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 italic serif">Explorer l&apos;Héritage</h2>
              <div className="h-1.5 w-24 bg-accent-gold rounded-full" />
            </div>
            <Link to="/archives" className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all">
              Consulter les manuscrits <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.title}
                to={cat.to}
                className="group relative overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer block border-4 border-white shadow-xl shadow-accent-gold/10"
              >
                <img
                  src={cat.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-secondary/70 to-transparent opacity-90" />
                <div className="absolute bottom-0 p-8">
                  <span className={`material-symbols-outlined text-white text-4xl mb-4 block`}>{cat.icon}</span>
                  <h3 className="text-white text-2xl font-bold mb-2 serif">{cat.title}</h3>
                  <p className="text-white/90 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {cat.description}
                  </p>
                </div>
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white material-symbols-outlined">north_east</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trésors Récents (Archives Dynamiques) */}
      <section className="py-24 bg-white overflow-hidden border-t border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-slate-900 text-3xl md:text-5xl font-black mb-3 italic serif">Trésors Récents</h2>
              <div className="h-1.5 w-24 bg-accent-gold rounded-full mb-4" />
              <p className="text-slate-500 serif">Les dernières numérisations ajoutées aux Archives Nationales.</p>
            </div>
            <Link to="/exploration" className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all group">
              Voir tout le catalogue <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>

          {loadingLatest ? (
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="min-w-[300px] md:min-w-[400px] h-80 bg-slate-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-12 scrollbar-hide touch-scroll">
              {latestDocs.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/documents/${doc.id}`}
                  className="min-w-[300px] md:min-w-[420px] bg-parchment/30 border border-accent-gold/10 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-accent-gold/5 transition-all group flex-shrink-0 relative"
                >
                  <div className="h-64 overflow-hidden relative">
                    {doc.thumbnail_url ? (
                      <img
                        src={doc.thumbnail_url}
                        alt={doc.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-parchment flex items-center justify-center">
                        <span className="material-symbols-outlined text-accent-gold/30 text-7xl">folded_paper</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase border border-accent-gold/10">
                      {doc.type}
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-accent-gold material-symbols-outlined text-sm">calendar_today</span>
                      <span className="text-slate-500 text-xs font-medium">{doc.year || 'Année inconnue'}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 mx-1" />
                      <span className="text-slate-500 text-xs font-medium">{doc.region?.name || 'Royaume'}</span>
                    </div>
                    <h4 className="text-slate-900 text-xl font-bold mb-3 group-hover:text-primary transition-colors serif line-clamp-2 leading-tight">
                      {doc.title}
                    </h4>
                    <div className="flex items-center justify-between pt-4 border-t border-accent-gold/5 mt-auto">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{doc.views_count} vues</span>
                      <span className="text-primary material-symbols-outlined group-hover:translate-x-1 transition-transform">visibility</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Documents Rares (Anciennement Odyssée du Temps) */}
      <section className="py-24 px-6 bg-background-light border-t border-slate-100" id="rare-documents">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-slate-900 text-4xl md:text-6xl font-black mb-4 italic serif uppercase tracking-tighter">
              Documents <span className="text-accent-gold">Rare</span>
            </h2>
            <div className="h-1.5 w-32 bg-accent-gold mx-auto rounded-full mb-6" />
            <p className="text-slate-500 max-w-2xl mx-auto text-lg serif italic">
              Une sélection exclusive des pièces les plus précieuses de notre patrimoine national.
            </p>
          </div>

          {loadingRare ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] bg-slate-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : rareDocs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {rareDocs.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/documents/${doc.id}`}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-accent-gold/20 shadow-xl hover:shadow-2xl transition-all duration-500"
                >
                  <img
                    src={doc.thumbnail_url || '/placeholder-archive.jpg'}
                    alt={doc.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <span className="text-accent-gold text-[10px] font-bold uppercase tracking-widest mb-2 block border-l-2 border-accent-gold pl-2">
                        {doc.type} • {doc.year || 'Époque Royale'}
                      </span>
                      <h3 className="text-white text-xl font-bold serif mb-3 leading-tight leading-clamp-2">
                        {doc.title}
                      </h3>
                      <div className="flex items-center gap-2 text-parchment/60 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        <span>Consulter ce trésor</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-accent-gold text-background-dark p-2 rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform duration-500">
                    <span className="material-symbols-outlined text-[20px]">star</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-parchment/30 rounded-3xl border-2 border-dashed border-accent-gold/10">
              <span className="material-symbols-outlined text-accent-gold/20 text-6xl mb-4">auto_stories</span>
              <p className="text-slate-400 serif italic">Bientôt, découvrez ici nos plus rares manuscrits...</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
