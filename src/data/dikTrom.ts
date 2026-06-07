// Auto-extracted from the Dik Trom A2 reader prototype. Lesson content unchanged.
// Modern-Dutch rephrasing of public-domain text (C.J. Kieviet, d.1931); 1899 phrasing preserved in notes.
import type { BookMeta, Page } from "./schema";

export const BOOK_META: BookMeta = {
  title: "Uit het leven van Dik Trom",
  author: "C. Joh. Kieviet",
  language: "nl-NL",
  source: "Based on Project Gutenberg #29712 (1899). Modern Dutch rephrasing for A2 learners; original 1899 phrasing preserved in notes.",
  chapters: [
    { number: 1, title: "Dirk wordt geboren en krijgt een naam" },
    { number: 2, title: "Dirk en de kraamverzorgster worden kwade vrienden" },
    { number: 3, title: "Dirk begint te kruipen en kattenkwaad te doen" },
    { number: 4, title: "Dirk wordt in dubbele zin dik" },
    { number: 5, title: "Dik ondergaat een gedaanteverwisseling" },
    { number: 6, title: "Hoe Dik uit varen ging" },
    { number: 7, title: "Dik gaat naar school" },
    { number: 8, title: "Dik en de juffrouw" },
    { number: 9, title: "Dik en de heks van de Achterweg" },
    { number: 10, title: "Een eerzame weduwe en een zeldzame ezel" },
    { number: 11, title: "Hoe Dik kwaad deed, en Bruin er een pak slaag voor kreeg" },
    { number: 12, title: "Flipsen wordt nog bozer" },
    { number: 13, title: "Boontje komt om zijn loontje" },
    { number: 14, title: "Hoe Dik op vrije voeten geraakte en een goed besluit nam" },
    { number: 15, title: "Paarden en ezels" },
    { number: 16, title: "Hoe Dik de heks vooruit hielp" },
    { number: 17, title: "Een ongeluk komt zelden alleen" },
    { number: 18, title: "Het slot van de geschiedenis" },
  ],
};

export const BOOK_PAGES: Page[] = [
  {
    page: 1,
    chapter: 1,
    title: "Hoofdstuk 1 — Dirk wordt geboren en krijgt een naam",
    paragraphs: [
      [
        {
          id: "p1-s1",
          dutch: "Moeder was ziek.",
          english: "Mother was ill.",
          words: [
            { nl: "Moeder", en: "Mother (capitalised — used like a name)" },
            { nl: "was", en: "was — past of zijn" },
            { nl: "ziek", en: "ill, sick" },
          ],
          notes: [
            {
              title: "Family roles as names",
              body: "Dutch capitalises 'Moeder' / 'Vader' when used as a stand-in for a parent's name — like English 'Mom' / 'Dad'. With an article ('de moeder van Dik') it stays lowercase.",
            },
            {
              title: "Past tense of 'zijn'",
              body: "Most-used past forms: ik/hij/zij was, wij/jullie/zij waren. 'Was' here is the simple past — Dutch storytelling uses simple past freely, while spoken Dutch tends to prefer the perfect ('ben geweest').",
            },
          ],
        },
        {
          id: "p1-s2",
          dutch: "Ze had al vier dagen hoge koorts en moest in bed blijven.",
          english: "She had had a high fever for four days and had to stay in bed.",
          words: [
            { nl: "ze", en: "she" },
            { nl: "had", en: "had — past of hebben" },
            { nl: "al vier dagen", en: "for four days now" },
            { nl: "hoge koorts", en: "high fever" },
            { nl: "moest", en: "had to — past of moeten" },
            { nl: "in bed blijven", en: "to stay in bed" },
          ],
          notes: [
            {
              title: "'al' for ongoing duration",
              body: "'Al vier dagen' = 'for four days now' (still going on). Pattern: 'al + [time period]' for something that started in the past and continues. 'Ik woon al tien jaar in Haarlem' = 'I've lived in Haarlem for ten years (and still do).'",
            },
            {
              title: "koorts (singular) hebben",
              body: "Modern Dutch uses 'koorts' as an uncountable noun — you say 'hoge koorts hebben', not '*koortsen hebben'. Like English 'fever', not 'fevers' for one illness.",
            },
            {
              title: "Modal in past: 'moest'",
              body: "Past forms of moeten: ik/hij moest, wij moesten. Modal verbs put their main verb at the end as an infinitive: 'ze moest in bed blijven' — moest in second position, 'blijven' at the end.",
            },
            {
              title: "Origineel (1899)",
              body: "The 1899 text used 'sedert' (older 'sinds'), 'hevige koortsen' (plural fevers), and a relative clause 'die haar dwongen het bed te houden' (that forced her to keep to bed). Modern Dutch is shorter and more direct.",
            },
          ],
        },
        {
          id: "p1-s3",
          dutch:
            "Maar hoe ziek ze ook was, haar hart bonsde van blijdschap. Vanmorgen was haar grootste wens uitgekomen: ze had een zoon gekregen.",
          english:
            "But however ill she was, her heart was pounding with joy. That morning her greatest wish had come true: she had a son.",
          words: [
            { nl: "maar", en: "but" },
            { nl: "hoe ziek ze ook was", en: "however ill she was" },
            { nl: "haar hart bonsde", en: "her heart was pounding" },
            { nl: "van blijdschap", en: "with joy" },
            { nl: "vanmorgen", en: "that/this morning" },
            { nl: "haar grootste wens", en: "her greatest wish" },
            { nl: "was uitgekomen", en: "had come true (past perfect of uitkomen)" },
            { nl: "had gekregen", en: "had gotten/received (past perfect of krijgen)" },
            { nl: "een zoon", en: "a son" },
          ],
          notes: [
            {
              title: "Concessive 'hoe … ook'",
              body: "'Hoe + adjective + ook' = 'however + adjective': hoe ziek ook (however ill), hoe moe ook (however tired), hoe duur ook (however expensive). The verb sits at the end of this clause: 'hoe ziek ze ook was'.",
            },
            {
              title: "uitkomen — to come true",
              body: "'Een wens komt uit' = a wish comes true. Separable verb: in main clauses 'uit' goes to the end ('mijn wens kwam uit'), in subordinate clauses or perfect tenses it sticks together ('mijn wens is uitgekomen').",
            },
            {
              title: "Time words with 'van-'",
              body: "vanmorgen (this morning), vanmiddag (this afternoon), vanavond (tonight), vannacht (last night/tonight). One word, single slot in the sentence.",
            },
            {
              title: "Origineel (1899)",
              body: "The 1899 text opened with 'Doch' (modern: maar), used the archaic dative 'dezen morgen' (modern: vanmorgen), 'wensch' (modern: wens), and the literary 'geschonken' (formally 'bestowed', modern everyday: gekregen).",
            },
          ],
        },
      ],
      [
        {
          id: "p1-s4",
          dutch:
            "Haar man wist nog niet wat voor geluk hij had, want hij werkte ver van huis en kwam meestal pas 's avonds laat thuis.",
          english:
            "Her husband didn't yet know how lucky he was, for he worked far from home and usually only got home late in the evening.",
          words: [
            { nl: "haar man", en: "her husband" },
            { nl: "wist", en: "knew — past of weten" },
            { nl: "nog niet", en: "not yet" },
            { nl: "wat voor geluk", en: "what (kind of) luck" },
            { nl: "hij had", en: "he had" },
            { nl: "want", en: "for, because (coordinating)" },
            { nl: "werkte", en: "worked" },
            { nl: "ver van huis", en: "far from home" },
            { nl: "meestal", en: "usually, mostly" },
            { nl: "pas", en: "only (not until)" },
            { nl: "'s avonds laat", en: "late in the evening" },
            { nl: "thuis", en: "home (location)" },
          ],
          notes: [
            {
              title: "weten vs. kennen",
              body: "'Wist' is past of weten — to know a fact. 'Kennen' would be wrong here (that's for people/places you're acquainted with). Test: 'weet je dat…' (did you know that…) vs. 'ken je hem?' (do you know him?).",
            },
            {
              title: "'pas' for 'not until'",
              body: "'Pas' here = 'only / not until'. 'Hij kwam pas 's avonds laat thuis' = he didn't get home until late at night. Different from 'pas' meaning 'just/recently' ('ik ben pas aangekomen' — I just arrived).",
            },
            {
              title: "Frozen genitive: 's avonds",
              body: "'s avonds, 's morgens, 's middags, 's nachts — leftover Dutch genitive forms meaning 'in the evening/morning/afternoon/night'. The 's is a contraction of 'des'. Treat them as fixed expressions.",
            },
            {
              title: "want — coordinating 'because'",
              body: "Both 'want' and 'omdat' mean 'because'. 'Want' is coordinating — word order stays normal (subject + verb). 'Omdat' is subordinating — pushes the verb to the end. '…want hij werkte ver' (V2 normal) vs. '…omdat hij ver werkte' (verb at end).",
            },
            {
              title: "Origineel (1899)",
              body: "The 1899 sentence packed in 'welk groot geluk hem te beurt was gevallen' (idiom: 'what great fortune had befallen him'), the archaic 'op grooten afstand van zijne woning', and 'reeds laat in den avond'. Same idea, more formal era.",
            },
          ],
        },
        {
          id: "p1-s5",
          dutch:
            "Maar vandaag verwachtte ze hem eerder, want ze had iemand gestuurd om hem het grote nieuws te vertellen.",
          english:
            "But today she expected him earlier, for she had sent someone to tell him the great news.",
          words: [
            { nl: "maar vandaag", en: "but today" },
            { nl: "verwachtte", en: "expected — past of verwachten" },
            { nl: "eerder", en: "earlier" },
            { nl: "had gestuurd", en: "had sent — past perfect of sturen" },
            { nl: "iemand", en: "someone" },
            { nl: "om … te vertellen", en: "in order to tell" },
            { nl: "het grote nieuws", en: "the great news" },
          ],
          notes: [
            {
              title: "V2 inversion (very common)",
              body: "'Maar vandaag' opens the sentence, so the verb 'verwachtte' takes second position and the subject 'ze' moves after it. Pattern: [opener] — [verb] — [subject] — [rest]. Once you internalise this, half of Dutch word order falls into place.",
            },
            {
              title: "Purpose clause: 'om … te + infinitive'",
              body: "'Om hem het nieuws te vertellen' = 'in order to tell him the news'. Pattern: 'om' opens the clause, the infinitive with 'te' goes at the end, everything else sits in between. Common in everyday Dutch: 'Ik ga naar de winkel om brood te kopen'.",
            },
            {
              title: "sturen — regular and useful",
              body: "Sturen is the everyday verb for 'to send' — regular: stuur, stuurde, gestuurd. Use it for messages, people, packages. The more formal/literary 'zenden' (zond, gezonden) survives mostly in fixed expressions like 'uitzenden' (to broadcast).",
            },
            {
              title: "Origineel (1899)",
              body: "The 1899 text used 'evenwel' (formal: however), 'een bode gezonden' (a messenger sent — old vocabulary), and the separable 'mede te deelen' (modern: meedelen / vertellen). The contemporary version uses everyday verbs only.",
            },
          ],
        },
      ],
    ],
  },
  {
    page: 2,
    chapter: 1,
    title: "Hoofdstuk 1 (vervolg) — De buurvrouw komt kijken",
    paragraphs: [
      [
        {
          id: "p2-s1",
          dutch: "Daar ging de deur open.",
          english: "There the door opened.",
          words: [
            { nl: "daar", en: "there" },
            { nl: "ging open", en: "opened — past of opengaan" },
            { nl: "de deur", en: "the door" },
          ],
          notes: [
            {
              title: "Separable verb: opengaan",
              body: "'Opengaan' = to open (intransitive — for things that open by themselves or where you don't say who did it). Splits in main clauses: 'de deur ging open'. Compare 'openmaken' (transitive — to open something): 'ze maakte de deur open'.",
            },
            {
              title: "V2 with 'daar'",
              body: "'Daar' opens the sentence, so the verb 'ging' takes second position and the subject 'de deur' follows. Storytelling shortcut — 'daar' here means 'at that moment' rather than physical 'there'.",
            },
          ],
        },
        {
          id: "p2-s2",
          dutch: "Zou hij het zijn?",
          english: "Could it be him?",
          words: [
            { nl: "zou", en: "would — past of zullen" },
            { nl: "hij", en: "he" },
            { nl: "het", en: "it" },
            { nl: "zijn", en: "to be" },
          ],
          notes: [
            {
              title: "'zou' for speculation",
              body: "Past form of 'zullen', used for speculation or uncertainty. 'Zou hij het zijn?' = 'could it be him?' / 'might that be him?'. Same use as English 'would' in 'would that be...?'. Very common in everyday Dutch.",
            },
            {
              title: "Question word order",
              body: "Yes/no questions invert: verb first, subject second. 'Zou hij het zijn?' not 'Hij zou het zijn?' (which would be a statement).",
            },
          ],
        },
        {
          id: "p2-s3",
          dutch:
            "Nee, het was een buurvrouw die even naar de baby kwam kijken.",
          english:
            "No, it was a neighbour who had come to take a look at the baby.",
          words: [
            { nl: "nee", en: "no" },
            { nl: "een buurvrouw", en: "a (female) neighbour" },
            { nl: "die", en: "who (relative pronoun)" },
            { nl: "even", en: "for a moment, briefly" },
            { nl: "de baby", en: "the baby" },
            { nl: "kwam kijken", en: "came to look (komen + bare infinitive)" },
          ],
          notes: [
            {
              title: "buurvrouw / buurman / buren",
              body: "Buurvrouw = female neighbour, buurman = male neighbour, de buren = the neighbours (plural, mixed/unspecified). Same -vrouw / -man pattern: vakvrouw/vakman (specialist), zakenvrouw/zakenman (businessperson).",
            },
            {
              title: "'even' — softening particle",
              body: "'Even' (or its diminutive 'eventjes') means 'briefly / just / for a moment'. Softens any action: 'kom even' (come for a sec), 'wacht even' (just wait), 'ik kijk even' (I'll just take a look). One of the small words that make Dutch sound natural.",
            },
            {
              title: "komen + infinitive (no 'te')",
              body: "'Ze kwam kijken' = she came to look. With verbs of motion (komen, gaan), the second verb is a bare infinitive (no 'te'): 'ik ga eten' (I'm going to eat), 'hij komt helpen' (he's coming to help). Different from 'om … te' purpose clauses.",
            },
            {
              title: "Origineel (1899)",
              body: "The original used 'eene buurvrouw' (extra -e on the article) and 'eens even naar den kleine kwam zien'. 'Den kleine' = 'the little one' in old dative; modern Dutch would say 'de kleine' or just 'de baby'. 'Zien' (to see) is replaced here by 'kijken' (to look) — both work but 'kijken' is more natural for this action.",
            },
          ],
        },
      ],
      [
        {
          id: "p2-s4",
          dutch:
            "De kraamverzorgster haalde hem uit de wieg en liet hem aan de buurvrouw zien.",
          english:
            "The maternity nurse lifted him out of the cradle and showed him to the neighbour.",
          words: [
            { nl: "de kraamverzorgster", en: "the maternity nurse (modern term)" },
            { nl: "haalde", en: "took, lifted — past of halen" },
            { nl: "uit de wieg", en: "out of the cradle" },
            { nl: "liet zien", en: "showed (laten + zien)" },
            { nl: "aan de buurvrouw", en: "to the neighbour" },
          ],
          notes: [
            {
              title: "kraamverzorgster — modern role",
              body: "In Kieviet's day this was 'de baker' — a woman who came to the home for the first 8-10 days after birth to care for mother and baby. The modern equivalent in NL is 'kraamverzorgster' (or 'kraamzorg' for the service). The role still exists; it's a quintessentially Dutch part of postnatal care.",
            },
            {
              title: "laten zien — to show",
              body: "Literally 'to let see' = to show. 'Iemand iets laten zien' = to show someone something. Common pattern: 'laten + bare infinitive'. Other useful ones: 'laten weten' (let know), 'laten vallen' (drop, let fall), 'laten staan' (leave standing).",
            },
            {
              title: "halen — versatile verb",
              body: "'Halen' covers a lot: fetch, get, pick up, take out. Regular: haal, haalde, gehaald. 'Brood halen' (get bread), 'iemand halen van het station' (pick someone up from the station), 'goede cijfers halen' (get good grades).",
            },
            {
              title: "Origineel (1899)",
              body: "Kieviet used 'de baker' throughout. We're swapping in 'kraamverzorgster' to make the role recognisable to a modern reader and learner — same function, current word.",
            },
          ],
        },
        {
          id: "p2-s5",
          dutch:
            "Maar zodra die hem zag, sloeg ze van verbazing haar handen in elkaar en riep uit:",
          english:
            "But as soon as she saw him, she clapped her hands together in amazement and exclaimed:",
          words: [
            { nl: "maar", en: "but" },
            { nl: "zodra", en: "as soon as" },
            { nl: "die", en: "she (referring back to buurvrouw)" },
            { nl: "zag", en: "saw — past of zien" },
            { nl: "sloeg", en: "struck, clapped — past of slaan" },
            { nl: "van verbazing", en: "in/from amazement" },
            { nl: "haar handen in elkaar", en: "her hands together" },
            { nl: "riep uit", en: "exclaimed (separable: uitroepen)" },
          ],
          notes: [
            {
              title: "'zodra' — subordinator",
              body: "'Zodra' = as soon as. It's subordinating, so the verb goes to the end of its clause: 'zodra die hem zag' (as soon as she saw him). Then the main clause inverts: '…sloeg ze…' — verb second.",
            },
            {
              title: "'die' as a pronoun",
              body: "'Die' here means 'she' — referring back to the buurvrouw. Dutch often uses 'die' (or 'dat' for het-words) instead of 'hij/zij/het' when the reference is clear from the previous sentence. Sounds natural and avoids repetition.",
            },
            {
              title: "Strong verb: slaan",
              body: "Slaan → sloeg → geslagen (to hit, strike). Past 'sloeg', past participle 'geslagen'. 'Handen in elkaar slaan' = to clap your hands together (gesture of surprise or delight).",
            },
            {
              title: "Strong verb: zien",
              body: "Zien → zag → gezien (to see). Don't confuse with 'kijken' (to look at) — 'zien' is what you do passively, 'kijken' is what you do actively.",
            },
          ],
        },
      ],
      [
        {
          id: "p2-s6",
          dutch:
            "'Wel, wel, wat een dikke jongen is dat! Zo'n dikkerd heb ik nog nooit gezien!'",
          english:
            "'Well, well, what a fat boy that is! I've never seen such a fat one!'",
          words: [
            { nl: "wel, wel", en: "well, well (exclamation)" },
            { nl: "wat een", en: "what a" },
            { nl: "dikke jongen", en: "fat boy" },
            { nl: "zo'n", en: "such a (contraction of 'zo een')" },
            { nl: "dikkerd", en: "fat one (informal noun)" },
            { nl: "nog nooit", en: "never (yet/before)" },
            { nl: "gezien", en: "seen (past part. of zien)" },
          ],
          notes: [
            {
              title: "'wat een' — exclamation",
              body: "Dutch wraps exclamations in 'wat een': 'wat een mooi huis!' (what a beautiful house!), 'wat een verhaal!' (what a story!). Same as English 'what a…!'.",
            },
            {
              title: "zo'n = zo een",
              body: "'Zo'n' is the everyday contraction of 'zo een' = 'such a'. Used before singular nouns: 'zo'n man' (such a man), 'zo'n boek' (such a book). Plural is just 'zulke': 'zulke jongens' (such boys).",
            },
            {
              title: "-erd suffix for people",
              body: "Adding -erd to an adjective makes a (slightly affectionate or teasing) noun for a person with that quality. 'Dik' → 'dikkerd' (a fatty), 'lui' → 'luierd' (lazybones), 'slim' → 'slimmerd' (smarty). Informal register.",
            },
            {
              title: "Perfect tense word order",
              body: "'Heb ik nog nooit gezien' — perfect tense (hebben + past participle). The 'gezien' goes to the end. With 'nog nooit' (never yet), this is the standard pattern: 'Ik heb dat nog nooit gedaan' (I've never done that).",
            },
            {
              title: "Origineel (1899)",
              body: "The 1899 buurvrouw exclaimed: 'Wel, wel, wat een driedubbeldikke jongen is dat! Zoo 'n dikzak heb ik nog nooit gezien! 't Is zoo waar een natuurwonder!' We've simplified slightly — 'driedubbeldik' (triple-fat) is fun but uncommon in modern Dutch; 'dikzak' is still very much used but a bit harsher than 'dikkerd'.",
            },
          ],
        },
        {
          id: "p2-s7",
          dutch:
            "'Kijk eens naar die bolle wangen, en die beentjes! Als die jongen zo doorgroeit, kan hij straks niet meer door de deur!'",
          english:
            "'Just look at those round cheeks, and those little legs! If that boy keeps growing like this, he won't fit through the door soon!'",
          words: [
            { nl: "kijk eens", en: "just look (eens softens)" },
            { nl: "naar", en: "at, toward" },
            { nl: "die bolle wangen", en: "those round cheeks" },
            { nl: "beentjes", en: "little legs (dim. of benen)" },
            { nl: "als", en: "if (conditional)" },
            { nl: "zo doorgroeit", en: "keeps growing like this" },
            { nl: "straks", en: "soon, later (today/shortly)" },
            { nl: "niet meer", en: "no longer, not anymore" },
            { nl: "door de deur", en: "through the door" },
          ],
          notes: [
            {
              title: "Diminutives in affection",
              body: "'Beentjes' = small/cute legs (from 'benen' = legs). The diminutive isn't always literal smallness — it adds warmth. Adults gushing over a baby will use diminutives constantly: handjes, voetjes, oogjes, neusje, mondje.",
            },
            {
              title: "Separable: doorgroeien",
              body: "'Doorgroeien' = to keep growing / grow on. 'Door' is the prefix that means 'through / continuing'. Same pattern in 'doorgaan' (to keep going), 'doorlezen' (read on), 'doorpraten' (talk on).",
            },
            {
              title: "'straks' vs. 'later'",
              body: "'Straks' = soon (in the next hour or so, often today). 'Later' = at some indefinite future time. 'Tot straks!' (see you in a bit) vs. 'tot later' (less common — 'tot ziens' is more usual for 'see you later').",
            },
            {
              title: "'als' for conditionals and habits",
              body: "'Als' covers both English 'if' (conditional) and 'when' (habitual/general). 'Als die jongen zo doorgroeit' = 'if/when this boy keeps growing like this'. The clause sends its verb to the end ('doorgroeit'), then the main clause inverts ('kan hij straks niet meer door de deur').",
            },
          ],
        },
        {
          id: "p2-s8",
          dutch:
            "'Ach, wat een jongen! Nou, gefeliciteerd hoor — ik wed dat je veel plezier aan hem zult beleven. En wat zal hij straks kunnen eten!'",
          english:
            "'Oh, what a boy! Well, congratulations — I bet you'll get a lot of joy out of him. And how he's going to eat!'",
          words: [
            { nl: "ach", en: "oh (interjection)" },
            { nl: "nou", en: "well (filler)" },
            { nl: "gefeliciteerd", en: "congratulations" },
            { nl: "hoor", en: "you know (sentence-final particle)" },
            { nl: "ik wed", en: "I bet" },
            { nl: "veel plezier", en: "lots of joy/fun" },
            { nl: "aan hem beleven", en: "to experience from him" },
            { nl: "zult", en: "will (formal you-form)" },
            { nl: "wat zal hij kunnen eten", en: "how he'll be able to eat" },
          ],
          notes: [
            {
              title: "'hoor' — friendly emphasis",
              body: "Untranslatable particle that ends sentences in friendly speech. Doesn't mean 'hear' here. 'Bedankt hoor!' (thanks!), 'tot morgen hoor!' (see you tomorrow!). It softens or warmly emphasises. Once you start hearing Dutch you'll notice it everywhere.",
            },
            {
              title: "gefeliciteerd",
              body: "All-purpose congratulations word. Used for birthdays, achievements, weddings, new babies. The full version is 'gefeliciteerd met...' followed by what you're congratulating about: 'gefeliciteerd met je verjaardag' (happy birthday), 'gefeliciteerd met de baby' (congrats on the baby).",
            },
            {
              title: "'plezier beleven aan'",
              body: "Idiom: 'aan iets/iemand plezier beleven' = to enjoy something/someone, to get joy out of them. Often said about kids, hobbies, or efforts that pay off. 'Ik beleef veel plezier aan mijn tuin' = my garden gives me a lot of joy.",
            },
            {
              title: "'zult' vs 'zal'",
              body: "'Zullen' (will) conjugates: ik zal, jij/u zult, hij zal, wij/jullie/zij zullen. The 'zult' here is the polite/formal you-form. In casual speech 'jij zal' is also heard, but 'jij zult' / 'u zult' is the textbook standard.",
            },
          ],
        },
      ],
    ],
  },
  {
    page: 3,
    chapter: 1,
    title: "Hoofdstuk 1 (vervolg) — De kraamverzorgster en de wieg",
    paragraphs: [
      [
        {
          id: "p3-s1",
          dutch:
            "'Of hij kan eten,' viel de kraamverzorgster in, 'daar kun je op rekenen!'",
          english:
            "'Whether he can eat — you can count on that!' the maternity nurse cut in.",
          words: [
            { nl: "of hij kan eten", en: "whether he can eat" },
            { nl: "viel in", en: "cut in, interjected (separable: invallen)" },
            { nl: "daar kun je op rekenen", en: "you can count on that" },
          ],
          notes: [
            {
              title: "'of' as confirmation",
              body: "Repeating the question with 'of' is a Dutch way to emphatically confirm: 'Of hij kan eten!' = 'Can he eat? You bet he can!'. The 'of' literally means 'whether' but the construction means 'absolutely yes'.",
            },
            {
              title: "Separable: invallen",
              body: "'Invallen' = to interject, fall in (also: to substitute, like a substitute teacher). Splits in main clauses: 'ze viel in' (she cut in). Other meanings depending on context: 'het valt me in' (it occurs to me), 'de winter valt in' (winter sets in).",
            },
            {
              title: "Pronoun adverb: daar … op",
              body: "'Daar … op rekenen' = to count on that. Dutch splits the prepositional pronoun: 'daar kun je op rekenen' (literally 'there can you on count'). Compare also 'daar weet ik niets van' (I know nothing about that), 'daar ben ik blij mee' (I'm happy with that).",
            },
          ],
        },
        {
          id: "p3-s2",
          dutch:
            "'Hij gaat als een dikke veelvraat eten — let maar op! Mijn lieve mensen, ik ben echt geschrokken van hem.'",
          english:
            "'He's going to eat like a big glutton — just watch! Goodness, I really got a fright from him.'",
          words: [
            { nl: "als een veelvraat", en: "like a glutton" },
            { nl: "let maar op", en: "just watch (imperative)" },
            { nl: "mijn lieve mensen", en: "my dear people / goodness (idiom)" },
            { nl: "echt", en: "really" },
            { nl: "ben geschrokken van", en: "got a fright from" },
          ],
          notes: [
            {
              title: "'let maar op'",
              body: "'Let op' = pay attention / watch out. Adding 'maar' makes it a softer, friendlier 'just watch / just wait and see'. The maar-as-softener pattern again — 'doe maar' (go ahead), 'kom maar' (come on then), 'zeg maar' (just say).",
            },
            {
              title: "'schrikken' — irregular and double",
              body: "'Schrikken' (to be startled / get a fright) is tricky: intransitive 'schrikken' is strong (schrok, geschrokken — 'ik ben geschrokken' = I got a fright), but the rare transitive 'doen schrikken' (to startle someone) is regular. For learning A2, just memorise: 'ik schrik / ik schrok / ik ben geschrokken'.",
            },
            {
              title: "Auxiliary 'zijn' for state changes",
              body: "Note 'ik ben geschrokken', not 'ik heb geschrokken'. Verbs of state change or motion take 'zijn' (to be) as auxiliary in the perfect: 'ik ben gegaan' (I went), 'ik ben gevallen' (I fell), 'ik ben opgestaan' (I got up). 'Schrikken' counts because it's a sudden change.",
            },
            {
              title: "Origineel (1899)",
              body: "Kieviet's nurse said: 'Hij zal den hollebollen Gijs wel nadoen, die eene koe en een kalf en een dood paard half opat.' This references 'Hollebolle Gijs' — a famous fairground figure (a giant carved head with an open mouth) where children would throw their snack wrappers. The reference is too period-specific to translate well, so we use a more general 'veelvraat' (glutton).",
            },
          ],
        },
      ],
      [
        {
          id: "p3-s3",
          dutch: "'Leg hem maar in de wieg, kraamverzorgster,' zei Moeder.",
          english: "'Just put him in the cradle, nurse,' said Mother.",
          words: [
            { nl: "leg", en: "put, lay (imperative of leggen)" },
            { nl: "in de wieg", en: "in the cradle" },
            { nl: "zei", en: "said — past of zeggen" },
          ],
          notes: [
            {
              title: "leggen vs. liggen",
              body: "Easy to confuse. 'Leggen' = to put/lay something (transitive, needs an object): 'ik leg de baby in de wieg'. 'Liggen' = to lie (intransitive): 'de baby ligt in de wieg'. English does the same dance with 'lay' / 'lie'.",
            },
            {
              title: "Imperative softened with 'maar'",
              body: "'Leg maar' — softer than just 'leg'. Same pattern as 'doe maar', 'zeg maar', 'kom maar'. Marks instruction as friendly suggestion rather than command.",
            },
          ],
        },
        {
          id: "p3-s4",
          dutch: "'Anders kan hij kou vatten.'",
          english: "'Otherwise he might catch a cold.'",
          words: [
            { nl: "anders", en: "otherwise, else" },
            { nl: "kan", en: "can, might" },
            { nl: "kou vatten", en: "to catch a cold (idiom)" },
          ],
          notes: [
            {
              title: "Idiom: kou vatten",
              body: "'Kou vatten' = to catch a cold. Literal: 'cold catch'. The 'kou' (cold, the feeling/weather) is uncountable. Don't confuse with 'verkoudheid' (a cold, the illness): 'ik heb kou gevat' (I've caught a chill) → 'ik heb een verkoudheid' (I have a cold).",
            },
            {
              title: "'kan' for possibility",
              body: "Modal 'kunnen' often means 'might/may' rather than 'be able to'. 'Hij kan kou vatten' = 'he might catch a cold' (not 'he is able to catch a cold'). Context tells you which.",
            },
          ],
        },
      ],
      [
        {
          id: "p3-s5",
          dutch:
            "Hij zelf zei niets — praten kon hij nog niet, en schreeuwen leek hij niet te willen.",
          english:
            "He himself said nothing — he couldn't talk yet, and he didn't seem to want to cry.",
          words: [
            { nl: "hij zelf", en: "he himself" },
            { nl: "niets", en: "nothing" },
            { nl: "praten", en: "to talk" },
            { nl: "kon", en: "could — past of kunnen" },
            { nl: "nog niet", en: "not yet" },
            { nl: "schreeuwen", en: "to scream, cry out" },
            { nl: "leek", en: "seemed — past of lijken" },
            { nl: "niet te willen", en: "not to want to" },
          ],
          notes: [
            {
              title: "'lijken' + 'te' + infinitive",
              body: "'Hij lijkt te willen' = he seems to want. Pattern: lijken + te + infinitive = 'seems to ___'. 'Het lijkt te regenen' (it seems to be raining), 'ze lijkt te slapen' (she seems to be sleeping). Strong verb: lijken → leek → geleken.",
            },
            {
              title: "Word order with infinitives",
              body: "'Praten kon hij nog niet' — fronted infinitive ('praten') for emphasis, then verb ('kon') in second position, then subject ('hij'), then rest. Dutch lets you front almost anything for emphasis as long as the verb stays in second position.",
            },
            {
              title: "schreeuwen — strong verb",
              body: "Schreeuwen → schreeuwde → geschreeuwd. Wait — that's regular! 'Schreeuwen' is actually one of the regular -en verbs. Don't be misled by the spelling. The everyday meaning is 'to scream / shout / yell loudly' — for a baby, 'huilen' (to cry) is more typical, but Kieviet uses 'schreeuwen' to emphasise that Dik isn't even doing this.",
            },
          ],
        },
        {
          id: "p3-s6",
          dutch:
            "Hij keek voor zijn leeftijd opvallend verstandig om zich heen, alsof hij zich aan de vreemde omgeving wilde wennen.",
          english:
            "He looked around remarkably intelligently for his age, as if he wanted to get used to the strange surroundings.",
          words: [
            { nl: "keek", en: "looked — past of kijken" },
            { nl: "voor zijn leeftijd", en: "for his age" },
            { nl: "opvallend", en: "remarkably, noticeably" },
            { nl: "verstandig", en: "sensible, intelligent" },
            { nl: "om zich heen", en: "around himself" },
            { nl: "alsof", en: "as if" },
            { nl: "wilde wennen", en: "wanted to get used to" },
            { nl: "vreemde omgeving", en: "strange surroundings" },
          ],
          notes: [
            {
              title: "'om zich heen kijken'",
              body: "Standard Dutch for 'to look around'. Pattern: 'om [reflexive] heen' = around oneself. The pronoun matches the subject: om me heen, om je heen, om hem/haar heen, om zich heen (3rd person reflexive).",
            },
            {
              title: "'alsof' — subordinator",
              body: "'Alsof' = as if. Subordinating, so the verb goes to the end: 'alsof hij zich wilde wennen' (as if he wanted to get used to it). With modals, the modal lands at the end ('wilde wennen' — 'wilde' before the infinitive 'wennen').",
            },
            {
              title: "wennen aan",
              body: "'Wennen aan iets' = to get used to something. Reflexive form: 'zich wennen aan' = to acclimatise oneself to. 'Ik moet eraan wennen' = I need to get used to it. The 'aan' is essential — don't forget it.",
            },
          ],
        },
      ],
    ],
  },
  {
    page: 4,
    chapter: 1,
    title: "Hoofdstuk 1 (vervolg) — Vader komt thuis",
    paragraphs: [
      [
        {
          id: "p4-s1",
          dutch:
            "De kraamverzorgster trok hem zijn nachtkleren aan — die waren al voor de helft te klein — en legde hem in de wieg, waar hij heel tevreden lag.",
          english:
            "The maternity nurse dressed him in his pajamas — half of which were already too small — and laid him in the cradle, where he lay quite contented.",
          words: [
            { nl: "trok aan", en: "put on (separable: aantrekken)" },
            { nl: "nachtkleren", en: "pajamas, nightclothes" },
            { nl: "voor de helft", en: "half (of it)" },
            { nl: "te klein", en: "too small" },
            { nl: "tevreden", en: "satisfied, contented" },
            { nl: "lag", en: "lay — past of liggen" },
          ],
          notes: [
            {
              title: "Separable: aantrekken",
              body: "'Aantrekken' = to put on (clothes). Splits in main clauses: 'hij trok zijn jas aan' (he put on his coat). Compare 'uittrekken' (take off): 'hij trok zijn jas uit'. With clothes: aantrekken (put on), uittrekken (take off), aanhebben (to be wearing).",
            },
            {
              title: "Strong verb: liggen",
              body: "Liggen → lag → gelegen (to lie/be lying). Past 'lag', past plural 'lagen'. Pairs with 'leggen' (to lay) — but they're spelled differently and conjugate differently. Worth memorising.",
            },
            {
              title: "'voor de helft'",
              body: "'Voor de helft' = half / half of it. 'Het is voor de helft af' (it's half done). 'De helft' (the half) is the noun; 'half' is the adjective. 'Een halve liter melk' (half a litre of milk) vs 'de helft van de melk' (half of the milk).",
            },
          ],
        },
        {
          id: "p4-s2",
          dutch: "Met een vergenoegd gezicht viel hij in slaap.",
          english: "With a satisfied face he fell asleep.",
          words: [
            { nl: "met", en: "with" },
            { nl: "vergenoegd", en: "pleased, contented" },
            { nl: "gezicht", en: "face" },
            { nl: "viel in slaap", en: "fell asleep (idiom: in slaap vallen)" },
          ],
          notes: [
            {
              title: "Idiom: in slaap vallen",
              body: "'In slaap vallen' = to fall asleep. Fixed expression. The opposite is 'wakker worden' (to wake up). 'Slapen' itself = to sleep (state); 'in slaap vallen' = to enter that state.",
            },
            {
              title: "vergenoegd — old-school adjective",
              body: "'Vergenoegd' (pleased, contented) is slightly bookish in modern Dutch — you'd more often hear 'tevreden' or 'blij'. Still understood and used in writing. Worth recognising.",
            },
            {
              title: "V2 with prepositional opener",
              body: "'Met een vergenoegd gezicht' opens the sentence (3 words counting as one phrase), so the verb 'viel' takes second position and the subject 'hij' follows. Same V2 pattern, regardless of how long the opener is.",
            },
          ],
        },
      ],
      [
        {
          id: "p4-s3",
          dutch: "Een poosje later kwam zijn vader thuis.",
          english: "A little while later his father came home.",
          words: [
            { nl: "een poosje", en: "a little while (dim. of poos)" },
            { nl: "later", en: "later" },
            { nl: "kwam thuis", en: "came home" },
            { nl: "zijn vader", en: "his father" },
          ],
          notes: [
            {
              title: "'een poosje' — friendly time word",
              body: "'Poos' = a while, 'poosje' = a little while (diminutive adds warmth). Common time-fillers: even (a moment), eventjes (just a moment), zo meteen (in a sec), straks (soon), een poosje (a little while), een tijdje (a while).",
            },
            {
              title: "thuiskomen — separable",
              body: "'Thuiskomen' = to come home. Splits in main clauses: 'hij komt thuis' (he comes home), 'hij kwam thuis' (he came home). In subordinate clauses it stays together: '…dat hij thuiskwam'.",
            },
          ],
        },
        {
          id: "p4-s4",
          dutch:
            "Hij was timmermansknecht bij baas Meyer, en zodra hij het grote nieuws had gehoord, was hij meteen op weg gegaan.",
          english:
            "He was a carpenter's assistant at boss Meyer's, and as soon as he had heard the great news, he had set off immediately.",
          words: [
            { nl: "timmermansknecht", en: "carpenter's assistant" },
            { nl: "bij baas Meyer", en: "at boss Meyer's place" },
            { nl: "zodra", en: "as soon as" },
            { nl: "had gehoord", en: "had heard (past perfect)" },
            { nl: "meteen", en: "immediately, right away" },
            { nl: "op weg gegaan", en: "set off, departed (idiom)" },
          ],
          notes: [
            {
              title: "Job-titles with -knecht",
              body: "'Knecht' historically meant a male servant or hired hand. In trades it became 'assistant/journeyman': timmermansknecht (carpenter's assistant), bakkersknecht (baker's assistant), boerenknecht (farmhand). Mostly historical now — modern equivalents use 'leerling' (apprentice) or 'medewerker' (employee).",
            },
            {
              title: "'op weg gaan'",
              body: "Idiom: 'op weg gaan' = to set off / get on the way. Literal: 'on way go'. Useful related expressions: 'onderweg' (on the way / en route), 'op weg naar' (on the way to), 'hij is op weg' (he's on his way).",
            },
            {
              title: "Past perfect with 'had'",
              body: "'Had gehoord' = had heard (past perfect). Used for an event before another past event: he had heard the news (first), then set off (second). Same as English. Auxiliary 'had' + past participle.",
            },
            {
              title: "meteen vs. direct vs. onmiddellijk",
              body: "All three mean 'immediately'. 'Meteen' is the everyday word — use this. 'Direct' also common, slightly more formal. 'Onmiddellijk' is most formal/strong, used for urgent commands ('kom onmiddellijk hier!').",
            },
          ],
        },
      ],
      [
        {
          id: "p4-s5",
          dutch:
            "Vol blijdschap over de geboorte van zijn zoontje stapte hij de kamer binnen, gaf zijn vrouw een kus en haastte zich naar de wieg.",
          english:
            "Full of joy over the birth of his little son, he stepped into the room, gave his wife a kiss, and hurried to the cradle.",
          words: [
            { nl: "vol blijdschap", en: "full of joy" },
            { nl: "geboorte", en: "birth" },
            { nl: "zoontje", en: "little son (diminutive)" },
            { nl: "stapte binnen", en: "stepped in (separable: binnenstappen)" },
            { nl: "gaf", en: "gave — past of geven" },
            { nl: "zijn vrouw", en: "his wife" },
            { nl: "een kus", en: "a kiss" },
            { nl: "haastte zich", en: "hurried (reflexive)" },
            { nl: "naar de wieg", en: "to the cradle" },
          ],
          notes: [
            {
              title: "Reflexive 'zich haasten'",
              body: "'Zich haasten' = to hurry. Always reflexive — you can't 'haasten' something else. 'Ik haast me, jij haast je, hij haast zich, wij haasten ons'. Useful related: 'haast' (haste / hurry), 'haastig' (hasty), 'geen haast' (no rush).",
            },
            {
              title: "Compound past actions in a row",
              body: "Three actions in sequence: 'stapte binnen, gaf … een kus, haastte zich'. All in past tense, all sharing the subject 'hij'. Dutch chains them with commas and 'en' just like English.",
            },
            {
              title: "Strong verb: geven",
              body: "Geven → gaf → gegeven (to give). Common pattern: short-vowel infinitive, long-vowel past, long-vowel past participle (geven, gaf, gegeven). Same as 'lezen' (read) → las → gelezen.",
            },
          ],
        },
      ],
    ],
  },
  {
    page: 5,
    chapter: 1,
    title: "Hoofdstuk 1 (vervolg) — Dirk krijgt zijn naam",
    paragraphs: [
      [
        {
          id: "p5-s1",
          dutch:
            "Wat was hij verbaasd toen hij zijn flinke zoon zag!",
          english:
            "How surprised he was when he saw his sturdy son!",
          words: [
            { nl: "wat", en: "how (in exclamations)" },
            { nl: "verbaasd", en: "surprised" },
            { nl: "toen", en: "when (past, single event)" },
            { nl: "flinke", en: "sturdy, hefty (positive: strapping)" },
            { nl: "zoon", en: "son" },
            { nl: "zag", en: "saw — past of zien" },
          ],
          notes: [
            {
              title: "'wat' as exclamation",
              body: "'Wat was hij verbaasd!' = How surprised he was! 'Wat' here is exclamatory, not interrogative. Pattern: 'wat + verb + subject + adjective'. Same as 'wat ben je groot geworden!' (how big you've gotten!).",
            },
            {
              title: "flink — versatile and positive",
              body: "'Flink' covers a lot of positive qualities: sturdy, sizeable, brave, considerable. 'Een flinke jongen' (a sturdy/strapping boy), 'een flinke wandeling' (a good long walk), 'wees flink!' (be brave!). Almost always positive.",
            },
            {
              title: "'toen' vs 'wanneer' vs 'als'",
              body: "Three Dutch words for English 'when'. 'Toen' = a single event in the past ('toen hij zijn zoon zag' — when he saw his son). 'Wanneer' = questions or future ('wanneer kom je?'). 'Als' = habitual or conditional present ('als ik moe ben' — when/if I'm tired).",
            },
          ],
        },
        {
          id: "p5-s2",
          dutch:
            "Toch zei hij niet veel — hij sperde zijn ogen wagenwijd open, streelde met zijn ruwe hand de dikke wangen van zijn kindje, keek de kraamverzorgster een paar seconden wezenloos aan, en… ging zijn boterham eten.",
          english:
            "Yet he didn't say much — he opened his eyes wide, stroked his little one's fat cheeks with his rough hand, stared blankly at the maternity nurse for a few seconds, and… went to eat his sandwich.",
          words: [
            { nl: "toch", en: "yet, still, anyway" },
            { nl: "veel", en: "much" },
            { nl: "sperde open", en: "opened wide (separable: openspeeren)" },
            { nl: "wagenwijd", en: "wide as a wagon (idiom: very wide)" },
            { nl: "streelde", en: "stroked, caressed" },
            { nl: "ruwe", en: "rough" },
            { nl: "wezenloos", en: "blankly, vacantly" },
            { nl: "aankijken", en: "to look at (separable)" },
            { nl: "boterham", en: "sandwich, slice of bread" },
          ],
          notes: [
            {
              title: "wagenwijd — visual idiom",
              body: "'Wagenwijd' literally = 'wagon-wide' (as wide as a wagon). Always paired with 'open': 'wagenwijd open' = wide open. 'De deur stond wagenwijd open' (the door stood wide open).",
            },
            {
              title: "boterham — Dutch staple",
              body: "'Boterham' = a slice of bread, often with topping (cheese, ham, sprinkles). The Dutch lunch is famously 'een boterham eten' — a sandwich, usually open-faced, eaten at home or work. Plural: 'boterhammen'.",
            },
            {
              title: "'wezenloos' — useful adverb",
              body: "'Wezenloos' = vacantly, blankly, in a daze. From 'wezen' (being/essence) + -loos (without). Other -loos words: hopeloos (hopeless), nutteloos (useless), slapeloos (sleepless), eindeloos (endless).",
            },
            {
              title: "Origineel (1899)",
              body: "Kieviet wrote 'Hij spalkte zijne oogen wagenwijd open, streelde met zijne ruwe hand de dikke wangen van zijn spruitje'. 'Spalken' (to prop wide) is rare today; 'sperren' is the usual modern verb. 'Spruitje' literally = 'little sprout' = an old-fashioned diminutive for one's child; modern equivalent is 'kindje' or 'kleintje'.",
            },
          ],
        },
      ],
      [
        {
          id: "p5-s3",
          dutch: "'Nou, man, vind je het geen bijzonder lief kind?' vroeg zijn vrouw.",
          english: "'Well, dear, don't you think it's an especially sweet child?' asked his wife.",
          words: [
            { nl: "nou", en: "well, so (filler)" },
            { nl: "man", en: "husband (here as term of address)" },
            { nl: "vind je", en: "do you think (vinden = to think/find)" },
            { nl: "geen", en: "not a (negation of 'een')" },
            { nl: "bijzonder", en: "special, particular, especially" },
            { nl: "lief", en: "sweet, dear" },
            { nl: "kind", en: "child" },
            { nl: "vroeg", en: "asked" },
          ],
          notes: [
            {
              title: "'man' as address",
              body: "Wives in Dutch literature (and informal speech) often call their husband 'man' — like English 'dear' or 'love'. Not literally 'man'. 'Man, doe even rustig' = 'honey, take it easy'. Husbands address wives as 'vrouw' the same way (less common today).",
            },
            {
              title: "'vinden' for opinions",
              body: "'Vinden' literally = to find, but with adjectives it expresses opinion: 'ik vind het leuk' (I think it's fun), 'vind je het mooi?' (do you think it's pretty?). Different from 'denken' (to think — about something abstract).",
            },
            {
              title: "'geen' vs 'niet'",
              body: "'Geen' negates indefinite nouns ('a/some'); 'niet' negates everything else. 'Vind je het geen lief kind?' = 'don't you think it's a sweet child?' (negating 'een lief kind'). Compare 'het kind is niet lief' (the child isn't sweet — negating the adjective).",
            },
          ],
        },
        {
          id: "p5-s4",
          dutch:
            "'En wat is hij dik, hè?'",
          english:
            "'And isn't he fat, eh?'",
          words: [
            { nl: "en", en: "and" },
            { nl: "wat is hij dik", en: "how fat he is (exclamation)" },
            { nl: "hè", en: "eh? right? (tag question)" },
          ],
          notes: [
            {
              title: "Sentence-final 'hè'",
              body: "'Hè' at the end of a statement turns it into a soft tag question / invitation to agree. Same as English 'right?' or 'eh?'. 'Mooi weer, hè?' (nice weather, eh?), 'jij komt ook, hè?' (you're coming too, right?).",
            },
            {
              title: "'wat + adjective' exclamation",
              body: "'Wat is hij dik!' = How fat he is! Or 'Wat een dik kind!' = What a fat child! Two patterns: 'wat is + subject + adjective' or 'wat een + adjective + noun'.",
            },
          ],
        },
        {
          id: "p5-s5",
          dutch:
            "Vader had net een grote hap brood genomen en kon onmogelijk antwoorden.",
          english:
            "Father had just taken a big bite of bread and couldn't possibly answer.",
          words: [
            { nl: "net", en: "just (a moment ago)" },
            { nl: "een grote hap", en: "a big bite" },
            { nl: "brood", en: "bread" },
            { nl: "had genomen", en: "had taken (past perfect of nemen)" },
            { nl: "onmogelijk", en: "impossibly, possibly not" },
            { nl: "antwoorden", en: "to answer" },
          ],
          notes: [
            {
              title: "'net' — useful little word",
              body: "'Net' = just (a moment ago). 'Hij is net gekomen' (he just arrived), 'ik heb net gegeten' (I just ate). Different from 'pas' (only / not until, also: just/recently for arrivals).",
            },
            {
              title: "Strong verb: nemen",
              body: "Nemen → nam → genomen (to take). Past 'nam', past plural 'namen'. Useful related: aannemen (to accept), meenemen (to take with), opnemen (to pick up [phone] / record).",
            },
            {
              title: "onmogelijk — adverb of impossibility",
              body: "'Onmogelijk' literally 'un-possible'. Used as adverb: 'ik kan onmogelijk komen' = I can't possibly come. Same pattern: onmogelijk (impossible), onnodig (unnecessary), onbekend (unknown).",
            },
          ],
        },
        {
          id: "p5-s6",
          dutch:
            "Het duurde even voordat hij eindelijk kon zeggen: 'Dik? Of hij dik is — dat is hij.'",
          english:
            "It took a while before he could finally say: 'Fat? You bet he's fat — that he is.'",
          words: [
            { nl: "het duurde", en: "it took / lasted" },
            { nl: "even", en: "a moment" },
            { nl: "voordat", en: "before" },
            { nl: "eindelijk", en: "finally" },
            { nl: "of hij dik is", en: "you bet he's fat (idiom)" },
            { nl: "dat is hij", en: "that he is (emphatic)" },
          ],
          notes: [
            {
              title: "Catchphrase: 'dat is hij' / 'dat is-ie'",
              body: "Dik's father's signature line throughout the book: 'Het is een bijzonder kind — dat is-ie' (he's a special child — that he is). The 'is-ie' is a colloquial smush of 'is hij'. We've kept it as 'dat is hij' here for clarity, but in dialogue you'll see 'is-ie' a lot.",
            },
            {
              title: "'voordat' — subordinator",
              body: "'Voordat' = before. Subordinator, so the verb goes to the end: 'voordat hij eindelijk kon zeggen' (before he could finally say). Often shortened to just 'voor': 'voor hij kwam' / 'voordat hij kwam'.",
            },
            {
              title: "'duren' — to take/last",
              body: "'Duren' = to last, take (time). 'Hoe lang duurt het?' (how long does it take?), 'het duurt twee uur' (it takes two hours). Don't confuse with 'nemen' (to take an object).",
            },
          ],
        },
      ],
      [
        {
          id: "p5-s7",
          dutch:
            "'Maar man,' ging zijn vrouw verder, 'hoe zullen we hem noemen? Hij moet zeker naar je vader vernoemd worden? Heette die niet Arie?'",
          english:
            "'But dear,' his wife continued, 'what shall we call him? He should be named after your father, shouldn't he? Wasn't his name Arie?'",
          words: [
            { nl: "ging verder", en: "continued (separable: verdergaan)" },
            { nl: "hoe zullen we", en: "how shall we" },
            { nl: "noemen", en: "to call (by name)" },
            { nl: "zeker", en: "surely, certainly" },
            { nl: "vernoemd worden naar", en: "to be named after" },
            { nl: "heette", en: "was called — past of heten" },
            { nl: "die", en: "he (referring to father)" },
          ],
          notes: [
            {
              title: "noemen vs heten",
              body: "'Noemen' = to call (give a name). 'Heten' = to be called (have a name). 'We noemen hem Dik' (we call him Dik) — active. 'Hij heet Dik' (he's called Dik) — his name is. They're a pair: noemen does, heten is.",
            },
            {
              title: "vernoemen naar — name after",
              body: "Idiom: 'vernoemen naar' = to name after (someone). 'Het kind is vernoemd naar zijn opa' (the child is named after his grandfather). A strong tradition in Dutch families historically — first son named after paternal grandfather, etc.",
            },
            {
              title: "'die' as he/she/it",
              body: "'Heette die niet Arie?' — 'die' refers back to the father just mentioned. Substituting 'die' for hij/zij/het is everyday Dutch when the reference is clear. Sounds more natural than 'heette hij niet Arie?'.",
            },
          ],
        },
        {
          id: "p5-s8",
          dutch:
            "'Hij zal Dirk heten,' klonk het uit Vaders volle mond.",
          english:
            "'He shall be called Dirk,' came the answer from Father's full mouth.",
          words: [
            { nl: "zal heten", en: "will be called (future)" },
            { nl: "klonk", en: "sounded — past of klinken" },
            { nl: "uit", en: "out of" },
            { nl: "volle mond", en: "full mouth" },
          ],
          notes: [
            {
              title: "'klinken' for indirect speech",
              body: "'Klinken' literally 'to sound' — used to introduce a quotation when describing how it came out: 'klonk het uit zijn mond' (so it sounded from his mouth). Slightly literary but very natural in narration. Strong verb: klinken → klonk → geklonken.",
            },
            {
              title: "Future with 'zullen'",
              body: "'Zullen' is the future-tense auxiliary. 'Hij zal heten' = he will be called. Conjugates: ik zal, jij/u zult, hij zal, wij/jullie/zij zullen. In speech, Dutch often uses 'gaan' or just present tense for near future: 'hij gaat Dirk heten' (more colloquial).",
            },
          ],
        },
        {
          id: "p5-s9",
          dutch:
            "'Mijn broer die naar Amerika is gegaan, heet ook zo — en daarom… hap!'",
          english:
            "'My brother who went to America is also called that — and that's why… chomp!'",
          words: [
            { nl: "broer", en: "brother" },
            { nl: "naar Amerika", en: "to America" },
            { nl: "is gegaan", en: "has gone (perfect of gaan)" },
            { nl: "heet ook zo", en: "is also called that" },
            { nl: "en daarom", en: "and that's why" },
            { nl: "hap", en: "chomp! (sound of biting)" },
          ],
          notes: [
            {
              title: "Auxiliary 'zijn' with motion verbs",
              body: "Note 'is gegaan' (not 'heeft gegaan'). Verbs of motion or change of state take 'zijn' as their perfect-tense auxiliary: 'ik ben gegaan' (I went), 'hij is vertrokken' (he left), 'wij zijn aangekomen' (we arrived). Memorise this list as you encounter them.",
            },
            {
              title: "Onomatopoeia: hap",
              body: "'Hap' is the Dutch sound effect for biting (English 'chomp' or 'munch'). Also a noun: 'een hap brood' (a bite of bread). The verb is 'happen' (to bite/snap at): 'de hond hapt naar mijn hand' (the dog snaps at my hand).",
            },
          ],
        },
      ],
      [
        {
          id: "p5-s10",
          dutch:
            "Toen hij weer kon spreken, draaide hij zich om, boog zich nog één keer over de wieg, ging rustig voor het bed van zijn vrouw staan en zei: 'Wat zullen we eraan doen, Griet? Het is een bijzonder kind — dat is hij.'",
          english:
            "When he could speak again, he turned around, leaned over the cradle once more, calmly stood in front of his wife's bed, and said: 'What can we do about it, Griet? He's a special child — that he is.'",
          words: [
            { nl: "toen", en: "when (past, single event)" },
            { nl: "weer", en: "again" },
            { nl: "draaide zich om", en: "turned around (reflexive separable)" },
            { nl: "boog zich", en: "leaned (reflexive of buigen)" },
            { nl: "nog één keer", en: "one more time" },
            { nl: "rustig", en: "calmly" },
            { nl: "voor", en: "in front of" },
            { nl: "wat zullen we eraan doen", en: "what can/shall we do about it" },
            { nl: "bijzonder", en: "special, particular" },
          ],
          notes: [
            {
              title: "Reflexive separable: zich omdraaien",
              body: "'Zich omdraaien' = to turn (oneself) around. Both reflexive AND separable — the 'om' splits to the end and the reflexive matches the subject. 'Hij draaide zich om' (he turned around). 'Ik draai me om, jij draait je om, hij draait zich om'.",
            },
            {
              title: "'eraan' — pronoun adverb",
              body: "'Eraan' = at it / about it / to it (er + aan). 'Wat zullen we eraan doen?' = what shall we do about it? Same pattern as 'erover' (about it), 'ermee' (with it), 'ervan' (of it). Replaces 'aan dat' / 'over dat' / etc., which sounds clunky.",
            },
            {
              title: "Griet — name and word",
              body: "'Griet' is short for Margaretha — Dik's mother. It's also a generic informal noun for 'woman' / 'wife' in older Dutch ('een grote griet' = a big girl). And there's the expression 'ouwe griet' (old hag, derogatory). Context tells you which.",
            },
            {
              title: "The catchphrase, again",
              body: "'Het is een bijzonder kind — dat is hij/is-ie' is Vader Trom's signature line. He'll repeat it dozens of times across the book whenever Dik does something outrageous. Watch for it as a running joke.",
            },
          ],
        },
        {
          id: "p5-s11",
          dutch:
            "Daarna stapte hij, bedenkelijk zijn hoofd schuddend, naar de burgemeester om het bijzondere kind te laten inschrijven onder de naam Dirk.",
          english:
            "Then he set off, shaking his head doubtfully, to the mayor to have the special child registered under the name Dirk.",
          words: [
            { nl: "daarna", en: "afterwards, then" },
            { nl: "stapte", en: "stepped, walked" },
            { nl: "bedenkelijk", en: "doubtful, dubious" },
            { nl: "schuddend", en: "shaking (present participle)" },
            { nl: "burgemeester", en: "mayor" },
            { nl: "laten inschrijven", en: "to have (someone) registered" },
            { nl: "onder de naam", en: "under the name" },
          ],
          notes: [
            {
              title: "Civil registration in NL",
              body: "Births in the Netherlands must be registered at the gemeente (municipality) within 3 days. Historically the burgemeester (mayor) personally handled registration in small villages — that's what's happening here. Today it's a 'medewerker burgerzaken' (civil registry clerk).",
            },
            {
              title: "'laten' + infinitive — to have done",
              body: "'Iets laten doen' = to have something done (by someone else). 'Het kind laten inschrijven' = to have the child registered. Compare: 'ik laat mijn haar knippen' (I have my hair cut), 'we laten het huis schilderen' (we're having the house painted).",
            },
            {
              title: "Present participle as adverb",
              body: "'Schuddend' = shaking (the act of). Built from 'schudden' (to shake) + -d. Used like an adverb describing how the main verb is performed: 'hij liep zwijgend weg' (he walked away in silence), 'ze zat huilend op de bank' (she sat crying on the couch).",
            },
          ],
        },
        {
          id: "p5-s12",
          dutch:
            "En omdat hij zelf Jan Trom heette, zou zijn zoon later luisteren naar de naam Dirk Trom.",
          english:
            "And because he himself was called Jan Trom, his son would later answer to the name Dirk Trom.",
          words: [
            { nl: "omdat", en: "because (subordinating)" },
            { nl: "zelf", en: "himself" },
            { nl: "zou luisteren", en: "would answer to (conditional)" },
            { nl: "naar de naam", en: "to the name (idiom)" },
          ],
          notes: [
            {
              title: "Idiom: 'luisteren naar de naam'",
              body: "'Luisteren naar de naam X' = to answer to the name X (literally: 'to listen to the name'). Slightly formal/literary way to introduce someone's name. 'De hond luistert naar de naam Boef' = 'the dog answers to the name Boef'.",
            },
            {
              title: "omdat vs want — closing thought",
              body: "Final 'omdat' usage to lock it in: 'omdat hij Jan Trom heette' — verb 'heette' goes to the end. Compare with 'want': '…want hij heette Jan Trom' — verb stays in second position. Same meaning, different word order rules.",
            },
            {
              title: "End of chapter 1",
              body: "And that's the end of chapter 1 — Dirk has been born and named. Coming up in chapter 2: 'Dirk en de baker worden kwade vrienden' (Dirk and the maternity nurse become bad friends) — when 10-day-old Dik kicks a bowl of soup all over her dress.",
            },
          ],
        },
      ],
    ],
  },
  {
    page: 6,
    chapter: 2,
    title: "Hoofdstuk 2 — Dirk en de kraamverzorgster worden kwade vrienden",
    paragraphs: [
      [
        {
          id: "p6-s1",
          dutch: "Dirk Trom was geen gewone jongen, en dat liet hij ook duidelijk zien.",
          english: "Dirk Trom was no ordinary boy, and he made that clearly known.",
          words: [
            { nl: "geen gewone jongen", en: "no ordinary boy" },
            { nl: "duidelijk", en: "clearly" },
            { nl: "liet zien", en: "showed (laten + zien)" },
          ],
          notes: [
            {
              title: "geen vs niet",
              body: "'Geen' negates indefinite nouns ('a/some'); 'niet' negates everything else. 'Geen gewone jongen' = 'no ordinary boy' (negating 'een gewone jongen'). If we said 'hij is niet gewoon', that would negate the adjective 'gewoon' itself.",
            },
            {
              title: "'laten zien' — to show",
              body: "Literally 'to let see' = to show. 'Iemand iets laten zien' = to show someone something. The pattern 'laten + bare infinitive' shows up everywhere: laten weten (let know), laten vallen (drop, let fall), laten staan (leave standing).",
            },
          ],
        },
        {
          id: "p6-s2",
          dutch:
            "Schreeuwen — wat andere kinderen kennelijk een aangenaam tijdverdrijf vinden — vond hij helemaal niet leuk.",
          english:
            "Crying — which other children apparently find an enjoyable pastime — he didn't find fun at all.",
          words: [
            { nl: "schreeuwen", en: "to scream, cry out" },
            { nl: "kennelijk", en: "apparently, evidently" },
            { nl: "een aangenaam tijdverdrijf", en: "a pleasant pastime" },
            { nl: "vinden", en: "to think, find (opinion)" },
            { nl: "helemaal niet", en: "not at all" },
            { nl: "leuk", en: "fun, nice" },
          ],
          notes: [
            {
              title: "vinden for opinions",
              body: "'Vinden' means 'to find' but with adjectives it expresses opinion. 'Hij vond het niet leuk' = 'he didn't think it was fun'. Compare 'hij vindt schreeuwen leuk' (he thinks crying is fun). One of the most-used verbs in everyday Dutch.",
            },
            {
              title: "Em-dashes and embedded clauses",
              body: "Dutch uses em-dashes (—) the same way English does — to set off an explanatory clause mid-sentence. The clause 'wat andere kinderen … vinden' is parenthetical; the main thought is 'schreeuwen vond hij niet leuk'. Mentally bracket the dashes.",
            },
            {
              title: "'helemaal niet' — emphatic negation",
              body: "'Helemaal' = completely, entirely. 'Helemaal niet' = not at all. 'Ik begrijp het helemaal niet' (I don't understand it at all). The opposite is 'helemaal wel' (totally yes) — both add intensity.",
            },
          ],
        },
        {
          id: "p6-s3",
          dutch:
            "Hij vond het zelfs beneden zijn waardigheid en deed het dus nooit, zelfs niet toen de kraamverzorgster hem per ongeluk een flink eind met een speld prikte.",
          english:
            "He even thought it beneath his dignity, and so never did it — not even when the maternity nurse accidentally pricked him quite deeply with a pin.",
          words: [
            { nl: "zelfs", en: "even" },
            { nl: "beneden zijn waardigheid", en: "beneath his dignity (idiom)" },
            { nl: "deed", en: "did — past of doen" },
            { nl: "nooit", en: "never" },
            { nl: "per ongeluk", en: "by accident, accidentally" },
            { nl: "een flink eind", en: "a good way (in: deeply)" },
            { nl: "een speld", en: "a pin" },
            { nl: "prikte", en: "pricked, jabbed" },
          ],
          notes: [
            {
              title: "Idiom: 'beneden je waardigheid'",
              body: "'Iets beneden je waardigheid vinden' = to consider something beneath you. Pure dignity-talk, often used humorously. 'Hij vond het beneden zijn waardigheid om te schreeuwen' = he was too dignified to cry.",
            },
            {
              title: "'per ongeluk' — useful pair",
              body: "'Per ongeluk' = by accident. The opposite is 'expres' or 'met opzet' = on purpose. 'Sorry, ik deed het per ongeluk' (sorry, I did it by accident). 'Hij deed het expres' (he did it on purpose).",
            },
            {
              title: "Strong verb: doen",
              body: "Doen → deed → gedaan (to do). One of the most irregular and common verbs. Worth memorising in full: ik doe, jij doet, hij doet, wij doen / past: ik deed, wij deden / perfect: ik heb gedaan.",
            },
            {
              title: "Origineel (1899)",
              body: "Kieviet wrote 'tamelijk diep met eene speld prikte' (quite deeply with a pin pricked). 'Tamelijk' is still common modern Dutch (= rather/quite), but the placement of 'eene' and the verb at the end makes it feel old.",
            },
          ],
        },
      ],
      [
        {
          id: "p6-s4",
          dutch: "Hij gaf geen kik, maar keek haar alleen met een verwijtende blik aan.",
          english: "He didn't make a peep, but just looked at her with a reproachful glance.",
          words: [
            { nl: "gaf geen kik", en: "didn't make a peep (idiom)" },
            { nl: "alleen", en: "only, just" },
            { nl: "verwijtende", en: "reproachful, accusing" },
            { nl: "blik", en: "look, glance" },
            { nl: "aankeek", en: "looked at (separable: aankijken)" },
          ],
          notes: [
            {
              title: "Idiom: 'geen kik geven'",
              body: "'Een kik geven' = to make a peep / utter a sound. Always used in negative: 'hij gaf geen kik' = he didn't make a peep / he was silent. Uniquely Dutch — comes from the sound 'kik' as imitation of a brief cry.",
            },
            {
              title: "Separable: aankijken",
              body: "'Iemand aankijken' = to look at someone (eye contact). Splits in main clauses: 'hij keek haar aan' (he looked at her). The 'aan' goes to the end. Compare 'kijken naar' (to look at, more general): 'hij keek naar de tv'.",
            },
            {
              title: "Present participle as adjective",
              body: "'Verwijtende' = reproachful, from 'verwijten' (to reproach) + -end + -e. Dutch builds participle adjectives by adding -end to the stem, then -e when in front of a noun. Like 'lopende mensen' (walking people), 'huilend kind' (crying child).",
            },
          ],
        },
        {
          id: "p6-s5",
          dutch:
            "Hij hield helemaal niet van haar, en eigenlijk verdiende ze dat niet, want ze zorgde zo goed mogelijk voor hem.",
          english:
            "He didn't like her at all, and really she didn't deserve it, because she took the best care of him she could.",
          words: [
            { nl: "hield niet van", en: "didn't like (houden van)" },
            { nl: "eigenlijk", en: "actually, really" },
            { nl: "verdiende", en: "deserved" },
            { nl: "zorgde voor", en: "took care of (zorgen voor)" },
            { nl: "zo goed mogelijk", en: "as well as possible" },
          ],
          notes: [
            {
              title: "houden van — to like/love",
              body: "'Van iemand houden' = to like or love someone. Strong verb: houden → hield → gehouden. 'Ik hou van jou' (I love you), 'ik hou van koffie' (I love coffee). For things, 'ik hou van' is more enthusiastic than 'ik vind … leuk'.",
            },
            {
              title: "zorgen voor — useful idiom",
              body: "'Zorgen voor iemand/iets' = to take care of, look after. 'De vader zorgt voor het kind' (the father takes care of the child). Also: 'zorg ervoor dat...' = make sure that...",
            },
            {
              title: "'zo … mogelijk' — as ___ as possible",
              body: "Pattern: 'zo + adjective + mogelijk' = 'as ___ as possible'. 'Zo goed mogelijk' (as well as possible), 'zo snel mogelijk' (asap), 'zo veel mogelijk' (as much as possible). One of the most useful constructions.",
            },
            {
              title: "eigenlijk — softener",
              body: "'Eigenlijk' literally means 'actually/really', but it often softens a statement: 'ik wil eigenlijk niet' = 'I don't really want to' (gentler than 'ik wil niet'). Marks something as a considered or honest thought.",
            },
          ],
        },
      ],
      [
        {
          id: "p6-s6",
          dutch:
            "Liever lag hij in de armen van zijn moeder. Niet dat hij het uitkraaide van plezier — nee, hij was kalm van aard — maar bij haar lag er een tevreden gloed over zijn dikke wangen.",
          english:
            "He preferred lying in his mother's arms. Not that he crowed with pleasure — no, he had a calm nature — but with her there was a contented glow over his fat cheeks.",
          words: [
            { nl: "liever", en: "rather, preferably" },
            { nl: "lag", en: "lay — past of liggen" },
            { nl: "in de armen van", en: "in the arms of" },
            { nl: "uitkraaide", en: "crowed (of joy)" },
            { nl: "van plezier", en: "with pleasure" },
            { nl: "kalm van aard", en: "calm by nature" },
            { nl: "een tevreden gloed", en: "a contented glow" },
          ],
          notes: [
            {
              title: "'liever' — preference",
              body: "'Liever' = comparative of 'graag' (gladly). 'Ik doe het graag' (I'm happy to do it) → 'ik doe het liever' (I'd rather do it) → 'ik doe het het liefst' (I'd most like to do it). Used constantly to express preference.",
            },
            {
              title: "'van aard' — by nature",
              body: "'Van aard' = by nature, in disposition. 'Hij is rustig van aard' (he's quiet by nature). 'Aard' (= nature, character) is also in 'aardig' (= friendly, kind, originally 'of good nature').",
            },
            {
              title: "Stilistic em-dashes",
              body: "Two em-dashes here mark a parenthetical aside: 'Niet dat hij het uitkraaide van plezier — nee, hij was kalm van aard — maar...'. The 'nee' inside the dashes is the writer interjecting/qualifying. Common in narrative Dutch.",
            },
          ],
        },
        {
          id: "p6-s7",
          dutch:
            "Toen hij tien dagen oud was, kwam het tussen hem en de kraamverzorgster tot een echte ruzie.",
          english:
            "When he was ten days old, it came to a real quarrel between him and the maternity nurse.",
          words: [
            { nl: "toen", en: "when (past, single event)" },
            { nl: "tien dagen oud", en: "ten days old" },
            { nl: "kwam … tot", en: "came to (idiom)" },
            { nl: "tussen", en: "between" },
            { nl: "een echte ruzie", en: "a real quarrel" },
          ],
          notes: [
            {
              title: "Idiom: 'het kwam tot'",
              body: "'Het kwam tot iets' = it came to something / it reached the point of. 'Het kwam tot een ruzie' (it came to a quarrel). 'Het kwam tot een akkoord' (they reached an agreement). Useful narrative idiom.",
            },
            {
              title: "ruzie — a useful word",
              body: "'Ruzie' = quarrel, fight, argument (verbal). 'Ruzie hebben met iemand' (to be in a fight with someone), 'ruzie maken' (to start a fight). Common in everyday speech — children, couples, neighbours.",
            },
            {
              title: "'toen' for past events",
              body: "'Toen' = when (single past event). Subordinator: pushes the verb to the end ('toen hij tien dagen oud was' — verb 'was' at end). Then the main clause inverts ('kwam het...' — verb 'kwam' second). This structure is everywhere in Dutch storytelling.",
            },
          ],
        },
      ],
    ],
  },
  {
    page: 7,
    chapter: 2,
    title: "Hoofdstuk 2 (vervolg) — De soep en de jurk",
    paragraphs: [
      [
        {
          id: "p7-s1",
          dutch:
            "De vrouw van timmerman Meyer, die mevrouw Trom tijdens haar ziekte had bezocht, stuurde een lekker soepje.",
          english:
            "Carpenter Meyer's wife, who had visited Mrs Trom during her illness, sent a tasty soup.",
          words: [
            { nl: "de vrouw van", en: "the wife of" },
            { nl: "timmerman", en: "carpenter" },
            { nl: "die … had bezocht", en: "who had visited" },
            { nl: "tijdens", en: "during" },
            { nl: "haar ziekte", en: "her illness" },
            { nl: "stuurde", en: "sent" },
            { nl: "een lekker soepje", en: "a tasty (little) soup" },
          ],
          notes: [
            {
              title: "Diminutive for warmth",
              body: "'Soep' (soup) → 'soepje' (a tasty little soup). The diminutive isn't always about size — here it adds warmth and homeliness. Same way grandmothers offer 'een koffietje' (a nice cup of coffee) or 'een glaasje wijn' (a glass of wine).",
            },
            {
              title: "Relative clause with 'die'",
              body: "'Die' = who/which (for de-words and plurals). 'De vrouw van Meyer, die … had bezocht' — 'die' refers back to 'de vrouw'. The verb 'had bezocht' lands at the end of the relative clause. For het-words you'd use 'dat' instead.",
            },
            {
              title: "tijdens — preposition",
              body: "'Tijdens' = during. Always preceded by an article-less or article-having noun: 'tijdens de oorlog' (during the war), 'tijdens haar ziekte' (during her illness), 'tijdens het werk' (during work).",
            },
          ],
        },
        {
          id: "p7-s2",
          dutch:
            "Ze gaf de boodschap mee dat ze snel nog eens langs zou komen om te kijken hoe het met moeder en kind ging.",
          english:
            "She passed along the message that she would soon stop by again to see how mother and child were doing.",
          words: [
            { nl: "gaf … mee", en: "passed along (separable: meegeven)" },
            { nl: "de boodschap", en: "the message" },
            { nl: "snel", en: "soon, quickly" },
            { nl: "nog eens", en: "once more, again" },
            { nl: "langs zou komen", en: "would stop by" },
            { nl: "om te kijken", en: "to see (purpose)" },
            { nl: "hoe het ging", en: "how things were going" },
          ],
          notes: [
            {
              title: "Separable: meegeven",
              body: "'Meegeven' = to give along / pass along (a message, an item). 'Hij gaf me een boodschap mee' (he passed me a message). The 'mee' splits to the end. Related: meebrengen (bring along), meenemen (take along).",
            },
            {
              title: "'langskomen' — to stop by",
              body: "'Langskomen' = to drop in, stop by. Very common social verb. 'Kom je morgen langs?' (will you stop by tomorrow?). Splits: 'hij kwam langs' (he stopped by). The 'langs' literally means 'past/along'.",
            },
            {
              title: "Indirect 'how' question",
              body: "'Hoe het ging' = how things were going. After 'kijken hoe...', the verb 'ging' goes to the end (subordinate clause). Main clause inversion doesn't apply inside the subordinate.",
            },
            {
              title: "'zou' for indirect/conditional",
              body: "'Zou' = would (past of zullen). Used here in indirect speech: 'ze zei dat ze zou komen' (she said she would come). The 'zou' carries the future-in-the-past meaning.",
            },
          ],
        },
      ],
      [
        {
          id: "p7-s3",
          dutch:
            "De kraamverzorgster zette de soep op een laag vuur om warm te houden, plaatste het komfoortje op tafel, en nam de kleine Dirk op schoot om hem te verkleden.",
          english:
            "The maternity nurse put the soup on a low flame to keep it warm, placed the little stove on the table, and took little Dirk on her lap to change him.",
          words: [
            { nl: "zette", en: "put — past of zetten" },
            { nl: "een laag vuur", en: "a low flame" },
            { nl: "warm te houden", en: "to keep warm" },
            { nl: "plaatste", en: "placed" },
            { nl: "het komfoortje", en: "the little stove (dim. of komfoor)" },
            { nl: "op schoot", en: "on (her) lap" },
            { nl: "verkleden", en: "to change clothes" },
          ],
          notes: [
            {
              title: "zetten / leggen / plaatsen — putting verbs",
              body: "Three Dutch verbs for 'to put': zetten (set, upright), leggen (lay, flat), plaatsen (place — slightly formal). 'Zet de fles op tafel' (put the bottle on the table — standing), 'leg de krant op tafel' (put the paper on the table — flat), 'plaatste het komfoortje' (placed the stove — formal/careful).",
            },
            {
              title: "komfoor — dated word",
              body: "A 'komfoor' (or 'komfoortje') was a small portable stove for keeping things warm — a bit dated now. Modern equivalent: 'een warmhoudplaatje' (warming plate) or just a low-flame setting on the stove. The diminutive is affectionate.",
            },
            {
              title: "'op schoot' — fixed expression",
              body: "'Op schoot' = on (one's) lap. No article — fixed expression, like 'op zolder' (in the attic), 'in bed' (in bed). 'Het kind op schoot nemen' = to take the child on one's lap.",
            },
            {
              title: "Verkleden vs aankleden",
              body: "'Aankleden' = to dress (put clothes on). 'Verkleden' = to change clothes / change into something else. 'Uitkleden' = to undress. The 'ver-' prefix often means 'change to a different state'.",
            },
          ],
        },
        {
          id: "p7-s4",
          dutch:
            "Af en toe roerde ze in de soep, zodat die niet zou aanbranden, en proefde een paar lepels om te kijken of die warm genoeg was.",
          english:
            "Now and then she stirred the soup, so it wouldn't burn, and tasted a few spoonfuls to check whether it was warm enough.",
          words: [
            { nl: "af en toe", en: "now and then, occasionally" },
            { nl: "roerde", en: "stirred" },
            { nl: "zodat", en: "so that" },
            { nl: "niet zou aanbranden", en: "wouldn't burn (food)" },
            { nl: "proefde", en: "tasted" },
            { nl: "een paar lepels", en: "a few spoonfuls" },
            { nl: "warm genoeg", en: "warm enough" },
          ],
          notes: [
            {
              title: "'af en toe' — useful expression",
              body: "'Af en toe' = now and then, occasionally. Common time-frequency expression. Compare 'soms' (sometimes), 'vaak' (often), 'meestal' (usually), 'altijd' (always).",
            },
            {
              title: "aanbranden — separable",
              body: "'Aanbranden' = to burn (of food, sticking to the pan). Splits in main clauses: 'de soep brandde aan' (the soup burned). Used specifically for food sticking and burning. Generic 'to burn' (a building, a candle) is 'branden' or 'verbranden'.",
            },
            {
              title: "'genoeg' placement",
              body: "'Genoeg' (enough) goes AFTER the adjective: 'warm genoeg' (warm enough), 'snel genoeg' (fast enough), 'groot genoeg' (big enough). Different from English which goes before: 'warm enough'.",
            },
          ],
        },
      ],
      [
        {
          id: "p7-s5",
          dutch:
            "Ze had niet door dat haar manier van doen Dirk helemaal niet beviel — maar dat zou ze al snel tot haar grote schrik merken.",
          english:
            "She didn't realise that her way of going about it didn't suit Dirk at all — but she was about to notice that, to her great shock.",
          words: [
            { nl: "had niet door", en: "didn't realise (doorhebben)" },
            { nl: "haar manier van doen", en: "her way of going about it" },
            { nl: "beviel", en: "pleased, suited" },
            { nl: "al snel", en: "soon" },
            { nl: "tot haar grote schrik", en: "to her great shock" },
            { nl: "merken", en: "to notice" },
          ],
          notes: [
            {
              title: "'doorhebben' — to realise",
              body: "'Doorhebben' = to realise, get it. Splits: 'ik heb het door' (I get it / I see what's going on). Past: 'had door'. Slightly informal — more colloquial than 'beseffen' (to realise, formal).",
            },
            {
              title: "bevallen — to please",
              body: "'Bevallen' literally 'to befall', but means 'to please' or 'to suit'. 'Het bevalt mij wel' (I quite like it / it suits me). Note the dative-like construction: subject is the thing, indirect object is the person. 'De jurk beviel haar' = 'the dress pleased her'.",
            },
            {
              title: "'tot haar schrik' — to her shock",
              body: "'Tot iemands schrik/verbazing/verdriet' = to someone's shock/surprise/sorrow. Useful narrative pattern: 'tot mijn verbazing' (to my surprise), 'tot zijn verdriet' (to his sorrow).",
            },
          ],
        },
      ],
      [
        {
          id: "p7-s6",
          dutch:
            "Toen ze Dirk had verkleed en hem in de wieg wilde leggen, leek het of de soep aanbrandde.",
          english:
            "When she had finished changing Dirk and was about to lay him in the cradle, it seemed the soup was burning.",
          words: [
            { nl: "had verkleed", en: "had changed (past perfect)" },
            { nl: "wilde leggen", en: "wanted to lay" },
            { nl: "leek het of", en: "it seemed as if" },
          ],
          notes: [
            {
              title: "'leek het of' — pattern",
              body: "'Het lijkt of...' = it seems that/as if... Past: 'het leek of...'. The clause that follows can use 'of' (as if) or 'dat' (that). 'Het leek of hij sliep' (it seemed he was asleep). Subordinate clause, so verb to the end.",
            },
            {
              title: "Past perfect with modal",
              body: "'Toen ze hem … wilde leggen' — 'wilde' is past of 'willen' (wanted), with 'leggen' as the main verb at the end. In the same sentence we have past perfect 'had verkleed' for the earlier action. Layered tenses to mark sequence.",
            },
          ],
        },
        {
          id: "p7-s7",
          dutch:
            "Snel pakte ze de pan in haar hand en schoof het komfoortje opzij. Met de lepel in haar andere hand wilde ze controleren of de soep echt aangebrand was.",
          english:
            "Quickly she grabbed the pot and pushed the little stove aside. With the spoon in her other hand she wanted to check whether the soup was really burning.",
          words: [
            { nl: "snel", en: "quickly" },
            { nl: "pakte", en: "grabbed, took hold of" },
            { nl: "de pan", en: "the pot, pan" },
            { nl: "schoof opzij", en: "pushed aside (separable: opzijschuiven)" },
            { nl: "controleren", en: "to check" },
            { nl: "echt", en: "really" },
            { nl: "aangebrand", en: "burnt (past part. of aanbranden)" },
          ],
          notes: [
            {
              title: "pakken — versatile verb",
              body: "'Pakken' = to grab, take hold of, catch. Regular: pak, pakte, gepakt. Useful in many contexts: 'pak het boek' (grab the book), 'de politie pakte hem' (the police caught him), 'ik pak even mijn jas' (let me just grab my coat).",
            },
            {
              title: "'opzij' — to the side",
              body: "'Opzij' = to/at the side. 'Iets opzij schuiven' = to push something aside. 'Ga opzij!' = get out of the way! Compare 'aan de kant' (to the side, similar), 'opzij gaan' (to step aside).",
            },
            {
              title: "controleren — false-friend warning",
              body: "'Controleren' = to check, verify. NOT 'to control'! For 'control' (have power over), Dutch uses 'beheersen' or 'onder controle hebben'. 'De douane controleert je tas' = customs checks your bag (not 'controls').",
            },
          ],
        },
      ],
      [
        {
          id: "p7-s8",
          dutch:
            "Net toen ze de lepel naar haar mond bracht, gooide Dirk plotseling zijn beide beentjes met zo'n kracht omhoog dat hij de pan uit haar hand trapte!",
          english:
            "Just as she was bringing the spoon to her mouth, Dirk suddenly threw both his little legs up with such force that he kicked the pot out of her hand!",
          words: [
            { nl: "net toen", en: "just when" },
            { nl: "bracht", en: "brought — past of brengen" },
            { nl: "gooide", en: "threw" },
            { nl: "plotseling", en: "suddenly" },
            { nl: "beide beentjes", en: "both little legs" },
            { nl: "met zo'n kracht", en: "with such force" },
            { nl: "omhoog", en: "upward" },
            { nl: "trapte uit", en: "kicked out (separable: uittrappen)" },
          ],
          notes: [
            {
              title: "'net toen' — narrative timing",
              body: "'Net toen' = just when / right as. Common in stories for marking the dramatic moment something interrupts. 'Net toen ik wilde gaan slapen, ging de telefoon' (just as I was about to go to sleep, the phone rang).",
            },
            {
              title: "Strong verb: brengen",
              body: "Brengen → bracht → gebracht (to bring). Past 'bracht'. Compare 'denken → dacht → gedacht' (to think) — same -cht pattern. Common pair: brengen vs halen (bring vs fetch/get).",
            },
            {
              title: "'zo'n kracht' — 'such (a)'",
              body: "'Zo'n' = zo + een = 'such a'. 'Met zo'n kracht' = with such force. Similar: 'zo'n mooi huis' (such a beautiful house), 'zo'n grappig verhaal' (such a funny story). Plural is 'zulke': 'zulke verhalen' (such stories).",
            },
            {
              title: "Origineel (1899)",
              body: "Kieviet wrote 'wierp ... omhoog' (threw upward — using 'werpen' instead of modern 'gooien'). 'Werpen' is more literary; everyday Dutch prefers 'gooien'.",
            },
          ],
        },
        {
          id: "p7-s9",
          dutch:
            "De inhoud veranderde haar mooie jurk in een ogenblik in een soepjurk.",
          english:
            "The contents turned her nice dress into a soup-dress in an instant.",
          words: [
            { nl: "de inhoud", en: "the contents" },
            { nl: "veranderde in", en: "turned into (veranderen in)" },
            { nl: "mooie jurk", en: "nice dress" },
            { nl: "in een ogenblik", en: "in an instant" },
            { nl: "soepjurk", en: "soup-dress (humorous coinage)" },
          ],
          notes: [
            {
              title: "veranderen in — to turn into",
              body: "'Iets verandert in iets anders' = something changes/turns into something else. 'De prins veranderde in een kikker' (the prince turned into a frog). The 'in' is essential — without it, 'veranderen' just means 'to change'.",
            },
            {
              title: "Schmidt-style word coinage",
              body: "'Soepjurk' (soup-dress) is a humorous one-off compound — Dutch loves spontaneously combining words. 'Een soep' + 'jurk' = a dress that has become soup-soaked. Annie M.G. Schmidt does this a lot too. Recognisable on the fly.",
            },
            {
              title: "'in een ogenblik'",
              body: "'Een ogenblik' = a moment, an instant. 'In een ogenblik' = in an instant / immediately. Compare 'even' (briefly), 'meteen' (right away), 'direct' (immediately). 'Een ogenblik geduld' (one moment please) is the standard polite request to wait.",
            },
          ],
        },
      ],
      [
        {
          id: "p7-s10",
          dutch:
            "De goede vrouw schrok zo erg dat een gehaktballetje in haar verkeerde keelgat schoot. Ze kreeg een hoestbui die haar het angstzweet uitbrak.",
          english:
            "The good woman got such a fright that a meatball went down the wrong way. She got a coughing fit that broke her out in a cold sweat.",
          words: [
            { nl: "schrok", en: "was startled — past of schrikken" },
            { nl: "zo erg dat", en: "so badly that" },
            { nl: "een gehaktballetje", en: "a (little) meatball" },
            { nl: "verkeerde keelgat", en: "wrong throat (idiom)" },
            { nl: "schoot", en: "shot, went — past of schieten" },
            { nl: "een hoestbui", en: "a coughing fit" },
            { nl: "het angstzweet", en: "cold sweat (lit. fear-sweat)" },
            { nl: "brak uit", en: "broke out (separable: uitbreken)" },
          ],
          notes: [
            {
              title: "Idiom: 'in het verkeerde keelgat schieten'",
              body: "Literally 'to shoot into the wrong throat'. Means food or drink going down the wrong pipe (= entering the windpipe). Also used metaphorically for things being misunderstood or taken the wrong way: 'die opmerking schoot hem in het verkeerde keelgat' (that remark didn't sit well with him).",
            },
            {
              title: "Compound: angstzweet",
              body: "'Angst' (fear) + 'zweet' (sweat) = 'angstzweet' (cold sweat from fear). Dutch loves these emotional compounds: huilbui (crying fit), lachbui (laughing fit), driftbui (rage fit). 'Het angstzweet brak haar uit' = she broke out in a cold sweat.",
            },
            {
              title: "Strong verb pair: schrikken / schieten",
              body: "'Schrikken' (to be startled) → schrok → geschrokken. 'Schieten' (to shoot, dart) → schoot → geschoten. Both strong verbs. The vowel pattern i → o is common: zingen→zong, drinken→dronk, vinden→vond.",
            },
          ],
        },
        {
          id: "p7-s11",
          dutch:
            "Dirk Trom keek haar zegevierend aan. Vanaf dat moment was de kraamverzorgster bang voor hem.",
          english:
            "Dirk Trom looked at her triumphantly. From that moment on, the maternity nurse was afraid of him.",
          words: [
            { nl: "zegevierend", en: "triumphantly" },
            { nl: "vanaf dat moment", en: "from that moment on" },
            { nl: "bang voor", en: "afraid of" },
          ],
          notes: [
            {
              title: "'bang voor' — afraid of",
              body: "'Bang voor + iets/iemand' = afraid of. 'Ik ben bang voor honden' (I'm afraid of dogs). The 'voor' is essential. Compare 'bang om te + infinitive' (afraid to do something): 'ik ben bang om te vallen' (I'm afraid to fall).",
            },
            {
              title: "'vanaf' — from (a starting point)",
              body: "'Vanaf' = from / starting from. 'Vanaf dat moment' (from that moment), 'vanaf morgen' (starting tomorrow), 'vanaf het station' (from the station). Different from 'van' (general 'from'): 'vanaf' marks a specific starting point.",
            },
            {
              title: "zegevieren — to triumph",
              body: "'Zegevieren' = to triumph, win victory. From 'zege' (victory) + 'vieren' (to celebrate). 'Zegevierend' = triumphantly (present participle as adverb). Slightly elevated/literary register but still understood.",
            },
          ],
        },
        {
          id: "p7-s12",
          dutch:
            "Niet lang daarna werd Moeder weer sterker, en toen ze haar krachten terug had, ging de kraamverzorgster weg. Bij haar afscheid liet Dirk voor het eerst zijn stem horen: hij nam afscheid met een lange, uitgerekte 'aaa'!",
          english:
            "Not long after, Mother grew stronger again, and when she had her strength back, the maternity nurse left. At her parting, Dirk made his voice heard for the first time: he said goodbye with a long, drawn-out 'aaa'!",
          words: [
            { nl: "niet lang daarna", en: "not long afterwards" },
            { nl: "werd sterker", en: "got stronger" },
            { nl: "haar krachten terug had", en: "had her strength back" },
            { nl: "ging weg", en: "left, went away (separable: weggaan)" },
            { nl: "bij haar afscheid", en: "at her departure" },
            { nl: "voor het eerst", en: "for the first time" },
            { nl: "zijn stem horen", en: "his voice heard (lit.)" },
            { nl: "afscheid nemen", en: "to say goodbye (idiom)" },
            { nl: "een uitgerekte 'aaa'", en: "a drawn-out 'aaa'" },
          ],
          notes: [
            {
              title: "Idiom: 'afscheid nemen'",
              body: "'Afscheid nemen (van iemand)' = to say goodbye (to someone). 'Hij nam afscheid van zijn moeder' (he said goodbye to his mother). 'Afscheid' on its own = farewell, parting. Standard Dutch — used in writing and speech.",
            },
            {
              title: "'voor het eerst' — fixed expression",
              body: "'Voor het eerst' = for the first time. 'Voor de eerste keer' is also possible but slightly more formal. Useful pair: 'voor het laatst' = for the last time.",
            },
            {
              title: "'worden' for becoming",
              body: "'Werd sterker' = got/became stronger. 'Worden' = to become. Past: werd → werden. 'Hij wordt oud' (he's getting old), 'het wordt donker' (it's getting dark). Don't confuse with 'zijn' (to be) — 'worden' is for the change of state.",
            },
            {
              title: "End of chapter 2",
              body: "And that's chapter 2 — Dik has had his first triumph. He's already a force at 10 days old. Coming up in chapter 3: 'Dirk begint te kruipen en kattenkwaad te doen' (Dirk starts crawling and getting into mischief) — the cat falls in, Dik discovers the coal bin, and the famous 'broodkast' nap incident.",
            },
          ],
        },
      ],
    ],
  },
];
