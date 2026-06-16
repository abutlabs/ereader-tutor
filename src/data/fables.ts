// Aesop's fables — the free starter book. Aesop's fables are ancient public-domain
// folklore (no edition/rights ambiguity); the Dutch text here is an original modern,
// A2-pitched retelling, and the translations/word breakdowns/notes are original
// study material — same shape and pedagogy as src/data/dikTrom.ts.
//
// Each fable is one Page (one lesson screen). The closing line is the moral, with
// a "De moraal" note. Sentence ids are "f<fable>-s<n>", unique within the book.
import type { BookMeta, Page } from "./schema";

export const FABLES_META: BookMeta = {
  title: "Fabels van Aesopus",
  author: "Aesopus (naverteld)",
  language: "nl-NL",
  targetLanguage: "English",
  level: "A2",
  status: "complete",
  source:
    "Aesop's fables are ancient public-domain folklore. Modern Dutch A2 retelling with original study notes.",
  chapters: [
    { number: 1, title: "De schildpad en de haas" },
    { number: 2, title: "De vos en de druiven" },
    { number: 3, title: "De mier en de krekel" },
    { number: 4, title: "De leeuw en de muis" },
    { number: 5, title: "De jongen die 'wolf' riep" },
    { number: 6, title: "De noordenwind en de zon" },
    { number: 7, title: "De wolf in schaapskleren" },
    { number: 8, title: "De stadsmuis en de veldmuis" },
    { number: 9, title: "De kraai en de kruik" },
    { number: 10, title: "De vos en de ooievaar" },
    { number: 11, title: "De gans met de gouden eieren" },
    { number: 12, title: "De hond en het bot" },
  ],
};

export const FABLES_PAGES: Page[] = [
  {
    page: 1,
    chapter: 1,
    title: "Fabel 1 — De schildpad en de haas",
    paragraphs: [
      [
        {
          id: "f1-s1",
          dutch: "Een haas lachte altijd om de langzame schildpad.",
          english: "A hare always laughed at the slow tortoise.",
          words: [
            { nl: "een haas", en: "a hare" },
            { nl: "lachte", en: "laughed — past of lachen" },
            { nl: "altijd", en: "always" },
            { nl: "om", en: "at (lachen óm = to laugh at)" },
            { nl: "de langzame schildpad", en: "the slow tortoise" },
          ],
          notes: [
            {
              title: "lachen om",
              body: "'Lachen om iets/iemand' = to laugh at something/someone. The fixed preposition is 'om', not 'naar' or 'aan'. 'Iedereen lachte om zijn grap' = everyone laughed at his joke.",
            },
            {
              title: "Adjective ending -e",
              body: "After 'de' (and after 'een' with de-words), an adjective takes -e: 'de langzame schildpad'. Without an article you'd still say 'langzame schildpad'. The bare form 'langzaam' appears only with het-words after 'een' or when used as an adverb.",
            },
          ],
        },
        {
          id: "f1-s2",
          dutch:
            "Op een dag werd de schildpad boos en zei: 'Wie van ons is het snelst? Laten we een wedstrijd doen!'",
          english:
            "One day the tortoise got angry and said: 'Which of us is the fastest? Let's have a race!'",
          words: [
            { nl: "op een dag", en: "one day" },
            { nl: "werd boos", en: "got angry (worden + adjective)" },
            { nl: "wie van ons", en: "which of us" },
            { nl: "het snelst", en: "the fastest" },
            { nl: "laten we …", en: "let's …" },
            { nl: "een wedstrijd doen", en: "have a race/contest" },
          ],
          notes: [
            {
              title: "worden = to become",
              body: "'Boos worden' = to get/become angry (a change of state). Past: 'werd'. Compare 'zijn' for a state you're already in: 'hij is boos' (he is angry) vs. 'hij werd boos' (he got angry).",
            },
            {
              title: "'laten we' — let's",
              body: "'Laten we + infinitive' makes a suggestion: 'laten we gaan' (let's go), 'laten we eten' (let's eat). The infinitive goes to the end: 'laten we een wedstrijd doen'.",
            },
          ],
        },
        {
          id: "f1-s3",
          dutch: "De haas vond het een grappig idee en lachte hard.",
          english: "The hare thought it was a funny idea and laughed loudly.",
          words: [
            { nl: "vond", en: "thought, found — past of vinden" },
            { nl: "het", en: "it" },
            { nl: "een grappig idee", en: "a funny idea" },
            { nl: "hard", en: "hard, loudly" },
          ],
          notes: [
            {
              title: "vinden for opinions",
              body: "'Iets … vinden' = to think something is … 'Hij vond het een grappig idee' = he thought it was a funny idea. Literally 'he found it a funny idea'. Very common way to give an opinion in Dutch.",
            },
          ],
        },
      ],
      [
        {
          id: "f1-s4",
          dutch:
            "Toen de wedstrijd begon, rende de haas meteen ver vooruit.",
          english: "When the race began, the hare immediately ran far ahead.",
          words: [
            { nl: "toen", en: "when (single past event)" },
            { nl: "begon", en: "began — past of beginnen" },
            { nl: "rende", en: "ran — past of rennen" },
            { nl: "meteen", en: "immediately" },
            { nl: "ver vooruit", en: "far ahead" },
          ],
          notes: [
            {
              title: "'toen' + end verb, then inversion",
              body: "'Toen' is subordinating, so its clause sends the verb to the end: 'toen de wedstrijd begon'. The main clause then inverts — verb second: '…rende de haas…'. Pattern: [Toen-clause], [verb] [subject] …",
            },
          ],
        },
        {
          id: "f1-s5",
          dutch:
            "Hij was zo zeker van zichzelf dat hij onderweg ging slapen.",
          english:
            "He was so sure of himself that he went to sleep along the way.",
          words: [
            { nl: "zo zeker van zichzelf", en: "so sure of himself" },
            { nl: "dat", en: "that (subordinating)" },
            { nl: "onderweg", en: "on the way, en route" },
            { nl: "ging slapen", en: "went to sleep (gaan + infinitive)" },
          ],
          notes: [
            {
              title: "zo … dat",
              body: "'Zo + adjective + dat …' = 'so + adjective + that …': 'zo zeker dat hij ging slapen' (so sure that he went to sleep). The 'dat'-clause pushes its verbs to the end: '…dat hij onderweg ging slapen'.",
            },
            {
              title: "gaan + infinitive",
              body: "'Gaan slapen' = to go to sleep; 'gaan' + a bare infinitive (no 'te'). Same as 'gaan eten' (go eat), 'gaan zitten' (sit down). Here in the past: 'ging slapen'.",
            },
          ],
        },
        {
          id: "f1-s6",
          dutch: "De schildpad liep langzaam, maar stopte nooit.",
          english: "The tortoise walked slowly, but never stopped.",
          words: [
            { nl: "liep", en: "walked — past of lopen" },
            { nl: "langzaam", en: "slowly" },
            { nl: "maar", en: "but" },
            { nl: "stopte nooit", en: "never stopped" },
          ],
          notes: [
            {
              title: "nooit — placement",
              body: "'Nooit' (never) sits after the verb in a main clause: 'hij stopte nooit'. Like other negatives ('niet', 'nooit', 'geen'), it tends to come late in the sentence.",
            },
          ],
        },
        {
          id: "f1-s7",
          dutch:
            "Terwijl de haas sliep, kwam de schildpad als eerste bij de finish.",
          english:
            "While the hare slept, the tortoise reached the finish first.",
          words: [
            { nl: "terwijl", en: "while" },
            { nl: "sliep", en: "slept — past of slapen" },
            { nl: "kwam", en: "came — past of komen" },
            { nl: "als eerste", en: "first, as the first one" },
            { nl: "bij de finish", en: "at the finish" },
          ],
          notes: [
            {
              title: "terwijl — at the same time",
              body: "'Terwijl' = while (two things happening at once). Subordinating: verb to the end — 'terwijl de haas sliep'. Then the main clause inverts: '…kwam de schildpad…'.",
            },
          ],
        },
      ],
      [
        {
          id: "f1-s8",
          dutch: "Langzaam en gestaag win je de race.",
          english: "Slow and steady wins the race.",
          words: [
            { nl: "langzaam en gestaag", en: "slow and steady" },
            { nl: "win je", en: "you win" },
            { nl: "de race", en: "the race" },
          ],
          notes: [
            {
              title: "De moraal",
              body: "The fable's lesson: patience and persistence beat careless speed. 'Gestaag' = steady, steadily — a slightly literary word kept here for the saying. The generic 'je' means 'one / you in general'.",
            },
          ],
        },
      ],
    ],
  },
  {
    page: 2,
    chapter: 2,
    title: "Fabel 2 — De vos en de druiven",
    paragraphs: [
      [
        {
          id: "f2-s1",
          dutch: "Op een warme dag zag een vos mooie druiven aan een hoge tak.",
          english: "On a warm day a fox saw beautiful grapes on a high branch.",
          words: [
            { nl: "op een warme dag", en: "on a warm day" },
            { nl: "zag", en: "saw — past of zien" },
            { nl: "een vos", en: "a fox" },
            { nl: "mooie druiven", en: "beautiful grapes" },
            { nl: "aan een hoge tak", en: "on a high branch" },
          ],
          notes: [
            {
              title: "'aan' for hanging/attached",
              body: "Things that hang from or are attached to something take 'aan': 'druiven aan de tak' (grapes on the branch), 'een schilderij aan de muur' (a painting on the wall).",
            },
          ],
        },
        {
          id: "f2-s2",
          dutch: "Hij had veel honger en wilde ze graag eten.",
          english: "He was very hungry and really wanted to eat them.",
          words: [
            { nl: "had honger", en: "was hungry (lit. 'had hunger')" },
            { nl: "veel", en: "a lot, much" },
            { nl: "wilde", en: "wanted — past of willen" },
            { nl: "ze", en: "them" },
            { nl: "graag", en: "gladly, would like to" },
          ],
          notes: [
            {
              title: "honger hebben",
              body: "Dutch 'has' hunger and thirst: 'honger hebben' (to be hungry), 'dorst hebben' (to be thirsty). Not '*zijn'. 'Ik heb honger' = I'm hungry.",
            },
            {
              title: "graag = would like to",
              body: "'Graag' added to a verb means you'd like / enjoy doing it: 'ik eet graag' (I like eating), 'hij wilde ze graag eten' (he really wanted to eat them). It's the everyday way to express 'would like'.",
            },
          ],
        },
        {
          id: "f2-s3",
          dutch: "De vos sprong zo hoog als hij kon, maar hij kon er niet bij.",
          english: "The fox jumped as high as he could, but he couldn't reach them.",
          words: [
            { nl: "sprong", en: "jumped — past of springen" },
            { nl: "zo hoog als hij kon", en: "as high as he could" },
            { nl: "kon", en: "could — past of kunnen" },
            { nl: "er niet bij kunnen", en: "to not be able to reach it" },
          ],
          notes: [
            {
              title: "zo … als — as … as",
              body: "'Zo hoog als hij kon' = as high as he could. Pattern for comparisons of equality: 'zo + adjective + als'. 'Zo snel als de wind' (as fast as the wind).",
            },
            {
              title: "'er niet bij kunnen'",
              body: "'Ergens bij kunnen' = to be able to reach something. 'Ik kan er niet bij' = I can't reach it. The 'er … bij' wraps around the rest of the sentence; the verb 'kunnen' carries the meaning 'to manage/reach' here.",
            },
          ],
        },
      ],
      [
        {
          id: "f2-s4",
          dutch: "Hij probeerde het keer op keer, maar het lukte niet.",
          english: "He tried again and again, but it didn't work.",
          words: [
            { nl: "probeerde", en: "tried — past of proberen" },
            { nl: "keer op keer", en: "again and again, time after time" },
            { nl: "het lukte niet", en: "it didn't work / succeed" },
          ],
          notes: [
            {
              title: "lukken — to succeed/work out",
              body: "'Lukken' = to succeed, work out. It's used impersonally with 'het': 'het lukt' (it works), 'het lukte niet' (it didn't work). To say who managed it, add a dative: 'het lukte hem niet' (he didn't manage it).",
            },
          ],
        },
        {
          id: "f2-s5",
          dutch: "Eindelijk gaf hij het op en liep weg.",
          english: "Finally he gave up and walked away.",
          words: [
            { nl: "eindelijk", en: "finally, at last" },
            { nl: "gaf op", en: "gave up (separable: opgeven)" },
            { nl: "het", en: "it" },
            { nl: "liep weg", en: "walked away (separable: weglopen)" },
          ],
          notes: [
            {
              title: "Separable verbs: opgeven, weglopen",
              body: "Both split in a main clause and send the prefix to the end: 'hij gaf het op' (he gave it up), 'hij liep weg' (he walked away). In a subordinate clause they rejoin: '…dat hij opgaf'.",
            },
          ],
        },
        {
          id: "f2-s6",
          dutch: "'Die druiven zijn vast nog zuur,' zei hij boos.",
          english: "'Those grapes are probably sour anyway,' he said crossly.",
          words: [
            { nl: "die druiven", en: "those grapes" },
            { nl: "vast", en: "surely, probably" },
            { nl: "nog", en: "anyway, still" },
            { nl: "zuur", en: "sour" },
            { nl: "zei", en: "said — past of zeggen" },
          ],
          notes: [
            {
              title: "'vast' = probably/surely",
              body: "Here 'vast' means 'surely / probably' (a confident guess): 'dat is vast lekker' = that's surely tasty. Don't confuse with 'vast' meaning 'stuck/fixed' ('de deur zit vast').",
            },
          ],
        },
      ],
      [
        {
          id: "f2-s7",
          dutch: "Het is makkelijk om iets te haten dat je niet kunt krijgen.",
          english: "It is easy to despise what you cannot have.",
          words: [
            { nl: "het is makkelijk", en: "it is easy" },
            { nl: "om … te haten", en: "to hate/despise" },
            { nl: "iets dat …", en: "something that …" },
            { nl: "niet kunt krijgen", en: "cannot get" },
          ],
          notes: [
            {
              title: "De moraal",
              body: "The origin of 'sour grapes': we pretend not to want what we can't have. Grammar: 'het is makkelijk om … te + infinitive' is the standard frame for 'it is easy to …'. The relative clause 'dat je niet kunt krijgen' sends its verbs to the end.",
            },
          ],
        },
      ],
    ],
  },
  {
    page: 3,
    chapter: 3,
    title: "Fabel 3 — De mier en de krekel",
    paragraphs: [
      [
        {
          id: "f3-s1",
          dutch: "De hele zomer zong en danste de krekel in het gras.",
          english: "All summer the cricket sang and danced in the grass.",
          words: [
            { nl: "de hele zomer", en: "the whole summer" },
            { nl: "zong", en: "sang — past of zingen" },
            { nl: "danste", en: "danced — past of dansen" },
            { nl: "de krekel", en: "the cricket" },
            { nl: "in het gras", en: "in the grass" },
          ],
          notes: [
            {
              title: "Time phrase up front → inversion",
              body: "'De hele zomer' opens the sentence, so the verb takes second place and the subject follows: '…zong en danste de krekel…'. With two verbs sharing one subject, both come before it here.",
            },
          ],
        },
        {
          id: "f3-s2",
          dutch: "De mier werkte hard en verzamelde eten voor de winter.",
          english: "The ant worked hard and gathered food for the winter.",
          words: [
            { nl: "de mier", en: "the ant" },
            { nl: "werkte hard", en: "worked hard" },
            { nl: "verzamelde", en: "gathered, collected — past of verzamelen" },
            { nl: "eten", en: "food" },
            { nl: "voor de winter", en: "for the winter" },
          ],
          notes: [
            {
              title: "'eten' as a noun",
              body: "'Eten' is both the verb 'to eat' and the noun 'food'. 'Eten verzamelen' = to gather food. Context tells them apart; as a noun it's a het-word: 'het eten is klaar' (the food is ready).",
            },
          ],
        },
      ],
      [
        {
          id: "f3-s3",
          dutch:
            "'Waarom werk je zo veel?' vroeg de krekel. 'Kom lekker met me spelen!'",
          english:
            "'Why do you work so much?' asked the cricket. 'Come and play with me!'",
          words: [
            { nl: "waarom", en: "why" },
            { nl: "werk je", en: "do you work" },
            { nl: "zo veel", en: "so much" },
            { nl: "vroeg", en: "asked — past of vragen" },
            { nl: "kom lekker", en: "come (and enjoy)" },
            { nl: "met me spelen", en: "play with me" },
          ],
          notes: [
            {
              title: "'lekker' beyond food",
              body: "'Lekker' literally means 'tasty', but Dutch uses it to mean 'nice / pleasantly': 'lekker spelen' (have a nice play), 'lekker slapen' (sleep well), 'lekker weer' (nice weather). It adds a cosy, enjoyable tone.",
            },
          ],
        },
        {
          id: "f3-s4",
          dutch: "'Ik maak voorraad voor de koude dagen,' antwoordde de mier.",
          english: "'I'm building up a store for the cold days,' answered the ant.",
          words: [
            { nl: "ik maak", en: "I make / am making" },
            { nl: "voorraad", en: "stock, supply, store" },
            { nl: "de koude dagen", en: "the cold days" },
            { nl: "antwoordde", en: "answered — past of antwoorden" },
          ],
          notes: [
            {
              title: "No present continuous",
              body: "Dutch has no '-ing' present. 'Ik maak voorraad' covers both 'I make' and 'I am making'. To stress it's in progress you can say 'ik ben voorraad aan het maken', but the simple present is usually enough.",
            },
          ],
        },
      ],
      [
        {
          id: "f3-s5",
          dutch: "Toen de winter kwam, had de krekel niets te eten.",
          english: "When winter came, the cricket had nothing to eat.",
          words: [
            { nl: "toen", en: "when (single past event)" },
            { nl: "de winter kwam", en: "winter came" },
            { nl: "niets te eten", en: "nothing to eat" },
          ],
          notes: [
            {
              title: "niets/iets te + infinitive",
              body: "'Niets te eten' = nothing to eat; 'iets te doen' = something to do. Pattern: niets/iets/genoeg + te + infinitive. The 'te'-infinitive goes at the end.",
            },
          ],
        },
        {
          id: "f3-s6",
          dutch: "De mier zat warm binnen met genoeg voedsel.",
          english: "The ant sat warm inside with plenty of food.",
          words: [
            { nl: "zat", en: "sat — past of zitten" },
            { nl: "warm binnen", en: "warm inside" },
            { nl: "met genoeg voedsel", en: "with enough food" },
          ],
          notes: [
            {
              title: "voedsel vs. eten",
              body: "'Voedsel' and 'eten' both mean food. 'Eten' is the everyday word; 'voedsel' is a touch more formal/general (also used for animals: 'voedsel voor de vogels').",
            },
          ],
        },
      ],
      [
        {
          id: "f3-s7",
          dutch: "Wie in de zomer werkt, heeft in de winter geen zorgen.",
          english: "Whoever works in summer has no worries in winter.",
          words: [
            { nl: "wie …", en: "whoever, the one who" },
            { nl: "in de zomer werkt", en: "works in summer" },
            { nl: "heeft geen zorgen", en: "has no worries" },
            { nl: "in de winter", en: "in winter" },
          ],
          notes: [
            {
              title: "De moraal",
              body: "Prepare in good times for the hard times ahead. Grammar: 'wie …' opens a 'whoever' clause whose verb goes to the end ('wie in de zomer werkt'); the main clause then inverts ('heeft …'). 'Geen' negates the noun 'zorgen' (worries).",
            },
          ],
        },
      ],
    ],
  },
  {
    page: 4,
    chapter: 4,
    title: "Fabel 4 — De leeuw en de muis",
    paragraphs: [
      [
        {
          id: "f4-s1",
          dutch: "Een leeuw sliep rustig in de zon.",
          english: "A lion slept peacefully in the sun.",
          words: [
            { nl: "een leeuw", en: "a lion" },
            { nl: "sliep", en: "slept — past of slapen" },
            { nl: "rustig", en: "calmly, peacefully" },
            { nl: "in de zon", en: "in the sun" },
          ],
          notes: [
            {
              title: "rustig — calm/quiet",
              body: "'Rustig' = calm, quiet, peaceful, at ease. As an adverb it describes how something happens: 'rustig slapen' (sleep peacefully), 'doe rustig aan' (take it easy).",
            },
          ],
        },
        {
          id: "f4-s2",
          dutch: "Een kleine muis liep over zijn poot en maakte hem wakker.",
          english: "A little mouse ran over his paw and woke him up.",
          words: [
            { nl: "een kleine muis", en: "a little mouse" },
            { nl: "liep over", en: "ran/walked over" },
            { nl: "zijn poot", en: "his paw" },
            { nl: "maakte wakker", en: "woke up (separable: wakker maken)" },
            { nl: "hem", en: "him" },
          ],
          notes: [
            {
              title: "wakker maken vs. wakker worden",
              body: "'Iemand wakker maken' = to wake someone (you do it to them). 'Wakker worden' = to wake up (it happens to you). 'De muis maakte de leeuw wakker' → 'de leeuw werd wakker'.",
            },
          ],
        },
        {
          id: "f4-s3",
          dutch: "De leeuw werd boos en pakte de muis met zijn grote klauw.",
          english: "The lion got angry and grabbed the mouse with his big claw.",
          words: [
            { nl: "werd boos", en: "got angry" },
            { nl: "pakte", en: "grabbed, took — past of pakken" },
            { nl: "met zijn grote klauw", en: "with his big claw" },
          ],
          notes: [
            {
              title: "pakken — to grab/take",
              body: "'Pakken' is the everyday verb for grabbing or taking hold of something: 'pak je jas' (grab your coat), 'hij pakte de bal' (he caught/grabbed the ball). Regular: pak, pakte, gepakt.",
            },
          ],
        },
      ],
      [
        {
          id: "f4-s4",
          dutch:
            "'Laat me alsjeblieft gaan,' piepte de muis. 'Misschien kan ik je ooit helpen.'",
          english:
            "'Please let me go,' squeaked the mouse. 'Maybe one day I can help you.'",
          words: [
            { nl: "laat me gaan", en: "let me go" },
            { nl: "alsjeblieft", en: "please" },
            { nl: "piepte", en: "squeaked — past of piepen" },
            { nl: "misschien", en: "maybe, perhaps" },
            { nl: "ooit", en: "ever, some day" },
            { nl: "kan ik je helpen", en: "I can help you" },
          ],
          notes: [
            {
              title: "'misschien' triggers inversion",
              body: "Starting with 'misschien' puts the verb second and the subject after it: 'misschien kan ik …' (not 'misschien ik kan'). Many adverbs at the front do this — it's the V2 rule again.",
            },
          ],
        },
        {
          id: "f4-s5",
          dutch: "De leeuw moest lachen, maar liet de muis toch vrij.",
          english: "The lion couldn't help laughing, but let the mouse go free anyway.",
          words: [
            { nl: "moest lachen", en: "couldn't help laughing (lit. had to laugh)" },
            { nl: "liet vrij", en: "set free (separable: vrijlaten)" },
            { nl: "toch", en: "still, anyway, nonetheless" },
          ],
          notes: [
            {
              title: "'moeten lachen' — idiom",
              body: "'Ik moet lachen' literally 'I have to laugh' = I can't help laughing. Dutch uses 'moeten' for involuntary reactions: 'ik moet niezen' (I have to sneeze), 'ik moest huilen' (I couldn't help crying).",
            },
          ],
        },
        {
          id: "f4-s6",
          dutch: "Een paar dagen later zat de leeuw vast in het net van een jager.",
          english: "A few days later the lion was caught in a hunter's net.",
          words: [
            { nl: "een paar dagen later", en: "a few days later" },
            { nl: "zat vast", en: "was stuck/caught (separable: vastzitten)" },
            { nl: "het net", en: "the net" },
            { nl: "van een jager", en: "of a hunter" },
          ],
          notes: [
            {
              title: "vastzitten — to be stuck",
              body: "'Vastzitten' = to be stuck/trapped/caught. 'Vast' = fixed, firm. Opposite: 'loszitten' (to be loose). 'De deur zit vast' (the door is stuck).",
            },
          ],
        },
        {
          id: "f4-s7",
          dutch: "De muis hoorde zijn gebrul en knaagde het net stuk.",
          english: "The mouse heard his roar and gnawed the net to pieces.",
          words: [
            { nl: "hoorde", en: "heard — past of horen" },
            { nl: "zijn gebrul", en: "his roar(ing)" },
            { nl: "knaagde", en: "gnawed — past of knagen" },
            { nl: "stuk", en: "to pieces, broken" },
          ],
          notes: [
            {
              title: "ge- for a collective sound/action",
              body: "'Gebrul' = roaring (from 'brullen', to roar). The prefix ge- makes nouns for continuous noise/activity: gezang (singing), gelach (laughter), gehuil (crying).",
            },
            {
              title: "iets stuk + verb",
              body: "Adding 'stuk' shows the result is broken: 'iets stuk maken' (break something), 'stuk knagen' (gnaw apart), 'stuk vallen' (fall and break). 'Stuk' = the resulting broken state.",
            },
          ],
        },
      ],
      [
        {
          id: "f4-s8",
          dutch: "Ook een kleine vriend kan een grote hulp zijn.",
          english: "Even a small friend can be a big help.",
          words: [
            { nl: "ook", en: "even, also" },
            { nl: "een kleine vriend", en: "a small friend" },
            { nl: "een grote hulp", en: "a big help" },
          ],
          notes: [
            {
              title: "De moraal",
              body: "Kindness is never wasted, and the weak can help the strong. Here 'ook' means 'even' (ook een kleine = even a small one). 'Hulp' is the noun 'help/aid'; the verb is 'helpen'.",
            },
          ],
        },
      ],
    ],
  },
  {
    page: 5,
    chapter: 5,
    title: "Fabel 5 — De jongen die 'wolf' riep",
    paragraphs: [
      [
        {
          id: "f5-s1",
          dutch: "Een herdersjongen paste elke dag op de schapen.",
          english: "A shepherd boy watched the sheep every day.",
          words: [
            { nl: "een herdersjongen", en: "a shepherd boy" },
            { nl: "paste op", en: "watched over, looked after (separable: oppassen)" },
            { nl: "elke dag", en: "every day" },
            { nl: "de schapen", en: "the sheep (plural)" },
          ],
          notes: [
            {
              title: "oppassen op",
              body: "'Oppassen op' = to look after / keep an eye on. 'Op de kinderen passen' (babysit the children). On its own 'pas op!' = watch out! 'Schaap' → plural 'schapen'.",
            },
          ],
        },
        {
          id: "f5-s2",
          dutch: "Hij verveelde zich en riep voor de grap: 'Wolf! Wolf!'",
          english: "He was bored and shouted as a joke: 'Wolf! Wolf!'",
          words: [
            { nl: "verveelde zich", en: "was bored (reflexive: zich vervelen)" },
            { nl: "riep", en: "shouted, called — past of roepen" },
            { nl: "voor de grap", en: "as a joke, for fun" },
          ],
          notes: [
            {
              title: "zich vervelen — reflexive",
              body: "'Zich vervelen' = to be bored. Always reflexive: ik verveel me, jij verveelt je, hij verveelt zich. 'Ik verveel me' = I'm bored.",
            },
          ],
        },
        {
          id: "f5-s3",
          dutch: "De mensen uit het dorp kwamen snel aanrennen om te helpen.",
          english: "The people from the village came running quickly to help.",
          words: [
            { nl: "de mensen", en: "the people" },
            { nl: "uit het dorp", en: "from the village" },
            { nl: "kwamen aanrennen", en: "came running (komen + aanrennen)" },
            { nl: "om te helpen", en: "in order to help" },
          ],
          notes: [
            {
              title: "om te + infinitive (purpose)",
              body: "'Om te helpen' = in order to help. The purpose frame 'om … te + infinitive' answers 'why'. The infinitive goes to the end: 'om te helpen'.",
            },
          ],
        },
      ],
      [
        {
          id: "f5-s4",
          dutch: "Maar er was geen wolf, en de jongen lachte hen uit.",
          english: "But there was no wolf, and the boy laughed at them.",
          words: [
            { nl: "er was geen wolf", en: "there was no wolf" },
            { nl: "lachte uit", en: "mocked, laughed at (separable: uitlachen)" },
            { nl: "hen", en: "them" },
          ],
          notes: [
            {
              title: "uitlachen vs. lachen om",
              body: "'Iemand uitlachen' = to laugh AT someone, to mock them (separable, takes a person object). Compare 'lachen om iets' (to laugh about something). 'Ze lachten hem uit' = they mocked him.",
            },
          ],
        },
        {
          id: "f5-s5",
          dutch: "Hij deed dit nog een keer, en weer kwam iedereen voor niets.",
          english: "He did this once more, and again everyone came for nothing.",
          words: [
            { nl: "deed", en: "did — past of doen" },
            { nl: "nog een keer", en: "one more time, again" },
            { nl: "weer", en: "again" },
            { nl: "iedereen", en: "everyone" },
            { nl: "voor niets", en: "for nothing, in vain" },
          ],
          notes: [
            {
              title: "'weer' at the front → inversion",
              body: "'Weer kwam iedereen' — 'weer' (again) opens the clause, so the verb 'kwam' comes second and the subject 'iedereen' follows. Don't confuse 'weer' (again) with 'het weer' (the weather).",
            },
          ],
        },
        {
          id: "f5-s6",
          dutch: "Op een dag kwam er echt een wolf.",
          english: "One day a wolf really came.",
          words: [
            { nl: "op een dag", en: "one day" },
            { nl: "kwam er", en: "there came" },
            { nl: "echt", en: "really, truly" },
            { nl: "een wolf", en: "a wolf" },
          ],
          notes: [
            {
              title: "'er' with appearing things",
              body: "When something new appears or exists, Dutch often uses 'er': 'er kwam een wolf' (a wolf came/appeared), 'er is een probleem' (there is a problem). 'Er' fills the subject slot before the real subject.",
            },
          ],
        },
      ],
      [
        {
          id: "f5-s7",
          dutch: "De jongen riep om hulp, maar nu geloofde niemand hem.",
          english: "The boy cried for help, but now no one believed him.",
          words: [
            { nl: "riep om hulp", en: "called for help" },
            { nl: "nu", en: "now" },
            { nl: "geloofde", en: "believed — past of geloven" },
            { nl: "niemand", en: "no one, nobody" },
          ],
          notes: [
            {
              title: "roepen om",
              body: "'Roepen om iets' = to call/cry out for something: 'om hulp roepen' (cry for help). And 'niemand' (nobody) is the subject here, after the inverted verb: '…geloofde niemand hem'.",
            },
          ],
        },
        {
          id: "f5-s8",
          dutch: "Wie vaak liegt, wordt niet meer geloofd.",
          english: "Whoever lies often is no longer believed.",
          words: [
            { nl: "wie vaak liegt", en: "whoever lies often" },
            { nl: "wordt geloofd", en: "is believed (passive)" },
            { nl: "niet meer", en: "no longer, not anymore" },
          ],
          notes: [
            {
              title: "De moraal",
              body: "A liar isn't believed even when telling the truth. Grammar: 'wordt geloofd' is the passive (worden + past participle) = 'is believed'. 'Niet meer' = no longer.",
            },
          ],
        },
      ],
    ],
  },
  {
    page: 6,
    chapter: 6,
    title: "Fabel 6 — De noordenwind en de zon",
    paragraphs: [
      [
        {
          id: "f6-s1",
          dutch: "De noordenwind en de zon hadden ruzie over wie het sterkst was.",
          english: "The North Wind and the Sun argued over who was the strongest.",
          words: [
            { nl: "de noordenwind", en: "the north wind" },
            { nl: "hadden ruzie", en: "argued, quarrelled (lit. 'had a quarrel')" },
            { nl: "over wie", en: "over who" },
            { nl: "het sterkst", en: "the strongest" },
          ],
          notes: [
            {
              title: "ruzie hebben / maken",
              body: "'Ruzie hebben' = to be quarrelling; 'ruzie maken' = to start a quarrel. 'Ruzie over iets' = an argument about something.",
            },
          ],
        },
        {
          id: "f6-s2",
          dutch: "Ze zagen een man met een warme jas over de weg lopen.",
          english: "They saw a man in a warm coat walking along the road.",
          words: [
            { nl: "zagen", en: "saw — past of zien" },
            { nl: "een man", en: "a man" },
            { nl: "met een warme jas", en: "with/in a warm coat" },
            { nl: "over de weg", en: "along the road" },
            { nl: "lopen", en: "to walk (bare infinitive after zien)" },
          ],
          notes: [
            {
              title: "zien + bare infinitive",
              body: "Verbs of perception take a bare infinitive (no 'te'): 'ze zagen hem lopen' (they saw him walk/walking), 'ik hoor je zingen' (I hear you singing). The infinitive goes to the end.",
            },
          ],
        },
        {
          id: "f6-s3",
          dutch: "'Wie zijn jas het eerst uitkrijgt, heeft gewonnen,' zei de zon.",
          english: "'Whoever gets his coat off first has won,' said the Sun.",
          words: [
            { nl: "wie … het eerst", en: "whoever … first" },
            { nl: "uitkrijgt", en: "gets off (separable: uitkrijgen)" },
            { nl: "heeft gewonnen", en: "has won — perfect of winnen" },
          ],
          notes: [
            {
              title: "uitkrijgen — manage to get off",
              body: "'Uitkrijgen' = to manage to get (clothes) off. The 'krijgen' adds the sense of 'manage/succeed'. Compare 'aankrijgen' (manage to get on). In the 'wie'-clause it stays at the end: 'wie zijn jas uitkrijgt'.",
            },
          ],
        },
      ],
      [
        {
          id: "f6-s4",
          dutch: "De noordenwind blies zo hard als hij kon.",
          english: "The North Wind blew as hard as he could.",
          words: [
            { nl: "blies", en: "blew — past of blazen" },
            { nl: "zo hard als hij kon", en: "as hard as he could" },
          ],
          notes: [
            {
              title: "Strong verb: blazen",
              body: "Blazen → blies → geblazen (to blow). 'Hard blazen' = to blow hard. Note 'hard' here means 'forcefully/loudly', not 'difficult'.",
            },
          ],
        },
        {
          id: "f6-s5",
          dutch: "Maar hoe harder hij blies, hoe steviger de man zijn jas vasthield.",
          english: "But the harder he blew, the more tightly the man held his coat.",
          words: [
            { nl: "hoe harder …, hoe steviger …", en: "the harder …, the tighter …" },
            { nl: "stevig", en: "firm, tight, sturdy" },
            { nl: "hield vast", en: "held on (separable: vasthouden)" },
          ],
          notes: [
            {
              title: "hoe … hoe … (the … the …)",
              body: "'Hoe + comparative …, hoe + comparative …' = 'the more …, the more …'. Both clauses send their verb to the end: 'hoe harder hij blies, hoe steviger de man zijn jas vasthield'. Also seen as 'hoe … des te …'.",
            },
          ],
        },
        {
          id: "f6-s6",
          dutch: "Toen scheen de zon warm en vriendelijk.",
          english: "Then the Sun shone warm and friendly.",
          words: [
            { nl: "toen", en: "then (next in the story)" },
            { nl: "scheen", en: "shone — past of schijnen" },
            { nl: "warm en vriendelijk", en: "warm and friendly" },
          ],
          notes: [
            {
              title: "'toen' = then (sequencing)",
              body: "Besides 'when', 'toen' is used to mean 'then / at that point' in a past story, opening a sentence and triggering inversion: 'toen scheen de zon'. Strong verb: schijnen → scheen → geschenen.",
            },
          ],
        },
        {
          id: "f6-s7",
          dutch: "Al snel had de man het te warm en deed zijn jas uit.",
          english: "Soon the man was too warm and took off his coat.",
          words: [
            { nl: "al snel", en: "soon, before long" },
            { nl: "had het te warm", en: "was too warm (lit. 'had it too warm')" },
            { nl: "deed uit", en: "took off (separable: uitdoen)" },
          ],
          notes: [
            {
              title: "'het … hebben' for feeling temperature",
              body: "Dutch says you 'have it' warm/cold: 'ik heb het warm' (I'm warm), 'ze had het koud' (she was cold). With 'te': 'hij had het te warm' (he was too warm).",
            },
          ],
        },
      ],
      [
        {
          id: "f6-s8",
          dutch: "Met vriendelijkheid bereik je meer dan met geweld.",
          english: "With kindness you achieve more than with force.",
          words: [
            { nl: "met vriendelijkheid", en: "with kindness" },
            { nl: "bereik je", en: "you achieve" },
            { nl: "meer dan", en: "more than" },
            { nl: "met geweld", en: "with force/violence" },
          ],
          notes: [
            {
              title: "De moraal",
              body: "Persuasion and warmth work better than force. '-heid' turns an adjective into an abstract noun: vriendelijk → vriendelijkheid (kindness), waar → waarheid (truth).",
            },
          ],
        },
      ],
    ],
  },
  {
    page: 7,
    chapter: 7,
    title: "Fabel 7 — De wolf in schaapskleren",
    paragraphs: [
      [
        {
          id: "f7-s1",
          dutch: "Een hongerige wolf wilde graag een schaap eten.",
          english: "A hungry wolf badly wanted to eat a sheep.",
          words: [
            { nl: "een hongerige wolf", en: "a hungry wolf" },
            { nl: "wilde graag", en: "really wanted to" },
            { nl: "een schaap", en: "a sheep" },
          ],
          notes: [
            {
              title: "hongerig vs. honger hebben",
              body: "'Hongerig' is the adjective 'hungry' (een hongerige wolf). In everyday speech people more often say 'honger hebben' ('de wolf had honger'). Both are fine.",
            },
          ],
        },
        {
          id: "f7-s2",
          dutch: "Op een dag vond hij een oude schapenvacht.",
          english: "One day he found an old sheepskin.",
          words: [
            { nl: "vond", en: "found — past of vinden" },
            { nl: "een oude schapenvacht", en: "an old sheepskin/fleece" },
          ],
          notes: [
            {
              title: "Compound nouns",
              body: "Dutch glues nouns together: schaap + vacht = schapenvacht (sheep's fleece). The last noun decides the gender/article. Read compounds back to front: a 'vacht' (fleece) of a 'schaap' (sheep).",
            },
          ],
        },
        {
          id: "f7-s3",
          dutch: "Hij trok de vacht aan en liep tussen de schapen.",
          english: "He put on the fleece and walked among the sheep.",
          words: [
            { nl: "trok aan", en: "put on (separable: aantrekken)" },
            { nl: "de vacht", en: "the fleece, coat" },
            { nl: "tussen de schapen", en: "among the sheep" },
          ],
          notes: [
            {
              title: "aantrekken — to put on",
              body: "'Aantrekken' = to put on (clothing). Splits in main clauses: 'hij trok de vacht aan'. Opposite: 'uittrekken' (take off).",
            },
          ],
        },
      ],
      [
        {
          id: "f7-s4",
          dutch: "Zo kon hij dicht bij de kudde komen zonder dat iemand het merkte.",
          english: "That way he could get close to the flock without anyone noticing.",
          words: [
            { nl: "zo", en: "that way, like this" },
            { nl: "dicht bij", en: "close to" },
            { nl: "de kudde", en: "the flock, herd" },
            { nl: "zonder dat", en: "without (someone doing something)" },
            { nl: "merkte", en: "noticed — past of merken" },
          ],
          notes: [
            {
              title: "'zonder dat' + clause",
              body: "When 'without' is followed by someone doing something, Dutch uses 'zonder dat + clause': 'zonder dat iemand het merkte' (without anyone noticing). The verb goes to the end. If there's no new subject, use 'zonder te': 'zonder te kijken' (without looking).",
            },
          ],
        },
        {
          id: "f7-s5",
          dutch: "Maar die avond wilde de herder een schaap slachten voor het eten.",
          english: "But that evening the shepherd wanted to slaughter a sheep for dinner.",
          words: [
            { nl: "die avond", en: "that evening" },
            { nl: "de herder", en: "the shepherd" },
            { nl: "slachten", en: "to slaughter, butcher" },
            { nl: "voor het eten", en: "for dinner/the meal" },
          ],
          notes: [
            {
              title: "Time phrase first → inversion",
              body: "'Die avond' opens the sentence, so the verb 'wilde' is second and the subject 'de herder' follows. The main verb 'slachten' (infinitive) goes to the end after the modal.",
            },
          ],
        },
        {
          id: "f7-s6",
          dutch: "In het donker pakte hij per ongeluk de wolf.",
          english: "In the dark he accidentally grabbed the wolf.",
          words: [
            { nl: "in het donker", en: "in the dark" },
            { nl: "per ongeluk", en: "by accident, accidentally" },
            { nl: "de wolf", en: "the wolf" },
          ],
          notes: [
            {
              title: "per ongeluk vs. expres",
              body: "'Per ongeluk' = by accident; its opposite is 'expres' (on purpose). 'Sorry, dat deed ik per ongeluk' (sorry, I did that by accident).",
            },
          ],
        },
      ],
      [
        {
          id: "f7-s7",
          dutch: "Wie anderen bedriegt, bedriegt soms zichzelf.",
          english: "Whoever deceives others sometimes deceives himself.",
          words: [
            { nl: "wie anderen bedriegt", en: "whoever deceives others" },
            { nl: "bedriegt", en: "deceives, cheats — of bedriegen" },
            { nl: "soms", en: "sometimes" },
            { nl: "zichzelf", en: "himself/oneself" },
          ],
          notes: [
            {
              title: "De moraal",
              body: "A trick can backfire on the trickster; a false appearance is dangerous. Grammar: the 'wie'-clause sends its verb to the end ('wie anderen bedriegt'), then the main clause inverts ('bedriegt … zichzelf').",
            },
          ],
        },
      ],
    ],
  },
  {
    page: 8,
    chapter: 8,
    title: "Fabel 8 — De stadsmuis en de veldmuis",
    paragraphs: [
      [
        {
          id: "f8-s1",
          dutch: "Een stadsmuis ging op bezoek bij zijn neef, de veldmuis.",
          english: "A town mouse went to visit his cousin, the country mouse.",
          words: [
            { nl: "een stadsmuis", en: "a town/city mouse" },
            { nl: "ging op bezoek", en: "went to visit" },
            { nl: "bij zijn neef", en: "to his cousin's" },
            { nl: "de veldmuis", en: "the field/country mouse" },
          ],
          notes: [
            {
              title: "op bezoek gaan bij",
              body: "'Op bezoek gaan bij iemand' = to go visit someone. 'Bij' marks whose place: 'bij zijn neef' (at his cousin's). 'Neef' = both cousin (male) and nephew.",
            },
          ],
        },
        {
          id: "f8-s2",
          dutch: "De veldmuis gaf hem eenvoudig eten: graan en wortels.",
          english: "The country mouse gave him simple food: grain and roots.",
          words: [
            { nl: "gaf", en: "gave — past of geven" },
            { nl: "eenvoudig eten", en: "simple food" },
            { nl: "graan", en: "grain" },
            { nl: "wortels", en: "roots; also carrots" },
          ],
          notes: [
            {
              title: "eenvoudig — simple/plain",
              body: "'Eenvoudig' = simple, plain, easy. 'Een eenvoudig leven' (a simple life), 'eenvoudig eten' (plain food). A near-synonym of 'simpel' but a touch more elegant.",
            },
          ],
        },
        {
          id: "f8-s3",
          dutch: "'Hoe kun je zo saai leven?' vroeg de stadsmuis. 'Kom mee naar de stad!'",
          english: "'How can you live so dully?' asked the town mouse. 'Come with me to the city!'",
          words: [
            { nl: "hoe kun je", en: "how can you" },
            { nl: "zo saai", en: "so dull/boring" },
            { nl: "leven", en: "to live" },
            { nl: "kom mee", en: "come along (separable: meekomen)" },
            { nl: "naar de stad", en: "to the city" },
          ],
          notes: [
            {
              title: "mee- = along/with",
              body: "'Meekomen' = to come along; 'meegaan' (go along), 'meedoen' (join in), 'meenemen' (take along). The 'mee' splits off in main clauses: 'kom mee!', 'ga je mee?' (are you coming along?).",
            },
          ],
        },
      ],
      [
        {
          id: "f8-s4",
          dutch: "In de stad vonden ze een tafel vol heerlijk eten.",
          english: "In the city they found a table full of delicious food.",
          words: [
            { nl: "vonden", en: "found — past of vinden" },
            { nl: "een tafel vol", en: "a table full of" },
            { nl: "heerlijk eten", en: "delicious food" },
          ],
          notes: [
            {
              title: "vol + noun",
              body: "'Vol' (full of) is followed directly by the thing: 'een tafel vol eten' (a table full of food), 'een glas vol water'. No 'van' needed.",
            },
          ],
        },
        {
          id: "f8-s5",
          dutch: "Maar net toen ze wilden eten, kwam er een grote kat aan.",
          english: "But just as they were about to eat, a big cat came along.",
          words: [
            { nl: "net toen", en: "just as, just when" },
            { nl: "wilden eten", en: "wanted to eat, were about to eat" },
            { nl: "kwam aan", en: "came/arrived (separable: aankomen)" },
            { nl: "een grote kat", en: "a big cat" },
          ],
          notes: [
            {
              title: "'net toen' — just as",
              body: "'Net toen …' = just as / right when …, used for an interrupting moment. Subordinating, so the verb goes to the end ('net toen ze wilden eten'); then the main clause inverts ('kwam er …').",
            },
          ],
        },
        {
          id: "f8-s6",
          dutch: "De twee muizen renden bang weg en konden bijna niet ontsnappen.",
          english: "The two mice ran away in fear and could barely escape.",
          words: [
            { nl: "renden weg", en: "ran away (separable: wegrennen)" },
            { nl: "bang", en: "afraid, scared" },
            { nl: "bijna niet", en: "barely, almost not" },
            { nl: "ontsnappen", en: "to escape" },
          ],
          notes: [
            {
              title: "bijna niet — barely",
              body: "'Bijna niet' = hardly, barely (almost not). Compare 'bijna' alone = almost ('ik ben er bijna' — I'm almost there). 'Ze konden bijna niet ontsnappen' = they could barely escape.",
            },
          ],
        },
      ],
      [
        {
          id: "f8-s7",
          dutch: "'Ik ga liever terug naar huis,' zei de veldmuis. 'Eenvoudig maar veilig.'",
          english: "'I'd rather go back home,' said the country mouse. 'Simple but safe.'",
          words: [
            { nl: "ik ga liever", en: "I'd rather go" },
            { nl: "terug naar huis", en: "back home" },
            { nl: "veilig", en: "safe" },
          ],
          notes: [
            {
              title: "liever — would rather",
              body: "'Liever' = rather, the comparative of 'graag'. 'Ik ga liever naar huis' = I'd rather go home. Build it as 'liever + verb'. The favourite is 'het liefst' (most of all).",
            },
          ],
        },
        {
          id: "f8-s8",
          dutch: "Liever eenvoudig en veilig dan rijk en bang.",
          english: "Better simple and safe than rich and afraid.",
          words: [
            { nl: "liever … dan …", en: "rather … than …" },
            { nl: "eenvoudig en veilig", en: "simple and safe" },
            { nl: "rijk en bang", en: "rich and afraid" },
          ],
          notes: [
            {
              title: "De moraal",
              body: "A modest life in peace beats luxury full of fear. Pattern: 'liever X dan Y' = better/rather X than Y. A common way to state a preference.",
            },
          ],
        },
      ],
    ],
  },
  {
    page: 9,
    chapter: 9,
    title: "Fabel 9 — De kraai en de kruik",
    paragraphs: [
      [
        {
          id: "f9-s1",
          dutch: "Een dorstige kraai vond een kruik met een beetje water erin.",
          english: "A thirsty crow found a pitcher with a little water in it.",
          words: [
            { nl: "een dorstige kraai", en: "a thirsty crow" },
            { nl: "een kruik", en: "a pitcher, jug" },
            { nl: "een beetje water", en: "a little water" },
            { nl: "erin", en: "in it" },
          ],
          notes: [
            {
              title: "er + preposition",
              body: "'Erin' = in it; Dutch fuses 'er' with a preposition instead of saying 'in it/that': erin (in it), erop (on it), ermee (with it). 'Water erin' = water in it.",
            },
          ],
        },
        {
          id: "f9-s2",
          dutch: "Maar het water stond te laag en haar snavel kon er niet bij.",
          english: "But the water was too low and her beak couldn't reach it.",
          words: [
            { nl: "het water stond te laag", en: "the water was/stood too low" },
            { nl: "haar snavel", en: "her beak" },
            { nl: "kon er niet bij", en: "couldn't reach it" },
          ],
          notes: [
            {
              title: "'staan' for liquid levels",
              body: "Dutch uses 'staan' for where a level sits: 'het water staat hoog/laag' (the water is high/low). Also 'staan' for things standing upright. 'Er niet bij kunnen' = can't reach it.",
            },
          ],
        },
        {
          id: "f9-s3",
          dutch: "De kraai dacht goed na en kreeg een slim idee.",
          english: "The crow thought hard and got a clever idea.",
          words: [
            { nl: "dacht na", en: "thought, reflected (separable: nadenken)" },
            { nl: "goed", en: "well, hard" },
            { nl: "kreeg", en: "got — past of krijgen" },
            { nl: "een slim idee", en: "a clever idea" },
          ],
          notes: [
            {
              title: "nadenken — to think over",
              body: "'Nadenken (over iets)' = to think, reflect (about something). Separable: 'ze dacht goed na'. Different from 'denken' (to think/believe): 'ik denk van wel' (I think so).",
            },
          ],
        },
      ],
      [
        {
          id: "f9-s4",
          dutch: "Eén voor één liet ze steentjes in de kruik vallen.",
          english: "One by one she dropped pebbles into the pitcher.",
          words: [
            { nl: "één voor één", en: "one by one" },
            { nl: "liet vallen", en: "dropped (laten + vallen)" },
            { nl: "steentjes", en: "little stones, pebbles" },
            { nl: "in de kruik", en: "into the pitcher" },
          ],
          notes: [
            {
              title: "laten vallen — to drop",
              body: "'Iets laten vallen' = to drop something (let it fall). 'Laten + infinitive' for causing things: laten vallen (drop), laten zien (show), laten weten (let know).",
            },
          ],
        },
        {
          id: "f9-s5",
          dutch: "Langzaam kwam het water steeds hoger.",
          english: "Slowly the water rose higher and higher.",
          words: [
            { nl: "langzaam", en: "slowly" },
            { nl: "kwam hoger", en: "rose/came higher" },
            { nl: "steeds hoger", en: "higher and higher" },
          ],
          notes: [
            {
              title: "steeds + comparative",
              body: "'Steeds + comparative' = more and more …: steeds hoger (higher and higher), steeds beter (better and better), steeds meer (more and more). 'Steeds' = ever, increasingly.",
            },
          ],
        },
        {
          id: "f9-s6",
          dutch: "Eindelijk kon de kraai drinken zoveel als ze wilde.",
          english: "Finally the crow could drink as much as she wanted.",
          words: [
            { nl: "eindelijk", en: "finally" },
            { nl: "kon drinken", en: "could drink" },
            { nl: "zoveel als ze wilde", en: "as much as she wanted" },
          ],
          notes: [
            {
              title: "zoveel als — as much as",
              body: "'Zoveel als' = as much as. The 'als'-clause sends its verb to the end: 'zoveel als ze wilde'. Related: 'zo veel mogelijk' (as much as possible).",
            },
          ],
        },
      ],
      [
        {
          id: "f9-s7",
          dutch: "Met geduld en verstand los je elk probleem op.",
          english: "With patience and sense you solve any problem.",
          words: [
            { nl: "met geduld", en: "with patience" },
            { nl: "verstand", en: "sense, intelligence" },
            { nl: "los je op", en: "you solve (separable: oplossen)" },
            { nl: "elk probleem", en: "any/every problem" },
          ],
          notes: [
            {
              title: "De moraal",
              body: "Cleverness beats brute strength; little by little does the trick. Grammar: 'oplossen' (to solve) splits — 'je lost het op'. With 'met …' up front, the verb 'los' comes second.",
            },
          ],
        },
      ],
    ],
  },
  {
    page: 10,
    chapter: 10,
    title: "Fabel 10 — De vos en de ooievaar",
    paragraphs: [
      [
        {
          id: "f10-s1",
          dutch: "De vos nodigde de ooievaar uit om te komen eten.",
          english: "The fox invited the stork to come and eat.",
          words: [
            { nl: "nodigde uit", en: "invited (separable: uitnodigen)" },
            { nl: "de ooievaar", en: "the stork" },
            { nl: "om te komen eten", en: "to come and eat" },
          ],
          notes: [
            {
              title: "uitnodigen om te …",
              body: "'Iemand uitnodigen om te …' = to invite someone to … Separable: 'hij nodigde haar uit'. The 'om te'-clause states the purpose: 'om te komen eten'.",
            },
          ],
        },
        {
          id: "f10-s2",
          dutch: "Hij gaf de soep op een plat bord.",
          english: "He served the soup on a flat plate.",
          words: [
            { nl: "gaf", en: "gave, served — past of geven" },
            { nl: "de soep", en: "the soup" },
            { nl: "op een plat bord", en: "on a flat plate" },
          ],
          notes: [
            {
              title: "bord — plate (a het-word)",
              body: "'Het bord' = the plate (also: board/sign). 'Een plat bord' uses the bare adjective 'plat' because 'bord' is a het-word after 'een'. Compare a de-word: 'een platte steen'.",
            },
          ],
        },
        {
          id: "f10-s3",
          dutch: "De ooievaar kon met haar lange snavel niets eten.",
          english: "The stork couldn't eat anything with her long beak.",
          words: [
            { nl: "kon niets eten", en: "couldn't eat anything" },
            { nl: "met haar lange snavel", en: "with her long beak" },
          ],
          notes: [
            {
              title: "niets — placement",
              body: "'Niets' (nothing) is the object here: 'ze kon niets eten' (she could eat nothing). The infinitive 'eten' goes to the end after the modal 'kon'.",
            },
          ],
        },
      ],
      [
        {
          id: "f10-s4",
          dutch: "De vos likte snel alle soep op en lachte stiekem.",
          english: "The fox quickly licked up all the soup and laughed slyly.",
          words: [
            { nl: "likte op", en: "licked up (separable: oplikken)" },
            { nl: "alle soep", en: "all the soup" },
            { nl: "stiekem", en: "secretly, slyly" },
          ],
          notes: [
            {
              title: "op- = up/finished",
              body: "The prefix 'op' often means 'all gone / finished': oplikken (lick up), opeten (eat up), opdrinken (drink up). 'De soep is op' = the soup is all gone.",
            },
          ],
        },
        {
          id: "f10-s5",
          dutch: "Een week later nodigde de ooievaar de vos uit.",
          english: "A week later the stork invited the fox.",
          words: [
            { nl: "een week later", en: "a week later" },
            { nl: "nodigde uit", en: "invited (separable: uitnodigen)" },
          ],
          notes: [
            {
              title: "Time phrase first → inversion",
              body: "'Een week later' opens the sentence, so the verb 'nodigde' comes second; the prefix 'uit' goes to the end: '…nodigde de ooievaar de vos uit'.",
            },
          ],
        },
        {
          id: "f10-s6",
          dutch: "Zij gaf het eten in een hoge, smalle kan.",
          english: "She served the food in a tall, narrow jug.",
          words: [
            { nl: "het eten", en: "the food" },
            { nl: "een hoge, smalle kan", en: "a tall, narrow jug" },
          ],
          notes: [
            {
              title: "Two adjectives",
              body: "Stack adjectives with a comma: 'een hoge, smalle kan' (a tall, narrow jug). Both take -e here (de-word 'kan' after 'een'). 'Kan' = jug/can; don't confuse with the verb 'kan' (can).",
            },
          ],
        },
        {
          id: "f10-s7",
          dutch: "Nu kon de vos niets eten, en de ooievaar at rustig haar deel.",
          english: "Now the fox couldn't eat anything, and the stork calmly ate her share.",
          words: [
            { nl: "nu", en: "now" },
            { nl: "at", en: "ate — past of eten" },
            { nl: "rustig", en: "calmly" },
            { nl: "haar deel", en: "her share/portion" },
          ],
          notes: [
            {
              title: "Strong verb: eten",
              body: "Eten → at → gegeten (to eat). The past 'at' is short; plural 'aten'. 'Haar deel eten' = to eat her share.",
            },
          ],
        },
      ],
      [
        {
          id: "f10-s8",
          dutch: "Wie een ander voor de gek houdt, kan hetzelfde terugkrijgen.",
          english: "Whoever fools another may get the same in return.",
          words: [
            { nl: "voor de gek houden", en: "to fool, make fun of (idiom)" },
            { nl: "hetzelfde", en: "the same" },
            { nl: "terugkrijgen", en: "to get back/in return" },
          ],
          notes: [
            {
              title: "De moraal",
              body: "One bad turn deserves another; mockery comes back to you. Idiom: 'iemand voor de gek houden' = to fool/tease someone. The 'wie'-clause sends 'houdt' to the end, then the main clause inverts.",
            },
          ],
        },
      ],
    ],
  },
  {
    page: 11,
    chapter: 11,
    title: "Fabel 11 — De gans met de gouden eieren",
    paragraphs: [
      [
        {
          id: "f11-s1",
          dutch: "Een arme boer had een bijzondere gans.",
          english: "A poor farmer had a special goose.",
          words: [
            { nl: "een arme boer", en: "a poor farmer" },
            { nl: "een bijzondere gans", en: "a special goose" },
          ],
          notes: [
            {
              title: "arm — poor (two meanings)",
              body: "'Arm' = poor (not rich) and also 'arm' (the body part). 'Een arme boer' = a poor farmer. Context makes it clear; here the -e ending marks the adjective before a noun.",
            },
          ],
        },
        {
          id: "f11-s2",
          dutch: "Elke ochtend legde de gans een ei van puur goud.",
          english: "Every morning the goose laid an egg of pure gold.",
          words: [
            { nl: "elke ochtend", en: "every morning" },
            { nl: "legde", en: "laid — past of leggen" },
            { nl: "een ei", en: "an egg" },
            { nl: "van puur goud", en: "of pure gold" },
          ],
          notes: [
            {
              title: "leggen — to lay",
              body: "'Een ei leggen' = to lay an egg. 'Leggen' (to lay/put down) is transitive — it needs an object. Don't mix it up with 'liggen' (to lie). Regular: leg, legde, gelegd.",
            },
          ],
        },
        {
          id: "f11-s3",
          dutch: "Zo werd de boer langzaam rijk.",
          english: "That way the farmer slowly became rich.",
          words: [
            { nl: "zo", en: "that way, thus" },
            { nl: "werd rijk", en: "became rich" },
            { nl: "langzaam", en: "slowly" },
          ],
          notes: [
            {
              title: "worden for change",
              body: "'Rijk worden' = to become/get rich (a change of state). Past 'werd'. 'Zo' at the front triggers inversion: 'zo werd de boer rijk'.",
            },
          ],
        },
      ],
      [
        {
          id: "f11-s4",
          dutch: "Maar hij werd hebberig en wilde al het goud in één keer.",
          english: "But he became greedy and wanted all the gold at once.",
          words: [
            { nl: "hebberig", en: "greedy" },
            { nl: "al het goud", en: "all the gold" },
            { nl: "in één keer", en: "all at once, in one go" },
          ],
          notes: [
            {
              title: "al + het/de + noun",
              body: "'Al het goud' = all the gold; 'al de mensen' = all the people. 'Al' before an article means 'all (of) the'. 'In één keer' = in a single go.",
            },
          ],
        },
        {
          id: "f11-s5",
          dutch: "Hij dacht dat er binnen in de gans een grote schat zat.",
          english: "He thought there was a great treasure inside the goose.",
          words: [
            { nl: "dacht dat", en: "thought that" },
            { nl: "binnen in de gans", en: "inside the goose" },
            { nl: "een grote schat", en: "a great treasure" },
            { nl: "zat", en: "sat, was — past of zitten" },
          ],
          notes: [
            {
              title: "'dat'-clause → verb to the end",
              body: "After 'denken dat …', the clause is subordinate, so the verb goes to the end: 'dat er … een grote schat zat'. 'Zitten' here means 'to be (located)'.",
            },
          ],
        },
        {
          id: "f11-s6",
          dutch: "Daarom sneed hij de gans open, maar binnenin was niets bijzonders.",
          english: "So he cut the goose open, but inside there was nothing special.",
          words: [
            { nl: "daarom", en: "so, therefore" },
            { nl: "sneed open", en: "cut open (separable: opensnijden)" },
            { nl: "binnenin", en: "inside" },
            { nl: "niets bijzonders", en: "nothing special" },
          ],
          notes: [
            {
              title: "niets + bijzonders (-s)",
              body: "After 'iets/niets/wat', the adjective takes an -s: 'niets bijzonders' (nothing special), 'iets leuks' (something nice), 'iets nieuws' (something new). And 'daarom' (therefore) up front triggers inversion.",
            },
          ],
        },
      ],
      [
        {
          id: "f11-s7",
          dutch: "Wie te veel ineens wil, verliest wat hij al heeft.",
          english: "Whoever wants too much at once loses what he already has.",
          words: [
            { nl: "te veel ineens", en: "too much at once" },
            { nl: "verliest", en: "loses — of verliezen" },
            { nl: "wat hij al heeft", en: "what he already has" },
          ],
          notes: [
            {
              title: "De moraal",
              body: "Greed destroys the very source of your good fortune. Grammar: 'wie … wil' (whoever wants) sends 'wil' to the end; then 'verliest' opens the main clause. 'Wat hij al heeft' = what he already has.",
            },
          ],
        },
      ],
    ],
  },
  {
    page: 12,
    chapter: 12,
    title: "Fabel 12 — De hond en het bot",
    paragraphs: [
      [
        {
          id: "f12-s1",
          dutch: "Een hond liep met een lekker bot in zijn bek naar huis.",
          english: "A dog was walking home with a tasty bone in his mouth.",
          words: [
            { nl: "een hond", en: "a dog" },
            { nl: "een lekker bot", en: "a tasty bone" },
            { nl: "in zijn bek", en: "in his mouth (of an animal)" },
            { nl: "naar huis", en: "home(ward)" },
          ],
          notes: [
            {
              title: "bek vs. mond",
              body: "'Bek' = an animal's mouth/snout; 'mond' = a human mouth. 'Het bot' (the bone) is a het-word, so 'een lekker bot' keeps the bare adjective.",
            },
          ],
        },
        {
          id: "f12-s2",
          dutch: "Onderweg kwam hij langs een rustige rivier.",
          english: "On the way he passed a calm river.",
          words: [
            { nl: "onderweg", en: "on the way" },
            { nl: "kwam langs", en: "passed, came by (separable: langskomen)" },
            { nl: "een rustige rivier", en: "a calm river" },
          ],
          notes: [
            {
              title: "langskomen / langs",
              body: "'Langs' = past/along; 'langskomen' = to come by/drop in. 'Onderweg' (on the way) opens the sentence and triggers inversion: 'onderweg kwam hij…'.",
            },
          ],
        },
        {
          id: "f12-s3",
          dutch: "In het water zag hij een andere hond met ook een bot.",
          english: "In the water he saw another dog, also with a bone.",
          words: [
            { nl: "in het water", en: "in the water" },
            { nl: "zag", en: "saw — past of zien" },
            { nl: "een andere hond", en: "another dog" },
            { nl: "ook een bot", en: "a bone too" },
          ],
          notes: [
            {
              title: "ander — other/another",
              body: "'Een andere hond' = another/a different dog. The -e ending appears before the noun. 'De andere' = the other one; 'iets anders' = something else.",
            },
          ],
        },
      ],
      [
        {
          id: "f12-s4",
          dutch: "Dat was natuurlijk zijn eigen spiegelbeeld, maar dat begreep hij niet.",
          english: "That was of course his own reflection, but he didn't understand that.",
          words: [
            { nl: "natuurlijk", en: "of course, naturally" },
            { nl: "zijn eigen spiegelbeeld", en: "his own reflection" },
            { nl: "begreep", en: "understood — past of begrijpen" },
          ],
          notes: [
            {
              title: "eigen — own",
              body: "'Eigen' = own; it never takes -e: 'zijn eigen bot' (his own bone), 'mijn eigen huis' (my own house). 'Spiegel' (mirror) + 'beeld' (image) = spiegelbeeld (reflection).",
            },
          ],
        },
        {
          id: "f12-s5",
          dutch: "Hij wilde ook dat tweede bot en hapte gulzig naar het water.",
          english: "He wanted that second bone too and snapped greedily at the water.",
          words: [
            { nl: "dat tweede bot", en: "that second bone" },
            { nl: "hapte", en: "snapped, bit — past of happen" },
            { nl: "gulzig", en: "greedily" },
            { nl: "naar het water", en: "at the water" },
          ],
          notes: [
            {
              title: "happen naar",
              body: "'Happen naar iets' = to snap/lunge at something with the mouth. 'De hond hapte naar de bal' (the dog snapped at the ball). 'Gulzig' = greedy/greedily (about eating).",
            },
          ],
        },
        {
          id: "f12-s6",
          dutch: "Daardoor viel zijn eigen bot uit zijn bek en zonk naar de bodem.",
          english: "As a result his own bone fell out of his mouth and sank to the bottom.",
          words: [
            { nl: "daardoor", en: "as a result, because of that" },
            { nl: "viel", en: "fell — past of vallen" },
            { nl: "uit zijn bek", en: "out of his mouth" },
            { nl: "zonk", en: "sank — past of zinken" },
            { nl: "naar de bodem", en: "to the bottom" },
          ],
          notes: [
            {
              title: "daardoor — cause/result",
              body: "'Daardoor' = because of that, as a result. It links a cause to its effect and triggers inversion at the front: 'daardoor viel zijn bot…'. Strong verbs: vallen → viel, zinken → zonk.",
            },
          ],
        },
      ],
      [
        {
          id: "f12-s7",
          dutch: "Wees tevreden met wat je hebt.",
          english: "Be content with what you have.",
          words: [
            { nl: "wees", en: "be (imperative of zijn)" },
            { nl: "tevreden met", en: "content/satisfied with" },
            { nl: "wat je hebt", en: "what you have" },
          ],
          notes: [
            {
              title: "De moraal",
              body: "Grasp at the shadow and you lose the substance — don't risk what's real for a reflection. 'Wees' is the irregular imperative of 'zijn' (to be): 'wees voorzichtig' (be careful). 'Tevreden met' = satisfied with.",
            },
          ],
        },
      ],
    ],
  },
];
