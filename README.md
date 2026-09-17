# Countries Quiz

Kvíz na vlajky a hlavné mestá: výber regiónu, najviac 20 neopakujúcich sa otázok, štyri odpovede a 10 sekúnd na otázku. Pôvodný tmavý vzhľad zostal zachovaný.

## Spustenie

Použi **Node.js 24 LTS** (`nvm use`), prípadne Node 22.19+.

```sh
npm ci
cp .env.example .env
```

Vytvor si vlastný kľúč v [REST Countries](https://restcountries.com/sign-up), vyber plán **Free** a doplň ho do `.env`:

```dotenv
NUXT_REST_COUNTRIES_API_KEY=tvoj_kluc
```

```sh
npm run dev
```

Otvor [localhost:3000](http://localhost:3000). Po zmene `.env` reštartuj server. Kľúč je súkromná serverová konfigurácia; nikdy ho nedávaj do `NUXT_PUBLIC_*`, frontendu alebo Gitu. `.env` je ignorovaný Gitom. Bez platného kľúča aplikácia zobrazí chybu a nespustí hru.

## REST Countries v5 a spotreba požiadaviek

- Serverový endpoint `GET /api/countries` načíta `https://api.restcountries.com/countries/v5` s hlavičkou `Authorization: Bearer …`.
- Načíta všetky stránky po 100 záznamov a iba potrebné polia. Pre približne 250 krajín sú to **3 požiadavky na celé načítanie**.
- V5 obsahuje aj územia bez ISO alpha-2 kódu. Tieto záznamy kvíz preskočí; stránkovanie sa stále riadi počtom všetkých záznamov v odpovedi. Chýbajúce hlavné mesto vylúči krajinu iba z režimu hlavných miest.
- Úspešný výsledok sa zdieľa v Nitro cache na **24 hodín**. Regióny a otázky sa vyberajú lokálne; ďalšia hra nevolá externé API.
- Pri jednej priebežne bežiacej serverovej inštancii to znamená približne **90 požiadaviek mesačne**, ak sa dáta obnovujú denne. Reštarty, nové nasadenia alebo viaceré/serverless inštancie môžu spotrebu zvýšiť: predvolená produkčná cache je v pamäti procesu. Pri väčšej prevádzke nakonfiguruj zdieľané trvalé Nitro úložisko pre `cache`.
- HTTP chyby, neúspešné JSON odpovede, neplatné dáta a chýbajúci kľúč majú viditeľné hlásenia. Chybové odpovede sa necachujú. Po expirácii cache sa prípadný výpadok zobrazí používateľovi.
- Verejný demo kľúč vracia iba ukážku jedného štátu, preto ho aplikácia nepoužíva ako náhradu plného datasetu.
- Obrázky vlajok sa načítavajú z CDN. Pri chybe sa dajú načítať znovu; časovač čaká na pripravenú vlajku.

Podmienky plánu skontroluj vo svojom účte: [dokumentácia a limity](https://restcountries.com/docs). Kód nemení plán účtu ani nekupuje platené služby.

## Overenie

```sh
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Jednotkové testy pokrývajú v5 normalizáciu, stránkovanie a chyby, výber otázok, bodovanie, časový limit aj čistenie časovačov. Playwright overuje desktop a mobil: chybu a opakovanie načítania, celý 20-otázkový kvíz, chybu obrázka a vypršanie času. Testy používajú kontrolované odpovede a nepotrebujú osobný API kľúč ani nespotrebúvajú kvótu.

## Produkcia

```sh
npm run build
# Nastav NUXT_REST_COUNTRIES_API_KEY v prostredí svojho hostingu.
npm start
```

Použi hosting s podporou **Nuxt/Nitro servera** (Node.js alebo kompatibilný serverless preset). Samotný statický hosting nestačí: server musí bezpečne držať API kľúč a vykonávať požiadavky. `npm start` automaticky nenačíta `.env`; pre lokálne overenie produkcie môžeš použiť `node --env-file=.env .output/server/index.mjs` alebo `npm run preview`.

## Štruktúra

- `app/app.vue` – nastavenia hry, otázky, skóre a chybové stavy.
- `app/components/QuizClue.vue` – načítanie vlajky alebo hlavného mesta.
- `app/composables/useQuiz.ts` – reaktívny stav hry a časovač.
- `app/utils/quiz.ts` – miešanie a generovanie otázok bez opakovaní.
- `server/utils/countries.ts` – overenie a normalizácia odpovedí v5.
- `server/api/countries.get.ts` – serverový endpoint s cache.
- `shared/types/country.ts` – spoločný dátový model.

Nuxt 4, Vue 3 a Tailwind 4 cez Vite plugin. TypeScript je na verzii 5.9, ktorá je kompatibilná s `vue-tsc` 3; TypeScript 7 zatiaľ s touto kontrolou Vue typov nefunguje.
