import { CertifiedDevice } from "../types";

export interface MarketAnalysisMonitor extends CertifiedDevice {
  priceRange: '50-90' | '90-160' | '160-260' | '260-400';
  userRating: number;
  reviewCount: number;
  clinicalCert: string;
}

export const CERTIFIED_MONITORS: MarketAnalysisMonitor[] = [
  // ==========================================
  // 1. BUDŻET: 50 - 90 zł (Najlepsze naramienne z atestem)
  // ==========================================
  {
    id: "medisana-bu-510",
    brand: "Medisana",
    category: "budget",
    priceRange: "50-90",
    name: "Medisana BU 510 / BU 512",
    badge: "Bestseller Budżetowy • Ekran 22mm",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
    cuffType: "Mankiet uniwersalny M-L (22-36 cm)",
    priceEstimate: "ok. 69 - 85 zł",
    priceValue: 75,
    userRating: 4.8,
    reviewCount: 1840,
    clinicalCert: "Certyfikat medyczny MDD (Medical Device Directive 93/42/EEC)",
    accuracyRating: "Walidacja europejska MDD, powtarzalny pomiar oscylometryczny",
    keyFeatures: [
      "Bardzo duże cyfry 22 mm – bez problemu widoczne bez okularów",
      "Pamięć dla 2 osób po 90 pomiarów ze średnią",
      "Wykrywanie nieregularnego rytmu serca (arytmii)",
      "Kolorowa skala oceny ciśnienia wg standardu WHO"
    ],
    seniorFriendlyNote: "Największe cyfry w klasie do 90 zł. Bardzo prosta obsługa jednym przyciskiem.",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-medisana+bu+510"
  },
  {
    id: "sanitas-sbm-21",
    brand: "Sanitas",
    category: "budget",
    priceRange: "50-90",
    name: "Sanitas SBM 21 (Grupa Beurer)",
    badge: "Sprawdzona Niemiecka Marka",
    badgeColor: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300",
    cuffType: "Mankiet regulowany (22-36 cm)",
    priceEstimate: "ok. 65 - 79 zł",
    priceValue: 70,
    userRating: 4.7,
    reviewCount: 920,
    clinicalCert: "Wyrób medyczny z atestem CE 0483",
    accuracyRating: "Kliniczna zgodność z normami EN 1060-1/-3",
    keyFeatures: [
      "Pamięć 4 x 30 pomiarów (dla całej rodziny)",
      "Wykrywanie zaburzeń rytmu serca (arytmia)",
      "Wyliczanie średniej z ostatnich zapisanych pomiarów",
      "Wygodny pokrowiec w zestawie"
    ],
    seniorFriendlyNote: "Klasyczna, bezawaryjna konstrukcja. Czytelny wyświetlacz i automatyczne wyłączanie.",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-sanitas+sbm+21"
  },
  {
    id: "tech-med-tma-500pro",
    brand: "Tech-Med",
    category: "budget",
    priceRange: "50-90",
    name: "Tech-Med TMA-500PRO",
    badge: "Polska Marka Medyczna • Port USB-C",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
    cuffType: "Mankiet komfortowy (22-42 cm)",
    priceEstimate: "ok. 75 - 89 zł",
    priceValue: 79,
    userRating: 4.8,
    reviewCount: 1250,
    clinicalCert: "Atest medyczny CE 0197, polski dystrybutor medyczny",
    accuracyRating: "Wysoka powtarzalność, atestowana dokładność ciśnienia ±3 mmHg",
    keyFeatures: [
      "Zasilanie bateryjne oraz port USB-C (możliwość pracy z ładowarki telefonu)",
      "Szeroki mankiet 22-42 cm (pasuje na szczupłe i grube ramię)",
      "Pamięć 2 x 120 pomiarów z datą i godziną",
      "Sygnalizacja arytmii i klasyfikacja WHO"
    ],
    seniorFriendlyNote: "Można podłączyć ładowarkę od smartfona – koniec z kupowaniem drogich baterii!",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-tech+med+tma+500pro"
  },
  {
    id: "esperanza-vitality",
    brand: "Esperanza",
    category: "budget",
    priceRange: "50-90",
    name: "Esperanza Vitality ECB002",
    badge: "Super Ekono do 55 zł",
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300",
    cuffType: "Mankiet standardowy (22-32 cm)",
    priceEstimate: "ok. 49 - 58 zł",
    priceValue: 52,
    userRating: 4.5,
    reviewCount: 640,
    clinicalCert: "Certyfikat wyrobu medycznego CE",
    accuracyRating: "Podstawowy atestowany pomiar oscylometryczny",
    keyFeatures: [
      "Najniższa cena za w pełni automatyczny aparat naramienny",
      "Pamięć 90 ostatnich pomiarów",
      "Skala ciśnienia według zaleceń WHO",
      "Lekki i poręczny"
    ],
    seniorFriendlyNote: "Dla osób szukających najtańszego sprawnego aparatu. Mankiet do 32 cm na standardową rękę.",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-esperanza+vitality+ecb002"
  },

  // ==========================================
  // 2. KLASA ŚREDNIA: 90 - 160 zł (Złoty stosunek jakości do ceny)
  // ==========================================
  {
    id: "omron-m2-basic",
    brand: "Omron",
    category: "mid",
    priceRange: "90-160",
    name: "Omron M2 Basic (HEM-7121J-E)",
    badge: "#1 w Przychodniach • Walidacja ESH",
    badgeColor: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300",
    cuffType: "Mankiet Easy Cuff (22-32 cm)",
    priceEstimate: "ok. 99 - 125 zł",
    priceValue: 115,
    userRating: 4.9,
    reviewCount: 4620,
    clinicalCert: "Pełna walidacja kliniczna ESH (Europejskie Towarzystwo Nadciśnienia)",
    accuracyRating: "Kliniczny standard dokładności, technologia czujników piezoelektrycznych Omron",
    keyFeatures: [
      "Technologia Intellisense – automatycznie dobiera właściwy poziom ciśnienia w mankiecie",
      "Wskaźnik prawidłowego założenia mankietu (OK)",
      "Wykrywanie nieregularnego bicia serca (arytmia)",
      "Pancerna trwałość – aparaty te działają bezawaryjnie po 8-10 lat"
    ],
    seniorFriendlyNote: "Jeden gigantyczny przycisk. Nie da się w nim niczego zepsuć ani przypadkowo przestawić.",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-omron+m2+basic"
  },
  {
    id: "microlife-bp-b2-basic",
    brand: "Microlife",
    category: "mid",
    priceRange: "90-160",
    name: "Microlife BP B2 Basic Gentle+",
    badge: "Szwajcarska Precyzja • Gentle+",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300",
    cuffType: "Mankiet stożkowy M-L (22-42 cm)",
    priceEstimate: "ok. 109 - 135 zł",
    priceValue: 119,
    userRating: 4.9,
    reviewCount: 2280,
    clinicalCert: "Walidacja kliniczna BHS (British Hypertension Society) ocena A/A",
    accuracyRating: "Medyczna najwyższa klasa dokładności A/A wg protokołu BHS",
    keyFeatures: [
      "Technologia Gentle+ – optymalna prędkość i delikatne pompowanie bez bólu ramienia",
      "Technologia IHB – wczesne ostrzeganie o arytmii serca",
      "Wskaźnik ruchu ramienia i kontrola dopasowania mankietu",
      "Pamięć 30 pomiarów z wyliczaniem średniej"
    ],
    seniorFriendlyNote: "Polecany przez farmaceutów dla osób z wrażliwymi, pękającymi naczynkami.",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-microlife+bp+b2+basic"
  },
  {
    id: "beurer-bm-28",
    brand: "Beurer",
    category: "mid",
    priceRange: "90-160",
    name: "Beurer BM 28 z Zasilaczem",
    badge: "Komplet z Zasilaczem • Mankiet 42cm",
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300",
    cuffType: "Mankiet uniwersalny (22-42 cm)",
    priceEstimate: "ok. 115 - 140 zł",
    priceValue: 125,
    userRating: 4.8,
    reviewCount: 1540,
    clinicalCert: "Walidacja Niemieckiego Towarzystwa Nadciśnienia Tętniczego",
    accuracyRating: "Kliniczna norma dokładności z opatentowanym wskaźnikiem spoczynku",
    keyFeatures: [
      "W zestawie oryginalny zasilacz sieciowy Beurer",
      "Opatentowany wskaźnik spoczynku – informuje czy pacjent jest wyciszony",
      "Uniwersalny mankiet 22-42 cm pasuje na każde ramię",
      "Pamięć 4 użytkowników po 30 pomiarów"
    ],
    seniorFriendlyNote: "Zasilacz w pudełku to wielka wygoda – podłączasz do gniazdka i mierzysz bez obaw o baterie.",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-beurer+bm+28"
  },
  {
    id: "tech-med-tma-alpha",
    brand: "Tech-Med",
    category: "mid",
    priceRange: "90-160",
    name: "Tech-Med TMA-ALPHA Touch",
    badge: "Wielki Podświetlany Ekran LCD",
    badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300",
    cuffType: "Mankiet komfortowy (22-42 cm)",
    priceEstimate: "ok. 119 - 149 zł",
    priceValue: 135,
    userRating: 4.8,
    reviewCount: 860,
    clinicalCert: "Certyfikat medyczny UE CE 0197",
    accuracyRating: "Zaawansowany algorytm DPDA dla stabilnego pomiaru",
    keyFeatures: [
      "Podświetlany na niebiesko, wielki kontrastowy ekran",
      "Możliwość zasilania bateryjnego lub zasilaczem USB",
      "Pamięć 2 x 120 pomiarów z datą i godziną",
      "Bardzo cicha praca kompresora pompy"
    ],
    seniorFriendlyNote: "Podświetlenie ekranu pozwala na wygodny pomiar o 6 rano bez zapalania światła w pokoju.",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-tech+med+tma+alpha"
  },
  {
    id: "novama-white",
    brand: "Novama",
    category: "mid",
    priceRange: "90-160",
    name: "Novama White / First",
    badge: "5 Lat Gwarancji • Szybki Pomiar",
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300",
    cuffType: "Mankiet Easy Slim (22-42 cm)",
    priceEstimate: "ok. 99 - 129 zł",
    priceValue: 110,
    userRating: 4.7,
    reviewCount: 710,
    clinicalCert: "Certyfikacja kliniczna ESH",
    accuracyRating: "Technologia pomiaru podczas delikatnego pompowania",
    keyFeatures: [
      "Aż 5 lat pełnej gwarancji producenta 'door-to-door'",
      "Pomiar podczas pompowania – badanie trwa o połowę krócej",
      "Interpretacja wyników w kolorowej skali WHO",
      "Nowoczesna, czysta stylistyka"
    ],
    seniorFriendlyNote: "Mankiet nie uciska mocno ramienia, a pomiar jest błyskawiczny.",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-novama+white+cisnieniomierz"
  },

  // ==========================================
  // 3. KLASA ZAAWANSOWANA: 160 - 260 zł (Złoty Standard & Mankiet 360°)
  // ==========================================
  {
    id: "omron-m3-comfort",
    brand: "Omron",
    category: "advanced",
    priceRange: "160-260",
    name: "Omron M3 Comfort (HEM-7155-E)",
    badge: "Złoty Standard Kardiologiczny • Mankiet 360°",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
    cuffType: "Sztywny mankiet Intelli Wrap 360° (22-42 cm)",
    priceEstimate: "ok. 189 - 230 zł",
    priceValue: 215,
    userRating: 4.95,
    reviewCount: 8400,
    clinicalCert: "Walidacja kliniczna ESH, AAMI oraz specjalna dla cukrzyków i kobiet w ciąży",
    accuracyRating: "Brak martwej strefy pomiarowej – 100% dokładności w dowolnym obrocie na ramieniu",
    keyFeatures: [
      "Mankiet Intelli Wrap 360° – eliminuje najczęstszy błąd pacjentów (złe ułożenie mankietu)",
      "Dioda LED potwierdzająca idealne założenie mankietu (zielone światło)",
      "Wskaźnik nieregularnego bicia serca (arytmia)",
      "Pamięć 2 x 60 pomiarów + tryb gościa"
    ],
    seniorFriendlyNote: "Najlepszy wybór dla osób starszych: mankiet jest uformowany w sztywną tubę – zakłada się go jedną ręką w 3 sekundy.",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-omron+m3+comfort"
  },
  {
    id: "microlife-bp-a2-afib",
    brand: "Microlife",
    category: "advanced",
    priceRange: "160-260",
    name: "Microlife BP A2 AFIB",
    badge: "Profilaktyka Udaru • Detekcja AFIB",
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300",
    cuffType: "Mankiet stożkowy M-L (22-42 cm)",
    priceEstimate: "ok. 179 - 220 zł",
    priceValue: 195,
    userRating: 4.9,
    reviewCount: 2890,
    clinicalCert: "Klinicznie potwierdzona czułość detekcji migotania przedsionków (AFIB) 97-100%",
    accuracyRating: "Kliniczna klasa A/A BHS, Oxford University Trial",
    keyFeatures: [
      "Opatentowana technologia AFIB – wczesne wykrywanie migotania przedsionków (przyczyny udarów)",
      "Technologia Gentle+ dla bezbolesnego pompowania",
      "Pamięć 2 x 99 pomiarów ze średnią",
      "Wskaźnik prawidłowego założenia mankietu"
    ],
    seniorFriendlyNote: "Kluczowy aparat przy problemach z kołataniem serca, migotaniem i skokami pulsu.",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-microlife+bp+a2+afib"
  },
  {
    id: "beurer-bm-54",
    brand: "Beurer",
    category: "advanced",
    priceRange: "160-260",
    name: "Beurer BM 54 Bluetooth",
    badge: "Łączność ze Smartfonem • Mankiet XL 44cm",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300",
    cuffType: "Mankiet XL (22-44 cm)",
    priceEstimate: "ok. 169 - 210 zł",
    priceValue: 189,
    userRating: 4.8,
    reviewCount: 1120,
    clinicalCert: "Zatwierdzony klinicznie przez Europejskie Towarzystwo Nadciśnienia Tętniczego ESH",
    accuracyRating: "Precyzyjny niemiecki czujnik piezo z uśrednianiem porannym i wieczornym",
    keyFeatures: [
      "Bezprzewodowy transfer danych Bluetooth do bezpłatnej aplikacji 'HealthManager'",
      "Bardzo szeroki mankiet do 44 cm (idealny na mocniej zbudowane ramiona)",
      "Pamięć 2 x 60 pomiarów z automatycznym uśrednianiem z 7 dni",
      "Klasyfikacja ryzyka wg kolorów WHO"
    ],
    seniorFriendlyNote: "Mankiet 44 cm gwarantuje, że nie będzie za ciasny na grubsze ramię.",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-beurer+bm+54"
  },
  {
    id: "braun-exactfit-3",
    brand: "Braun",
    category: "advanced",
    priceRange: "160-260",
    name: "Braun ExactFit 3 (BUA6150)",
    badge: "2 Mankiet w Zestawie (S/M + L/XL)",
    badgeColor: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 border-violet-300",
    cuffType: "2 mankiety w zestawie: S/M (22-32 cm) i L/XL (32-42 cm)",
    priceEstimate: "ok. 165 - 199 zł",
    priceValue: 180,
    userRating: 4.8,
    reviewCount: 980,
    clinicalCert: "Walidacja Europejskiego Towarzystwa Nadciśnienia (ESH)",
    accuracyRating: "Kliniczna zgodność, zaawansowane uśrednianie 3 ostatnich pomiarów",
    keyFeatures: [
      "W zestawie 2 precyzyjne mankiety – idealne dla pary o różnej budowie ciała",
      "Zaawansowana funkcja uśredniania z ostatnich 3 pomiarów",
      "Pamięć dla 2 osób po 40 pomiarów",
      "Łagodne, miękkie napełnianie mankietu Soft-Inflation"
    ],
    seniorFriendlyNote: "Genialne rozwiązanie dla małżeństw – żona może używać mankietu S/M, a mąż L/XL.",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-braun+exactfit+3"
  },
  {
    id: "oromed-oro-bp-voice",
    brand: "ORO-MED",
    category: "advanced",
    priceRange: "160-260",
    name: "ORO-MED ORO-BP Voice (Mówiący)",
    badge: "Mówi Wynik po Polsku • Dla Seniora",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300",
    cuffType: "Mankiet uniwersalny (22-40 cm)",
    priceEstimate: "ok. 159 - 189 zł",
    priceValue: 175,
    userRating: 4.8,
    reviewCount: 1340,
    clinicalCert: "Certyfikat medyczny CE 0120",
    accuracyRating: "Podwójna filtracja zakłóceń ruchowych",
    keyFeatures: [
      "Lektor w języku polskim – czyta na głos ciśnienie skurczowe, rozkurczowe i puls",
      "Regulacja głośności lub możliwość wyciszenia lektora",
      "Wielki podświetlany ekran LCD o wysokim kontraście",
      "Wykrywanie arytmii serca"
    ],
    seniorFriendlyNote: "Niezastąpiony dla osób słabowidzących, z zaćmą lub jaskrą – aparat sam powie wynik!",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-oromed+oro+bp+voice"
  },

  // ==========================================
  // 4. KLASA PREMIUM: 260 - 400 zł (Potrójny pomiar MAM, AFIB, Bluetooth)
  // ==========================================
  {
    id: "omron-m7-intelli-it",
    brand: "Omron",
    category: "premium",
    priceRange: "260-400",
    name: "Omron M7 Intelli IT (HEM-7361T-E)",
    badge: "Najwyższy Model Omron • AFIB & Dual Screen",
    badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300",
    cuffType: "Sztywny mankiet Intelli Wrap 360° (22-42 cm)",
    priceEstimate: "ok. 299 - 369 zł",
    priceValue: 335,
    userRating: 4.95,
    reviewCount: 4200,
    clinicalCert: "Najwyższa światowa certyfikacja kliniczna ESH / AAMI / dabl Educational Trust",
    accuracyRating: "Złoty standard dokładności laboratoryjnej w warunkach domowych",
    keyFeatures: [
      "Podwójny ekran – wyświetla bieżący wynik tuż obok poprzedniego dla natychmiastowego porównania",
      "Detekcja migotania przedsionków (AFIB) w trybie automatycznego pomiaru potrójnego",
      "Mankiet 360° Intelli Wrap – eliminuje błędy ułożenia na ramieniu",
      "Bluetooth i synchronizacja z darmową aplikacją OMRON connect (wykresy, eksport PDF)"
    ],
    seniorFriendlyNote: "Podwójny ekran jest fenomenalny: od razu widać, czy ciśnienie spadło po wzięciu leków.",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-omron+m7+intelli+it"
  },
  {
    id: "microlife-bp-b6-afib",
    brand: "Microlife",
    category: "premium",
    priceRange: "260-400",
    name: "Microlife BP B6 Connect AFIB MAM",
    badge: "Technologia MAM (3 Pomiarowa) • Bluetooth",
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300",
    cuffType: "Mankiet sztywny Easy (22-42 cm)",
    priceEstimate: "ok. 280 - 349 zł",
    priceValue: 310,
    userRating: 4.9,
    reviewCount: 1680,
    clinicalCert: "Klinicznie testowany u pacjentów kardiologicznych, z cukrzycą i schorzeniami nerek",
    accuracyRating: "Technologia MAM – wykonuje 3 pomiary pod rząd i podaje uśredniony wynik medyczny",
    keyFeatures: [
      "Technologia MAM – automatyczne 3 pomiary wg zaleceń kardiologicznych PTNT",
      "Technologia AFIBsens – najnowocześniejsza detekcja migotania przedsionków",
      "Łączność Bluetooth oraz złącze USB do komputera PC",
      "Blokada przycisków przed przypadkowym wciśnięciem"
    ],
    seniorFriendlyNote: "Potrójny pomiar eliminuje tzw. 'efekt białego fartucha' i chwilowe skoki ciśnienia wywołane stresem.",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-microlife+bp+b6+connect+afib"
  },
  {
    id: "omron-m6-comfort",
    brand: "Omron",
    category: "premium",
    priceRange: "260-400",
    name: "Omron M6 Comfort z AFIB (HEM-7360-E)",
    badge: "Gabinetowo-Domowy • Mankiet 360°",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
    cuffType: "Mankiet sztywny Intelli Wrap 360° (22-42 cm)",
    priceEstimate: "ok. 279 - 339 zł",
    priceValue: 305,
    userRating: 4.9,
    reviewCount: 3150,
    clinicalCert: "Walidacja dla populacji ogólnej, diabetyków i kobiet w ciąży",
    accuracyRating: "Potrójny pomiar z detekcją AFIB, dioda ułożenia mankietu",
    keyFeatures: [
      "Mankiet Intelli Wrap 360° zakładany jedną ręką",
      "Detekcja migotania przedsionków w trybie potrójnego pomiaru",
      "Pamięć 2 użytkowników po 100 pomiarów + porównanie poranne i wieczorne",
      "Wskaźnik porannego nadciśnienia tętniczego"
    ],
    seniorFriendlyNote: "Bliźniacza dokładność jak model M7, dedykowany osobom preferującym pracę bez aplikacji na telefonie.",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-omron+m6+comfort"
  },
  {
    id: "beurer-bm-85",
    brand: "Beurer",
    category: "premium",
    priceRange: "260-400",
    name: "Beurer BM 85 z Akumulatorem i HDO",
    badge: "Wskaźnik Spoczynku HDO • Wbudowany Akumulator",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
    cuffType: "Mankiet uniwersalny (22-42 cm)",
    priceEstimate: "ok. 319 - 389 zł",
    priceValue: 349,
    userRating: 4.8,
    reviewCount: 840,
    clinicalCert: "Certyfikat ESH, nagroda Red Dot Design Award za ergonomię medyczną",
    accuracyRating: "Opatentowany wskaźnik spoczynku hemodynamicznego (HDO)",
    keyFeatures: [
      "Wbudowany akumulator litowo-jonowy – ładowany kablem USB (brak baterii paluszków)",
      "Wskaźnik spoczynku HDO – informuje, czy jesteś wystarczająco wyciszony do wiarygodnego pomiaru",
      "Podświetlane na biało dotykowe przyciski Sensor-Touch",
      "Bluetooth i synchronizacja z aplikacją beurer HealthManager"
    ],
    seniorFriendlyNote: "Wbudowany akumulator wystarcza na wiele miesięcy. Wyjątkowo elegancki i czytelny.",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-beurer+bm+85"
  },
  {
    id: "braun-exactfit-5-connect",
    brand: "Braun",
    category: "premium",
    priceRange: "260-400",
    name: "Braun ExactFit 5 Connect (BUA6350)",
    badge: "2 Precyzyjne Mankiety • Bluetooth Braun",
    badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300",
    cuffType: "2 mankiety w zestawie: S/M i L/XL",
    priceEstimate: "ok. 285 - 359 zł",
    priceValue: 315,
    userRating: 4.85,
    reviewCount: 1240,
    clinicalCert: "Walidacja kliniczna Europejskiego Towarzystwa Nadciśnienia Tętniczego ESH",
    accuracyRating: "Kliniczna zgodność z zaawansowaną analizą porannych skoków ciśnienia",
    keyFeatures: [
      "2 precyzyjne mankiety w zestawie dopasowane do każdego obwodu ręki",
      "Wykrywanie porannego nadciśnienia tętniczego i nieregularnego bicia serca",
      "Kolorowy, podświetlany wyświetlacz z natychmiastową interpretacją wyniku",
      "Aplikacja mobilna Braun Healthy Heart przez Bluetooth"
    ],
    seniorFriendlyNote: "Świetna graficzna prezentacja wyników na ekranie – od razu wiadomo, czy wynik jest w bezpiecznej zielonej strefie.",
    affiliateUrl: "https://www.ceneo.pl/Zdrowie;szukaj-braun+exactfit+5+connect"
  }
];
