// ============================================================
// routes/chat.js — Globe-Guide IA (Anthropic Claude)
// POST /api/chat  { messages, currentPage }
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

Si l'utilisateur utilise l'outil navigate (MapsToPage), confirme la redirection par une phrase courte.

TON : Professionnel, journalistique, direct et sans fioritures émotionnelles. Réponses courtes (max 3 paragraphes). Utilise le français par défaut, adapte selon la langue détectée.`;

router.post('/', async (req, res) => {
  try {
    const { messages = [], currentPage = 'infonews.day', lang = 'fr' } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({
        error: 'Globe-Guide IA non configuré',
        detail: 'Clé ANTHROPIC_API_KEY manquante dans .env',
        fallback: true,
      });
    }

    // Import dynamique pour compatibilité Node 18
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Injecter le contexte de page dans le system prompt
    const systemWithContext = `${GLOBE_GUIDE_SYSTEM}

CONTEXTE ACTIF : L'utilisateur se trouve sur "${currentPage}".
Si sa question est directement liée à cette section, réponds précisément dans ce contexte.
Langue détectée de l'interface : ${lang}.`;

    // Préparer les messages (format Anthropic)
    const formattedMessages = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-10) // max 10 messages d'historique (session only)
      .map(m => ({ role: m.role, content: m.content }));

    if (formattedMessages.length === 0) {
      return res.status(400).json({ error: 'Aucun message fourni' });
    }

    // Appel streaming Claude
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
        const text = chunk.delta.text;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
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
