export type PriceCategory = 'all' | 'under70' | 'under130' | 'under200' | 'premium';

export interface RecommendedDevice {
  id: string;
  name: string;
  brand: string;
  category: 'under70' | 'under130' | 'under200' | 'premium';
  badge: string;
  badgeColor: string;
  cuffType: string;
  priceEstimate: string;
  priceValue: number; // approximate PLN for sorting
  accuracyRating: string;
  keyFeatures: string[];
  seniorFriendlyNote: string;
  // =========================================================================
  // TUTAJ WKLEJASZ SWÓJ LINK AFILIACYJNY (np. z Allegro Polecam, Ceneo, apteki)
  // Gdy użytkownik kliknie przycisk, przejdzie pod ten adres, a Ty otrzymasz prowizję.
  // =========================================================================
  affiliateUrl: string;
}

export const RECOMMENDED_DEVICES: RecommendedDevice[] = [
  // -------------------------------------------------------------------------
  // KATEGORIA 1: SUPER BUDŻETOWE (DO OK. 50 - 70 ZŁ)
  // -------------------------------------------------------------------------
  {
    id: 'esperanza-vitality',
    brand: 'Esperanza',
    category: 'under70',
    name: 'Esperanza Vitality ECB002',
    badge: 'Super Budżet do 60 zł',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
    cuffType: 'Mankiet standardowy (22-32 cm)',
    priceEstimate: 'ok. 45 - 60 zł',
    priceValue: 50,
    accuracyRating: 'Podstawowy oscylometryczny pomiar medyczny',
    keyFeatures: [
      'Automatyczne pompowanie i spuszczanie powietrza',
      'Pamięć 90 ostatnich pomiarów z datą i godziną',
      'Klasyfikacja ciśnienia wg standardów WHO na wyświetlaczu',
      'Kompaktowa, lekka obudowa na baterie AAA',
    ],
    seniorFriendlyNote: 'Bardzo tani i prosty. Uwaga: mankiet do 32 cm pasuje na szczuplejsze lub standardowe ramiona.',
    affiliateUrl: 'https://allegro.pl/listing?string=esperanza%20vitality%20ecb002',
  },
  {
    id: 'sanitas-sbm-21',
    brand: 'Sanitas',
    category: 'under70',
    name: 'Sanitas SBM 21 (Niemiecka marka)',
    badge: 'Sprawdzony Tani Model',
    badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300',
    cuffType: 'Mankiet regulowany (22-36 cm)',
    priceEstimate: 'ok. 65 - 75 zł',
    priceValue: 70,
    accuracyRating: 'Certyfikacja wyrobu medycznego CE',
    keyFeatures: [
      'Pamięć 4 x 30 pomiarów (dla 4 domowników)',
      'Ostrzeżenie przed ewentualnymi zaburzeniami rytmu serca (arytmia)',
      'Czytelny wyświetlacz LCD i funkcja wyliczania średniej',
      'Automatyczne wyłączanie zapobiegające rozładowaniu baterii',
    ],
    seniorFriendlyNote: 'Niemiecka kontrola jakości w bardzo przystępnej cenie, mankiet do 36 cm.',
    affiliateUrl: 'https://allegro.pl/listing?string=sanitas%20sbm%2021',
  },

  // -------------------------------------------------------------------------
  // KATEGORIA 2: SOLIDNA PÓŁKA EKONOMICZNA (DO OK. 100 - 130 ZŁ)
  // -------------------------------------------------------------------------
  {
    id: 'tech-med-tma-500pro',
    brand: 'Tech-Med',
    category: 'under130',
    name: 'Tech-Med TMA-500PRO',
    badge: 'Bestseller Polski / Najlepsza Cena',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
    cuffType: 'Uniwersalny mankiet komfortowy (22-42 cm)',
    priceEstimate: 'ok. 95 - 120 zł',
    priceValue: 110,
    accuracyRating: 'Atest medyczny CE 0197, kliniczna zgodność',
    keyFeatures: [
      'Zasilanie bateryjne ORAZ przez port USB-C (można podpiąć ładowarkę od telefonu!)',
      'Duży, uniwersalny mankiet 22-42 cm (pasuje na każde ramię)',
      'Pamięć 2 x 120 pomiarów dla 2 osób z datą i godziną',
      'Wykrywanie objawów arytmii i wskaźnik poziomu ciśnienia wg WHO',
    ],
    seniorFriendlyNote: 'Rewelacyjny dla seniorów: można zasilać kablem od telefonu (brak problemu z bateriami), ogromne cyfry.',
    affiliateUrl: 'https://allegro.pl/listing?string=tech-med%20tma%20500pro',
  },
  {
    id: 'novama-white',
    brand: 'Novama',
    category: 'under130',
    name: 'Novama White / First',
    badge: '5 Lat Gwarancji',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300',
    cuffType: 'Mankiet uniwersalny M-L (22-42 cm)',
    priceEstimate: 'ok. 99 - 130 zł',
    priceValue: 115,
    accuracyRating: 'Certyfikacja kliniczna ESH (Europejskie Towarzystwo Nadciśnienia)',
    keyFeatures: [
      'Gwarancja "od drzwi do drzwi" aż 5 lat',
      'Technologia pomiaru podczas pompowania (łagodny i bardzo szybki pomiar)',
      'Interpretacja wyniku wg skali kolorów',
      'Pamięć 90 wyników z analizą średniej',
    ],
    seniorFriendlyNote: 'Biała, czysta obudowa z pojedynczym dużym przyciskiem. Bardzo delikatny dla kruchych naczyń krwionośnych.',
    affiliateUrl: 'https://allegro.pl/listing?string=novama%20white%20cisnieniomierz',
  },
  {
    id: 'oromed-oro-bp',
    brand: 'ORO-MED',
    category: 'under130',
    name: 'ORO-MED ORO-BP Crystal / Optic',
    badge: 'Podświetlany Ekran',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
    cuffType: 'Mankiet standardowy do dużego (22-40 cm)',
    priceEstimate: 'ok. 90 - 125 zł',
    priceValue: 105,
    accuracyRating: 'Atest wyrobu medycznego UE',
    keyFeatures: [
      'Duży, podświetlany na niebiesko ekran (idealny do pomiaru w nocy/o świcie)',
      'Wykrywanie arytmii serca oraz błędu ruchowego',
      'Pamięć 2 x 120 wpisów',
      'Bardzo cicha praca kompresora',
    ],
    seniorFriendlyNote: 'Dla osób ze słabszym wzrokiem – podświetlenie ekranu pozwala odczytać wynik bez zapalania światła.',
    affiliateUrl: 'https://allegro.pl/listing?string=oromed%20oro%20bp%20cisnieniomierz',
  },

  // -------------------------------------------------------------------------
  // KATEGORIA 3: STANDARD APTECZNY I SZPITALNY (DO OK. 150 - 200 ZŁ)
  // -------------------------------------------------------------------------
  {
    id: 'microlife-bp-a2-basic',
    brand: 'Microlife',
    category: 'under200',
    name: 'Microlife BP A2 Basic Gentle+',
    badge: 'Wybór Lekarzy i Farmaceutów',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
    cuffType: 'Mankiet stożkowy M-L (22-42 cm)',
    priceEstimate: 'ok. 145 - 175 zł',
    priceValue: 160,
    accuracyRating: 'Najwyższa klasa A/A wg BHS (British Hypertension Society)',
    keyFeatures: [
      'Technologia Gentle+ dla bezbolesnego i łagodnego pompowania mankietu',
      'Opatentowana technologia PAD wykrywająca wczesne zaburzenia rytmu serca',
      'Wskaźnik prawidłowego założenia mankietu oraz wskaźnik ruchu ręki',
      'Kolorowa skala WHO na krawędzi obudowy (zielony / żółty / czerwony)',
    ],
    seniorFriendlyNote: 'Szwajcarska precyzja, najczęściej polecany model w polskich aptekach. Nie ściska mocno ręki.',
    affiliateUrl: 'https://allegro.pl/listing?string=microlife%20bp%20a2%20basic',
  },
  {
    id: 'omron-m2-basic',
    brand: 'Omron',
    category: 'under200',
    name: 'Omron M2 Basic (HEM-7121J-E)',
    badge: 'Niezawodny Japoński Klasyk',
    badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300',
    cuffType: 'Mankiet Easy Cuff (22-32 cm lub zestaw z 42 cm)',
    priceEstimate: 'ok. 125 - 160 zł',
    priceValue: 140,
    accuracyRating: 'Pełna walidacja kliniczna ESH',
    keyFeatures: [
      'Technologia Intellisense dopasowująca ciśnienie do użytkownika',
      'Wskaźnik prawidłowego założenia mankietu',
      'Wskaźnik nieregularnego rytmu serca',
      'Legendarne japońskie czujniki ciśnienia o wieloletniej trwałości',
    ],
    seniorFriendlyNote: 'Jeden wielki przycisk operacyjny. Nie da się w nim niczego przypadkowo przestawić ani popsuć.',
    affiliateUrl: 'https://allegro.pl/listing?string=omron%20m2%20basic',
  },
  {
    id: 'braun-exactfit-3',
    brand: 'Braun',
    category: 'under200',
    name: 'Braun ExactFit 3 (BUA6150)',
    badge: 'Zestaw z 2 Mankietami',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
    cuffType: 'Dwa mankiety w zestawie: S-M oraz L-XL',
    priceEstimate: 'ok. 165 - 195 zł',
    priceValue: 180,
    accuracyRating: 'Walidacja Europejskiego Towarzystwa Nadciśnienia',
    keyFeatures: [
      'W komplecie 2 oddzielne mankiety dla idealnego dopasowania do każdej ręki',
      'Zaawansowane uśrednianie z ostatnich 3 pomiarów',
      'Pamięć dla 2 osób po 40 pomiarów',
      'Intuicyjna kolorowa skala oceny ciśnienia',
    ],
    seniorFriendlyNote: 'Idealny, jeśli ciśnienie mierzy małżeństwo o różnej budowie ciała (szczupła i tęższa ręka).',
    affiliateUrl: 'https://allegro.pl/listing?string=braun%20exactfit%203',
  },

  // -------------------------------------------------------------------------
  // KATEGORIA 4: KLASA KARDIOLOGICZNA I ZAAWANSOWANA (OK. 200 - 450 ZŁ)
  // -------------------------------------------------------------------------
  {
    id: 'omron-m3-comfort',
    brand: 'Omron',
    category: 'premium',
    name: 'Omron M3 Comfort (HEM-7155-E)',
    badge: 'Złoty Standard Kardiologiczny',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
    cuffType: 'Mankiet sztywny Intelli Wrap 360° (22-42 cm)',
    priceEstimate: 'ok. 210 - 260 zł',
    priceValue: 235,
    accuracyRating: 'Kliniczna walidacja ESH / AAMI / dla cukrzyków i kobiet w ciąży',
    keyFeatures: [
      'Mankiet 360° eliminuje błędy pomiaru – mierzy dokładnie w każdym położeniu na ramieniu',
      'Dioda LED potwierdzająca idealne założenie mankietu (zielone światło)',
      'Wykrywanie nieregularnego bicia serca (arytmia)',
      'Pamięć 2 użytkowników x 60 pomiarów + funkcja gościa',
    ],
    seniorFriendlyNote: 'Absolutny numer 1 dla osób starszych: sztywny mankiet zakłada się jedną ręką w 3 sekundy, nie da się go założyć źle.',
    affiliateUrl: 'https://allegro.pl/listing?string=omron%20m3%20comfort',
  },
  {
    id: 'microlife-bp-b6-afib',
    brand: 'Microlife',
    category: 'premium',
    name: 'Microlife BP B6 Connect AFIB',
    badge: 'Wykrywanie Ryzyka Udaru (AFIB)',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300',
    cuffType: 'Mankiet sztywny Easy (22-42 cm)',
    priceEstimate: 'ok. 270 - 340 zł',
    priceValue: 300,
    accuracyRating: 'Klinicznie testowany u pacjentów kardiologicznych i nerkowych',
    keyFeatures: [
      'Technologia AFIBsens – wczesne wykrywanie migotania przedsionków zapobiegające udarom',
      'Technologia MAM – automatyczne wykonanie 3 pomiarów pod rząd i wyliczenie średniej',
      'Łączność Bluetooth i przesyłanie wyników do komputera lub telefonu',
      'Blokada przycisków przed przypadkowym wciśnięciem',
    ],
    seniorFriendlyNote: 'Urządzenie dla osób z problemami kardiologicznymi, arytmiami lub po incydentach sercowych.',
    affiliateUrl: 'https://allegro.pl/listing?string=microlife%20bp%20b6%20connect%20afib',
  },
  {
    id: 'omron-m7-intelli-it',
    brand: 'Omron',
    category: 'premium',
    name: 'Omron M7 Intelli IT (HEM-7361T-E)',
    badge: 'Top Model Omron z AFIB i Bluetooth',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
    cuffType: 'Mankiet sztywny Intelli Wrap 360° (22-42 cm)',
    priceEstimate: 'ok. 340 - 430 zł',
    priceValue: 380,
    accuracyRating: 'Najwyższa światowa certyfikacja kliniczna',
    keyFeatures: [
      'Podwójny ekran (pokazuje bieżący pomiar obok poprzedniego dla natychmiastowego porównania)',
      'Wskaźnik ryzyka migotania przedsionków (AFIB)',
      'Mankiet 360° Intelli Wrap – brak martwej strefy pomiarowej',
      'Moduł Bluetooth i synchronizacja ze smartfonem',
    ],
    seniorFriendlyNote: 'Podwójny ekran jest fantastyczny – od razu widać, czy ciśnienie spadło w porównaniu do poranka.',
    affiliateUrl: 'https://allegro.pl/listing?string=omron%20m7%20intelli%20it',
  },
];
