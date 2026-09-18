const expansions = [
  {
    id: "arr", name: "A Realm Reborn", patch: "2.x", year: 2013, levels: "1–50", color: "#71eaff",
    short: "Naces como aventurero y terminas defendiendo Eorzea.",
    hook: "Llegas a una Eorzea que todavía intenta levantarse de la Séptima Calamidad. Conoces a los Scions, combates primals y descubres que el Imperio Garleano amenaza a las ciudades-estado.",
    tags: ["Scions", "Primals", "Garlemald", "Crystal Tower"],
    spoiler: "Derrotas a la Ultima Weapon y a Lahabrea, pero la victoria no trae paz: los Crystal Braves son corrompidos, el sultanicidio te incrimina y tú y Alphinaud escapáis hacia Ishgard."
  },
  {
    id: "hw", name: "Heavensward", patch: "3.x", year: 2015, levels: "50–60", color: "#78a8ff",
    short: "Refugio en Ishgard y guerra entre humanos y dragones.",
    hook: "Exiliado de Eorzea, buscas asilo en Ishgard. La ciudad lleva mil años en guerra contra los dragones y su verdad está enterrada bajo religión, nobleza y rencor.",
    tags: ["Ishgard", "Dragonsong War", "Nidhogg", "Alexander"],
    spoiler: "La guerra nació de la traición de los antepasados de Ishgard. Thordan busca poder divino, Haurchefant se sacrifica y la caída definitiva de Nidhogg permite construir una paz nueva."
  },
  {
    id: "sb", name: "Stormblood", patch: "4.x", year: 2017, levels: "60–70", color: "#ff7d75",
    short: "Dos pueblos intentan romper las cadenas imperiales.",
    hook: "La lucha se divide entre Ala Mhigo y Doma. Debes ayudar a pueblos sometidos a recuperar la esperanza antes de enfrentarse al Imperio.",
    tags: ["Ala Mhigo", "Doma", "Zenos", "Omega"],
    spoiler: "Doma y Ala Mhigo son liberadas. Zenos se fusiona con Shinryu para buscar una batalla definitiva, mientras la política imperial y los Ascians preparan una amenaza mucho mayor."
  },
  {
    id: "shb", name: "Shadowbringers", patch: "5.x", year: 2019, levels: "70–80", color: "#a887ff",
    short: "Viajas al First, un mundo ahogado por la Luz.",
    hook: "Los Scions han sido llamados a otra reflexión. Allí, la Luz no representa salvación: ha devorado casi todo el mundo y crea monstruos llamados sin eaters.",
    tags: ["The First", "Lightwardens", "Crystarium", "Eden"],
    spoiler: "Emet-Selch revela la historia de los antiguos y el propósito de las Rejoinings. En Amaurot, el Warrior of Light, Ardbert y los Scions detienen su plan y devuelven la noche al First."
  },
  {
    id: "ew", name: "Endwalker", patch: "6.x", year: 2021, levels: "80–90", color: "#e8c574",
    short: "El arco de Hydaelyn y Zodiark alcanza su conclusión.",
    hook: "Los Final Days regresan. La investigación conduce de Sharlayan y Garlemald hasta la Luna y más allá de las estrellas.",
    tags: ["Final Days", "Sharlayan", "Garlemald", "Pandæmonium"],
    spoiler: "Zodiark cae, Elpis revela el origen de la catástrofe y Hydaelyn entrega su último legado. El viaje termina frente a Meteion y la Endsinger, afirmando que la vida vale incluso con dolor."
  },
  {
    id: "dt", name: "Dawntrail", patch: "7.x", year: 2024, levels: "90–100", color: "#72e6b1",
    short: "Un nuevo comienzo en Tural y una sucesión disputada.",
    hook: "Una invitación te lleva al continente occidental de Tural. La competición por el trono de Tuliyollal comienza como aventura cultural y abre la puerta a un misterio tecnológico.",
    tags: ["Tural", "Tuliyollal", "Solution Nine", "Arcadion"],
    spoiler: "Wuk Lamat supera el rito de sucesión, pero la amenaza cambia con Alexandria, Zoraal Ja y Sphene. Living Memory obliga a elegir entre conservar ecos del pasado o proteger a quienes aún viven."
  }
];

const expansionDetails = {
  arr: {
    theme: "Reconstrucción, alianzas y el nacimiento del Warrior of Light.",
    highlights: ["Presenta las tres ciudades-estado, los Scions y el Imperio Garleano.", "Enseña el ciclo principal de MSQ, dungeons, trials y Crystal Tower.", "Sus parches 2.x preparan directamente la entrada a Ishgard."],
    source: "https://na.finalfantasyxiv.com/a_realm_reborn/"
  },
  hw: {
    theme: "Fe, memoria histórica y el precio de una guerra de mil años.",
    highlights: ["Abre Ishgard y las tierras de Dravania.", "Introduce Dark Knight, Astrologian y Machinist.", "El vuelo y Alexander forman parte de su identidad jugable."],
    source: "https://na.finalfantasyxiv.com/heavensward/"
  },
  sb: {
    theme: "Liberación, resistencia y las cicatrices del dominio imperial.",
    highlights: ["Divide el viaje entre Ala Mhigo y el Lejano Oriente.", "Introduce Samurai y Red Mage.", "Omega, Ivalice y Eureka amplían muchísimo su endgame."],
    source: "https://na.finalfantasyxiv.com/stormblood/"
  },
  shb: {
    theme: "Luz y oscuridad dejan de ser respuestas simples.",
    highlights: ["Traslada la aventura al First y al Crystarium.", "Introduce Gunbreaker, Dancer, Trust y role quests.", "Eden, YoRHa y Bozja continúan sus grandes historias opcionales."],
    source: "https://na.finalfantasyxiv.com/shadowbringers/"
  },
  ew: {
    theme: "El cierre del arco de Hydaelyn y Zodiark y una reflexión sobre la esperanza.",
    highlights: ["Viaja por Sharlayan, Garlemald, la Luna y destinos más lejanos.", "Introduce Reaper y Sage.", "Pandæmonium, Myths of the Realm e Island Sanctuary forman su etapa posterior."],
    source: "https://na.finalfantasyxiv.com/endwalker/"
  },
  dt: {
    theme: "Exploración, legado cultural y el comienzo de una etapa nueva.",
    highlights: ["Lleva el viaje a Tural y Tuliyollal.", "Introduce Viper y Pictomancer.", "Solution Nine y el Arcadion muestran la otra cara de esta aventura."],
    source: "https://na.finalfantasyxiv.com/dawntrail/"
  }
};

expansions.forEach(expansion => Object.assign(expansion, expansionDetails[expansion.id]));

const legacyStory = {
  id: "legacy",
  name: "El prólogo: FFXIV 1.0 y la Séptima Calamidad",
  patch: "LEGACY",
  year: "2010–2013",
  levels: "Antes de ARR",
  color: "#e8c574",
  hook: "La primera versión de FFXIV concluyó con la caída de Dalamud. A Realm Reborn no ignora aquel final: lo convierte en el desastre histórico del que Eorzea intenta recuperarse.",
  theme: "Cómo una reconstrucción real del juego se convirtió también en el punto de partida de su historia.",
  tags: ["Dalamud", "Bahamut", "Carteneau", "Séptima Calamidad"],
  highlights: ["No necesitas jugar la versión 1.0 para entender ARR.", "El vídeo de apertura de ARR resume el desastre de Carteneau.", "Los personajes Legacy reciben algunas referencias especiales, pero la historia principal funciona para cualquier cuenta."],
  spoiler: "Louisoix detiene temporalmente a Bahamut y envía a los Warriors of Light fuera del alcance de la calamidad. Cinco años después comienza A Realm Reborn.",
  source: "https://na.finalfantasyxiv.com/a_realm_reborn/"
};

const levelBands = [
  { min:1, max:15, range:"1–15", expansion:"A Realm Reborn", title:"Aprende tu clase", summary:"Historia inicial, hunting log y primeras habilidades.", priorities:[["MSQ","Sigue el meteorito; es tu llave principal."],["Clase","Haz las misiones de clase cuando aparezcan."],["Aetherytes","Sintoniza cada cristal para viajar barato."],["Equipo","Usa recompensas de MSQ y Hall of the Novice."]] },
  { min:16, max:29, range:"16–29", expansion:"A Realm Reborn", title:"Entran las duties", summary:"Dungeons, roulettes, Grand Company y chocobo.", priorities:[["Dungeons","Sastasha abre el ciclo de contenido en grupo."],["Roulette","Leveling da mucha experiencia una vez al día."],["Chocobo","Desbloquea My Little Chocobo tras elegir Grand Company."],["Job","No pierdas de vista la transición de clase a job."]] },
  { min:30, max:49, range:"30–49", expansion:"A Realm Reborn", title:"Tu job toma forma", summary:"Job stone, primals y sistemas centrales.", priorities:[["Job stone","Equípala: convierte tu clase en su job real."],["Job quests","Desbloquean habilidades esenciales."],["MSQ","Ifrit, Titan y Garuda marcan el avance."],["Blue quests","Abren glamour, challenge log y sistemas útiles."]] },
  { min:50, max:50, range:"50", expansion:"ARR · Endgame", title:"No has terminado ARR", summary:"The Ultimate Weapon, Crystal Tower y parches 2.x.", priorities:[["MSQ","Completa ARR y sus parches hasta Before the Dawn."],["Crystal Tower","Es obligatoria para continuar más adelante."],["Poetics","Compra Augmented Ironworks de ilvl 130."],["Opcional","Extreme trials, Binding Coil, relic Zodiac y Hildibrand."]] },
  { min:51, max:59, range:"51–59", expansion:"Heavensward", title:"La guerra de Ishgard", summary:"Volar, nuevas zonas y dungeons de nivelación.", priorities:[["MSQ","La historia desbloquea cada zona de Heavensward."],["Aether Currents","Completa corrientes y misiones azules para volar."],["Job quests","Hazlas a 52, 54, 56, 58 y 60 cuando corresponda."],["Equipo","Los dungeons y la MSQ bastan durante la subida."]] },
  { min:60, max:60, range:"60", expansion:"HW · Endgame", title:"Alexander y las Anima", summary:"Equipo Shire, raids y contenido 3.x.", priorities:[["Poetics","Augmented Shire alcanza ilvl 270."],["Alexander","Raid normal de 8 jugadores en cuatro tiers."],["Alliance","Void Ark inicia Shadows of Mhach."],["Relic","Anima Weapon es un proyecto largo, principalmente cosmético hoy."]] },
  { min:61, max:69, range:"61–69", expansion:"Stormblood", title:"Liberar dos naciones", summary:"Ala Mhigo, Doma y nuevas zonas orientales.", priorities:[["MSQ","Tu acceso a Kugane y Othard depende de la historia."],["Aether Currents","Desbloquea el vuelo zona por zona."],["Job quests","La cadena 60–70 entrega tu habilidad de nivel 70."],["Equipo","Cambia piezas con dungeons y recompensas de MSQ."]] },
  { min:70, max:70, range:"70", expansion:"SB · Endgame", title:"Omega, Ivalice y Eureka", summary:"Equipo Scaevan y grandes cadenas opcionales.", priorities:[["Poetics","Augmented Scaevan alcanza ilvl 400."],["Omega","Raid normal y savage de Stormblood."],["Ivalice","Alliance raid importante y requisito para Bozja."],["Eureka","Zona especial para relics, farmeo y progresión propia."]] },
  { min:71, max:79, range:"71–79", expansion:"Shadowbringers", title:"Devuelve la noche", summary:"The First, role quests y Trust/Duty Support.", priorities:[["MSQ","Avanza con los Scions a través de cada Lightwarden."],["Role quests","Sustituyen las job quests tradicionales; completa una cadena."],["Duty Support","Puedes recorrer dungeons principales con NPCs."],["Equipo","Usa coffers de MSQ y drops; no gastes de más."]] },
  { min:80, max:80, range:"80", expansion:"ShB · Endgame", title:"Eden, NieR y Bozja", summary:"Equipo Cryptlurker y contenido paralelo enorme.", priorities:[["Poetics","Augmented Cryptlurker alcanza ilvl 530."],["Eden","Raid de 8 jugadores con 12 encuentros."],["Alliance","YoRHa: Dark Apocalypse es la serie de NieR."],["Bozja","Relic Resistance, Southern Front y Zadnor."]] },
  { min:81, max:89, range:"81–89", expansion:"Endwalker", title:"Hasta las estrellas", summary:"Final Days, nuevos destinos y role quests.", priorities:[["MSQ","Es la prioridad para abrir zonas y duties."],["Role quests","Hay cadenas por rol; no bloquean la MSQ."],["Aether Currents","Recógelas mientras recorres cada mapa."],["Equipo","MSQ y dungeons mantienen el ilvl necesario."]] },
  { min:90, max:90, range:"90", expansion:"EW · Endgame", title:"Pandæmonium y vida tranquila", summary:"Equipo Credendum, raids e Island Sanctuary.", priorities:[["MSQ 6.x","La aventura posterior abre el camino hacia Tural."],["Pandæmonium","Raid normal y savage en tres tiers."],["Alliance","Myths of the Realm explora a los Twelve."],["Lifestyle","Island Sanctuary ofrece progreso independiente y cosméticos."]] },
  { min:91, max:99, range:"91–99", expansion:"Dawntrail", title:"La ruta de Tural", summary:"Rito de sucesión, nuevas culturas y tecnología.", priorities:[["MSQ","Es el camino directo a zonas, dungeons y vuelos."],["Viper / Pictomancer","Empiezan en 80 si tienes Dawntrail y un job al 80."],["Role quests","Cinco cadenas por rol vuelven en esta expansión."],["Nivel 100","Tu tramo termina aquí justo antes del endgame actual."]] }
];

const jobs = [
  {name:"Paladin",abbr:"PLD",role:"Tanque",start:30,route:"Gladiator 1 → Paladin 30",requirement:"Gladiator 30 y misión de clase completada",place:"Ul'dah",weapon:"Espada y escudo",feel:"Defensa clásica, espada, escudo y magia sagrada.",note:"Paladin es la evolución de Gladiator. No creas otro personaje: equipas el job stone de Paladin y continúas con el mismo nivel.",steps:["Empieza o desbloquea Gladiator en Ul'dah.","Sube Gladiator a nivel 30 y termina su misión de clase de nivel 30.","Acepta la primera misión de Paladin y equipa el Soul of the Paladin."],slug:"paladin"},
  {name:"Warrior",abbr:"WAR",role:"Tanque",start:30,route:"Marauder 1 → Warrior 30",requirement:"Marauder 30 y misión de clase completada",place:"Limsa Lominsa",weapon:"Hacha a dos manos",feel:"Hacha enorme, autocuración brutal y ritmo directo.",note:"“Marauder → Warrior” significa que empiezas como la clase Marauder al nivel 1. Al nivel 30 haces la misión inicial de Warrior, recibes su job stone y sigues jugando con la misma hacha y el mismo personaje.",steps:["Empieza o desbloquea Marauder en Limsa Lominsa.","Sube Marauder a nivel 30 y termina su misión de clase de nivel 30.","Acepta la primera misión de Warrior y equipa el Soul of the Warrior."],slug:"warrior"},
  {name:"Dark Knight",abbr:"DRK",role:"Tanque",start:30,route:"Job independiente · empieza en 30",requirement:"Heavensward y acceso a Ishgard",place:"Ishgard",weapon:"Espadón",feel:"Espadón, barreras y estética oscura.",note:"No tiene clase base. La misión de desbloqueo te entrega el job directamente al nivel 30; para verla debes haber avanzado la MSQ hasta poder entrar en Ishgard.",steps:["Completa la historia de ARR y sus parches hasta acceder a Ishgard.","Busca la misión inicial de Dark Knight en The Pillars.","Completa la misión, equipa el job stone y continúa desde nivel 30."],slug:"darkknight"},
  {name:"Gunbreaker",abbr:"GNB",role:"Tanque",start:60,route:"Job independiente · empieza en 60",requirement:"Shadowbringers y un job de combate al 60",place:"New Gridania",weapon:"Gunblade",feel:"Gunblade, combos rápidos y mitigación activa.",note:"No necesitas subir una clase base. Cumples el requisito con cualquier Disciple of War o Magic de nivel 60 y la misión te entrega Gunbreaker al 60.",steps:["Ten Shadowbringers registrado.","Alcanza nivel 60 con cualquier job de combate.","Acepta la misión inicial en New Gridania y equipa su job stone."],slug:"gunbreaker"},
  {name:"White Mage",abbr:"WHM",role:"Healer",start:30,route:"Conjurer 1 → White Mage 30",requirement:"Conjurer 30 y misión de clase completada",place:"Gridania",weapon:"Báculo",feel:"Curación potente, sencilla y muy visible.",note:"White Mage evoluciona desde Conjurer. El nivel no se reinicia: el job stone amplía la misma progresión con habilidades exclusivas.",steps:["Empieza o desbloquea Conjurer en Gridania.","Sube Conjurer a nivel 30 y completa su misión de clase.","Acepta la primera misión de White Mage y equipa su job stone."],slug:"whitemage"},
  {name:"Scholar",abbr:"SCH",role:"Healer",start:30,route:"Arcanist 1 → Scholar 30",requirement:"Arcanist 30 y misión de clase completada",place:"Limsa Lominsa",weapon:"Libro de grimorios",feel:"Hada, escudos y planificación.",note:"Arcanist puede convertirse tanto en Scholar como en Summoner. Ambos comparten el nivel base de Arcanist, pero usan job stones, equipo y misiones distintas.",steps:["Empieza o desbloquea Arcanist en Limsa Lominsa.","Sube Arcanist a nivel 30 y completa su misión de clase.","Acepta la primera misión de Scholar y equipa el Soul of the Scholar."],slug:"scholar"},
  {name:"Astrologian",abbr:"AST",role:"Healer",start:30,route:"Job independiente · empieza en 30",requirement:"Heavensward y acceso a Ishgard",place:"Ishgard",weapon:"Star globe",feel:"Cartas, estrellas y curación flexible.",note:"No tiene clase base. Al llegar a Ishgard puedes aceptar su misión y el job comienza directamente al nivel 30.",steps:["Completa ARR y sus parches hasta entrar en Ishgard.","Busca la misión inicial en The Pillars.","Completa la misión y equipa el Soul of the Astrologian."],slug:"astrologian"},
  {name:"Sage",abbr:"SGE",role:"Healer",start:70,route:"Job independiente · empieza en 70",requirement:"Endwalker y un job de combate al 70",place:"Limsa Lominsa",weapon:"Nouliths",feel:"Escudos tecnológicos y cura mientras ataca.",note:"Se desbloquea con cualquier job de combate al 70; no exige subir otra clase concreta.",steps:["Ten Endwalker registrado.","Alcanza nivel 70 con cualquier Disciple of War o Magic.","Acepta la misión inicial en Limsa Lominsa y equipa su job stone."],slug:"sage"},
  {name:"Monk",abbr:"MNK",role:"Melee",start:30,route:"Pugilist 1 → Monk 30",requirement:"Pugilist 30 y misión de clase completada",place:"Ul'dah",weapon:"Armas de puño",feel:"Golpes veloces, formas y presión constante.",note:"Monk es la evolución de Pugilist. Mantienes el nivel y el equipo compatible al equipar su job stone.",steps:["Empieza o desbloquea Pugilist en Ul'dah.","Sube Pugilist a 30 y termina su misión de clase.","Acepta la primera misión de Monk y equipa su job stone."],slug:"monk"},
  {name:"Dragoon",abbr:"DRG",role:"Melee",start:30,route:"Lancer 1 → Dragoon 30",requirement:"Lancer 30 y misión de clase completada",place:"Gridania",weapon:"Lanza",feel:"Lanza, saltos y ataques con identidad dracónica.",note:"Dragoon continúa la progresión de Lancer. El job stone abre sus misiones y habilidades propias.",steps:["Empieza o desbloquea Lancer en Gridania.","Sube Lancer a 30 y completa su misión de clase.","Acepta la primera misión de Dragoon y equipa su job stone."],slug:"dragoon"},
  {name:"Ninja",abbr:"NIN",role:"Melee",start:30,route:"Clase 10 → Rogue 1 → Ninja 30",requirement:"Rogue 30 y misión de clase completada",place:"Limsa Lominsa",weapon:"Dagas",feel:"Mudras, velocidad y utilidad de grupo.",note:"Rogue no se ofrece en la creación de personaje. Primero completa la misión de nivel 10 de tu clase inicial; después podrás desbloquear Rogue en Limsa y llevarlo a 30 para convertirlo en Ninja.",steps:["Completa la misión de nivel 10 de tu primera clase.","Desbloquea Rogue en Limsa Lominsa y súbelo a 30.","Completa la misión inicial de Ninja y equipa su job stone."],slug:"ninja"},
  {name:"Samurai",abbr:"SAM",role:"Melee",start:50,route:"Job independiente · empieza en 50",requirement:"Stormblood y un job de combate al 50",place:"Ul'dah",weapon:"Katana",feel:"Katana, recursos personales y gran daño.",note:"No tiene clase base. Cualquier job de combate al 50 cumple el requisito de nivel.",steps:["Ten Stormblood registrado.","Alcanza nivel 50 con cualquier job de combate.","Acepta la misión inicial en Ul'dah y equipa su job stone."],slug:"samurai"},
  {name:"Reaper",abbr:"RPR",role:"Melee",start:70,route:"Job independiente · empieza en 70",requirement:"Endwalker y un job de combate al 70",place:"Ul'dah",weapon:"Guadaña",feel:"Guadaña, avatar del void y combos fluidos.",note:"No tiene clase base. La misión lo entrega al 70 cuando cumples la licencia y el requisito de nivel.",steps:["Ten Endwalker registrado.","Alcanza nivel 70 con cualquier job de combate.","Acepta la misión inicial en Ul'dah y equipa su job stone."],slug:"reaper"},
  {name:"Viper",abbr:"VPR",role:"Melee",start:80,route:"Job independiente · empieza en 80",requirement:"Dawntrail y un job de combate al 80",place:"Ul'dah",weapon:"Espadas dobles",feel:"Dos espadas, ritmo veloz y cadenas intuitivas.",note:"No necesita clase base ni haber llegado todavía a Tural. Basta la licencia de Dawntrail y un job de combate al 80.",steps:["Ten Dawntrail registrado.","Alcanza nivel 80 con cualquier job de combate.","Acepta la misión inicial en Ul'dah y equipa su job stone."],slug:"viper"},
  {name:"Beastmaster",abbr:"BST",role:"Limitado",start:1,route:"Job limitado · empieza en 1",requirement:"Job de combate al 50 y The Ultimate Weapon",place:"New Gridania",weapon:"Hacha de una mano y familiares",feel:"Captura monstruos y combina sus habilidades mediante familiares.",note:"Es un limited job: tiene nivel máximo y reglas de grupo distintas a los jobs normales. La guía oficial actual lo presenta con nivel máximo 50.",steps:["Alcanza nivel 50 con un Disciple of War o Magic.","Completa la MSQ “The Ultimate Weapon”.", "Acepta “Strangers in the Wood” en New Gridania y comienza desde nivel 1."],slug:"beastmaster"},
  {name:"Bard",abbr:"BRD",role:"Ranged",start:30,route:"Archer 1 → Bard 30",requirement:"Archer 30 y misión de clase completada",place:"Gridania",weapon:"Arco",feel:"Arco, canciones y procs reactivos.",note:"Bard es la evolución de Archer. El job stone añade canciones y habilidades de apoyo sin reiniciar tu nivel.",steps:["Empieza o desbloquea Archer en Gridania.","Sube Archer a 30 y completa su misión de clase.","Acepta la primera misión de Bard y equipa su job stone."],slug:"bard"},
  {name:"Machinist",abbr:"MCH",role:"Ranged",start:30,route:"Job independiente · empieza en 30",requirement:"Heavensward y acceso a Ishgard",place:"Ishgard",weapon:"Arma de fuego",feel:"Armas de fuego, gadgets y daño personal.",note:"No tiene clase base. Debes acceder a Ishgard y la misión te entrega Machinist al nivel 30.",steps:["Completa ARR y sus parches hasta entrar en Ishgard.","Busca la misión inicial en Foundation.","Completa la misión y equipa su job stone."],slug:"machinist"},
  {name:"Dancer",abbr:"DNC",role:"Ranged",start:60,route:"Job independiente · empieza en 60",requirement:"Shadowbringers y un job de combate al 60",place:"Limsa Lominsa",weapon:"Chakrams",feel:"Chakrams, pasos y apoyo a un compañero.",note:"No tiene clase base. La misión lo entrega directamente al 60.",steps:["Ten Shadowbringers registrado.","Alcanza nivel 60 con cualquier job de combate.","Acepta la misión inicial en Limsa Lominsa y equipa su job stone."],slug:"dancer"},
  {name:"Black Mage",abbr:"BLM",role:"Caster",start:30,route:"Thaumaturge 1 → Black Mage 30",requirement:"Thaumaturge 30 y misión de clase completada",place:"Ul'dah",weapon:"Báculo de dos manos",feel:"Torreta mágica: fuego enorme y gestión de posición.",note:"Black Mage continúa la progresión de Thaumaturge. El job stone abre sus hechizos y misiones exclusivas.",steps:["Empieza o desbloquea Thaumaturge en Ul'dah.","Sube Thaumaturge a 30 y completa su misión de clase.","Acepta la primera misión de Black Mage y equipa su job stone."],slug:"blackmage"},
  {name:"Summoner",abbr:"SMN",role:"Caster",start:30,route:"Arcanist 1 → Summoner 30",requirement:"Arcanist 30 y misión de clase completada",place:"Limsa Lominsa",weapon:"Libro de grimorios",feel:"Invocaciones, movilidad y rotación accesible.",note:"Arcanist puede abrir Summoner y Scholar. Comparten nivel porque ambos nacen de Arcanist, pero sus job stones y roles son distintos.",steps:["Empieza o desbloquea Arcanist en Limsa Lominsa.","Sube Arcanist a 30 y completa su misión de clase.","Acepta la primera misión de Summoner y equipa su job stone."],slug:"summoner"},
  {name:"Red Mage",abbr:"RDM",role:"Caster",start:50,route:"Job independiente · empieza en 50",requirement:"Stormblood y un job de combate al 50",place:"Ul'dah",weapon:"Florete y foco",feel:"Magia dual, florete y resurrección rápida.",note:"No tiene clase base. La misión lo entrega al nivel 50.",steps:["Ten Stormblood registrado.","Alcanza nivel 50 con cualquier job de combate.","Acepta la misión inicial en Ul'dah y equipa su job stone."],slug:"redmage"},
  {name:"Pictomancer",abbr:"PCT",role:"Caster",start:80,route:"Job independiente · empieza en 80",requirement:"Dawntrail y un job de combate al 80",place:"Gridania",weapon:"Pincel",feel:"Pinta criaturas, armas y paisajes mágicos.",note:"No tiene clase base ni exige haber entrado en Tural. La licencia de Dawntrail y un job de combate al 80 bastan.",steps:["Ten Dawntrail registrado.","Alcanza nivel 80 con cualquier job de combate.","Acepta la misión inicial en Gridania y equipa su job stone."],slug:"pictomancer"},
  {name:"Blue Mage",abbr:"BLU",role:"Limitado",start:1,route:"Job limitado · empieza en 1",requirement:"Job de combate al 50 y The Ultimate Weapon",place:"Limsa Lominsa",weapon:"Caña de una mano",feel:"Aprende hechizos de monstruos y usa reglas propias.",note:"Es un limited job: aprende acciones observando monstruos y no usa normalmente el Duty Finder estándar. Su progresión y su contenido están separados de los jobs normales.",steps:["Alcanza nivel 50 con un Disciple of War o Magic.","Completa la MSQ “The Ultimate Weapon”.", "Acepta la misión inicial en Limsa Lominsa y comienza desde nivel 1."],slug:"bluemage"}
].map(job => ({...job, source:`https://na.finalfantasyxiv.com/jobguide/${job.slug}/`}));

const roleColors = { Tanque:"#78a8ff", Healer:"#72e6b1", Melee:"#ff7d75", Ranged:"#e8c574", Caster:"#a887ff", Limitado:"#62d9e8" };
const roleAdvice = {
  Tanque: "Ideal si disfrutas liderar el recorrido, proteger al grupo y sobrevivir golpes enormes. Mantén activa tu stance de tanque en contenido grupal.",
  Healer: "Curar es importante, pero también puedes atacar cuando el grupo está estable. Aprende a usar primero tus curas instantáneas y recursos.",
  Melee: "Lucha cerca del jefe, respeta mecánicas y aprovecha los ataques posicionales cuando tu job los tenga.",
  Ranged: "Puedes atacar mientras te mueves. Usa esa libertad para resolver mecánicas sin dejar de ayudar al grupo.",
  Caster: "Equilibra potencia y movimiento. Aprende cuándo puedes terminar un casteo y cuándo debes recolocarte.",
  Limitado: "Los limited jobs usan reglas propias, tienen progresión especial y restricciones para entrar en contenido mediante el Duty Finder estándar."
};
const professions = ["Carpenter","Blacksmith","Armorer","Goldsmith","Leatherworker","Weaver","Alchemist","Culinarian","Miner","Botanist","Fisher"];

const lore = [
  {title:"Aether",symbol:"✦",text:"La energía que compone vida, materia y magia. Viajar, curar, lanzar hechizos y hasta el clima dependen de su flujo."},
  {title:"The Echo",symbol:"◉",text:"Una capacidad rara que permite experimentar recuerdos ajenos y resistir el tempering de los primals."},
  {title:"Primals",symbol:"△",text:"Entidades invocadas mediante fe, deseo y enormes cantidades de aether. Su presencia puede drenar la tierra y dominar voluntades."},
  {title:"The Source y sus reflejos",symbol:"◈",text:"El mundo principal es the Source. Existen otras reflexiones separadas de él, como the First y the Thirteenth.",spoiler:"La fragmentación ocurrió cuando Hydaelyn dividió el mundo original y a Zodiark en catorce partes."},
  {title:"Ascians",symbol:"☽",text:"Figuras inmortales que intervienen detrás de imperios, guerras y calamidades.",spoiler:"Son supervivientes o fragmentos de los Ancients que buscan restaurar su mundo mediante Rejoinings."},
  {title:"Calamities",symbol:"☄",text:"Desastres de escala continental que marcan las eras de Eorzea. La Séptima es la caída de Dalamud al comienzo de ARR."},
  {title:"Garlemald",symbol:"♜",text:"Imperio expansionista que compensa su dificultad para usar magia con ingeniería magitek y conquista militar."},
  {title:"Dynamis",symbol:"∞",text:"Una energía sensible a emoción y voluntad, mucho más tenue que el aether.",spoiler:"Es la clave de los Final Days y del conflicto final de Endwalker."}
];

const races = [
  ["Hyur","Midlander · Highlander","Humanos diversos y extendidos por todo el mundo."],
  ["Elezen","Wildwood · Duskwight","Pueblo alto y longevo con fuertes tradiciones."],
  ["Lalafell","Plainsfolk · Dunesfolk","Pequeños de estatura; comerciantes, granjeros y aventureros."],
  ["Miqo'te","Seekers · Keepers","Pueblo felino dividido por costumbres solares y lunares."],
  ["Roegadyn","Sea Wolves · Hellsguard","Físicamente imponentes; marinos y guardianes de montañas."],
  ["Au Ra","Raen · Xaela","Escamas, cuernos y culturas muy diferentes entre clanes."],
  ["Hrothgar","Helions · The Lost","Pueblo leonino originario de Ilsabard y Bozja."],
  ["Viera","Rava · Veena","Pueblo de orejas largas, gran longevidad y vínculos forestales."]
].map(([name,clans,text])=>({name,clans,text}));

const contents = [
  ["MSQ y dungeons","Historia","◆","La columna vertebral. Abre mapas, ciudades, vuelos, sistemas y casi todo el contenido posterior.","Desde nivel 1"],
  ["Trials","Combate","△","Batallas concentradas contra jefes. Normal para historia; Extreme para reto, monturas y armas.","8 jugadores normalmente"],
  ["Raids normales","Combate","◇","Series de 12 encuentros por expansión, divididas en tres o cuatro bloques narrativos.","8 jugadores"],
  ["Alliance raids","Combate","⬡","Grandes recorridos con tres alianzas. Mezclan espectáculo, historia y equipo de catch-up.","24 jugadores"],
  ["Savage y Ultimate","Combate","♢","Endgame coordinado. Savage exige ejecución precisa; Ultimate es el reto más alto del juego.","Contenido avanzado"],
  ["Deep Dungeons","Exploración","▥","Palace of the Dead, Heaven-on-High y Eureka Orthos: progreso interno, pisos y runs largas.","Solo o grupo pequeño"],
  ["Relic weapons","Colección","⚒","Cadenas extensas para armas icónicas: Zodiac, Anima, Eureka, Resistance, Manderville y más.","Proyecto a largo plazo"],
  ["Eureka y Bozja","Exploración","⌁","Zonas masivas con progresión propia, FATEs especiales, raids y materiales de relic.","Nivel 70 / 80"],
  ["Crafting y gathering","Profesiones","⚒","Economía, recetas, entregas, pesca, restauraciones y contenido lifestyle separado del combate.","11 profesiones"],
  ["Glamour y housing","Social","✦","El verdadero endgame para muchos: vestuario, tintes, retratos, apartamentos y decoración.","Creatividad"],
  ["Gold Saucer","Social","★","Triple Triad, chocobo racing, Fashion Report, GATEs y recompensas compradas con MGP.","Minijuegos"],
  ["PvP","Combate","⚑","Crystalline Conflict, Frontline y Rival Wings con acciones y balance separados del PvE.","Colas competitivas"],
  ["Ocean Fishing","Profesiones","≈","Viajes programados desde Limsa con cadenas, spectral currents, puntuación y coleccionables.","Fisher"],
  ["Island Sanctuary","Lifestyle","♧","Isla personal con recolección, talleres, animales, cultivos y cosméticos.","Después de Endwalker"],
  ["Variant / Criterion","Combate","⌘","Dungeons con rutas variables; Criterion transforma la idea en un reto de cuatro jugadores.","Nivel 90+"],
  ["Cosmic Exploration","Lifestyle","☄","Contenido cooperativo de crafting y gathering que desarrolla proyectos más allá de Etheirys.","Dawntrail"],
  ["Maps y treasure dungeons","Exploración","⌖","Mapas descifrados que pueden abrir portales a instancias de tesoro, azar y gil.","Grupos pequeños"],
  ["Hunts y FATEs","Exploración","◎","Objetivos de mundo abierto, trenes de hunts, monedas regionales y eventos compartidos.","Mundo abierto"]
].map(([title,category,symbol,text,meta])=>({title,category,symbol,text,meta}));

const glossary = [
  ["MSQ","Main Scenario Quest: la historia principal marcada con el meteorito."],
  ["Blue quest","Misión azul con +: desbloquea una función, duty, job o sistema."],
  ["Duty","Nombre general para una instancia: dungeon, trial, raid, guildhest, etc."],
  ["Roulette","Cola aleatoria diaria que entrega experiencia, gil o tomestones extra."],
  ["ilvl","Item level: poder del equipo. No es lo mismo que el nivel del personaje."],
  ["Tomestones","Monedas de combate para comprar equipo. Poetics cubre endgames antiguos."],
  ["Poetics","Allagan Tomestones of Poetics: moneda para equipo y materiales de expansiones anteriores."],
  ["Glamour","Sistema que cambia la apariencia sin alterar estadísticas."],
  ["Materia","Bonificaciones secundarias que se insertan en ranuras del equipo."],
  ["GC","Grand Company: organización estatal que ofrece rango, seals y chocobo."],
  ["FC","Free Company: el equivalente a un gremio de jugadores."],
  ["FATE","Evento dinámico de mundo abierto que aparece temporalmente en el mapa."],
  ["LB","Limit Break: habilidad compartida del grupo cuya forma depende del rol."],
  ["GCD","Acción ligada al recast global; forma el ritmo principal de tu rotación."],
  ["oGCD","Habilidad fuera del recast global que se intercala entre GCDs."],
  ["AoE","Area of Effect: afecta una zona o varios objetivos."],
  ["DoT","Damage over Time: daño que continúa durante varios segundos."],
  ["Enmity","Amenaza que decide a quién ataca el enemigo; los tanques la controlan."],
  ["Tankbuster","Ataque de jefe pensado para golpear muy fuerte al tanque."],
  ["Stack","Marcador que pide reunirse para repartir daño."],
  ["Spread","Marcador que pide separarse para no solapar explosiones."],
  ["Snapshot","Momento real en que el servidor decide si una mecánica te golpeó."],
  ["Synced","Duty ajustada al nivel e ilvl previstos originalmente."],
  ["Unsynced","Entrada sin sincronización para superar contenido viejo con poder actual."],
  ["EX","Extreme: versión más difícil de un trial, con armas y monturas."],
  ["Savage","Dificultad alta de raids de ocho jugadores."],
  ["Ultimate","Encuentros largos y extremadamente exigentes con recompensas de prestigio."],
  ["BiS","Best in Slot: combinación óptima de equipo para un job."],
  ["Prog","Práctica de una pelea que el grupo todavía está aprendiendo."],
  ["Clear","Completar una duty; a veces indica que el grupo busca su primera victoria."]
].map(([term,definition])=>({term,definition}));

const loreDetails = {
  "Aether": {detail:"Todo ser vivo y casi toda materia contiene aether. Puede adoptar aspectos elementales, circular por el cuerpo y concentrarse en cristales o corrientes.",why:"Explica la magia, los aetherytes, muchas catástrofes y por qué abusar de ciertas invocaciones daña el entorno.",related:["Cristales", "Aetherytes", "Primals"]},
  "The Echo": {detail:"Es una facultad que se manifiesta de formas distintas. En el protagonista suele permitir presenciar recuerdos sin haber estado allí y comprender intenciones más allá del idioma.",why:"Justifica varias escenas jugables y ayuda a explicar por qué el Warrior of Light puede enfrentarse a ciertos peligros.",related:["Warrior of Light", "Scions", "Blessing of Light"]},
  "Primals": {detail:"No son simplemente dioses que aparecen por sí mismos: las invocaciones usan aether, deseo y una imagen mental compartida para darles forma.",why:"Son una amenaza política y ecológica, no solo jefes de trial. El juego revisa esta idea desde varios ángulos.",related:["Tempering", "Beast tribes", "Aether"]},
  "The Source y sus reflejos": {detail:"La aventura comienza en the Source. Otros mundos paralelos conservan versiones distintas de lugares, pueblos y almas relacionadas.",why:"Permite entender por qué Shadowbringers cambia de mundo sin abandonar la historia central.",related:["The First", "The Thirteenth", "Rejoinings"]},
  "Ascians": {detail:"Actúan durante gran parte del juego como manipuladores que empujan conflictos y calamidades. Su objetivo completo se revela poco a poco.",why:"Conectan amenazas que al principio parecen separadas y forman el eje del gran arco de ARR a Endwalker.",related:["Rejoinings", "Ancients", "Garlemald"]},
  "Calamities": {detail:"Cada Umbral Calamity cierra una era y altera el mundo. La Séptima, causada por la caída de Dalamud, separa la versión 1.0 de A Realm Reborn.",why:"Las ruinas, fronteras y tensiones de Eorzea existen porque el continente todavía vive con sus consecuencias.",related:["Dalamud", "Bahamut", "Astral eras"]},
  "Garlemald": {detail:"El imperio combina expansión militar, propaganda y tecnología magitek. Su población incluye pueblos incorporados por conquista y una élite con una historia propia.",why:"Es la principal potencia imperial durante las primeras expansiones y afecta directamente a Ala Mhigo, Doma y muchos aliados.",related:["Magitek", "Legions", "Ala Mhigo"]},
  "Dynamis": {detail:"Es una energía más difícil de detectar que el aether y responde con fuerza a la emoción, la voluntad y la experiencia colectiva.",why:"Endwalker la usa para explicar fenómenos que la lógica habitual del aether no podía resolver por sí sola.",related:["Aether", "Final Days", "Elpis"]}
};
lore.forEach(item => Object.assign(item, loreDetails[item.title]));

const raceDetails = {
  "Hyur": {home:"Presentes en casi todas las regiones",detail:"Midlanders y Highlanders reflejan migraciones y culturas distintas; no forman una sola nación uniforme."},
  "Elezen": {home:"Gridania, Ishgard y comunidades duskwight",detail:"Wildwood y Duskwight comparten origen, pero su relación con los bosques, ciudades y comunidades subterráneas es diferente."},
  "Lalafell": {home:"Ul'dah, Thanalan y comunidades marítimas",detail:"Plainsfolk y Dunesfolk tienen historias propias. Su tamaño no limita ninguna clase, job ni animación de combate."},
  "Miqo'te": {home:"Comunidades dispersas por Eorzea",detail:"Seekers of the Sun y Keepers of the Moon se distinguen por tradiciones, nombres y vínculos solares o lunares."},
  "Roegadyn": {home:"La Noscea, montañas y antiguas migraciones",detail:"Sea Wolves y Hellsguard proceden de tradiciones distintas; ambos aparecen en profesiones y sociedades muy variadas."},
  "Au Ra": {home:"Othard y diásporas posteriores",detail:"Raen y Xaela no son una cultura única. Especialmente los Xaela se dividen en numerosas tribus con costumbres diferentes."},
  "Hrothgar": {home:"Ilsabard, Bozja y diásporas",detail:"Helions y the Lost conservan historias marcadas por reinas, clanes y desplazamientos causados por la guerra."},
  "Viera": {home:"Bosques de Othard y las montañas de Skatay",detail:"Rava y Veena poseen tradiciones ligadas a territorios distintos y una longevidad mucho mayor que la de varios pueblos de Eorzea."}
};
races.forEach(race => Object.assign(race, raceDetails[race.name], {gameplay:"La raza es una elección estética y narrativa: no bloquea jobs ni contenido."}));

const contentDetails = {
  "MSQ y dungeons": {how:"Sigue el icono del meteorito. La propia MSQ abre los dungeons necesarios y Duty Support permite hacer muchos de ellos con NPCs.",forWho:"Para todo el mundo; es el camino que desbloquea el resto del juego.",first:"Continúa la Main Scenario Quest más reciente de tu diario."},
  "Trials": {how:"La historia y las misiones azules abren trials. Normal suele entrar por Duty Finder; Extreme suele organizarse mediante Party Finder.",forWho:"Normal para historia y espectáculo; Extreme para aprender mecánicas coordinadas y buscar recompensas.",first:"Completa el trial normal de la historia antes de buscar su versión Extreme."},
  "Raids normales": {how:"Se desbloquean con una cadena azul en el endgame de cada expansión y se dividen en encuentros cortos de ocho jugadores.",forWho:"Para quien quiere historia secundaria y combates más elaborados sin el compromiso de Savage.",first:"Busca la cadena de raid normal al alcanzar 50, 60, 70, 80, 90 o 100."},
  "Alliance raids": {how:"Sus cadenas azules abren recorridos de 24 jugadores formados por tres alianzas de ocho.",forWho:"Para historia, espectáculo, glamour y equipo de puesta al día.",first:"Empieza por Crystal Tower al nivel 50; además forma parte de la progresión obligatoria de la MSQ."},
  "Savage y Ultimate": {how:"Savage se abre tras la raid normal correspondiente. Ultimate exige requisitos previos de endgame y grupos muy coordinados.",forWho:"Para jugadores que disfrutan practicar durante horas, revisar errores y ejecutar una estrategia precisa.",first:"Domina primero normal y Extreme; después busca un grupo de aprendizaje claramente etiquetado como prog."},
  "Deep Dungeons": {how:"Cada Deep Dungeon tiene una misión azul de acceso y un nivel/equipo interno que progresa dentro de la instancia.",forWho:"Para jugar solo o en grupo pequeño, subir jobs y perseguir logros de runs profundas.",first:"Palace of the Dead es la primera opción y se abre durante ARR."},
  "Relic weapons": {how:"Cada expansión propone una cadena distinta de misiones, monedas y farmeo para construir un arma visualmente única.",forWho:"Para coleccionistas y quien quiera un proyecto largo; las reliquias antiguas ya no son necesarias para progresar.",first:"Elige primero el aspecto que quieres y empieza solo esa cadena para no dispersarte."},
  "Eureka y Bozja": {how:"Son zonas instanciadas con reglas y progresión propias. Se abren mediante cadenas azules después de sus expansiones.",forWho:"Para quien disfruta FATEs masivos, farmeo social, raids especiales y armas relic.",first:"Eureka corresponde al endgame de Stormblood; Bozja al de Shadowbringers."},
  "Crafting y gathering": {how:"Desbloquea los gremios de artesanos y recolectores. Cada profesión tiene nivel, equipo, acciones y misiones propias.",forWho:"Para economía, colecciones, recetas, pesca y progreso no centrado en combate.",first:"Prueba una profesión en una ciudad inicial y usa el gathering/crafting log como ruta."},
  "Glamour y housing": {how:"Glamour proyecta una apariencia sobre tu equipo. Housing permite decorar habitaciones, apartamentos o parcelas según disponibilidad.",forWho:"Para creatividad, capturas, colecciones y vida social.",first:"Desbloquea glamour con la misión azul de nivel 15 en Vesper Bay."},
  "Gold Saucer": {how:"Una misión de nivel 15 en Ul'dah abre el casino. Sus actividades entregan MGP, una moneda exclusiva del lugar.",forWho:"Para minijuegos, cartas, monturas, peinados y descansos entre combates.",first:"Acepta “It Could Happen to You” cuando tengas acceso al airship."},
  "PvP": {how:"Tras unirte a una Grand Company, una misión azul abre Wolves' Den y los modos PvP. Dentro usas acciones PvP separadas.",forWho:"Para partidas rápidas, grandes batallas y recompensas de series; el balance no replica el PvE.",first:"Configura primero tu hotbar PvP en Wolves' Den Pier."},
  "Ocean Fishing": {how:"Los barcos salen en horarios programados desde Limsa. Capturas, bonus de grupo y spectral currents elevan la puntuación.",forWho:"Para subir Fisher, buscar minions/monturas y disfrutar una actividad social relajada.",first:"Desbloquea Fisher y la misión de Ocean Fishing en Limsa Lominsa."},
  "Island Sanctuary": {how:"Después de Endwalker abres una isla con rango propio, talleres, cultivos, animales y moneda independiente.",forWho:"Para progreso tranquilo y cosméticos; no sustituye crafting o gathering normales.",first:"Completa la MSQ de Endwalker y busca la misión azul de acceso."},
  "Variant / Criterion": {how:"Variant permite escoger rutas y registrar finales; Criterion reutiliza el escenario con combates mucho más exigentes para cuatro.",forWho:"Variant para explorar y coleccionar; Criterion para grupos pequeños que quieren dificultad alta.",first:"Empieza por la Variant correspondiente y descubre varias rutas antes de saltar a Criterion."},
  "Cosmic Exploration": {how:"Artesanos y recolectores colaboran en objetivos compartidos y proyectos de desarrollo durante Dawntrail.",forWho:"Para quien quiere progreso comunitario centrado por completo en Hand y Land.",first:"Avanza la historia y revisa la misión azul del contenido cuando cumplas sus requisitos."},
  "Maps y treasure dungeons": {how:"Descifra un mapa, localiza el punto y derrota a los enemigos. Algunos cofres abren portales a dungeons de azar y tesoro.",forWho:"Para grupos pequeños que buscan gil, materiales, minions y momentos impredecibles.",first:"Desbloquea la acción de mapas y prueba uno apropiado para tu nivel."},
  "Hunts y FATEs": {how:"Los FATEs aparecen en el mapa; las hunts usan objetivos marcados y monedas regionales. La comunidad organiza trenes para derrotarlos en cadena.",forWho:"Para mundo abierto, experiencia, monedas, logros y actividad comunitaria.",first:"Empieza con FATEs cercanos; para hunts, desbloquea el tablón de tu Grand Company y los rangos de cada expansión."}
};
contents.forEach(item => Object.assign(item, contentDetails[item.title], {source:"https://na.finalfantasyxiv.com/lodestone/playguide/"}));

const glossaryHelp = {
  "MSQ":["“Voy por la MSQ de nivel 54” significa que su historia está en ese tramo, aunque su job sea de nivel mayor.",["Blue quest","Duty"]],
  "Blue quest":["Si ves el icono azul con +, suele merecer la pena leer qué sistema desbloquea.",["MSQ","Duty"]],
  "Duty":["Sastasha, Ifrit y Crystal Tower son duties de tipos distintos.",["Roulette","Synced"]],
  "Roulette":["“Haz la leveling roulette” significa usar la bonificación diaria de una cola aleatoria.",["Duty","Tomestones"]],
  "ilvl":["Dos personajes nivel 90 pueden tener potencia muy distinta si uno lleva ilvl 560 y otro 650.",["BiS","Synced"]],
  "Tomestones":["En endgame entregas tomestones a vendedores para comprar equipo; cada moneda tiene un uso concreto.",["Poetics","ilvl"]],
  "Poetics":["Al llegar a 50 puedes cambiar Poetics por equipo Augmented Ironworks en los vendedores correspondientes.",["Tomestones","ilvl"]],
  "Glamour":["Puedes conservar las estadísticas de una armadura y mostrar el aspecto de otra.",["Materia","ilvl"]],
  "Materia":["Meld significa insertar materia; overmeld es intentar colocarla más allá de las ranuras garantizadas.",["BiS","ilvl"]],
  "GC":["Tu GC no es un clan de jugadores: es una organización del juego vinculada a una ciudad-estado.",["FC","Blue quest"]],
  "FC":["“Busco FC” significa que busca una comunidad o gremio de jugadores.",["GC","Prog"]],
  "FATE":["El círculo azul del mapa marca la zona activa; participa y permanece hasta que termine para recibir crédito.",["AoE","Hunts"]],
  "LB":["En una dungeon, un melee suele usar LB sobre el jefe; en grupos grandes puede reservarse según la estrategia.",["Duty","Tankbuster"]],
  "GCD":["Si una acción activa el recast compartido de unos segundos, normalmente forma parte del GCD.",["oGCD","Snapshot"]],
  "oGCD":["Mitigaciones y buffs suelen tejerse entre dos ataques GCD sin retrasar el siguiente.",["GCD","Tankbuster"]],
  "AoE":["Usa tu combo AoE cuando hay varios enemigos juntos; el punto exacto depende de tu job.",["DoT","Spread"]],
  "DoT":["Un DoT sigue causando daño después del golpe inicial y normalmente debe renovarse antes de expirar.",["GCD","Snapshot"]],
  "Enmity":["La lista de enemigos muestra quién tiene aggro; el tanque usa su stance para mantenerlo.",["Tankbuster","AoE"]],
  "Tankbuster":["Un marcador rojo sobre el tanque suele anunciar daño fuerte: responde con mitigación antes del impacto.",["Enmity","oGCD"]],
  "Stack":["Las flechas amarillas que apuntan hacia dentro suelen pedir que el grupo se junte.",["Spread","AoE"]],
  "Spread":["Si cada jugador recibe un círculo, sepárate para que las áreas no se superpongan.",["Stack","AoE"]],
  "Snapshot":["Salir del círculo después de que el servidor haya registrado el golpe puede ser demasiado tarde aunque la animación aún no ocurra.",["GCD","AoE"]],
  "Synced":["Entrar synced a una raid antigua reduce nivel e ilvl para conservar parte de su dificultad.",["Unsynced","ilvl"]],
  "Unsynced":["Una party unsynced entra a contenido antiguo sin el ajuste normal para farmear más rápido.",["Synced","Clear"]],
  "EX":["“EX farm” busca repetir un Extreme ya aprendido; “EX prog” busca practicarlo.",["Prog","Clear"]],
  "Savage":["Las parties suelen indicar el punto de práctica: fresh, phase 2, enrage o clear.",["Prog","BiS"]],
  "Ultimate":["No es simplemente una versión con más vida: encadena fases complejas y exige consistencia prolongada.",["Savage","Prog"]],
  "BiS":["Un set BiS depende del job y del parche; no es una lista universal para todos.",["ilvl","Materia"]],
  "Prog":["“P3 prog” indica que el objetivo es practicar la fase 3, no prometer una victoria inmediata.",["Clear","EX"]],
  "Clear":["“Clear party” pretende completar la pelea; si aún aprendes las primeras fases, busca una party de prog.",["Prog","Duty"]]
};
glossary.forEach(item => {
  const [example, related] = glossaryHelp[item.term];
  Object.assign(item, {example, related});
});

const views = [...document.querySelectorAll(".view")];
const navItems = [...document.querySelectorAll(".nav-item")];
const spoilerToggle = document.querySelector("#spoilerToggle");
const searchInput = document.querySelector("#globalSearch");
const searchResults = document.querySelector("#searchResults");
const jobDialog = document.querySelector("#jobDialog");
const jobDialogContent = document.querySelector("#jobDialogContent");
const detailDialog = document.querySelector("#detailDialog");
const detailDialogContent = document.querySelector("#detailDialogContent");
let activeRole = "Todos";
let activeContent = "Todo";

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
}

function termSlug(value) {
  return normalize(value).replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}

function openDialog(dialog) {
  if (dialog.open) dialog.close();
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open","");
}

function showView(id, updateHash = true) {
  const safeId = views.some(view => view.id === id) ? id : "inicio";
  views.forEach(view => view.classList.toggle("active", view.id === safeId));
  navItems.forEach(item => item.classList.toggle("active", item.dataset.view === safeId));
  if (updateHash) {
    try {
      history.replaceState(null, "", `#${safeId}`);
    } catch {
      location.hash = safeId;
    }
  }
  window.scrollTo({top:0, behavior:"auto"});
  searchResults.hidden = true;
}

function renderExpansionStrip() {
  document.querySelector("#homeExpansionStrip").innerHTML = expansions.map(exp => `
    <button type="button" class="expansion-chip" style="--accent:${exp.color}" data-expansion="${exp.id}" aria-label="Abrir ficha de ${exp.name}">
      <span>${exp.levels}</span><strong>${exp.name}</strong><small>${exp.year}</small>
    </button>`).join("");
}

function renderHistory() {
  document.querySelector("#historyTimeline").innerHTML = expansions.map(exp => `
    <article class="history-entry" id="story-${exp.id}" style="--accent:${exp.color}">
      <div class="history-marker"><strong>${exp.levels}</strong></div>
      <button type="button" class="history-card" data-story="${exp.id}" aria-label="Abrir ficha de historia de ${exp.name}">
        <span class="history-top"><span><span class="eyebrow">PATCH ${exp.patch}</span><span class="history-title">${exp.name}</span></span><span class="history-meta">${exp.year}<br>${exp.levels}</span></span>
        <span class="history-hook">${exp.hook}</span>
        <span class="story-tags">${exp.tags.map(tag=>`<span>${tag}</span>`).join("")}</span>
        <span class="spoiler-box spoiler-only"><strong>Con spoilers:</strong> ${exp.spoiler}</span>
        <span class="card-open">Abrir ficha completa →</span>
      </button>
    </article>`).join("");
}

function bandForLevel(level) {
  return levelBands.find(band => level >= band.min && level <= band.max) || levelBands[0];
}

function renderLevel(level) {
  const band = bandForLevel(level);
  document.querySelector("#levelReadout").textContent = level;
  document.querySelector("#levelResult").innerHTML = `
    <div class="level-result-main"><span class="level-expansion">${band.expansion}</span><h2>${band.title}</h2><p>${band.summary}</p><small style="color:var(--muted)">Tramo ${band.range}</small></div>
    <div class="priority-list">${band.priorities.map((item,index)=>`<div class="priority-item"><span>${index+1}</span><div><strong>${item[0]}</strong><small>${item[1]}</small></div></div>`).join("")}</div>`;
}

function renderLevelBands() {
  document.querySelector("#levelBands").innerHTML = levelBands.map(band => `
    <button type="button" class="band-card" data-level="${band.min}"><span class="band-level">${band.range}</span><span><strong>${band.title}</strong><p>${band.summary}</p></span></button>`).join("");
}

function renderJobFilters() {
  const roles = ["Todos","Tanque","Healer","Melee","Ranged","Caster","Limitado"];
  document.querySelector("#jobFilters").innerHTML = roles.map(role=>`<button type="button" class="filter-btn ${role===activeRole?"active":""}" data-role="${role}">${role}</button>`).join("");
}

function renderJobs() {
  const filtered = activeRole === "Todos" ? jobs : jobs.filter(job=>job.role===activeRole);
  document.querySelector("#jobsGrid").innerHTML = filtered.map(job=>`<button type="button" class="job-card" style="--role:${roleColors[job.role]}" data-job="${job.abbr}" aria-label="Abrir ficha de ${job.name}"><span class="job-card-top"><span class="job-abbr">${job.abbr}</span><span><span class="role-label">${job.role}</span><strong class="job-name">${job.name}</strong></span></span><span class="job-feel">${job.feel}</span><span class="job-meta"><span>El job empieza en <strong>${job.start}</strong></span><span>${job.route}</span></span><span class="job-open">Abrir ficha completa →</span></button>`).join("");
  document.querySelector("#professionList").innerHTML = professions.map(item=>`<span>${item}</span>`).join("");
}

function openJob(abbr) {
  const job = jobs.find(item=>item.abbr===abbr);
  if (!job) return;
  const color = roleColors[job.role];
  jobDialogContent.innerHTML = `
    <div class="job-dialog-head" style="--job-color:${color}">
      <div class="job-dialog-abbr">${job.abbr}</div>
      <div><span class="job-dialog-role">${job.role}</span><h2 id="jobDialogTitle">${job.name}</h2></div>
    </div>
    <p class="job-dialog-copy">${job.feel}</p>
    <div class="job-dialog-grid" style="--job-color:${color}">
      <div><span>Nivel al obtener el job</span><strong>${job.start}</strong></div>
      <div><span>Ruta resumida</span><strong>${job.route}</strong></div>
      <div><span>Requisito</span><strong>${job.requirement}</strong></div>
      <div><span>Dónde empieza</span><strong>${job.place}</strong></div>
      <div><span>Arma</span><strong>${job.weapon}</strong></div>
      <div><span>Rol</span><strong>${job.role}</strong></div>
    </div>
    <div class="job-route"><h3>Ruta para desbloquearlo</h3><ol class="route-list">${job.steps.map(step=>`<li>${step}</li>`).join("")}</ol></div>
    <div class="job-explanation"><strong>¿QUÉ SIGNIFICA ESA RUTA?</strong><p>${job.note}</p></div>
    <div class="job-advice" style="--job-color:${color}"><span>CONSEJO DE JUEGO</span><p>${roleAdvice[job.role]}</p></div>
    <div class="source-row"><a class="primary-btn" href="${job.source}" target="_blank" rel="noreferrer">Ver Job Guide oficial ↗</a><span class="source-note">Fuente primaria de Square Enix · la ficha abre en otra pestaña</span></div>`;
  openDialog(jobDialog);
}

function openStory(id) {
  const item = id === "legacy" ? legacyStory : expansions.find(expansion=>expansion.id===id);
  if (!item) return;
  detailDialogContent.innerHTML = `
    <span class="detail-kicker">HISTORIA · ${item.patch}</span>
    <h2 id="detailDialogTitle">${item.name}</h2>
    <p class="detail-lead">${item.hook}</p>
    <div class="detail-grid"><div><span>Periodo</span><strong>${item.year}</strong></div><div><span>Niveles</span><strong>${item.levels}</strong></div></div>
    <section class="detail-section"><h3>De qué va realmente</h3><p>${item.theme}</p></section>
    <section class="detail-section"><h3>Por qué importa</h3><ul class="detail-list">${item.highlights.map(point=>`<li>${point}</li>`).join("")}</ul></section>
    <div class="story-tags" style="--accent:${item.color}">${item.tags.map(tag=>`<span>${tag}</span>`).join("")}</div>
    <div class="spoiler-box spoiler-only"><strong>Resumen con spoilers:</strong> ${item.spoiler}</div>
    <div class="source-row"><a class="primary-btn" href="${item.source}" target="_blank" rel="noreferrer">Ver página oficial ↗</a><span class="source-note">Fuente primaria de Square Enix</span></div>`;
  openDialog(detailDialog);
}

function openLore(index) {
  const item = lore[index];
  if (!item) return;
  detailDialogContent.innerHTML = `
    <span class="detail-kicker">MUNDO Y LORE · ${item.symbol}</span>
    <h2 id="detailDialogTitle">${item.title}</h2>
    <p class="detail-lead">${item.text}</p>
    <section class="detail-section"><h3>Explicación</h3><p>${item.detail}</p></section>
    <section class="detail-section"><h3>Por qué importa</h3><p>${item.why}</p></section>
    <section class="detail-section"><h3>Conceptos relacionados</h3><div class="story-tags" style="--accent:var(--cyan)">${item.related.map(tag=>`<span>${tag}</span>`).join("")}</div></section>
    ${item.spoiler?`<div class="spoiler-box spoiler-only"><strong>Con spoilers:</strong> ${item.spoiler}</div>`:""}
    <div class="source-row"><a class="primary-btn" href="https://na.finalfantasyxiv.com/game_manual/" target="_blank" rel="noreferrer">Consultar manual oficial ↗</a></div>`;
  openDialog(detailDialog);
}

function openRace(index) {
  const race = races[index];
  if (!race) return;
  detailDialogContent.innerHTML = `
    <span class="detail-kicker">PUEBLO JUGABLE</span>
    <h2 id="detailDialogTitle">${race.name}</h2>
    <p class="detail-lead">${race.text}</p>
    <div class="detail-grid"><div><span>Clanes</span><strong>${race.clans}</strong></div><div><span>Presencia</span><strong>${race.home}</strong></div></div>
    <section class="detail-section"><h3>Contexto</h3><p>${race.detail}</p></section>
    <section class="detail-section"><h3>En el juego</h3><p>${race.gameplay}</p></section>
    <div class="source-row"><a class="primary-btn" href="https://na.finalfantasyxiv.com/game_manual/" target="_blank" rel="noreferrer">Ver manual oficial ↗</a></div>`;
  openDialog(detailDialog);
}

function openContent(index) {
  const item = contents[index];
  if (!item) return;
  detailDialogContent.innerHTML = `
    <span class="detail-kicker">CONTENIDO · ${item.category}</span>
    <h2 id="detailDialogTitle">${item.symbol} ${item.title}</h2>
    <p class="detail-lead">${item.text}</p>
    <div class="detail-grid"><div><span>Tipo</span><strong>${item.category}</strong></div><div><span>Referencia</span><strong>${item.meta}</strong></div></div>
    <section class="detail-section"><h3>Cómo funciona</h3><p>${item.how}</p></section>
    <section class="detail-section"><h3>Para quién es</h3><p>${item.forWho}</p></section>
    <section class="detail-section"><h3>Primer paso recomendado</h3><p>${item.first}</p></section>
    <div class="source-row"><a class="primary-btn" href="${item.source}" target="_blank" rel="noreferrer">Abrir Play Guide oficial ↗</a></div>`;
  openDialog(detailDialog);
}

function openGlossary(slug) {
  const item = glossary.find(entry=>termSlug(entry.term)===slug);
  if (!item) return;
  const related = item.related.map(term=>{
    const found = glossary.find(entry=>normalize(entry.term)===normalize(term));
    return found ? `<button type="button" class="filter-btn" data-term="${termSlug(found.term)}">${found.term}</button>` : `<span class="related-tag">${term}</span>`;
  }).join("");
  detailDialogContent.innerHTML = `
    <span class="detail-kicker">GLOSARIO</span>
    <h2 id="detailDialogTitle">${item.term}</h2>
    <p class="detail-lead">${item.definition}</p>
    <section class="detail-section"><h3>Ejemplo real</h3><p>${item.example}</p></section>
    <section class="detail-section"><h3>Relacionado</h3><div class="filter-row" style="margin:8px 0 0">${related}</div></section>
    <div class="source-row"><a class="primary-btn" href="https://na.finalfantasyxiv.com/game_manual/" target="_blank" rel="noreferrer">Abrir manual oficial ↗</a></div>`;
  openDialog(detailDialog);
}

function openMethodology() {
  detailDialogContent.innerHTML = `
    <span class="detail-kicker">GUÍA SIN HUMO</span>
    <h2 id="detailDialogTitle">Qué significa, cuándo aparece y de dónde sale</h2>
    <p class="detail-lead">La web traduce la información oficial a decisiones prácticas. Una ficha distingue el nivel al que nace un job, el requisito para abrirlo y los pasos que tienes que seguir.</p>
    <section class="detail-section"><h3>Ejemplo: Warrior</h3><p>“Marauder 1 → Warrior 30” no significa que Warrior empiece al nivel 1. Significa que subes la clase Marauder desde 1; al 30 completas su misión, recibes el job stone de Warrior y continúas con el mismo personaje.</p></section>
    <section class="detail-section"><h3>Criterio editorial</h3><ul class="detail-list"><li>Datos de jobs contrastados con el Job Guide oficial.</li><li>Historia y características contrastadas con las páginas oficiales de las expansiones.</li><li>Los consejos de prioridad son síntesis prácticas, no texto copiado del juego.</li><li>Los spoilers permanecen ocultos hasta activar el interruptor.</li></ul></section>
    <div class="source-row"><a class="primary-btn" href="https://na.finalfantasyxiv.com/jobguide/battle/" target="_blank" rel="noreferrer">Job Guide oficial ↗</a><a class="ghost-btn" href="https://na.finalfantasyxiv.com/game_manual/" target="_blank" rel="noreferrer">Manual oficial ↗</a></div>
    <p class="source-note">Eorzea Codex es una guía fan independiente y no está afiliada con Square Enix.</p>`;
  openDialog(detailDialog);
}

function renderWorld() {
  document.querySelector("#loreGrid").innerHTML = lore.map((item,index)=>`<button type="button" class="lore-card" data-lore="${index}" aria-label="Abrir explicación de ${item.title}"><span class="lore-symbol">${item.symbol}</span><strong class="card-title">${item.title}</strong><span class="lore-copy">${item.text}</span>${item.spoiler?`<span class="spoiler-box spoiler-only">${item.spoiler}</span>`:""}<span class="card-open">Abrir explicación →</span></button>`).join("");
  document.querySelector("#raceGrid").innerHTML = races.map((race,index)=>`<button type="button" class="race-card" data-race="${index}" aria-label="Abrir ficha de ${race.name}"><strong>${race.name}</strong><span>${race.clans}</span><span class="race-copy">${race.text}</span><span class="card-open">Abrir ficha →</span></button>`).join("");
}

function renderContentFilters() {
  const categories = ["Todo",...new Set(contents.map(item=>item.category))];
  document.querySelector("#contentFilters").innerHTML = categories.map(cat=>`<button type="button" class="filter-btn ${cat===activeContent?"active":""}" data-content-filter="${cat}">${cat}</button>`).join("");
}

function renderContent() {
  const filtered = activeContent === "Todo" ? contents : contents.filter(item=>item.category===activeContent);
  document.querySelector("#contentGrid").innerHTML = filtered.length ? filtered.map(item=>`<button type="button" class="content-card" data-content="${contents.indexOf(item)}" aria-label="Abrir ficha de ${item.title}"><span class="content-symbol">${item.symbol}</span><strong class="card-title">${item.title}</strong><span class="content-copy">${item.text}</span><span class="content-meta">${item.category} · ${item.meta}</span><span class="card-open">Abrir ficha →</span></button>`).join("") : `<div class="empty-filter">No hay contenido en este filtro.</div>`;
}

function renderGlossary() {
  document.querySelector("#glossaryGrid").innerHTML = glossary.map(item=>`<button type="button" class="glossary-item" id="term-${termSlug(item.term)}" data-term="${termSlug(item.term)}" aria-label="Abrir definición de ${item.term}"><span class="term">${item.term}</span><span class="definition">${item.definition}</span><span class="card-open">Ver ejemplo →</span></button>`).join("");
}

function buildSearchIndex() {
  return [
    ...expansions.map(x=>({type:"Historia",title:x.name,detail:`${x.levels} · ${x.short}`,view:"historia",story:x.id,text:`${x.name} ${x.short} ${x.hook} ${x.tags.join(" ")}`})),
    ...levelBands.map(x=>({type:"Niveles",title:`Nivel ${x.range}: ${x.title}`,detail:x.expansion,view:"niveles",level:x.min,text:`${x.range} ${x.title} ${x.summary} ${x.priorities.flat().join(" ")}`})),
    ...jobs.map(x=>({type:"Job",title:x.name,detail:`${x.role} · el job empieza en ${x.start}`,view:"jobs",job:x.abbr,text:`${x.name} ${x.abbr} ${x.role} ${x.route} ${x.requirement} ${x.feel}`})),
    ...lore.map((x,index)=>({type:"Lore",title:x.title,detail:x.text,view:"mundo",lore:index,text:`${x.title} ${x.text} ${x.detail} ${x.spoiler||""}`})),
    ...races.map((x,index)=>({type:"Raza",title:x.name,detail:x.clans,view:"mundo",race:index,text:`${x.name} ${x.clans} ${x.text} ${x.detail}`})),
    ...contents.map((x,index)=>({type:x.category,title:x.title,detail:x.meta,view:"contenido",content:index,text:`${x.title} ${x.category} ${x.text} ${x.meta} ${x.how}`})),
    ...glossary.map(x=>({type:"Glosario",title:x.term,detail:x.definition,view:"glosario",term:termSlug(x.term),text:`${x.term} ${x.definition} ${x.example}`}))
  ];
}

const searchIndex = buildSearchIndex();
function normalize(value) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""); }

function runSearch(query) {
  const q = normalize(query.trim());
  if (!q) { searchResults.hidden = true; return; }
  const terms = q.split(/\s+/);
  const matches = searchIndex.map(item=>{
    const hay = normalize(item.text);
    const title = normalize(item.title);
    const score = terms.reduce((sum,term)=>sum+(title.includes(term)?5:hay.includes(term)?1:-20),0);
    return {item,score};
  }).filter(x=>x.score>=0).sort((a,b)=>b.score-a.score).slice(0,10);
  searchResults.innerHTML = matches.length ? matches.map(({item},i)=>`<button type="button" class="search-hit" data-search-index="${searchIndex.indexOf(item)}"><b>${escapeHtml(item.type)}</b><span>${escapeHtml(item.title)}</span><small>${escapeHtml(item.detail).slice(0,70)}</small></button>`).join("") : `<div class="no-results">No encontré nada con “${escapeHtml(query)}”. Prueba otra palabra.</div>`;
  searchResults.hidden = false;
}

function openSearchItem(item) {
  if (item.view === "jobs") { activeRole = "Todos"; renderJobFilters(); renderJobs(); }
  if (item.view === "contenido") { activeContent = "Todo"; renderContentFilters(); renderContent(); }
  showView(item.view);
  if (item.level) {
    const slider = document.querySelector("#levelSlider"); slider.value = item.level; renderLevel(item.level);
  }
  if (item.job) openJob(item.job);
  if (item.story) openStory(item.story);
  if (Number.isInteger(item.lore)) openLore(item.lore);
  if (Number.isInteger(item.race)) openRace(item.race);
  if (Number.isInteger(item.content)) openContent(item.content);
  if (item.term) openGlossary(item.term);
}

function setSpoilers(on) {
  document.body.classList.toggle("spoilers-on",on);
  spoilerToggle.setAttribute("aria-pressed",String(on));
  spoilerToggle.querySelector("strong").textContent = on ? "ON" : "OFF";
  try {
    localStorage.setItem("eorzea-spoilers",on?"on":"off");
  } catch {}
}

renderExpansionStrip();
renderHistory();
renderLevelBands();
renderLevel(1);
renderJobFilters();
renderJobs();
renderWorld();
renderContentFilters();
renderContent();
renderGlossary();

document.addEventListener("click", event => {
  const nav = event.target.closest("[data-view]");
  if (nav) { event.preventDefault(); showView(nav.dataset.view); }
  const go = event.target.closest("[data-go]");
  if (go) { event.preventDefault(); showView(go.dataset.go); }
  const exp = event.target.closest("[data-expansion]");
  if (exp) { showView("historia"); openStory(exp.dataset.expansion); }
  const story = event.target.closest("[data-story]");
  if (story) openStory(story.dataset.story);
  const band = event.target.closest("[data-level]");
  if (band) { const level=Number(band.dataset.level); document.querySelector("#levelSlider").value=level; renderLevel(level); document.querySelector(".level-console").scrollIntoView({behavior:"auto",block:"center"}); }
  const role = event.target.closest("[data-role]");
  if (role) { activeRole=role.dataset.role; renderJobFilters(); renderJobs(); }
  const job = event.target.closest("[data-job]");
  if (job) openJob(job.dataset.job);
  const loreCard = event.target.closest("[data-lore]");
  if (loreCard) openLore(Number(loreCard.dataset.lore));
  const raceCard = event.target.closest("[data-race]");
  if (raceCard) openRace(Number(raceCard.dataset.race));
  const contentFilter = event.target.closest("[data-content-filter]");
  if (contentFilter) { activeContent=contentFilter.dataset.contentFilter; renderContentFilters(); renderContent(); }
  const contentCard = event.target.closest("[data-content]");
  if (contentCard) openContent(Number(contentCard.dataset.content));
  const term = event.target.closest("[data-term]");
  if (term) openGlossary(term.dataset.term);
  const methodology = event.target.closest("[data-methodology]");
  if (methodology) openMethodology();
  const hit = event.target.closest("[data-search-index]");
  if (hit) openSearchItem(searchIndex[Number(hit.dataset.searchIndex)]);
  if (!event.target.closest(".search-wrap")) searchResults.hidden = true;
});

jobDialog.addEventListener("click",event=>{
  if (event.target===jobDialog) jobDialog.close();
});
detailDialog.addEventListener("click",event=>{
  if (event.target===detailDialog) detailDialog.close();
});

document.querySelector("#levelSlider").addEventListener("input", event=>renderLevel(Number(event.target.value)));
spoilerToggle.addEventListener("click",()=>setSpoilers(spoilerToggle.getAttribute("aria-pressed")!=="true"));
searchInput.addEventListener("input",event=>runSearch(event.target.value));
searchInput.addEventListener("focus",event=>{ if(event.target.value.trim()) runSearch(event.target.value); });
document.addEventListener("keydown",event=>{
  if (event.key==="/" && document.activeElement!==searchInput) { event.preventDefault(); searchInput.focus(); }
  if (event.key==="Escape") { searchResults.hidden=true; searchInput.blur(); }
});
window.addEventListener("hashchange",()=>showView(location.hash.slice(1)||"inicio",false));

let savedSpoilerState = false;
try {
  savedSpoilerState = localStorage.getItem("eorzea-spoilers")==="on";
} catch {}
setSpoilers(savedSpoilerState);
showView(location.hash.slice(1)||"inicio",false);
document.documentElement.classList.add("eorzea-ready");
