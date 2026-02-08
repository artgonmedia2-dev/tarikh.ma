import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
  { badge: 'Dynastie Saadienne', meta: '16ème Siècle', title: "L'Art de la calligraphie à Marrakech", description: "Étude détaillée sur les styles de transcription utilisés sous le règne d'Ahmed al-Mansur.", image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7IYapK4EGetsL_RnTQwBUvwHL5a5B-qIjLOumYxyvWjE_JDl8rKzx0dljC3v_BkCs65Rw12yGxvrpqcboQPdZBp1UBYiBubcOz-u_hPBp5BH3_Wem9xWRsBv8U0oSLvoRsKfrvQuiiGJ-4F1EibEogb5Hz0KscEJNDk_XBa49-ZG0r32EVY6CaCk0QQ7m19zWjd1N3YWPOpVdHluwJUdvBh6OwEpxH29OtKX9Qp5cgNPFomhLOhMFF53VZ9nKHx_elUkIMOIKfj3x' },
  { badge: 'Architecture', meta: 'Fès Médina', title: 'Les Plans de la Mosquée Al-Qarawiyyin', description: "Reconstitution numérique des plans d'expansion originaux de la célèbre université.", image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4pX_5kvwy0ARvBEUidUNSjjFHqT1yuDAs5o-XrdneM15Ki4vIyB5sM83L7IkyCEl7wbVyN05Eyli3UQ1T-yY3ggBvxi401drFGGis2Gzeoy3t1T6esMPzO5bqAv1NZQSXnO2XTSDeMJE-WaCHJ8I_ht-Y9lEpp7k13W-l70od9BwbWMpNnvKE99RQaFWFWt-1Z-D0L9e_xAYAw-uteguwY_qv6aAa7BTI1AUaUl6mCXYMNrbN0V1qNhKKpvbpkB09YhGn4mHwCKsN' },
  { badge: 'Documents Royaux', meta: 'Rabat, 1894', title: 'Lettres Diplomatiques de Moulay Hassan I', description: 'Correspondances inédites avec les puissances européennes à la fin du XIXe siècle.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACH6QP68BU4m47rEjeCbIejMaopwz4l2eJQxDv51xyCxkVHdWs_bDpb1-3ihRyvPPlsOxumuQu_rDNB2n9eEEixouW9H3o_DJQDyZrrjd9Rgdjn0bECC51D10l_MLT5jOcV81r4WXcpDOZkitCNIa-Gsz_2EFWIO5CB_KoNXzzwaj_yGxGWcf-cn7lM6PR7Uv9LuAOLQ1qayjybRSXSjq2s8rcfGD2TX2H4qdEik-iWFMGG6Qeziv0-bx9pUlP4U2Rj0ERcJqKQre0' },
];

const DYNASTIES = [
  { name: 'Idrisides', years: '788 - 974', icon: 'potted_plant' },
  { name: 'Almoravides', years: '1040 - 1147', icon: 'fort' },
  { name: 'Almohades', years: '1121 - 1269', icon: 'architecture', active: true },
  { name: 'Mérinides', years: '1244 - 1465', icon: 'school' },
  { name: 'Saadiens', years: '1549 - 1659', icon: 'crown' },
  { name: 'Alaouites', years: '1666 - Présent', icon: 'account_balance' },
];

export function Accueil() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

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
                <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/60 to-transparent" />
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

      {/* Trésors Récents */}
      <section className="py-24 bg-white overflow-hidden border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-slate-900 text-3xl md:text-4xl font-black mb-2 italic">Trésors Récents</h2>
            <p className="text-slate-500">Les dernières numérisations ajoutées à nos serveurs.</p>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
            {TRESORS.map((t) => (
              <Link
                key={t.title}
                to="/archives"
                className="min-w-[300px] md:min-w-[400px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:border-accent-gold/50 transition-colors group flex-shrink-0"
              >
                <div className="h-56 overflow-hidden">
                  <img
                    src={t.image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-primary/20 text-primary text-[10px] font-black uppercase px-2 py-1 rounded">{t.badge}</span>
                    <span className="text-slate-500 text-xs">{t.meta}</span>
                  </div>
                  <h4 className="text-slate-900 text-lg font-bold mb-2">{t.title}</h4>
                  <p className="text-slate-500 text-sm line-clamp-2">{t.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* L'Odyssée du Temps */}
      <section className="py-24 px-6 bg-white border-t border-slate-100" id="epoques">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-slate-800 text-4xl font-black mb-4 italic">L&apos;Odyssée du Temps</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base">
              Parcourez les siècles et découvrez les archives classées par dynasties et grandes périodes historiques du Maroc.
            </p>
          </div>
          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 hidden lg:block" />
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 relative z-10">
              {DYNASTIES.map((d) => (
                <Link
                  key={d.name}
                  to={`/archives?epoque=${encodeURIComponent(d.name)}`}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div
                    className={`w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center transition-all shadow-sm mb-4 bg-white ${d.active
                      ? 'ring-4 ring-primary/40 border-primary/30 text-slate-800'
                      : 'text-slate-700 group-hover:ring-4 group-hover:ring-slate-200'
                      }`}
                  >
                    <span className="material-symbols-outlined text-3xl">{d.icon}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">{d.years}</span>
                  <h5 className="text-slate-800 font-black text-center text-sm">{d.name}</h5>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
