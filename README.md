# ⚡ PACK-A-PUNCHLINER

Applicazione web per la generazione di parole e frasi pensate per il freestyle.  
Consente di estrarre elementi casuali da un database personalizzabile, filtrare per categoria e gestire l'intero archivio direttamente nel browser.

---

## Generazione

<img width="426" height="61" alt="image" src="https://github.com/user-attachments/assets/07ea6d71-3907-4c02-a31d-50e57bef79e3" />

Seleziona il numero di voci da estrarre (da 1 a 10) e premi **GENERA**.  
Le voci vengono visualizzate a schermo con colori alternati per migliorarne la leggibilità.  
I testi si **adattano automaticamente** alle dimensioni del contenitore, massimizzando la leggibilità indipendentemente dal numero di voci estratte.

Nella versione desktop, il tasto **SPAZIO** consente di generare rapidamente nuovi risultati senza interagire con l'interfaccia.

### Logica a mazzo (senza ripetizioni)

Il sistema utilizza una logica a **mazzo chiuso** per garantire varietà e coerenza nelle estrazioni:

- Le voci disponibili (in base ai filtri attivi) vengono considerate come un *mazzo*.
- Ogni elemento estratto viene temporaneamente escluso dalle estrazioni successive.
- Una voce può essere nuovamente estratta solo dopo che tutte le altre del pool attivo sono state utilizzate almeno una volta.

Questo approccio evita ripetizioni premature e assicura una distribuzione uniforme nel tempo.

- **RIMESCOLA** resetta completamente il mazzo e ne rimescola l'ordine.
- Qualsiasi modifica ai filtri categoria ricostruisce automaticamente il mazzo in base al nuovo pool attivo.

---

## Filtri Categoria

<img width="410" height="124" alt="image" src="https://github.com/user-attachments/assets/beb9b2ff-9b20-4247-b4e1-fab01c55ee76" />

Ogni voce del database è associata a uno o più tag.

- Attivando un tag, la generazione viene limitata alle voci che lo contengono.
- È possibile attivare più tag contemporaneamente per combinare diversi insiemi di dati.
- I tag possono essere **rinominati** direttamente dal pannello archivio.
- I tag possono essere **archiviati** per nasconderli dai filtri principali senza eliminarli.
- L'ordine dei tag è **personalizzabile** e viene salvato automaticamente.

I filtri influenzano direttamente il mazzo di estrazione.

---

## Auto Timer

Il pannello **Auto Timer** consente di generare nuove voci automaticamente a intervalli regolari, senza premere manualmente il pulsante.

- Imposta la durata dell'intervallo in secondi (default: 5s, range: 1–300s).
- Premi **AVVIA** per iniziare: una barra di avanzamento mostra il tempo rimanente prima della prossima estrazione.
- Premi **FERMA** per interrompere il ciclo automatico.
- La durata viene salvata automaticamente e ripristinata ai successivi accessi.
- Su mobile la barra del timer è visibile in basso, sopra la barra di navigazione.
- Ogni generazione manuale (pulsante GENERA o tasto SPAZIO) resetta il countdown del timer.

---

## Database Editor

<img width="421" height="455" alt="image" src="https://github.com/user-attachments/assets/3b8f92f7-f29a-4f59-a868-5ff36b2dbe8f" />

Pannello dedicato alla gestione completa del database locale.

**Inserimento massivo**  
Consente di incollare più voci contemporaneamente (una per riga) e assegnare loro uno o più tag.  
Le voci già esistenti non vengono duplicate: eventuali nuovi tag vengono semplicemente aggiunti a quelle esistenti.  
Durante l'inserimento è disponibile una **selezione rapida dei tag esistenti** per velocizzare la categorizzazione.

**Tabella archivio**  
Permette di:

- Cercare voci per testo
- Filtrare per tag
- Modificare testo e tag di una voce (modale su desktop, schermata dedicata su mobile)
- Aggiungere o rimuovere tag da una voce
- Eliminare singole voci con possibilità di **annullare l'eliminazione** tramite toast

Il database è organizzato in pagine per mantenere alte le prestazioni anche con archivi di grandi dimensioni.

---

## Backup

<img width="419" height="176" alt="image" src="https://github.com/user-attachments/assets/01d547bf-8306-4a69-b4c3-c43dcc1d6ab7" />

- **Esporta**  
  Apre una modale che permette di selezionare i tag da includere nell'esportazione.  
  È possibile esportare l'intero archivio o solo le voci appartenenti a specifici tag.  
  Il file scaricato è in formato `.json`.

- **Importa**  
  Importa un file `.json` precedentemente salvato.  
  Le voci vengono unite a quelle esistenti, evitando duplicati e consolidando i tag.

- **Carica DB Default**  
  Sovrascrive il database attuale con quello predefinito (oltre 800 voci suddivise per categoria).  
  Mostra una modale di conferma prima di procedere, poiché l'operazione è irreversibile.  
  Al primo accesso (archivio vuoto), il database di default viene caricato automaticamente senza mostrare la modale.

- **Cancella Database**  
  Elimina definitivamente l'intero archivio locale.  
  Mostra una modale di conferma prima di procedere, poiché l'operazione è irreversibile.

---

## Temi

<img width="419" height="330" alt="image" src="https://github.com/user-attachments/assets/d0eafda3-fd5e-44c1-bf20-31f0bb003123" />

Sono disponibili 10 temi grafici selezionabili:

| Tema | Descrizione |
|---|---|
| **Elettrico** | Giallo neon su grigio scuro |
| **Switch** | Ciano e rosa acceso |
| **Cioccolato** | Toni caldi marroni |
| **Halloween** | Arancione su nero |
| **Ferrari** | Rosso su grigio scuro |
| **Cyberpunk** | Ciano e viola neon |
| **Retrowave** | Rosa e arancio su nero |
| **Pastello** | Lilla e azzurro morbido |
| **Giungla** | Verde naturale |
| **Caramella** | Rosa e giallo vivace |

La preferenza viene salvata automaticamente e applicata ai successivi accessi.

---

## Interfaccia

L'app è ottimizzata sia per **desktop** che per **mobile**:

- Su **desktop** il layout è a griglia con il display principale, i filtri e il pannello timer visibili simultaneamente. Il tasto SPAZIO genera nuove voci da qualsiasi punto della pagina.
- Su **mobile** l'interfaccia utilizza un **drawer scorrevole dal basso** (apribile anche con swipe verso il basso per chiuderlo) per accedere a timer, import/export e impostazioni. La modifica delle singole voci avviene in una schermata dedicata con animazione a slide.
