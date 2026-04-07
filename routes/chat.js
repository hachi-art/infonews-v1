// ============================================================
// routes/chat.js — Globe-Guide IA (Anthropic Claude)
// POST /api/chat  { messages, currentPage, lang }
// ============================================================
const express = require('express');
const router  = express.Router();

const GLOBE_GUIDE_SYSTEM = `TU ES LE GLOBE-GUIDE, L'ASSISTANT OFFICIEL DE INFONEWS.DAY.

RÔLE ET MISSION :
Tu es un analyste neutre, un traducteur et un guide de navigation. Ton but est d'aider l'utilisateur à décrypter les flux mondiaux (News, Bourses, Archives, Science, Musique, Sport) sans jamais prendre parti.

RÈGLES IMPÉRATIVES (ZERO DATA & PRIVACY) :
- Ne demande JAMAIS le nom, l'e-mail, ou la localisation précise de l'utilisateur.
- Tu parles à un citoyen anonyme. Traite-le avec respect, objectivité et concision.
- N'invente jamais d'informations. Si tu ne sais pas, dis : "Cette donnée n'est pas disponible dans les flux actuels de infonews.day."
- L'historique de conversation n'est JAMAIS stocké côté serveur. Session uniquement.

FONCTIONNALITÉS SPÉCIFIQUES :

Cross-Check : Si l'utilisateur pose une question géopolitique, donne TOUJOURS :
  • Perspective Occidentale (Reuters/AP/AFP/BBC)
  • Perspective Non-Occidentale (TASS ⚠️/Xinhua ⚠️/Al Jazeera)
  Rappelle que TASS et Xinhua sont des médias d'État — signale-le systématiquement.

Synthèse : Si on te demande de résumer un rapport (CIA, OMS, ONU, FMI, Banque Mondiale), fais-le sous forme de 3 à 5 points clés en liste à puces, factuellement.

Navigation : Si l'utilisateur cherche un sujet, indique-lui dans quel Pôle il doit se rendre :
  - Pôle 1 WORLD PULSE : Accueil, Globe 3D, Alertes mondiales, Organisations
  - Pôle 2 ÉCO & POUVOIR : Marchés, Matières premières, Institutions (FED/BCE/FMI), Géopolitique
  - Pôle 3 NEWSROOM : Agences Occident, Orient/Asie, Moyen-Orient, Afrique/LatAm, Éditorial IA, Cross-Check, Archives
  - Pôle 4 SCREEN & STREAM : Cinéma, Sport, Culture & Agenda, Gaming, Art
  - Pôle 5 TECH & TERRE : GAFAM/IA, Cybersécurité, Espace & Océans, Science, Météo, Santé, Droits, Environnement
  - Pôle 6 MUSIC PRO : Streaming public, DJ Pro (Beatport/Traxsource), Radios du Monde, Droits (SACEM/BMI), Littérature
  - Pôle 7 SOCIAL & LAB : Social Pulse (X/Instagram/TikTok/Reddit), Hub Débat, WorldMood, Tendances, Podcasts, Transparence

TON : Professionnel, journalistique, direct et sans fioritures émotionnelles. Réponses courtes (max 3 paragraphes). Utilise le français par défaut, adapte selon la langue détectée.`;

// ── Fallback local intelligent ────────────────────────────────
const NAVIGATION_MAP = {
  'marché|bourse|action|indice|s&p|nasdaq|nikkei|cac|dax|finance': { pole: 'Pôle 2 — Éco & Pouvoir', slide: 'marches' },
  'or|pétrole|lithium|blé|gaz|matière|commodity|commodit': { pole: 'Pôle 2 — Éco & Pouvoir', slide: 'matieres' },
  'fed|bce|fmi|banque mondiale|imf|ocde|ndb|bad|institution': { pole: 'Pôle 2 — Éco & Pouvoir', slide: 'institutions' },
  'cia|onu|foia|wikileaks|sipri|géopolit|conflit|guerre': { pole: 'Pôle 2 — Éco & Pouvoir', slide: 'geopolitique' },
  'bbc|reuters|ap|afp|cnn|occident|occidental': { pole: 'Pôle 3 — Newsroom', slide: 'occident' },
  'xinhua|tass|nhk|yonhap|chine|russie|asie|orient': { pole: 'Pôle 3 — Newsroom', slide: 'orient' },
  'al jazeera|trt|anadolu|moyen.orient|israel|palestine|iran': { pole: 'Pôle 3 — Newsroom', slide: 'moyen-orient-media' },
  'afrique|latam|africa|telesur|mercopress|amérique latine': { pole: 'Pôle 3 — Newsroom', slide: 'afrique-media' },
  'editorial|synthèse|ia journalisme|cross.check': { pole: 'Pôle 3 — Newsroom', slide: 'editorial' },
  'cinéma|film|série|netflix|hbo|tmdb|box.office': { pole: 'Pôle 4 — Screen & Stream', slide: 'cinema' },
  'sport|foot|football|tennis|f1|nba|champion': { pole: 'Pôle 4 — Screen & Stream', slide: 'sport' },
  'gaming|jeu vidéo|game|hardware|pc|console': { pole: 'Pôle 4 — Screen & Stream', slide: 'gaming' },
  'gafam|openai|google|microsoft|apple|meta|amazon|ia|intelligence artificielle': { pole: 'Pôle 5 — Tech & Terre', slide: 'ia-gafam' },
  'cyber|hacker|faille|cve|ransomware|sécurité': { pole: 'Pôle 5 — Tech & Terre', slide: 'cyber' },
  'espace|nasa|esa|cnsa|satellite|mars|lune': { pole: 'Pôle 5 — Tech & Terre', slide: 'espace' },
  'musique|music|spotify|deezer|soundcloud|streaming': { pole: 'Pôle 6 — Music Pro', slide: 'streaming' },
  'dj|beatport|traxsource|juno|techno|house|electro': { pole: 'Pôle 6 — Music Pro', slide: 'music-dj' },
  'radio|radio garden|fm': { pole: 'Pôle 6 — Music Pro', slide: 'radios' },
  'sacem|bmi|ascap|ifpi|droit auteur|copyright|label': { pole: 'Pôle 6 — Music Pro', slide: 'music-droits' },
  'reddit|twitter|x|instagram|tiktok|social|trending': { pole: 'Pôle 7 — Social & Lab', slide: 'social' },
  'podcast|audio|épisode': { pole: 'Pôle 7 — Social & Lab', slide: 'transparence' },
  'globe|3d|satellite|carte|map': { pole: 'Pôle 1 — World Pulse', slide: 'globe-satellite' },
  'alerte|breaking|urgent|flash': { pole: 'Pôle 1 — World Pulse', slide: 'world-pulse' },
};

function buildFallbackResponse(userMessage, currentPage, lang) {
  const msg = userMessage.toLowerCase();
  const isEN = lang === 'en';
  const isES = lang === 'es';

  // Navigation check
  for (const [keywords, dest] of Object.entries(NAVIGATION_MAP)) {
    const regex = new RegExp(keywords, 'i');
    if (regex.test(msg)) {
      if (isEN) return `I recommend you head to **${dest.pole}** for this topic. Use the main navigation to access it directly.`;
      if (isES) return `Te recomiendo ir a **${dest.pole}** para este tema. Usa la navegación principal para acceder directamente.`;
      return `Je te recommande de consulter **${dest.pole}** pour ce sujet. Utilise la navigation principale pour y accéder directement.`;
    }
  }

  // Questions about infonews
  if (/infonews|site|comment|fonctionne|source/i.test(msg)) {
    if (isEN) return `**infonews.day** is an independent OSINT hub with 7 poles and 25 pages. Sources include Reuters, BBC, Al Jazeera, TASS ⚠️, Xinhua ⚠️, NASA, ESA, Beatport and 100+ APIs. No cookies, no tracking — RGPD Zero Data.`;
    if (isES) return `**infonews.day** es un hub OSINT independiente con 7 polos y 25 páginas. Fuentes: Reuters, BBC, Al Jazeera, TASS ⚠️, Xinhua ⚠️, NASA, ESA, Beatport y +100 APIs. Sin cookies ni rastreo — RGPD Zero Data.`;
    return `**infonews.day** est un hub OSINT indépendant avec 7 pôles et 25 pages. Sources : Reuters, BBC, Al Jazeera, TASS ⚠️, Xinhua ⚠️, NASA, ESA, Beatport et 100+ APIs. Aucun cookie, aucun tracker — RGPD Zero Data.`;
  }

  // Cross-check request
  if (/cross.check|perspective|point de vue|opinion|bias|biais/i.test(msg)) {
    if (isEN) return `**Cross-Check methodology:** On any geopolitical event, infonews.day shows two perspectives:\n• **Western** (Reuters/AP/AFP/BBC) — editorial independence, based in Europe/USA\n• **Non-Western** (TASS ⚠️/Xinhua ⚠️/Al Jazeera) — state-controlled or alternative viewpoints\nTASS and Xinhua are always flagged as state media.`;
    return `**Méthode Cross-Check :** Sur tout événement géopolitique, infonews.day présente deux perspectives :\n• **Occidentale** (Reuters/AP/AFP/BBC) — indépendance éditoriale, basés en Europe/USA\n• **Non-occidentale** (TASS ⚠️/Xinhua ⚠️/Al Jazeera) — médias d'État ou alternatives\nTASS et Xinhua sont toujours signalés comme médias d'État.`;
  }

  // Default guidance
  if (isEN) return `I'm the Globe-Guide, your navigator for **infonews.day** (7 poles, 25 pages). Ask me about a topic (markets, geopolitics, cinema, music, space...) and I'll direct you to the right section. Full AI mode activates once the API key is configured.`;
  if (isES) return `Soy el Globe-Guide, tu navegador en **infonews.day** (7 polos, 25 páginas). Pregúntame sobre cualquier tema (mercados, geopolítica, cine, música, espacio...) y te dirigiré a la sección correcta. El modo IA completo se activa con la clave API configurada.`;
  return `Je suis le Globe-Guide, ton navigateur sur **infonews.day** (7 pôles, 25 pages). Pose-moi une question sur un sujet (marchés, géopolitique, cinéma, musique, espace...) et je t'oriente vers la bonne section. Le mode IA complet s'active une fois la clé API configurée.`;
}

router.post('/', async (req, res) => {
  try {
    const { messages = [], currentPage = 'infonews.day', lang = 'fr' } = req.body;

    // ── Fallback local si pas de clé ─────────────────────────
    if (!process.env.ANTHROPIC_API_KEY) {
      const lastUser = [...messages].reverse().find(m => m.role === 'user');
      const text = buildFallbackResponse(lastUser?.content || '', currentPage, lang);

      // Simuler un stream SSE pour la cohérence du client
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      // Envoyer mot par mot pour l'effet streaming
      const words = text.split(' ');
      for (const word of words) {
        res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
        await new Promise(r => setTimeout(r, 30));
      }
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    // ── Mode IA réel (Anthropic Claude) ───────────────────────
    let Anthropic;
    try {
      Anthropic = require('@anthropic-ai/sdk');
    } catch {
      return res.status(503).json({ error: '@anthropic-ai/sdk non installé' });
    }

    const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });

    const systemWithContext = `${GLOBE_GUIDE_SYSTEM}

CONTEXTE ACTIF : L'utilisateur se trouve sur "${currentPage}".
Si sa question est directement liée à cette section, réponds précisément dans ce contexte.
Langue détectée de l'interface : ${lang}.`;

    const formattedMessages = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }));

    if (formattedMessages.length === 0) {
      return res.status(400).json({ error: 'Aucun message fourni' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const stream = await client.messages.stream({
      model:      'claude-3-5-haiku-20241022',
      max_tokens: 600,
      system:     systemWithContext,
      messages:   formattedMessages,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (err) {
    console.error('[Globe-Guide] Erreur IA:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erreur Globe-Guide', detail: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

module.exports = router;
