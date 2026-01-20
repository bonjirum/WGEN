# ⚡ PACK-A-PUNCHLINER

**PACK-A-PUNCHLINER** è un generatore di parole custom, con database personalizzabile, con utilizzo mirato per i cypher freestyle.

---

## 🚀 Funzionalità Dashboard

### Generazione
<img width="500" height="92" alt="image" src="https://github.com/user-attachments/assets/eedef478-c680-4fe3-8061-ecbbd458c528" />


- **Selettore Quantità:** Permette di estrarre da 1 a 10 elementi contemporaneamente.
- **Genera:** Estrae casualmente entità dal database rispettando i filtri attivi.
- **Supporto Tastiera:** Premendo il tasto <kbd>SPAZIO</kbd> è possibile generare nuovi risultati senza interruzioni.

### Gestione del Mazzo (Shuffle Logic)
Il sistema utilizza una logica a "mazzo chiuso" per garantire varietà:
- Una parola non verrà ripetuta finché tutte le altre parole del pool selezionato non sono state estratte.
- Il tasto **SHUFFLE** resetta il mazzo attuale e rimescola l'intero database.
- Qualsiasi modifica ai filtri resetta il mazzo attuale e rimescola l'intero database.

### Filtri Categoria
<img width="360" height="172" alt="image" src="https://github.com/user-attachments/assets/54bdb759-74da-4eeb-a3dc-842614fb15cb" />

- I tag sono selezionabili nella colonna laterale. 
- Quando un tag è attivo, la generazione è limitata esclusivamente alle voci che lo contengono.
- È possibile attivare più tag contemporaneamente per un'estrazione combinata.





---

## 🛠 Database Editor
<img width="362" height="78" alt="image" src="https://github.com/user-attachments/assets/d64da43c-7a9c-42be-a7c3-202b841a84e6" />

Il pannello Editor permette il controllo totale sui dati salvati nel `localStorage` del browser.

### Inserimento Massivo
<img width="1171" height="340" alt="image" src="https://github.com/user-attachments/assets/e5843d0e-8f61-49cf-b6b5-d18fb43c1a5e" />

- **Area di Testo:** Inserisci decine di voci contemporaneamente (una per riga).
- **Tag:** Seleziona i tag esistenti tramite i pulsanti rapidi per assegnarli velocemente alle nuove voci, oppure inseriscili manualmente nel box di testo dedicato.

### Gestione Archivio (Tabella)
<img width="1129" height="404" alt="image" src="https://github.com/user-attachments/assets/3f3b89ab-c1f1-42da-858a-98665a480857" />

- **Ricerca Intelligente:** Barra di ricerca testuale e filtri per tag per trovare voci specifiche in database estesi.
- **Editing Dinamico:** - Rimuovi tag cliccando sulla `×` accanto ad essi.
  - Aggiungi nuovi tag esistenti tramite il menu a tendina `+` direttamente in riga.
- **Eliminazione:** Rimozione definitiva di singole voci.

---

## 💾 Backup e Importazione
<img width="332" height="116" alt="image" src="https://github.com/user-attachments/assets/823b1f1c-1dbb-4562-af2a-30762a25e1ef" />

- **Export:** Esporta il tuo intero database personalizzato in formato `.json`.
- **Import:** Carica file backup precedentemente creati.
- **Default DB:** Ripristina il database di fabbrica (richiede il file `db-argomenti-v1.json`).

---
