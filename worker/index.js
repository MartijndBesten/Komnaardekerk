// Cloudflare Worker: serveert dist/ (static assets) en behandelt alleen POST /api/contact.
// Het formulier staat pas aan als CONTACT_AAN = "ja" én de mailbinding is ingesteld.
// Zie README.md → 'Contactformulier aanzetten'.

import { EmailMessage } from 'cloudflare:email';
import { verwerk } from './verwerk.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact') {
      return verwerk(request, env, {
        maakMail: (van, aan, raw) => new EmailMessage(van, aan, raw)
      });
    }
    return env.ASSETS.fetch(request);
  }
};
