// Spreekwoorden & Uitdrukkingen — a compilation of Dutch idioms, sayings and
// proverbs. These are traditional folk wisdom (public domain). Each one is its
// OWN page with a single sentence, so "learned" is tracked per idiom (one mark
// per page) rather than per sentence — the right grain for flashcard-style study.
//
// Lesson shape per idiom:
//   dutch   = the idiom/saying
//   english = what it actually means (figurative)
//   words   = literal word-by-word breakdown (the fun, often absurd literal image)
//   notes   = Letterlijk (literal picture) · Voorbeeld (usage in a sentence) ·
//             In het Engels (closest equivalent) · Herkomst / Let op when useful.
import type { BookMeta, Page, Sentence } from "./schema";

export const IDIOMS_META: BookMeta = {
  title: "Spreekwoorden & Uitdrukkingen",
  author: "Nederlandse volkswijsheid",
  language: "nl-NL",
  targetLanguage: "English",
  level: "B1",
  status: "complete",
  source:
    "Traditional Dutch idioms, sayings and proverbs (public-domain folk wisdom). Original study notes and example sentences.",
  chapters: [
    { number: 1, title: "Dieren — beestachtige uitdrukkingen" },
    { number: 2, title: "Eten & drinken" },
    { number: 3, title: "Water & weer" },
    { number: 4, title: "Hoofd & hart" },
    { number: 5, title: "Wijze woorden — spreekwoorden" },
  ],
};

// Tiny helper so each page is unmistakably one idiom = one learnable unit.
function idiom(
  n: number,
  chapter: number,
  banner: string,
  s: Omit<Sentence, "id">,
): Page {
  return {
    page: n,
    chapter,
    title: banner,
    paragraphs: [[{ id: `idiom-${n}`, ...s }]],
  };
}

export const IDIOMS_PAGES: Page[] = [
  // ── 1. Dieren ──────────────────────────────────────────────────────────────
  idiom(1, 1, "🐾 Dieren", {
    dutch: "De kat uit de boom kijken.",
    english: "To wait and see how a situation develops before doing anything.",
    words: [
      { nl: "de kat", en: "the cat" },
      { nl: "uit de boom", en: "out of the tree" },
      { nl: "kijken", en: "to look / watch" },
    ],
    notes: [
      { title: "Letterlijk", body: "'To watch the cat out of the tree' — you hang back and observe rather than jumping in." },
      { title: "Voorbeeld", body: "Hij zei nog niets in de vergadering; hij keek eerst de kat uit de boom. — He didn't say anything in the meeting yet; he waited to see which way the wind blew." },
      { title: "In het Engels", body: "to wait and see · to bide your time." },
      { title: "Let op", body: "Word order: 'hij kijkt de kat uit de boom' — the literal object 'de kat' sits in the middle, 'kijken' at the end." },
    ],
  }),
  idiom(2, 1, "🐾 Dieren", {
    dutch: "Nu komt de aap uit de mouw.",
    english: "Now the hidden truth or real motive comes out.",
    words: [
      { nl: "nu", en: "now" },
      { nl: "komt", en: "comes" },
      { nl: "de aap", en: "the monkey" },
      { nl: "uit de mouw", en: "out of the sleeve" },
    ],
    notes: [
      { title: "Letterlijk", body: "'Now the monkey comes out of the sleeve.' Street performers once hid a real monkey in their clothes; when it popped out, the trick was exposed." },
      { title: "Voorbeeld", body: "Hij was ineens zo aardig… en nu komt de aap uit de mouw: hij wil geld lenen. — He was suddenly so nice… and now the truth comes out: he wants to borrow money." },
      { title: "In het Engels", body: "now the truth comes out · to let the cat out of the bag." },
    ],
  }),
  idiom(3, 1, "🐾 Dieren", {
    dutch: "Een kat in de zak kopen.",
    english: "To buy something that turns out to be worthless; to be cheated in a deal.",
    words: [
      { nl: "een kat", en: "a cat" },
      { nl: "in de zak", en: "in the bag / sack" },
      { nl: "kopen", en: "to buy" },
    ],
    notes: [
      { title: "Letterlijk", body: "'To buy a cat in the bag' — you paid for a piglet without looking inside, and got a worthless cat instead." },
      { title: "Voorbeeld", body: "Controleer de auto goed, anders koop je een kat in de zak. — Check the car carefully, or you'll buy a pig in a poke." },
      { title: "In het Engels", body: "to buy a pig in a poke." },
    ],
  }),
  idiom(4, 1, "🐾 Dieren", {
    dutch: "Twee vliegen in één klap slaan.",
    english: "To achieve two things with a single action.",
    words: [
      { nl: "twee vliegen", en: "two flies" },
      { nl: "in één klap", en: "in one blow / swat" },
      { nl: "slaan", en: "to hit, strike" },
    ],
    notes: [
      { title: "Letterlijk", body: "'To swat two flies with one blow.' Almost the same picture as the English version — just flies instead of birds." },
      { title: "Voorbeeld", body: "Door op de fiets naar het werk te gaan sla ik twee vliegen in één klap: ik spaar geld én ik sport. — By cycling to work I kill two birds with one stone: I save money and I exercise." },
      { title: "In het Engels", body: "to kill two birds with one stone." },
    ],
  }),
  idiom(5, 1, "🐾 Dieren", {
    dutch: "Rondrennen als een kip zonder kop.",
    english: "To rush about in a panicky, disorganized way, without thinking.",
    words: [
      { nl: "rondrennen", en: "to run around" },
      { nl: "als een kip", en: "like a chicken" },
      { nl: "zonder kop", en: "without a head" },
    ],
    notes: [
      { title: "Letterlijk", body: "'Like a chicken without a head' — the same vivid image English uses." },
      { title: "Voorbeeld", body: "Doe even rustig! Je rent rond als een kip zonder kop. — Calm down a bit! You're running around like a headless chicken." },
      { title: "In het Engels", body: "like a headless chicken." },
    ],
  }),

  // ── 2. Eten & drinken ────────────────────────────────────────────────────
  idiom(6, 2, "🧀 Eten & drinken", {
    dutch: "Ergens geen kaas van gegeten hebben.",
    english: "To know nothing about a subject.",
    words: [
      { nl: "ergens", en: "of something / about something" },
      { nl: "geen kaas", en: "no cheese" },
      { nl: "van gegeten hebben", en: "to have eaten of it" },
    ],
    notes: [
      { title: "Letterlijk", body: "'To have eaten no cheese of something.' Wonderfully Dutch — knowledge is measured in cheese." },
      { title: "Voorbeeld", body: "Vraag mij niets over computers — daar heb ik geen kaas van gegeten. — Don't ask me about computers — I know nothing about it." },
      { title: "In het Engels", body: "to know nothing about it · it's all Greek to me." },
      { title: "Let op", body: "Always negative, with 'geen': you can't *have* eaten cheese of something. The 'ergens … van' wraps around the rest of the sentence." },
    ],
  }),
  idiom(7, 2, "🧀 Eten & drinken", {
    dutch: "Een appeltje voor de dorst.",
    english: "Something (usually money) saved for when you might need it later.",
    words: [
      { nl: "een appeltje", en: "a little apple (diminutive)" },
      { nl: "voor de dorst", en: "for the thirst" },
    ],
    notes: [
      { title: "Letterlijk", body: "'A little apple for the thirst' — a juicy apple kept back for when you get thirsty later." },
      { title: "Voorbeeld", body: "Ze geeft niet alles uit; ze houdt een appeltje voor de dorst. — She doesn't spend everything; she keeps something for a rainy day." },
      { title: "In het Engels", body: "a nest egg · something for a rainy day." },
      { title: "Let op", body: "The diminutive 'appeltje' (not 'appel') is fixed here — it makes the saving sound modest and cosy." },
    ],
  }),
  idiom(8, 2, "🧀 Eten & drinken", {
    dutch: "Met de mond vol tanden staan.",
    english: "To be lost for words, unable to respond.",
    words: [
      { nl: "met de mond", en: "with the mouth" },
      { nl: "vol tanden", en: "full of teeth" },
      { nl: "staan", en: "to stand" },
    ],
    notes: [
      { title: "Letterlijk", body: "'To stand with your mouth full of teeth' — so full there's no room left to get a word out." },
      { title: "Voorbeeld", body: "Toen ze me die vraag stelde, stond ik met de mond vol tanden. — When she asked me that question, I was completely tongue-tied." },
      { title: "In het Engels", body: "to be tongue-tied · lost for words." },
    ],
  }),
  idiom(9, 2, "🧀 Eten & drinken", {
    dutch: "We zaten als haring in een ton.",
    english: "Packed very tightly together.",
    words: [
      { nl: "we zaten", en: "we sat / were" },
      { nl: "als haring", en: "like herring" },
      { nl: "in een ton", en: "in a barrel" },
    ],
    notes: [
      { title: "Letterlijk", body: "'Like herring in a barrel' — salted herring was packed into barrels with no space to spare. Very fitting for a fishing nation." },
      { title: "Voorbeeld", body: "In de volle trein zaten we als haring in een ton. — In the packed train we were squeezed in like sardines." },
      { title: "In het Engels", body: "packed like sardines." },
    ],
  }),

  // ── 3. Water & weer ──────────────────────────────────────────────────────
  idiom(10, 3, "🌧️ Water & weer", {
    dutch: "Het regent pijpenstelen.",
    english: "It's raining very hard.",
    words: [
      { nl: "het regent", en: "it's raining" },
      { nl: "pijpenstelen", en: "pipe-stems (the long thin stems of clay pipes)" },
    ],
    notes: [
      { title: "Letterlijk", body: "'It's raining pipe-stems' — the rain falls in long, straight, grey lines like the stems of old clay pipes." },
      { title: "Voorbeeld", body: "Neem een paraplu mee, het regent pijpenstelen. — Take an umbrella, it's bucketing down." },
      { title: "In het Engels", body: "it's raining cats and dogs · it's bucketing down." },
    ],
  }),
  idiom(11, 3, "🌧️ Water & weer", {
    dutch: "Een storm in een glas water.",
    english: "A lot of fuss and worry about something that isn't important.",
    words: [
      { nl: "een storm", en: "a storm" },
      { nl: "in een glas water", en: "in a glass of water" },
    ],
    notes: [
      { title: "Letterlijk", body: "'A storm in a glass of water' — a tiny container, so the 'storm' can't really amount to anything." },
      { title: "Voorbeeld", body: "Maak je niet druk, het is een storm in een glas water. — Don't worry, it's a storm in a teacup." },
      { title: "In het Engels", body: "a storm in a teacup · a tempest in a teapot." },
    ],
  }),
  idiom(12, 3, "🌧️ Water & weer", {
    dutch: "Roeien met de riemen die je hebt.",
    english: "To make the best of the limited means available to you.",
    words: [
      { nl: "roeien", en: "to row" },
      { nl: "met de riemen", en: "with the oars" },
      { nl: "die je hebt", en: "that you have" },
    ],
    notes: [
      { title: "Letterlijk", body: "'To row with the oars you have' — you can't wait for better oars; you row with what's in the boat." },
      { title: "Voorbeeld", body: "We hadden weinig budget, maar je moet roeien met de riemen die je hebt. — We had little budget, but you have to make do with what you've got." },
      { title: "In het Engels", body: "to make do with what you've got." },
      { title: "Dubbele betekenis", body: "'Riem' means both 'oar' (roeiriem) and 'belt'. Here it's oars — context decides which 'riem' you get." },
    ],
  }),
  idiom(13, 3, "🌧️ Water & weer", {
    dutch: "Het water staat hem aan de lippen.",
    english: "He is in serious trouble (often financial) and running out of options.",
    words: [
      { nl: "het water", en: "the water" },
      { nl: "staat", en: "stands / reaches" },
      { nl: "hem", en: "him (dative: 'to him')" },
      { nl: "aan de lippen", en: "at the lips" },
    ],
    notes: [
      { title: "Letterlijk", body: "'The water reaches his lips' — he's nearly drowning; one more wave and he's under." },
      { title: "Voorbeeld", body: "Het bedrijf kan failliet gaan; het water staat hun aan de lippen. — The company may go bankrupt; they're in deep water." },
      { title: "In het Engels", body: "to be in deep water · up to one's neck." },
      { title: "Let op", body: "Use a dative for the person: het water staat mij / hem / hun aan de lippen (to me / him / them)." },
    ],
  }),

  // ── 4. Hoofd & hart ──────────────────────────────────────────────────────
  idiom(14, 4, "❤️ Hoofd & hart", {
    dutch: "De knoop doorhakken.",
    english: "To finally make a difficult decision.",
    words: [
      { nl: "de knoop", en: "the knot" },
      { nl: "doorhakken", en: "to chop / cut through" },
    ],
    notes: [
      { title: "Letterlijk", body: "'To chop through the knot' — instead of patiently untangling it, you settle the matter in one decisive stroke (cf. the Gordian knot)." },
      { title: "Voorbeeld", body: "Na lang twijfelen hakte ze de knoop door en nam ze de baan aan. — After much hesitation she made the call and took the job." },
      { title: "In het Engels", body: "to cut the knot · to make the call." },
      { title: "Let op", body: "'Doorhakken' is separable: 'ze hakt de knoop door' (main clause), '…dat ze de knoop doorhakt' (subordinate)." },
    ],
  }),
  idiom(15, 4, "❤️ Hoofd & hart", {
    dutch: "Iets onder de knie hebben.",
    english: "To have mastered a skill.",
    words: [
      { nl: "iets", en: "something" },
      { nl: "onder de knie", en: "under the knee" },
      { nl: "hebben", en: "to have" },
    ],
    notes: [
      { title: "Letterlijk", body: "'To have something under the knee' — like a wrestler who has pinned his opponent down and fully controls it." },
      { title: "Voorbeeld", body: "Na maanden oefenen heb ik het Nederlands eindelijk een beetje onder de knie. — After months of practice I've finally got a bit of a handle on Dutch." },
      { title: "In het Engels", body: "to have got the hang of it · to have it down." },
    ],
  }),
  idiom(16, 4, "❤️ Hoofd & hart", {
    dutch: "Iemand een hart onder de riem steken.",
    english: "To encourage or comfort someone; to lift their spirits.",
    words: [
      { nl: "iemand", en: "someone" },
      { nl: "een hart", en: "a heart (here: courage)" },
      { nl: "onder de riem", en: "under the belt" },
      { nl: "steken", en: "to put, tuck" },
    ],
    notes: [
      { title: "Letterlijk", body: "'To tuck a heart under someone's belt' — to slip them some courage to carry on, right where they need it." },
      { title: "Voorbeeld", body: "Haar lieve bericht stak me een hart onder de riem. — Her kind message really lifted my spirits." },
      { title: "In het Engels", body: "to give someone a boost · to buck someone up." },
      { title: "Let op", body: "The warm opposite of nr. 13: there the water is at the lips; here you hand someone courage to keep going." },
    ],
  }),
  idiom(17, 4, "❤️ Hoofd & hart", {
    dutch: "Met de deur in huis vallen.",
    english: "To get straight to the point with no introduction.",
    words: [
      { nl: "met de deur", en: "with the door" },
      { nl: "in huis", en: "into the house" },
      { nl: "vallen", en: "to fall" },
    ],
    notes: [
      { title: "Letterlijk", body: "'To fall into the house with the door' — you burst in so fast you bring the door down with you, skipping all the niceties." },
      { title: "Voorbeeld", body: "Sorry dat ik met de deur in huis val, maar ik heb je hulp nodig. — Sorry to be so blunt, but I need your help." },
      { title: "In het Engels", body: "to come straight to the point · to blurt it out." },
    ],
  }),

  // ── 5. Wijze woorden — spreekwoorden ─────────────────────────────────────
  idiom(18, 5, "🦉 Wijze woorden", {
    dutch: "De aanhouder wint.",
    english: "The one who keeps trying will succeed in the end.",
    words: [
      { nl: "de aanhouder", en: "the one who persists / keeps at it" },
      { nl: "wint", en: "wins" },
    ],
    notes: [
      { title: "Letterlijk", body: "'The persister wins.' 'Aanhouder' comes from 'aanhouden' — to keep going, to keep it up." },
      { title: "Voorbeeld", body: "Blijf rustig solliciteren — de aanhouder wint. — Keep applying calmly — perseverance pays off." },
      { title: "In het Engels", body: "perseverance pays off · if at first you don't succeed, try, try again." },
      { title: "Soort", body: "A 'spreekwoord' (proverb): a fixed, complete sentence of folk wisdom — you quote it whole." },
    ],
  }),
  idiom(19, 5, "🦉 Wijze woorden", {
    dutch: "Wie het laatst lacht, lacht het best.",
    english: "Final success matters more than an early advantage.",
    words: [
      { nl: "wie", en: "whoever, the one who" },
      { nl: "het laatst lacht", en: "laughs last" },
      { nl: "lacht het best", en: "laughs best" },
    ],
    notes: [
      { title: "Letterlijk", body: "Nearly word-for-word the English proverb — laugh at the end, not at the start." },
      { title: "Voorbeeld", body: "Ze lachten om mijn plan, maar wie het laatst lacht, lacht het best. — They laughed at my plan, but he who laughs last laughs best." },
      { title: "In het Engels", body: "he who laughs last laughs best/longest." },
      { title: "Let op", body: "Grammar: 'wie het laatst lacht' is a 'whoever' clause — its verb 'lacht' goes to the end; then the main clause follows." },
    ],
  }),
  idiom(20, 5, "🦉 Wijze woorden", {
    dutch: "Beter één vogel in de hand dan tien in de lucht.",
    english: "A small sure thing is worth more than a big uncertain one.",
    words: [
      { nl: "beter", en: "better" },
      { nl: "één vogel in de hand", en: "one bird in the hand" },
      { nl: "dan tien in de lucht", en: "than ten in the air" },
    ],
    notes: [
      { title: "Letterlijk", body: "'Better one bird in the hand than ten in the air.' Dutch raises the stakes — ten in the air, not just two in the bush." },
      { title: "Voorbeeld", body: "Neem dat zekere aanbod maar: beter één vogel in de hand dan tien in de lucht. — Take the sure offer: a bird in the hand is worth two in the bush." },
      { title: "In het Engels", body: "a bird in the hand is worth two in the bush." },
    ],
  }),
];
