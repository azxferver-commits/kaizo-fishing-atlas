(() => {
  "use strict";

  const STORAGE_PREFIX = "kaizoGoldSaucer:v1";
  const FASHION_SOURCE_URL = "https://raw.githubusercontent.com/KevinAllenWiegand/ffxiv-fashion-report-v2/main/public/master.json";
  const VALID_VIEWS = new Set(["inicio", "mapa", "mgp", "juegos", "fashion"]);
  const numberFormat = new Intl.NumberFormat("es-ES");
  const dateFormat = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });
  const timeFormat = new Intl.DateTimeFormat("es-ES", { weekday: "short", hour: "2-digit", minute: "2-digit" });

  const embeddedFashionFallback = {
    week: 451,
    date: "2026-09-18",
    theme: "Shiver Me Timbers",
    updatedAt: "2026-09-18T12:00:00Z",
    source: "Copia incluida",
    slots: [
      { type: "Head", hint: "Shivering Timbers", items: [] },
      { type: "Body", hint: "Winter Wonderland", items: ["Adventuring Sweater", "Dream Tunic", "Glacial Coat", "Highland Smock", "Starlight Robe", "Starlight Tunic", "Winter Sweater"] },
      { type: "Hands", hint: "Bewitched", items: ["Antiquated Constellation Armlets", "Ghost Barque Long Gloves of Scouting", "Star Velvet Long Gloves of Casting", "Star Velvet Long Gloves of Healing", "Thavnairian Armlets"] },
      { type: "Legs", hint: "Sleight of Hand", items: ["Magician's Slops", "Pilgrim's Slops", "Rainbow Slops of Aiming", "Rainbow Slops of Casting", "Rainbow Slops of Healing"] }
    ]
  };

  const quickTasks = [
    { id: "mini", title: "Mini Cactpot", detail: "Compra tus 3 boletos diarios.", reward: "3 / día" },
    { id: "fashion", title: "Fashion Report", detail: "Participa y apunta a 80 puntos.", reward: "60.000" },
    { id: "jumbo", title: "Jumbo Cactpot", detail: "Compra los 3 boletos antes del sorteo.", reward: "3 / semana" },
    { id: "gates", title: "Cinco GATEs", detail: "Activa Open the Gates en el Challenge Log.", reward: "5.000 +" },
    { id: "challenge", title: "Retos rápidos", detail: "Completa 3 minijuegos y gana 100 MGP.", reward: "2.500" }
  ];

  const zones = {
    entrance: {
      number: "01",
      type: "PUNTO DE LLEGADA",
      name: "Entrance Square",
      coords: "X:4.8 · Y:6.7",
      description: "El centro de operaciones: registro, cambio inicial de MGP, acceso al dirigible y ascensor hacia Chocobo Square.",
      activities: ["Gold Saucer Attendant", "Canje inicial de gil por MGP", "Ascensor a Chocobo Square", "Aetheryte principal"],
      tip: "Registra el aetheryte y habla con el Gold Saucer Attendant antes de explorar.",
      gameZone: "all",
      button: "Ver todas las actividades"
    },
    card: {
      number: "02",
      type: "CARTAS Y TORNEOS",
      name: "Card Square",
      coords: "Área central de Triple Triad",
      description: "La plaza dedicada a Triple Triad: tutorial, NPC rivales, torneos y acceso a las actividades de cartas.",
      activities: ["Triple Triad", "Torneos regulares", "Open Tournaments", "Vendedores de cartas"],
      tip: "Empieza con NPC sencillos y vende las cartas repetidas para recuperar MGP.",
      gameZone: "card",
      button: "Ver juegos de Card Square"
    },
    wonder: {
      number: "03",
      type: "ARCADE Y LOTERÍA",
      name: "Wonder Square",
      coords: "Zona oeste y este",
      description: "La zona más práctica para una visita diaria: Mini Cactpot, máquinas arcade y acceso a Masked Rose para Fashion Report.",
      activities: ["Mini Cactpot", "Fashion Report", "Máquinas arcade", "Intercambio de premios"],
      tip: "Haz primero los tres Mini Cactpot; cuesta muy poco y puede dar una ganancia excelente.",
      gameZone: "wonder",
      button: "Ver juegos de Wonder Square"
    },
    event: {
      number: "04",
      type: "ESCENARIO GATE",
      name: "Event Square",
      coords: "Área del escenario",
      description: "Uno de los escenarios donde se celebran eventos GATE. Sigue los avisos y habla con el GATE Client cuando se anuncie una actividad.",
      activities: ["Any Way the Wind Blows", "Cliffhanger", "Avisos de GATE", "Espectáculos del recinto"],
      tip: "Llega unos minutos antes del aviso; algunas inscripciones se cierran poco después del inicio.",
      gameZone: "event",
      button: "Ver GATEs de Event Square"
    },
    round: {
      number: "05",
      type: "PLATAFORMA GATE",
      name: "Round Square",
      coords: "Área circular superior",
      description: "Plataforma usada por GATEs de supervivencia y precisión. Aquí importan la posición, la cámara y reaccionar sin prisa.",
      activities: ["The Slice Is Right", "Air Force One", "GATE Client", "Puntos de observación"],
      tip: "No persigas cada recompensa si te obliga a arriesgar una eliminación temprana.",
      gameZone: "round",
      button: "Ver GATEs de Round Square"
    },
    chocobo: {
      number: "06",
      type: "CARRERAS",
      name: "Chocobo Square",
      coords: "Acceso por ascensor desde Entrance Square",
      description: "Todo lo necesario para registrar, entrenar, competir y criar tu chocobo de carreras se concentra en esta plaza.",
      activities: ["Chocobo Racing", "Registro de chocobo", "Entrenamiento y alimento", "Challenge Races"],
      tip: "Las primeras carreras sirven para aprender stamina y trazadas; luego el pedigree importa mucho más.",
      gameZone: "chocobo",
      button: "Ver Chocobo Racing"
    },
    minion: {
      number: "07",
      type: "ESTRATEGIA EN TIEMPO REAL",
      name: "Minion Square",
      coords: "Acceso desde Chocobo Square",
      description: "El salón de Lord of Verminion, donde tus minions se convierten en unidades para atacar Arcana Stones y controlar el tablero.",
      activities: ["Lord of Verminion", "Tutoriales y desafíos", "Partidas contra NPC", "Partidas contra jugadores"],
      tip: "Los cinco combates semanales del Challenge Log suman 27.000 MGP sólo en bonificaciones.",
      gameZone: "minion",
      button: "Ver Lord of Verminion"
    }
  };

  const games = [
    {
      id: "leap-of-faith", name: "Leap of Faith", icon: "↟", category: "gate", categoryLabel: "GATE", zone: "event", location: "Event Square / instancias GATE",
      summary: "Recorrido de plataformas: llega a la meta y recoge cactuars sin caer.",
      steps: ["Habla con el GATE Client cuando aparezca el aviso.", "Sigue el recorrido de saltos y ajusta la cámara antes de cada salto.", "Llega a la meta; los cactuars opcionales aumentan la recompensa."],
      tip: "Completar vale más que arriesgarlo todo por el último cactuar. Primero asegura la meta.",
      meta: { Frecuencia: "Rotación GATE", Tipo: "Plataformas", Ideal: "MGP repetible" }
    },
    {
      id: "air-force-one", name: "Air Force One", icon: "◎", category: "gate", categoryLabel: "GATE", zone: "round", location: "Round Square / instancia GATE",
      summary: "Galería de tiro sobre raíles: apunta a cactuars y evita los objetivos penalizadores.",
      steps: ["Inscríbete con el GATE Client.", "Mueve la mira y dispara a los objetivos cactuar.", "Evita los objetivos rojos y acumula precisión hasta el final."],
      tip: "Es una GATE segura porque no exige saltos. Prioriza blancos claros en vez de disparar sin control.",
      meta: { Frecuencia: "Rotación GATE", Tipo: "Puntería", Riesgo: "Bajo" }
    },
    {
      id: "wind-blows", name: "Any Way the Wind Blows", icon: "≋", category: "gate", categoryLabel: "GATE", zone: "event", location: "Event Square",
      summary: "Evento de supervivencia por rondas: Typhon elimina zonas al azar con sus estornudos.",
      steps: ["Entra en la arena durante la inscripción.", "Elige una posición y observa cada ronda.", "Sobrevive a los empujes hasta terminar el evento."],
      tip: "No existe un punto garantizado. Distribuirse y aceptar el componente aleatorio es parte del juego.",
      meta: { Frecuencia: "Rotación GATE", Tipo: "Supervivencia", Azar: "Alto" }
    },
    {
      id: "slice-is-right", name: "The Slice Is Right", icon: "刀", category: "gate", categoryLabel: "GATE", zone: "round", location: "Round Square",
      summary: "Supervive a los ataques de Yojimbo, esquiva zonas y recoge MGP sin caer.",
      steps: ["Entra a la plataforma al abrirse la inscripción.", "Lee la dirección de cada corte y aléjate de las áreas peligrosas.", "Recoge MGP sólo cuando la ruta sea segura y resiste hasta el final."],
      tip: "La cámara elevada ayuda a leer bambús y cortes. Sobrevivir es prioridad; las monedas son secundarias.",
      meta: { Frecuencia: "Rotación GATE", Tipo: "Esquiva", Riesgo: "Medio" }
    },
    {
      id: "cliffhanger", name: "Cliffhanger", icon: "△", category: "gate", categoryLabel: "GATE", zone: "event", location: "Event Square / Wonder Square",
      summary: "Escala un recorrido corto, evita bombas y rescata al chocobo de la cima.",
      steps: ["Habla con el GATE Client cercano al recorrido.", "Sube con saltos cortos mientras vigilas las explosiones.", "Alcanza al chocobo antes de que finalice el tiempo."],
      tip: "Espera la explosión si una bomba está a punto de detonar; recuperar el equilibrio cuesta más tiempo.",
      meta: { Frecuencia: "Rotación GATE", Tipo: "Plataformas", Duración: "Corta" }
    },
    {
      id: "monster-toss", name: "Monster Toss", icon: "◌", category: "arcade", categoryLabel: "Arcade", zone: "wonder", location: "Wonder Square",
      summary: "Baloncesto contrarreloj: encesta tantas veces como puedas antes de la bocina.",
      steps: ["Activa la máquina pagando una pequeña cantidad de MGP.", "Ajusta dirección y fuerza del tiro.", "Encadena canastas antes de que termine el tiempo."],
      tip: "Úsalo para completar rápidamente los retos de minijuegos del Challenge Log.",
      meta: { Coste: "Bajo", Tipo: "Precisión", Sesión: "Muy corta" }
    },
    {
      id: "crystal-tower-striker", name: "Crystal Tower Striker", icon: "⇣", category: "arcade", categoryLabel: "Arcade", zone: "wonder", location: "Wonder Square",
      summary: "Detén el indicador en la zona óptima y golpea el medidor con la mayor fuerza.",
      steps: ["Inicia la máquina.", "Observa el movimiento del indicador de potencia.", "Confirma cuando esté dentro de la zona de mejor puntuación."],
      tip: "Su duración mínima lo convierte en una opción rápida para completar tres minijuegos.",
      meta: { Coste: "Bajo", Tipo: "Timing", Sesión: "Muy corta" }
    },
    {
      id: "moogles-paw", name: "The Moogle's Paw", icon: "⌁", category: "arcade", categoryLabel: "Arcade", zone: "wonder", location: "Wonder Square",
      summary: "Controla una garra moogle en dos ejes y colócala sobre el premio.",
      steps: ["Mantén pulsado para mover la garra horizontalmente.", "Confirma y repite para el eje vertical.", "La garra desciende automáticamente sobre el objetivo."],
      tip: "Los movimientos no se pueden corregir al soltar; usa toques medidos y referencias visuales.",
      meta: { Coste: "Bajo", Tipo: "Posición", Sesión: "Corta" }
    },
    {
      id: "cuff-a-cur", name: "Cuff-a-Cur", icon: "✹", category: "arcade", categoryLabel: "Arcade", zone: "wonder", location: "Wonder Square",
      summary: "Golpea cuando el indicador pasa por el centro para conseguir la mejor puntuación.",
      steps: ["Inicia el minijuego.", "Sigue el indicador que recorre la barra.", "Confirma en la zona central para lanzar el golpe."],
      tip: "No persigas la perfección: su valor real está en hacer intentos rápidos para el Challenge Log.",
      meta: { Coste: "Bajo", Tipo: "Timing", Sesión: "Muy corta" }
    },
    {
      id: "finer-miner", name: "The Finer Miner", icon: "⌁", category: "arcade", categoryLabel: "Arcade", zone: "wonder", location: "Wonder Square",
      summary: "Busca mineral oculto: el medidor indica qué tan cerca está tu siguiente golpe.",
      steps: ["Elige una posición del arco de minería.", "Interpreta la señal de cercanía.", "Ajusta el siguiente intento hasta encontrar el depósito."],
      tip: "Divide mentalmente el arco y reduce el rango con cada pista, como una búsqueda binaria.",
      meta: { Coste: "Bajo", Tipo: "Deducción", Sesión: "Corta" }
    },
    {
      id: "out-on-a-limb", name: "Out on a Limb", icon: "⌇", category: "arcade", categoryLabel: "Arcade", zone: "wonder", location: "Wonder Square",
      summary: "Variante de tala: localiza la madera oculta interpretando la distancia de cada intento.",
      steps: ["Elige una zona del arco.", "Usa la pista de cercanía para reducir el área posible.", "Encuentra el punto y decide si continúas o cobras."],
      tip: "Cobrar una ganancia segura suele ser mejor que arriesgar toda la ronda buscando el máximo.",
      meta: { Coste: "Bajo", Tipo: "Deducción", Sesión: "Corta" }
    },
    {
      id: "mini-cactpot", name: "Mini Cactpot", icon: "#", category: "azar", categoryLabel: "Cactpot", zone: "wonder", location: "Wonder Square · X:5.1 Y:6.5",
      summary: "Lotería diaria de cuadrícula 3×3. Revela tres números y elige la línea con mejor suma.",
      steps: ["Compra hasta tres boletos diarios por 10 MGP cada uno.", "Revela tres casillas ocultas.", "Compara las ocho líneas y elige la suma con mejor premio."],
      tip: "Las sumas 6, 24 y 23 son especialmente valiosas. Haz los tres boletos: el coste es mínimo.",
      meta: { Frecuencia: "3 al día", Coste: "10 MGP", Tipo: "Azar + decisión" }
    },
    {
      id: "jumbo-cactpot", name: "Jumbo Cactpot", icon: "◆", category: "azar", categoryLabel: "Cactpot", zone: "wonder", location: "Wonder Square · X:8.5 Y:5.9",
      summary: "Lotería semanal de cuatro cifras con hasta tres boletos por sorteo.",
      steps: ["Compra hasta tres boletos y elige cuatro dígitos.", "Espera el sorteo de tu centro de datos.", "Reclama cada boleto; dentro de la primera hora recibes Early Bird Bonus."],
      tip: "Compra siempre los tres boletos y activa un recordatorio para cobrar después del sorteo.",
      meta: { Frecuencia: "Semanal", Coste: "100 / 150 / 200", Cobro: "Máx. 7 días" }
    },
    {
      id: "triple-triad", name: "Triple Triad", icon: "▦", category: "estrategia", categoryLabel: "Estrategia", zone: "card", location: "Card Square / Battlehall",
      summary: "Juego de cartas 3×3: captura cartas usando los valores de sus cuatro lados.",
      steps: ["Forma un mazo de cinco cartas.", "Alterna colocaciones en el tablero 3×3.", "Supera el lado adyacente del rival y adapta tu plan a las reglas especiales."],
      tip: "Combina los retos normales, Battlehall y Open Tournament para sumar varias bonificaciones semanales.",
      meta: { Jugadores: "1–2", Tipo: "Cartas", Log: "Hasta 21.500 MGP" }
    },
    {
      id: "chocobo-racing", name: "Chocobo Racing", icon: "♞", category: "carreras", categoryLabel: "Carreras", zone: "chocobo", location: "Chocobo Square",
      summary: "Carreras con stamina, carriles, objetos, entrenamiento y un sistema de pedigree.",
      steps: ["Completa “So You Want to Be a Jockey” y registra tu chocobo.", "Acelera administrando la stamina, cambia de carril y recoge objetos.", "Sube de rango, entrena y retira chocobos de rango 40 para criar mejores generaciones."],
      tip: "La ruta semanal de 3 carreras + 1 victoria es rápida; las metas de 20/10 requieren más dedicación.",
      meta: { Jugadores: "1–8", Tipo: "Carreras", Log: "Hasta 26.000 MGP" }
    },
    {
      id: "lord-of-verminion", name: "Lord of Verminion", icon: "♟", category: "estrategia", categoryLabel: "Estrategia", zone: "minion", location: "Minion Square",
      summary: "Estrategia en tiempo real: despliega minions y destruye las Arcana Stones rivales.",
      steps: ["Elige tus minions considerando tipo, coste y habilidades.", "Despliega grupos y captura puntos del tablero.", "Ataca las Arcana Stones mientras proteges las tuyas."],
      tip: "Completar cinco partidas semanales activa tres retos acumulativos por 27.000 MGP.",
      meta: { Jugadores: "1–2", Tipo: "RTS", Log: "27.000 MGP" }
    },
    {
      id: "doman-mahjong", name: "Doman Mahjong", icon: "四", category: "estrategia", categoryLabel: "Estrategia", zone: "wonder", location: "Gold Saucer / Duty Finder",
      summary: "Mahjong japonés para cuatro jugadores, con partidas contra personas o autómatas.",
      steps: ["Forma una mano válida con cuatro grupos y una pareja, o una mano especial.", "Aprende al menos un yaku; una forma válida sin yaku no puede ganar.", "Gestiona descartes, riichi y riesgo observando lo que muestran los rivales."],
      tip: "Es profundo y no es la ruta más rápida de farmeo, pero dos partidas PvP dan 5.000 MGP del Challenge Log.",
      meta: { Jugadores: "4", Tipo: "Mahjong", Log: "5.000 MGP" }
    }
  ];

  const methods = [
    { rank: "01", title: "Fashion Report", summary: "La mayor recompensa por pocos minutos una vez por semana.", reward: "Hasta 60.000 / semana", gameId: "fashion-method", zone: "wonder", detail: { icon: "♢", category: "Método semanal", location: "Wonder Square · Masked Rose X:7.2 Y:7.4", summary: "Participar entrega 10.000 MGP; obtener 80 puntos o más añade 50.000 MGP una vez por semana.", steps: ["Consulta el tema desde el martes.", "Espera a que la evaluación abra el viernes.", "Equipa prendas que coincidan con las pistas y busca 80 puntos."], tip: "No necesitas 100 puntos para la recompensa principal. Detente al alcanzar 80.", meta: { Frecuencia: "Semanal", Tiempo: "5–20 min", Recompensa: "60.000 MGP" } } },
    { rank: "02", title: "Challenge Log", summary: "Bonificaciones que convierten actividades normales en una ruta rentable.", reward: "Hasta 95.000 / semana", gameId: "challenge-method", zone: "entrance", detail: { icon: "✓", category: "Método semanal", location: "Menú Challenge Log", summary: "Diecisiete retos del Gold Saucer premian minijuegos, GATEs, carreras, cartas, Verminion y Mahjong.", steps: ["Desbloquea Challenge Log con “Rising to the Challenge”.", "Prioriza objetivos acumulativos que se completan juntos.", "Usa la lista interactiva de esta página para no repetir tareas."], tip: "Cinco partidas de Lord of Verminion activan tres retos y suman 27.000 MGP.", meta: { Frecuencia: "Semanal", Total: "95.000 MGP", Reinicio: "Martes" } } },
    { rank: "03", title: "GATEs", summary: "Eventos cada 20 minutos; perfectos mientras haces otras tareas.", reward: "MGP repetible + 13.000 log", gameId: "gate-method", zone: "event", detail: { icon: "✦", category: "Método repetible", location: "Varias plazas", summary: "Los eventos públicos del Gold Saucer se anuncian cada veinte minutos y dan MGP según participación o rendimiento.", steps: ["Mira el contador de esta web.", "Acércate a la plaza indicada por el aviso.", "Habla con el GATE Client antes de que cierre la inscripción."], tip: "Combina cinco participaciones y tres éxitos para cobrar 13.000 MGP adicionales del Challenge Log.", meta: { Frecuencia: "Cada 20 min", Log: "13.000 MGP", Tipo: "Repetible" } } },
    { rank: "04", title: "Mini Cactpot", summary: "Tres intentos diarios, coste casi nulo y posibilidad de premio alto.", reward: "3 boletos / día", gameId: "mini-cactpot", zone: "wonder" },
    { rank: "05", title: "Lord of Verminion", summary: "Una de las concentraciones más grandes del Challenge Log.", reward: "27.000 / 5 partidas", gameId: "lord-of-verminion", zone: "minion" },
    { rank: "06", title: "Triple Triad", summary: "Cartas, Battlehall y torneos apilan varios retos semanales.", reward: "Hasta 21.500 de log", gameId: "triple-triad", zone: "card" },
    { rank: "07", title: "Chocobo Racing", summary: "Buena ruta si te gusta progresar y criar a largo plazo.", reward: "Hasta 26.000 de log", gameId: "chocobo-racing", zone: "chocobo" },
    { rank: "08", title: "Jumbo Cactpot", summary: "Tres boletos semanales; poca dedicación y premio potencial enorme.", reward: "Sorteo semanal", gameId: "jumbo-cactpot", zone: "wonder" }
  ];

  const challenges = [
    { id: "mini3", title: "Size Doesn't Matter", detail: "Completa 3 minijuegos.", reward: 1000, tags: ["rapido"] },
    { id: "mini100", title: "From Small Things", detail: "Gana 100 MGP en minijuegos.", reward: 1500, tags: ["rapido"] },
    { id: "gate5", title: "Open the Gates", detail: "Participa en 5 GATEs.", reward: 5000, tags: ["gate"] },
    { id: "gate3", title: "Close the Gates", detail: "Completa con éxito 3 GATEs.", reward: 8000, tags: ["gate"] },
    { id: "race3", title: "To the Races I", detail: "Participa en 3 carreras chocobo.", reward: 5000, tags: ["carreras"] },
    { id: "race20", title: "To the Races II", detail: "Participa en 20 carreras chocobo.", reward: 8000, tags: ["carreras"] },
    { id: "win1", title: "Victory Lap I", detail: "Gana 1 carrera chocobo.", reward: 5000, tags: ["carreras"] },
    { id: "win10", title: "Victory Lap II", detail: "Gana 10 carreras chocobo.", reward: 8000, tags: ["carreras"] },
    { id: "triad10", title: "Always in Threes", detail: "Juega 10 partidas de Triple Triad.", reward: 5000, tags: ["cartas"] },
    { id: "triadwin10", title: "A Winner Is You", detail: "Gana 10 partidas de Triple Triad.", reward: 8000, tags: ["cartas"] },
    { id: "hall5", title: "Cards in the Hall", detail: "Juega 5 partidas en Battlehall.", reward: 2500, tags: ["cartas"] },
    { id: "hallwin3", title: "Triple Tumble", detail: "Gana 3 partidas en Battlehall.", reward: 3000, tags: ["cartas"] },
    { id: "tournament", title: "Come on in, It's Open", detail: "Participa en un Open Tournament y cobra.", reward: 3000, tags: ["cartas"] },
    { id: "lovm1", title: "Come Play Lord I", detail: "Juega 1 partida de Lord of Verminion.", reward: 5000, tags: ["verminion"] },
    { id: "lovm3", title: "Come Play Lord II", detail: "Juega 3 partidas de Lord of Verminion.", reward: 10000, tags: ["verminion"] },
    { id: "lovm5", title: "Come Play Lord III", detail: "Juega 5 partidas de Lord of Verminion.", reward: 12000, tags: ["verminion"] },
    { id: "mahjong2", title: "Kiwami", detail: "Participa en 2 partidas PvP de Doman Mahjong.", reward: 5000, tags: ["mahjong"] }
  ];

  const timePlans = {
    15: { estimate: "60.000+ MGP", steps: [["Fashion Report", "60.000"], ["Mini Cactpot ×3", "variable"], ["Jumbo Cactpot ×3", "boletos"]] },
    30: { estimate: "65.000+ MGP", steps: [["Fashion Report", "60.000"], ["Minijuegos ×3 + 100 MGP", "2.500"], ["Una GATE cercana", "premio"], ["Cactpot diario/semanal", "variable"]] },
    60: { estimate: "75.000–100.000+ MGP", steps: [["Fashion Report", "60.000"], ["Retos rápidos", "2.500"], ["GATEs y sus retos", "hasta 13.000"], ["Verminion o Triple Triad", "progreso log"], ["Cactpot", "variable"]] }
  };

  const guideTabs = {
    theme: { number: "01", title: "El tema aparece el martes", text: "Habla con Masked Rose para ver el tema y cuatro pistas de equipo. En esta web se cargan automáticamente la semana, las pistas y las opciones conocidas." },
    gear: { number: "02", title: "La apariencia glamurizada es la que se evalúa", text: "Puedes llevar una pieza base distinta si su glamour coincide con la solución. Equipa también los demás huecos de armadura: dejarlos vacíos puede reducir tu puntuación." },
    score: { number: "03", title: "Tu objetivo práctico son 80 puntos", text: "Tienes hasta cuatro evaluaciones entre el viernes y el reinicio del martes. Usa cada intento para corregir prendas o tintes; no necesitas llegar a 100 para obtener los 50.000 MGP extra." },
    reward: { number: "04", title: "60.000 MGP una vez por semana", text: "La primera participación semanal concede 10.000 MGP. Alcanzar 80 puntos o más concede 50.000 adicionales. Repetir intentos ayuda a mejorar la nota, pero no repite esos premios." }
  };

  const fashionChecklistItems = [
    { id: "review", title: "Revisé las 4 pistas", detail: "Comprueba cada hueco temático." },
    { id: "items", title: "Preparé las prendas", detail: "Pieza original o glamour equivalente." },
    { id: "slots", title: "Llené todos los huecos", detail: "No dejes armadura principal vacía." },
    { id: "dyes", title: "Comprobé los tintes", detail: "Úsalos si la solución semanal los pide." },
    { id: "participated", title: "Ya participé", detail: "+10.000 MGP una vez esta semana." },
    { id: "score80", title: "Conseguí 80+", detail: "+50.000 MGP adicionales." }
  ];

  let activeView = "inicio";
  let activeZone = "entrance";
  let activeGameFilter = "all";
  let activeZoneGameFilter = null;
  let currentFashionData = embeddedFashionFallback;
  let toastTimer = null;
  let lastDialogZone = "entrance";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function safeParse(value, fallback) {
    try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
  }

  function storageGet(key, fallback) {
    try { return safeParse(localStorage.getItem(key), fallback); } catch { return fallback; }
  }

  function storageSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  }

  function getCycle(now = new Date()) {
    const utc = new Date(now);
    const day = utc.getUTCDay();
    const daysSinceTuesday = (day - 2 + 7) % 7;
    const start = new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate() - daysSinceTuesday, 8, 0, 0));
    if (utc < start) start.setUTCDate(start.getUTCDate() - 7);
    const judging = new Date(start.getTime() + 3 * 86400000);
    const nextReset = new Date(start.getTime() + 7 * 86400000);
    return { start, judging, nextReset, key: start.toISOString().slice(0, 10) };
  }

  function weeklyKey(section) {
    return `${STORAGE_PREFIX}:${section}:${getCycle().key}`;
  }

  function formatDuration(ms, includeMinutes = true) {
    const safe = Math.max(0, ms);
    const days = Math.floor(safe / 86400000);
    const hours = Math.floor((safe % 86400000) / 3600000);
    const minutes = Math.floor((safe % 3600000) / 60000);
    if (days > 0) return includeMinutes ? `${days}d ${hours}h ${minutes}m` : `${days}d ${hours}h`;
    if (hours > 0) return includeMinutes ? `${hours}h ${minutes}m` : `${hours}h`;
    const seconds = Math.floor((safe % 60000) / 1000);
    return includeMinutes ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }

  function setView(view, options = {}) {
    const nextView = VALID_VIEWS.has(view) ? view : "inicio";
    activeView = nextView;
    $$('[data-view-panel]').forEach((panel) => {
      const visible = panel.dataset.viewPanel === nextView;
      panel.hidden = !visible;
      panel.classList.toggle("is-visible", visible);
    });
    $$(".nav-button[data-view]").forEach((button) => {
      const active = button.dataset.view === nextView;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    if (options.updateHash !== false) history.pushState({ view: nextView }, "", `#${nextView}`);
    document.title = `${viewTitle(nextView)} — KAIZO Gold Saucer`;
    if (options.scroll !== false) window.scrollTo({ top: 0, behavior: options.instant ? "auto" : "smooth" });
    if (options.focus) {
      requestAnimationFrame(() => {
        const target = document.getElementById(options.focus);
        if (target) { target.focus({ preventScroll: true }); target.scrollIntoView({ behavior: "smooth", block: "center" }); }
      });
    }
  }

  function viewTitle(view) {
    return ({ inicio: "Inicio", mapa: "Mapa", mgp: "Ganar MGP", juegos: "Juegos", fashion: "Fashion Report" })[view] || "Inicio";
  }

  function bindNavigation() {
    $$(".nav-button[data-view]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
    $$('[data-view-jump]').forEach((button) => button.addEventListener("click", () => {
      const filter = button.dataset.filterJump;
      if (filter) {
        activeGameFilter = filter;
        activeZoneGameFilter = null;
        updateGameFilterButtons();
        renderGames();
      }
      setView(button.dataset.viewJump, { focus: button.dataset.focusTarget || null });
    }));
    window.addEventListener("popstate", () => setView(location.hash.slice(1), { updateHash: false, instant: true }));
  }

  function renderQuickChecklist() {
    const state = storageGet(weeklyKey("quick"), {});
    const wrap = $("#quickChecklist");
    wrap.innerHTML = "";
    quickTasks.forEach((task) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `quick-item${state[task.id] ? " is-done" : ""}`;
      button.dataset.quickId = task.id;
      button.setAttribute("aria-pressed", state[task.id] ? "true" : "false");
      button.innerHTML = `<span class="quick-check">${state[task.id] ? "✓" : ""}</span><span class="quick-copy"><strong>${task.title}</strong><small>${task.detail}</small></span><span class="quick-reward">${task.reward}</span>`;
      button.addEventListener("click", () => {
        const next = storageGet(weeklyKey("quick"), {});
        next[task.id] = !next[task.id];
        storageSet(weeklyKey("quick"), next);
        renderQuickChecklist();
      });
      wrap.appendChild(button);
    });
    const done = quickTasks.filter((task) => state[task.id]).length;
    $("#quickDoneCount").textContent = String(done);
  }

  function resetQuickChecklist() {
    storageSet(weeklyKey("quick"), {});
    renderQuickChecklist();
    showToast("Lista semanal reiniciada.");
  }

  function selectZone(zoneId, options = {}) {
    const zone = zones[zoneId] || zones.entrance;
    activeZone = zoneId in zones ? zoneId : "entrance";
    $$(".map-node").forEach((node) => {
      const active = node.dataset.zone === activeZone;
      node.classList.toggle("is-active", active);
      node.setAttribute("aria-pressed", active ? "true" : "false");
    });
    $("#zoneNumber").textContent = zone.number;
    $("#zoneType").textContent = zone.type;
    $("#zoneName").textContent = zone.name;
    $("#zoneCoords").textContent = zone.coords;
    $("#zoneDescription").textContent = zone.description;
    $("#zoneTip").textContent = zone.tip;
    $("#zoneGamesButton").innerHTML = `${zone.button} <span aria-hidden="true">→</span>`;
    const list = $("#zoneActivities");
    list.innerHTML = "";
    zone.activities.forEach((activity) => {
      const li = document.createElement("li");
      li.textContent = activity;
      list.appendChild(li);
    });
    if (options.scroll) $(".zone-panel").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function bindMap() {
    $$(".map-node").forEach((node) => node.addEventListener("click", () => selectZone(node.dataset.zone)));
    $$('[data-zone-route]').forEach((button) => button.addEventListener("click", () => selectZone(button.dataset.zoneRoute, { scroll: true })));
    $("#mapResetButton").addEventListener("click", () => selectZone("entrance", { scroll: true }));
    $("#zoneGamesButton").addEventListener("click", () => {
      const filter = zones[activeZone].gameZone;
      activeZoneGameFilter = filter === "all" ? null : filter;
      activeGameFilter = "all";
      $("#gameSearch").value = "";
      updateGameFilterButtons();
      renderGames();
      setView("juegos");
      showToast(filter === "all" ? "Mostrando todas las actividades." : `Actividades relacionadas con ${zones[activeZone].name}.`);
    });
  }

  function loadGoal() {
    const saved = storageGet(`${STORAGE_PREFIX}:goal`, { current: 20000, goal: 500000 });
    const current = Number.isFinite(Number(saved.current)) ? Math.max(0, Number(saved.current)) : 20000;
    const goal = Number.isFinite(Number(saved.goal)) ? Math.max(1, Number(saved.goal)) : 500000;
    $("#mgpCurrent").value = String(current);
    $("#mgpGoal").value = String(goal);
    updateGoalUI();
  }

  function updateGoalUI() {
    const current = Math.max(0, Number($("#mgpCurrent").value) || 0);
    const goal = Math.max(1, Number($("#mgpGoal").value) || 1);
    const remaining = Math.max(0, goal - current);
    const percent = Math.min(100, Math.max(0, (current / goal) * 100));
    const weeks = Math.ceil(remaining / 120000);
    $("#mgpRemaining").textContent = `${numberFormat.format(remaining)} MGP`;
    $("#mgpWeeks").textContent = remaining === 0 ? "Meta cumplida" : String(weeks);
    $("#goalProgressMain").style.width = `${percent}%`;
    $("#goalProgressMini").style.width = `${percent}%`;
    $("#goalPercentBadge").textContent = `${Math.round(percent)}%`;
    $("#goalCurrentMini").textContent = numberFormat.format(current);
    $("#goalTargetMini").textContent = numberFormat.format(goal);
  }

  function bindGoal() {
    [$("#mgpCurrent"), $("#mgpGoal")].forEach((input) => input.addEventListener("input", updateGoalUI));
    $("#saveGoalButton").addEventListener("click", () => {
      const current = Math.max(0, Number($("#mgpCurrent").value) || 0);
      const goal = Math.max(1, Number($("#mgpGoal").value) || 1);
      storageSet(`${STORAGE_PREFIX}:goal`, { current, goal });
      updateGoalUI();
      showToast("Meta de MGP guardada en este dispositivo.");
    });
    $("#resetGoalButton").addEventListener("click", () => {
      $("#mgpCurrent").value = "20000";
      $("#mgpGoal").value = "500000";
      storageSet(`${STORAGE_PREFIX}:goal`, { current: 20000, goal: 500000 });
      updateGoalUI();
      showToast("Meta restablecida a 20.000 / 500.000 MGP.");
    });
  }

  function renderTimePlan(minutes) {
    const plan = timePlans[minutes] || timePlans[15];
    const wrap = $("#timeRoute");
    wrap.innerHTML = "";
    plan.steps.forEach(([title, reward], index) => {
      const row = document.createElement("div");
      row.className = "time-step";
      row.innerHTML = `<span>${index + 1}</span><strong>${title}</strong><small>${reward}</small>`;
      wrap.appendChild(row);
    });
    $("#timeEstimate").textContent = plan.estimate;
    $$("[data-time]").forEach((button) => button.classList.toggle("is-active", Number(button.dataset.time) === Number(minutes)));
  }

  function renderMethods() {
    const grid = $("#methodGrid");
    grid.innerHTML = "";
    methods.forEach((method) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "method-card";
      button.innerHTML = `<span class="method-rank">${method.rank}</span><h3>${method.title}</h3><p>${method.summary}</p><footer><strong>${method.reward}</strong><span aria-hidden="true">↗</span></footer>`;
      button.addEventListener("click", () => openMethod(method));
      grid.appendChild(button);
    });
  }

  function renderChallengeList(filter = "all") {
    const state = storageGet(weeklyKey("challenge"), {});
    const list = $("#challengeList");
    list.innerHTML = "";
    challenges.forEach((challenge) => {
      const visible = filter === "all" || challenge.tags.includes(filter);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `challenge-item${state[challenge.id] ? " is-done" : ""}`;
      button.hidden = !visible;
      button.setAttribute("aria-pressed", state[challenge.id] ? "true" : "false");
      button.innerHTML = `<span class="check-box">${state[challenge.id] ? "✓" : ""}</span><span class="challenge-copy"><strong>${challenge.title}</strong><small>${challenge.detail}</small></span><span class="challenge-reward">${numberFormat.format(challenge.reward)}</span>`;
      button.addEventListener("click", () => {
        const next = storageGet(weeklyKey("challenge"), {});
        next[challenge.id] = !next[challenge.id];
        storageSet(weeklyKey("challenge"), next);
        renderChallengeList(filter);
      });
      list.appendChild(button);
    });
    const complete = challenges.filter((challenge) => state[challenge.id]);
    const total = complete.reduce((sum, challenge) => sum + challenge.reward, 0);
    $("#challengeMgp").textContent = numberFormat.format(total);
    $("#challengeCount").textContent = `${complete.length} de ${challenges.length} retos completos`;
  }

  function bindMgp() {
    $$("[data-time]").forEach((button) => button.addEventListener("click", () => renderTimePlan(Number(button.dataset.time))));
    $$("[data-challenge-filter]").forEach((button) => button.addEventListener("click", () => {
      $$("[data-challenge-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
      renderChallengeList(button.dataset.challengeFilter);
    }));
    $("#clearChallengeButton").addEventListener("click", () => {
      storageSet(weeklyKey("challenge"), {});
      const active = $("[data-challenge-filter].is-active")?.dataset.challengeFilter || "all";
      renderChallengeList(active);
      showToast("Challenge Log de esta semana desmarcado.");
    });
  }

  function updateGameFilterButtons() {
    $$("[data-game-filter]").forEach((button) => button.classList.toggle("is-active", button.dataset.gameFilter === activeGameFilter));
  }

  function gameMatchesZone(game, zoneFilter) {
    if (!zoneFilter) return true;
    if (zoneFilter === "event") return game.zone === "event";
    if (zoneFilter === "round") return game.zone === "round";
    return game.zone === zoneFilter;
  }

  function renderGames() {
    const query = $("#gameSearch").value.trim().toLowerCase();
    const grid = $("#gamesGrid");
    grid.innerHTML = "";
    const visible = games.filter((game) => {
      const filterMatch = activeGameFilter === "all" || game.category === activeGameFilter;
      const zoneMatch = gameMatchesZone(game, activeZoneGameFilter);
      const searchMatch = !query || `${game.name} ${game.summary} ${game.categoryLabel} ${game.location}`.toLowerCase().includes(query);
      return filterMatch && zoneMatch && searchMatch;
    });
    visible.forEach((game) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "game-card";
      button.dataset.gameId = game.id;
      button.innerHTML = `<span class="game-card-top"><span class="game-icon" aria-hidden="true">${game.icon}</span><span class="game-category">${game.categoryLabel}</span></span><h2>${game.name}</h2><p>${game.summary}</p><footer><span>${game.location}</span><span aria-hidden="true">↗</span></footer>`;
      button.addEventListener("click", () => openGame(game));
      grid.appendChild(button);
    });
    $("#allGamesCount").textContent = `(${games.length})`;
    $("#gameResultCount").textContent = `${visible.length} ${visible.length === 1 ? "actividad" : "actividades"}`;
    $("#gamesEmpty").hidden = visible.length !== 0;
  }

  function resetGameFilters() {
    activeGameFilter = "all";
    activeZoneGameFilter = null;
    $("#gameSearch").value = "";
    updateGameFilterButtons();
    renderGames();
  }

  function bindGames() {
    $$("[data-game-filter]").forEach((button) => button.addEventListener("click", () => {
      activeGameFilter = button.dataset.gameFilter;
      activeZoneGameFilter = null;
      updateGameFilterButtons();
      renderGames();
    }));
    $("#gameSearch").addEventListener("input", () => { activeZoneGameFilter = null; renderGames(); });
    $("#clearGameSearch").addEventListener("click", () => { $("#gameSearch").value = ""; renderGames(); $("#gameSearch").focus(); });
    $("#resetGameFilters").addEventListener("click", resetGameFilters);
  }

  function openGame(game) {
    openDialog({
      title: game.name, icon: game.icon, category: game.categoryLabel, location: game.location,
      summary: game.summary, steps: game.steps, tip: game.tip, meta: game.meta, zone: game.zone
    });
  }

  function openMethod(method) {
    if (method.detail) {
      openDialog({ title: method.title, zone: method.zone, ...method.detail });
      return;
    }
    const game = games.find((item) => item.id === method.gameId);
    if (game) openGame(game);
  }

  function openDialog(data) {
    lastDialogZone = data.zone || "entrance";
    $("#dialogCategory").textContent = data.category || "Actividad";
    $("#dialogLocation").textContent = data.location || "Gold Saucer";
    $("#dialogIcon").textContent = data.icon || "✦";
    $("#dialogTitle").textContent = data.title;
    $("#dialogSummary").textContent = data.summary;
    $("#dialogTip").textContent = data.tip;
    const steps = $("#dialogSteps");
    steps.innerHTML = "";
    (data.steps || []).forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      steps.appendChild(li);
    });
    const meta = $("#dialogMeta");
    meta.innerHTML = "";
    Object.entries(data.meta || {}).forEach(([key, value]) => {
      const row = document.createElement("div");
      const label = document.createElement("span");
      const strong = document.createElement("strong");
      label.textContent = key;
      strong.textContent = value;
      row.append(label, strong);
      meta.appendChild(row);
    });
    const dialog = $("#detailDialog");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog() {
    const dialog = $("#detailDialog");
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
  }

  function bindDialog() {
    $("#dialogClose").addEventListener("click", closeDialog);
    $("#dialogDoneButton").addEventListener("click", closeDialog);
    $("#dialogMapButton").addEventListener("click", () => {
      closeDialog();
      selectZone(lastDialogZone);
      setView("mapa");
    });
    $("#detailDialog").addEventListener("click", (event) => {
      if (event.target === $("#detailDialog")) closeDialog();
    });
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ");
  }

  function extractFashionMaster(master) {
    if (!master || !Array.isArray(master.reports) || !master.reports.length) throw new Error("Formato semanal no válido");
    const latest = [...master.reports].sort((a, b) => String(a.date).localeCompare(String(b.date))).at(-1);
    const slotDatabase = Array.isArray(master.slots) ? master.slots : [];
    return {
      week: latest.week,
      date: latest.date,
      theme: latest.theme,
      updatedAt: new Date().toISOString(),
      source: "Fuente en vivo",
      slots: (latest.slots || []).map((slot) => {
        const match = slotDatabase.find((candidate) => normalize(candidate.type) === normalize(slot.type) && normalize(candidate.hint) === normalize(slot.hint));
        return { type: slot.type, hint: slot.hint, items: (match?.items || []).map((item) => typeof item === "string" ? item : item.name).filter(Boolean) };
      })
    };
  }

  function normalizeLocalFashion(data) {
    if (!data || !data.date || !data.theme || !Array.isArray(data.slots)) throw new Error("Copia semanal no válida");
    return { ...data, source: data.source || "Copia automática" };
  }

  function candidateScore(data) {
    const time = Date.parse(`${data.date}T00:00:00Z`) || 0;
    const items = (data.slots || []).reduce((sum, slot) => sum + (slot.items?.length || 0), 0);
    return time + Math.min(items, 99) * 1000;
  }

  async function fetchJson(url, timeout = 7000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async function loadFashionReport(manual = false) {
    const button = $("#refreshFashionButton");
    const original = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<span aria-hidden="true">↻</span> Sincronizando…';
    $("#fashionLiveStatus").textContent = "Sincronizando datos semanales…";
    const cache = Date.now();
    const [localResult, liveResult] = await Promise.allSettled([
      fetchJson(`data/fashion-report.json?v=${cache}`, 4500).then(normalizeLocalFashion),
      fetchJson(`${FASHION_SOURCE_URL}?v=${cache}`, 7500).then(extractFashionMaster)
    ]);
    const candidates = [embeddedFashionFallback];
    if (localResult.status === "fulfilled") candidates.push(localResult.value);
    if (liveResult.status === "fulfilled") candidates.push(liveResult.value);
    currentFashionData = candidates.sort((a, b) => candidateScore(b) - candidateScore(a))[0];
    const usedLive = liveResult.status === "fulfilled" && candidateScore(currentFashionData) === candidateScore(liveResult.value);
    renderFashion(currentFashionData, usedLive ? "live" : localResult.status === "fulfilled" ? "local" : "embedded");
    button.disabled = false;
    button.innerHTML = original;
    if (manual) showToast(usedLive ? "Fashion Report actualizado con la fuente en vivo." : "Fuente en vivo no disponible; se mantiene la última copia válida.");
  }

  function slotLabel(type) {
    return ({ Head: "Cabeza", Body: "Torso", Hands: "Manos", Legs: "Piernas", Feet: "Pies", Wrist: "Muñecas", Ear: "Orejas", Neck: "Cuello", Ring: "Anillo" })[type] || type;
  }

  function renderFashion(data, mode) {
    const sourceLabel = mode === "live" ? "Datos en vivo" : mode === "local" ? "Copia automática" : "Copia incluida";
    $("#fashionSourcePill").textContent = mode === "live" ? "EN VIVO" : "RESPALDO";
    $("#fashionThemeMini").textContent = data.theme;
    $("#fashionWeekNumber").textContent = `SEMANA ${data.week ?? "—"}`;
    $("#fashionDate").textContent = data.date ? dateFormat.format(new Date(`${data.date}T12:00:00Z`)) : "—";
    $("#fashionTheme").textContent = data.theme;
    $("#fashionLiveStatus").textContent = sourceLabel;
    $("#fashionUpdatedAt").textContent = data.updatedAt ? `Última copia: ${new Date(data.updatedAt).toLocaleString("es-ES")}` : "";
    const itemCount = (data.slots || []).reduce((sum, slot) => sum + (slot.items?.length || 0), 0);
    $("#fashionExplainer").textContent = itemCount
      ? `Hay ${itemCount} opciones conocidas repartidas entre las cuatro pistas. Abre la lista y prepara una combinación para llegar a 80 puntos.`
      : "Las pistas ya están publicadas. Las prendas exactas aún se están comprobando; esta pantalla las incorporará en cuanto la fuente semanal se actualice.";
    const wrap = $("#fashionSlots");
    wrap.innerHTML = "";
    (data.slots || []).forEach((slot) => {
      const card = document.createElement("article");
      card.className = "fashion-slot";
      const items = Array.isArray(slot.items) ? slot.items : [];
      const top = document.createElement("div");
      top.className = "fashion-slot-head";
      top.innerHTML = `<span class="fashion-slot-type">${slotLabel(slot.type)}</span><span class="fashion-slot-count">${items.length ? `${items.length} opciones` : "pendiente"}</span>`;
      const title = document.createElement("h3");
      title.textContent = slot.hint;
      card.append(top, title);
      if (items.length) {
        const list = document.createElement("ul");
        items.slice(0, 5).forEach((item) => { const li = document.createElement("li"); li.textContent = item; list.appendChild(li); });
        if (items.length > 5) { const li = document.createElement("li"); li.textContent = `y ${items.length - 5} opciones más`; list.appendChild(li); }
        card.appendChild(list);
      } else {
        const note = document.createElement("p");
        note.className = "fashion-slot-empty";
        note.textContent = "Soluciones en comprobación. Usa la pista como referencia y actualiza más tarde.";
        card.appendChild(note);
      }
      wrap.appendChild(card);
    });
  }

  function renderFashionChecklist() {
    const state = storageGet(weeklyKey("fashion"), {});
    const wrap = $("#fashionChecklist");
    wrap.innerHTML = "";
    fashionChecklistItems.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `fashion-check-item${state[item.id] ? " is-done" : ""}`;
      button.setAttribute("aria-pressed", state[item.id] ? "true" : "false");
      button.innerHTML = `<span class="check-box">${state[item.id] ? "✓" : ""}</span><span class="fashion-check-copy"><strong>${item.title}</strong><small>${item.detail}</small></span>`;
      button.addEventListener("click", () => {
        const next = storageGet(weeklyKey("fashion"), {});
        next[item.id] = !next[item.id];
        if (item.id === "score80" && next.score80) next.participated = true;
        if (item.id === "participated" && !next.participated) next.score80 = false;
        storageSet(weeklyKey("fashion"), next);
        renderFashionChecklist();
      });
      wrap.appendChild(button);
    });
    const done = fashionChecklistItems.filter((item) => state[item.id]).length;
    const reward = (state.participated ? 10000 : 0) + (state.score80 ? 50000 : 0);
    $("#fashionProgressBadge").textContent = `${done} / ${fashionChecklistItems.length}`;
    $("#fashionRewardEstimate").textContent = `${numberFormat.format(reward)} MGP`;
  }

  function copyFashion() {
    const lines = [`Fashion Report — Semana ${currentFashionData.week}`, `${currentFashionData.theme} (${currentFashionData.date})`, ""];
    currentFashionData.slots.forEach((slot) => {
      lines.push(`${slotLabel(slot.type)} — ${slot.hint}`);
      if (slot.items?.length) slot.items.forEach((item) => lines.push(`• ${item}`));
      else lines.push("• Soluciones aún en comprobación");
      lines.push("");
    });
    const text = lines.join("\n").trim();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast("Lista del Fashion Report copiada.")).catch(() => fallbackCopy(text));
    } else fallbackCopy(text);
  }

  function fallbackCopy(text) {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try { document.execCommand("copy"); showToast("Lista del Fashion Report copiada."); }
    catch { showToast("No se pudo copiar automáticamente."); }
    area.remove();
  }

  function renderGuideTab(tab) {
    const data = guideTabs[tab] || guideTabs.theme;
    const panel = $("#guide-panel");
    panel.setAttribute("aria-labelledby", `tab-${tab}`);
    panel.innerHTML = `<span class="guide-number">${data.number}</span><div><h3>${data.title}</h3><p>${data.text}</p></div>`;
    $$("[data-guide-tab]").forEach((button) => {
      const active = button.dataset.guideTab === tab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
      button.tabIndex = active ? 0 : -1;
    });
  }

  function bindFashion() {
    $("#refreshFashionButton").addEventListener("click", () => loadFashionReport(true));
    $("#copyFashionButton").addEventListener("click", copyFashion);
    $("#resetFashionChecklist").addEventListener("click", () => {
      storageSet(weeklyKey("fashion"), {});
      renderFashionChecklist();
      showToast("Intento de Fashion Report reiniciado.");
    });
    $$("[data-guide-tab]").forEach((button, index, buttons) => {
      button.addEventListener("click", () => renderGuideTab(button.dataset.guideTab));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const target = buttons[(index + direction + buttons.length) % buttons.length];
        renderGuideTab(target.dataset.guideTab);
        target.focus();
      });
    });
  }

  function updateClocks() {
    const now = new Date();
    const cycle = getCycle(now);
    const nextGate = new Date(Math.ceil((now.getTime() + 1000) / 1200000) * 1200000);
    $("#gateCountdown").textContent = formatDuration(nextGate - now);
    $("#gateLocalTime").textContent = `Empieza ${timeFormat.format(nextGate)} · cada 20 min`;
    $("#resetCountdown").textContent = formatDuration(cycle.nextReset - now, false);
    $("#resetLocalTime").textContent = `${timeFormat.format(cycle.nextReset)} · ${dateFormat.format(cycle.nextReset)}`;
    const end = new Date(cycle.nextReset.getTime() - 1);
    $("#weekRange").textContent = `${dateFormat.format(cycle.start)} — ${dateFormat.format(end)}`;
    const judgingOpen = now >= cycle.judging;
    const target = judgingOpen ? cycle.nextReset : cycle.judging;
    const stage = judgingOpen ? "EVALUACIÓN ABIERTA" : "PISTAS PUBLICADAS";
    $("#fashionStageMini").textContent = judgingOpen ? "Evaluación abierta" : "Fase de pistas";
    $("#fashionStageBadge").textContent = stage;
    $("#fashionCountdown").textContent = formatDuration(target - now);
    $("#fashionCountdownLabel").textContent = judgingOpen ? "hasta el reinicio semanal" : "hasta que abra la evaluación";
  }

  function bindGlobalButtons() {
    $("#resetQuickButton").addEventListener("click", resetQuickChecklist);
  }

  function init() {
    bindNavigation();
    bindMap();
    bindGoal();
    bindMgp();
    bindGames();
    bindDialog();
    bindFashion();
    bindGlobalButtons();
    renderQuickChecklist();
    selectZone("entrance");
    loadGoal();
    renderTimePlan(15);
    renderMethods();
    renderChallengeList("all");
    renderGames();
    renderFashion(embeddedFashionFallback, "embedded");
    renderFashionChecklist();
    renderGuideTab("theme");
    updateClocks();
    setInterval(updateClocks, 1000);
    loadFashionReport(false);
    const initialView = location.hash.slice(1);
    setView(VALID_VIEWS.has(initialView) ? initialView : "inicio", { updateHash: false, scroll: false, instant: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
