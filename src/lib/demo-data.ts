// =====================================================================
// MODO DEMO — datos de ejemplo en memoria.
// Se usan cuando NO hay Supabase configurado (.env.local vacío), para
// que el sitio se vea funcional de inmediato. En producción los mismos
// datos viven en supabase/migrations/002_seed.sql.
//
// CALENDARIO REAL fase de grupos 2026 (11–27 jun): equipos, fechas y
// horas tomados del calendario oficial (hora de Bogotá, UTC-5).
// Las sedes/estadios son la mejor asignación disponible — se pueden
// ajustar desde /admin. Banderas vía flagcdn.com (ISO 2 letras).
// =====================================================================

import type {
  Team, Match, Venue, Poll, Vote, Banner, Popup,
  League, LeagueMember, Prediction, VenueReview,
} from "./types";

const flag = (iso2: string) => `https://flagcdn.com/w160/${iso2}.png`;

// --- 48 selecciones del Mundial 2026 (sorteo real) -------------------
// id = código FIFA en minúscula (en Supabase serán uuid).
const T = (
  id: string, name: string, code: string, iso2: string,
  group: string, rank: number | null
): Team => ({
  id, name, code, flag_url: flag(iso2),
  group_label: group, fifa_rank: rank,
});

export const DEMO_TEAMS: Team[] = [
  // Grupo A
  T("mex", "México", "MEX", "mx", "A", 14),
  T("rsa", "Sudáfrica", "RSA", "za", "A", 61),
  T("kor", "Corea del Sur", "KOR", "kr", "A", 22),
  T("cze", "Chequia", "CZE", "cz", "A", 31),
  // Grupo B
  T("can", "Canadá", "CAN", "ca", "B", 28),
  T("sui", "Suiza", "SUI", "ch", "B", 17),
  T("qat", "Catar", "QAT", "qa", "B", 53),
  T("bih", "Bosnia y Herzegovina", "BIH", "ba", "B", 70),
  // Grupo C
  T("bra", "Brasil", "BRA", "br", "C", 5),
  T("mar", "Marruecos", "MAR", "ma", "C", 11),
  T("sco", "Escocia", "SCO", "gb-sct", "C", 38),
  T("hai", "Haití", "HAI", "ht", "C", 84),
  // Grupo D
  T("usa", "Estados Unidos", "USA", "us", "D", 16),
  T("par", "Paraguay", "PAR", "py", "D", 39),
  T("aus", "Australia", "AUS", "au", "D", 26),
  T("tur", "Turquía", "TUR", "tr", "D", 27),
  // Grupo E
  T("ger", "Alemania", "GER", "de", "E", 9),
  T("ecu", "Ecuador", "ECU", "ec", "E", 23),
  T("civ", "Costa de Marfil", "CIV", "ci", "E", 42),
  T("cuw", "Curazao", "CUW", "cw", "E", 82),
  // Grupo F
  T("ned", "Países Bajos", "NED", "nl", "F", 7),
  T("jpn", "Japón", "JPN", "jp", "F", 18),
  T("tun", "Túnez", "TUN", "tn", "F", 43),
  T("swe", "Suecia", "SWE", "se", "F", 40),
  // Grupo G
  T("bel", "Bélgica", "BEL", "be", "G", 8),
  T("egy", "Egipto", "EGY", "eg", "G", 34),
  T("irn", "Irán", "IRN", "ir", "G", 21),
  T("nzl", "Nueva Zelanda", "NZL", "nz", "G", 86),
  // Grupo H
  T("esp", "España", "ESP", "es", "H", 1),
  T("uru", "Uruguay", "URU", "uy", "H", 15),
  T("ksa", "Arabia Saudita", "KSA", "sa", "H", 60),
  T("cpv", "Cabo Verde", "CPV", "cv", "H", 68),
  // Grupo I
  T("fra", "Francia", "FRA", "fr", "I", 3),
  T("sen", "Senegal", "SEN", "sn", "I", 19),
  T("nor", "Noruega", "NOR", "no", "I", 29),
  T("irq", "Irak", "IRQ", "iq", "I", 58),
  // Grupo J
  T("arg", "Argentina", "ARG", "ar", "J", 2),
  T("aut", "Austria", "AUT", "at", "J", 24),
  T("alg", "Argelia", "ALG", "dz", "J", 35),
  T("jor", "Jordania", "JOR", "jo", "J", 64),
  // Grupo K
  T("por", "Portugal", "POR", "pt", "K", 6),
  T("col", "Colombia", "COL", "co", "K", 13),
  T("uzb", "Uzbekistán", "UZB", "uz", "K", 57),
  T("cod", "RD Congo", "COD", "cd", "K", 56),
  // Grupo L
  T("eng", "Inglaterra", "ENG", "gb-eng", "L", 4),
  T("cro", "Croacia", "CRO", "hr", "L", 10),
  T("gha", "Ghana", "GHA", "gh", "L", 73),
  T("pan", "Panamá", "PAN", "pa", "L", 30),
];

// --- Los 72 partidos de la fase de grupos (kickoff en UTC) -----------
// Hora Bogotá = UTC-5. Ej: 14:00 Bogotá = 19:00Z del mismo día.
const M = (
  id: string, group: string, home: string, away: string,
  kickoffUtc: string, stadium: string, city: string
): Match => ({
  id, stage: "group", group_label: group,
  home_team_id: home, away_team_id: away, kickoff: kickoffUtc,
  stadium, host_city: city, status: "scheduled",
  home_score: null, away_score: null,
  views: Math.floor(Math.random() * 300) + 50,
});

export const DEMO_MATCHES: Match[] = [
  // ---- Grupo A ----
  M("a1", "A", "mex", "rsa", "2026-06-11T19:00:00Z", "Estadio Azteca (Banorte)", "Ciudad de México"),
  M("a2", "A", "kor", "cze", "2026-06-12T02:00:00Z", "Estadio Akron", "Guadalajara"),
  M("a3", "A", "cze", "rsa", "2026-06-18T16:00:00Z", "Estadio Mercedes-Benz", "Atlanta"),
  M("a4", "A", "mex", "kor", "2026-06-19T01:00:00Z", "Estadio Akron", "Guadalajara"),
  M("a5", "A", "cze", "mex", "2026-06-25T01:00:00Z", "Estadio Azteca (Banorte)", "Ciudad de México"),
  M("a6", "A", "rsa", "kor", "2026-06-25T01:00:00Z", "Estadio BBVA", "Monterrey"),
  // ---- Grupo B ----
  M("b1", "B", "can", "bih", "2026-06-12T19:00:00Z", "Estadio de Toronto", "Toronto"),
  M("b2", "B", "qat", "sui", "2026-06-13T19:00:00Z", "Estadio Lincoln Financial", "Filadelfia"),
  M("b3", "B", "sui", "bih", "2026-06-18T19:00:00Z", "Estadio Gillette", "Boston"),
  M("b4", "B", "can", "qat", "2026-06-18T22:00:00Z", "Estadio de Toronto", "Toronto"),
  M("b5", "B", "sui", "can", "2026-06-24T19:00:00Z", "BC Place", "Vancouver"),
  M("b6", "B", "bih", "qat", "2026-06-24T19:00:00Z", "Estadio Lumen", "Seattle"),
  // ---- Grupo C ----
  M("c1", "C", "bra", "mar", "2026-06-13T22:00:00Z", "Estadio MetLife", "Nueva York / Nueva Jersey"),
  M("c2", "C", "hai", "sco", "2026-06-14T01:00:00Z", "Estadio BBVA", "Monterrey"),
  M("c3", "C", "sco", "mar", "2026-06-19T22:00:00Z", "Estadio Gillette", "Boston"),
  M("c4", "C", "bra", "hai", "2026-06-20T00:30:00Z", "Estadio MetLife", "Nueva York / Nueva Jersey"),
  M("c5", "C", "sco", "bra", "2026-06-24T22:00:00Z", "Estadio Hard Rock", "Miami"),
  M("c6", "C", "mar", "hai", "2026-06-24T22:00:00Z", "Estadio Mercedes-Benz", "Atlanta"),
  // ---- Grupo D ----
  M("d1", "D", "usa", "par", "2026-06-13T01:00:00Z", "Estadio SoFi", "Los Ángeles"),
  M("d2", "D", "aus", "tur", "2026-06-14T04:00:00Z", "BC Place", "Vancouver"),
  M("d3", "D", "usa", "aus", "2026-06-19T19:00:00Z", "Estadio Lumen", "Seattle"),
  M("d4", "D", "tur", "par", "2026-06-20T03:00:00Z", "Estadio Levi's", "San Francisco"),
  M("d5", "D", "tur", "usa", "2026-06-26T02:00:00Z", "Estadio SoFi", "Los Ángeles"),
  M("d6", "D", "par", "aus", "2026-06-26T02:00:00Z", "Estadio Levi's", "San Francisco"),
  // ---- Grupo E ----
  M("e1", "E", "ger", "cuw", "2026-06-14T17:00:00Z", "Estadio NRG", "Houston"),
  M("e2", "E", "civ", "ecu", "2026-06-14T23:00:00Z", "Estadio Lincoln Financial", "Filadelfia"),
  M("e3", "E", "ger", "civ", "2026-06-20T20:00:00Z", "Estadio de Toronto", "Toronto"),
  M("e4", "E", "ecu", "cuw", "2026-06-21T00:00:00Z", "Estadio Arrowhead", "Kansas City"),
  M("e5", "E", "cuw", "civ", "2026-06-25T20:00:00Z", "Estadio NRG", "Houston"),
  M("e6", "E", "ecu", "ger", "2026-06-25T20:00:00Z", "Estadio AT&T", "Dallas"),
  // ---- Grupo F ----
  M("f1", "F", "ned", "jpn", "2026-06-14T20:00:00Z", "Estadio AT&T", "Dallas"),
  M("f2", "F", "swe", "tun", "2026-06-15T02:00:00Z", "Estadio BBVA", "Monterrey"),
  M("f3", "F", "ned", "swe", "2026-06-20T17:00:00Z", "Estadio NRG", "Houston"),
  M("f4", "F", "tun", "jpn", "2026-06-21T04:00:00Z", "Estadio Lumen", "Seattle"),
  M("f5", "F", "jpn", "swe", "2026-06-25T23:00:00Z", "Estadio Arrowhead", "Kansas City"),
  M("f6", "F", "tun", "ned", "2026-06-25T23:00:00Z", "Estadio AT&T", "Dallas"),
  // ---- Grupo G ----
  M("g1", "G", "bel", "egy", "2026-06-15T19:00:00Z", "Estadio Lincoln Financial", "Filadelfia"),
  M("g2", "G", "irn", "nzl", "2026-06-16T01:00:00Z", "Estadio Lumen", "Seattle"),
  M("g3", "G", "bel", "irn", "2026-06-21T19:00:00Z", "Estadio Mercedes-Benz", "Atlanta"),
  M("g4", "G", "nzl", "egy", "2026-06-22T01:00:00Z", "Estadio SoFi", "Los Ángeles"),
  M("g5", "G", "egy", "irn", "2026-06-27T03:00:00Z", "Estadio Lumen", "Seattle"),
  M("g6", "G", "nzl", "bel", "2026-06-27T03:00:00Z", "BC Place", "Vancouver"),
  // ---- Grupo H ----
  M("h1", "H", "esp", "cpv", "2026-06-15T16:00:00Z", "Estadio Gillette", "Boston"),
  M("h2", "H", "ksa", "uru", "2026-06-15T22:00:00Z", "Estadio Hard Rock", "Miami"),
  M("h3", "H", "esp", "ksa", "2026-06-21T16:00:00Z", "Estadio de Toronto", "Toronto"),
  M("h4", "H", "uru", "cpv", "2026-06-21T22:00:00Z", "Estadio NRG", "Houston"),
  M("h5", "H", "cpv", "ksa", "2026-06-27T00:00:00Z", "Estadio BBVA", "Monterrey"),
  M("h6", "H", "uru", "esp", "2026-06-27T00:00:00Z", "Estadio Akron", "Guadalajara"),
  // ---- Grupo I ----
  M("i1", "I", "fra", "sen", "2026-06-16T19:00:00Z", "Estadio MetLife", "Nueva York / Nueva Jersey"),
  M("i2", "I", "irq", "nor", "2026-06-16T22:00:00Z", "Estadio Gillette", "Boston"),
  M("i3", "I", "fra", "irq", "2026-06-22T21:00:00Z", "Estadio Lincoln Financial", "Filadelfia"),
  M("i4", "I", "nor", "sen", "2026-06-23T00:00:00Z", "Estadio de Toronto", "Toronto"),
  M("i5", "I", "nor", "fra", "2026-06-26T19:00:00Z", "Estadio Gillette", "Boston"),
  M("i6", "I", "sen", "irq", "2026-06-26T19:00:00Z", "Estadio MetLife", "Nueva York / Nueva Jersey"),
  // ---- Grupo J ----
  M("j1", "J", "arg", "alg", "2026-06-17T01:00:00Z", "Estadio Arrowhead", "Kansas City"),
  M("j2", "J", "aut", "jor", "2026-06-17T04:00:00Z", "Estadio Levi's", "San Francisco"),
  M("j3", "J", "arg", "aut", "2026-06-22T17:00:00Z", "Estadio AT&T", "Dallas"),
  M("j4", "J", "jor", "alg", "2026-06-23T03:00:00Z", "Estadio Levi's", "San Francisco"),
  M("j5", "J", "alg", "aut", "2026-06-28T02:00:00Z", "BC Place", "Vancouver"),
  M("j6", "J", "jor", "arg", "2026-06-28T02:00:00Z", "Estadio SoFi", "Los Ángeles"),
  // ---- Grupo K (¡el de Colombia!) ----
  M("k1", "K", "por", "cod", "2026-06-17T17:00:00Z", "Estadio NRG", "Houston"),
  M("k2", "K", "uzb", "col", "2026-06-18T02:00:00Z", "Estadio Azteca (Banorte)", "Ciudad de México"),
  M("k3", "K", "por", "uzb", "2026-06-23T17:00:00Z", "Estadio Mercedes-Benz", "Atlanta"),
  M("k4", "K", "col", "cod", "2026-06-24T02:00:00Z", "Estadio Akron", "Guadalajara"),
  M("k5", "K", "col", "por", "2026-06-27T23:30:00Z", "Estadio Hard Rock", "Miami"),
  M("k6", "K", "cod", "uzb", "2026-06-27T23:30:00Z", "Estadio Mercedes-Benz", "Atlanta"),
  // ---- Grupo L ----
  M("l1", "L", "eng", "cro", "2026-06-17T20:00:00Z", "Estadio AT&T", "Dallas"),
  M("l2", "L", "gha", "pan", "2026-06-17T23:00:00Z", "Estadio de Toronto", "Toronto"),
  M("l3", "L", "eng", "gha", "2026-06-23T20:00:00Z", "Estadio Gillette", "Boston"),
  M("l4", "L", "pan", "cro", "2026-06-23T23:00:00Z", "Estadio MetLife", "Nueva York / Nueva Jersey"),
  M("l5", "L", "pan", "eng", "2026-06-27T21:00:00Z", "Estadio MetLife", "Nueva York / Nueva Jersey"),
  M("l6", "L", "cro", "gha", "2026-06-27T21:00:00Z", "Estadio Lincoln Financial", "Filadelfia"),
];

// --- Sitios "dónde ver" de ejemplo (Bogotá) ---------------------------
const V = (
  id: string, name: string, neighborhood: string, address: string,
  desc: string, screens: number, promos: string,
  opts: Partial<Venue> = {}
): Venue => ({
  id, name, address, neighborhood, city: "Bogotá",
  phone: "+57 313 650 0697",
  photo_url: `https://picsum.photos/seed/mundialya-${id}/800/500`,
  description: desc, screens, promos,
  showing_match_id: opts.showing_match_id ?? null,
  is_verified: opts.is_verified ?? false,
  is_featured: opts.is_featured ?? false,
  featured_until: opts.featured_until ?? null,
  avg_rating: opts.avg_rating ?? 0,
  review_count: opts.review_count ?? 0,
  views: Math.floor(Math.random() * 200) + 20,
});

export const DEMO_VENUES: Venue[] = [
  V("v1", "Café La Tribuna", "Chapinero", "Cra 7 # 53-40",
    "Café futbolero con pantalla gigante, brunch y ambiente de estadio.",
    4, "2x1 en café durante los partidos de Colombia",
    { is_verified: true, is_featured: true, featured_until: "2026-07-19T23:59:59Z", avg_rating: 4.8, review_count: 24, showing_match_id: "k2" }),
  V("v2", "Restaurante El Estadio 93", "Parque de la 93", "Cll 93B # 12-18",
    "Parrilla y comida típica con 6 pantallas y terraza. Ideal para grupos.",
    6, "Picada mundialista para 4 por $79.900",
    { is_verified: true, is_featured: true, featured_until: "2026-07-19T23:59:59Z", avg_rating: 4.6, review_count: 18, showing_match_id: "k2" }),
  V("v3", "Plaza Gastronómica La Marca", "Usaquén", "Cll 119 # 6A-20",
    "Plaza de comidas al aire libre con pantalla LED de 5 metros. Family-friendly.",
    2, "Helado gratis para niños con camiseta de la Selección",
    { is_verified: true, avg_rating: 4.4, review_count: 11, showing_match_id: "a1" }),
  V("v4", "Café Gol Caribe", "Cedritos", "Cll 140 # 13-25",
    "Café costeño: arepa e' huevo, jugos naturales y todos los partidos.",
    3, "Combo arepa + jugo a $12.000 en partidos de la jornada",
    { is_verified: true, avg_rating: 4.2, review_count: 9 }),
  V("v5", "Terraza Mundialista", "Modelia", "Av. Esperanza # 75-30",
    "Terraza con asados, juegos para niños y pantalla gigante.",
    2, "Parqueadero gratis por consumo mayor a $50.000",
    { avg_rating: 4.0, review_count: 5, showing_match_id: "c1" }),
  V("v6", "Family Park El Hincha", "Salitre", "Av. 68 # 24-50",
    "Parque familiar con zona de picnic y pantalla inflable para los partidos.",
    1, "Entrada libre — reserva tu manta mundialista",
    { avg_rating: 4.5, review_count: 7 }),
];

export const DEMO_REVIEWS: VenueReview[] = [
  { id: "r1", venue_id: "v1", reviewer_name: "Camila R.", rating: 5, comment: "El mejor ambiente para ver a la Selección. Volvemos seguro.", status: "approved", ip_hash: "demo1" },
  { id: "r2", venue_id: "v1", reviewer_name: "Andrés M.", rating: 4, comment: "Buen café y pantalla gigante. Llega temprano, se llena.", status: "approved", ip_hash: "demo2" },
  { id: "r3", venue_id: "v2", reviewer_name: "Laura G.", rating: 5, comment: "La picada mundialista está brutal. Súper para el parche.", status: "approved", ip_hash: "demo3" },
  { id: "r4", venue_id: "v3", reviewer_name: "Felipe T.", rating: 4, comment: "Perfecto para ir con los niños. Ambiente familiar.", status: "pending", ip_hash: "demo4" },
];

// --- Encuestas, banners y popups demo ---------------------------------
export const DEMO_POLLS: Poll[] = [
  { id: "p-global", match_id: null, question: "¿Quién será campeón del Mundial 2026?", options: ["Argentina", "Brasil", "Francia", "España", "Colombia", "Otro"] },
  { id: "p-a1", match_id: "a1", question: "¿Quién gana?", options: ["México", "Empate", "Sudáfrica"] },
  { id: "p-k2", match_id: "k2", question: "¿Quién gana?", options: ["Uzbekistán", "Empate", "Colombia"] },
];

export const DEMO_VOTES: Vote[] = [
  ...Array.from({ length: 42 }, (_, i): Vote => ({ id: `dv${i}`, poll_id: "p-k2", option_index: i < 4 ? 0 : i < 10 ? 1 : 2, ip_hash: `seed${i}` })),
  ...Array.from({ length: 25 }, (_, i): Vote => ({ id: `gv${i}`, poll_id: "p-global", option_index: i % 6, ip_hash: `gseed${i}` })),
];

export const DEMO_BANNERS: Banner[] = [
  { id: "b1", title: "Tu marca aquí — patrocina MundialYa", image_url: null, link: "/metricas", placement: "home_top", active: true, starts_at: null, ends_at: null, priority: 1 },
  { id: "b2", title: "Espacio disponible para patrocinador", image_url: null, link: "/metricas", placement: "match", active: true, starts_at: null, ends_at: null, priority: 1 },
];

export const DEMO_POPUPS: Popup[] = [
  { id: "pop1", title: "⚽ ¡Arranca el Mundial!", body: "Colombia debuta el 17 de junio contra Uzbekistán. Crea tu polla, predice los marcadores y reta a tu parche antes del pitazo.", image_url: null, link: "/polla", active: true, starts_at: null, ends_at: null, frequency_hours: 12 },
];

// --- Liga global demo con tabla de líderes ----------------------------
export const DEMO_LEAGUES: League[] = [
  { id: "global", name: "Polla Global MundialYa", code: "GLOBAL", owner_id: "system", is_public: true },
];

export const DEMO_MEMBERS: LeagueMember[] = [
  { id: "lm1", league_id: "global", user_id: "u-demo1", display_name: "Juancho10", total_points: 0 },
  { id: "lm2", league_id: "global", user_id: "u-demo2", display_name: "LaPilarica", total_points: 0 },
  { id: "lm3", league_id: "global", user_id: "u-demo3", display_name: "ElProfe", total_points: 0 },
];

export const DEMO_PREDICTIONS: Prediction[] = [];
