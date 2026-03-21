# ⚡ PACK-A-PUNCHLINER

**PACK-A-PUNCHLINER** è un generatore di parole/frasi con database personalizzabile, progettato per i cypher freestyle. Disponibile su browser desktop e mobile, con un'interfaccia ottimizzata per entrambi.

---

## 📱 Interfaccia Mobile

Su mobile il tool occupa l'intero schermo senza mai richiedere scroll:

- **Topbar** — mostra il titolo e il selettore del tema grafico
- **Area di generazione** — occupa tutto lo spazio disponibile tra topbar e bottombar; il testo generato si adatta automaticamente in dimensione per riempire lo spazio
- **Bottombar** — contiene il selettore quantità (−/+), il tasto **GENERA** e il tasto ☰ per aprire il drawer
- **Drawer** — pannello che sale dal basso con i filtri categoria, shuffle, e tutti i controlli del database

## 🖥 Interfaccia Desktop

Su desktop il layout è a colonne: la colonna principale contiene l'area di generazione e i controlli, la colonna laterale contiene i filtri e i pulsanti database.

---

## 🎨 Temi Grafici

Il tool include 4 temi selezionabili dal dropdown "TEMA:" nella topbar (mobile) o nell'header (desktop). Il tema scelto viene salvato e ripristinato automaticamente alle visite successive.

| Tema | Descrizione |
|---|---|
| **Switch** | Teal e rosso su sfondo antracite — default |
| **Cyberpunk** | Cyan e magenta su sfondo nero |
| **Retrowave** | Rosso e arancione su sfondo viola scuro |
| **Marvin** | Teal su sfondo bianco — alta leggibilità in ambienti luminosi |

---

## ⚙️ Generazione

- **Selettore Quantità** — estrai da 1 a 10 elementi contemporaneamente tramite i tasti −/+
- **GENERA** — estrae casualmente elementi dal database rispettando i filtri attivi; il testo generato alterna due colori del tema per distinguere facilmente le voci
- **Tasto SPAZIO** *(solo desktop)* — genera nuovi risultati senza usare il mouse

### Shuffle Logic (mazzo chiuso)
Il sistema garantisce varietà con una logica a "mazzo chiuso":
- Una voce non viene ripetuta finché tutte le altre del pool selezionato non sono state estratte almeno una volta
- **SHUFFLE** resetta e rimescola il mazzo attuale
- Qualsiasi modifica ai filtri resetta automaticamente il mazzo

---

## 🏷 Filtri Categoria

I tag sono selezionabili dal pannello filtri (colonna laterale su desktop, drawer su mobile):

- Quando un tag è attivo, la generazione è limitata alle voci che lo contengono
- È possibile attivare più tag contemporaneamente per estrazioni combinate
- Il contatore accanto a ogni tag mostra quante voci appartengono a quella categoria

---

## 🛠 Database Editor

Il pannello editor permette il controllo totale sui dati salvati nel `localStorage` del browser.

### Inserimento Massivo
- Inserisci decine di voci contemporaneamente nell'area di testo, una per riga
- Seleziona i tag da assegnare tramite i pulsanti rapidi, oppure inseriscili manualmente separati da virgola
- Le voci già presenti non vengono duplicate: se una voce esiste già, vengono aggiunti solo i tag nuovi

### Gestione Archivio
- **Ricerca testuale** e **filtri per tag** per trovare voci specifiche in database estesi
- **Editing inline** — clicca su una voce per modificarla direttamente
- **Rimuovi tag** cliccando sulla `×` accanto ad essi
- **Aggiungi tag** esistenti tramite il menu a tendina `+` direttamente in riga
- **Elimina** per la rimozione definitiva di singole voci
- Navigazione paginata per database grandi

---

## 💾 Backup e Importazione

- **Export** — esporta l'intero database in formato `.json`
- **Import** — carica un file `.json` precedentemente esportato; le voci vengono aggiunte a quelle esistenti, i duplicati vengono ignorati e i tag vengono unificati
- **Carica DB Default** — carica il database predefinito con 800+ voci. Richiede un server HTTP (funziona automaticamente su GitHub Pages; in locale usa Live Server o `python -m http.server`)

---

## 🌐 Deploy

Il tool è un singolo file `index.html` — basta caricarlo su qualsiasi hosting statico. Il database predefinito (`db-argomenti-v1.json`) deve trovarsi nella stessa cartella.

I dati del database personalizzato vengono salvati nel `localStorage` del browser: sono locali alla macchina e al browser utilizzato. Per trasferire il database tra dispositivi usa la funzione Export/Import.
