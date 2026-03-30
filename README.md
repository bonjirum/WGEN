# ⚡ PACK-A-PUNCHLINER

Applicazione web per la generazione di parole e frasi pensate per il cypher freestyle.  
Consente di estrarre elementi casuali da un database personalizzabile, filtrare per categoria e gestire l’intero archivio direttamente nel browser.

---

## Generazione

<img width="422" height="65" alt="image" src="https://github.com/user-attachments/assets/211faa75-3a02-4860-aa3b-33bdfcbf148b" />

Seleziona il numero di voci da estrarre (da 1 a 10) e premi **GENERA**.  
Le voci vengono visualizzate a schermo con colori alternati per migliorarne la leggibilità.

Nella versione desktop, il tasto **SPAZIO** consente di generare rapidamente nuovi risultati senza interagire con l’interfaccia.

### Logica a mazzo (senza ripetizioni)

Il sistema utilizza una logica a **mazzo chiuso** per garantire varietà e coerenza nelle estrazioni:

- Le voci disponibili (in base ai filtri attivi) vengono considerate come un *mazzo*.
- Ogni elemento estratto viene temporaneamente escluso dalle estrazioni successive.
- Una voce può essere nuovamente estratta solo dopo che tutte le altre del pool attivo sono state utilizzate almeno una volta.

Questo approccio evita ripetizioni premature e assicura una distribuzione uniforme nel tempo.

- **SHUFFLE** resetta completamente il mazzo e ne rimescola l’ordine.
- Qualsiasi modifica ai filtri categoria ricostruisce automaticamente il mazzo in base al nuovo pool attivo.

---

## Filtri Categoria

<img width="423" height="414" alt="image" src="https://github.com/user-attachments/assets/e91498ac-102c-4dce-a5cb-7a8d9fd0e7cd" />

Ogni voce del database è associata a uno o più tag.

- Attivando un tag, la generazione viene limitata alle voci che lo contengono.
- È possibile attivare più tag contemporaneamente per combinare diversi insiemi di dati.

I filtri influenzano direttamente il mazzo di estrazione.

---

## Database Editor

![databaseeditor](https://github.com/user-attachments/assets/8831ace4-c62f-4ba4-8f6a-fe4be1f8fb0f)

Pannello dedicato alla gestione completa del database locale.

**Inserimento massivo**  
Consente di incollare più voci contemporaneamente (una per riga) e assegnare loro uno o più tag.  
Le voci già esistenti non vengono duplicate: eventuali nuovi tag vengono semplicemente aggiunti.

**Tabella archivio**  
Permette di:

- Cercare voci per testo
- Filtrare per tag
- Modificare direttamente i contenuti
- Aggiungere o rimuovere tag
- Eliminare singole voci

Il database è organizzato in pagine per mantenere alte le prestazioni anche con archivi di grandi dimensioni.

---

## Backup

<img width="425" height="418" alt="image" src="https://github.com/user-attachments/assets/6d931db7-af3e-42c2-998e-6d49942cda95" />

- **Export**  
  Esporta l’intero database in formato `.json`

- **Import**  
  Importa un file `.json` precedentemente salvato  
  Le voci vengono unite a quelle esistenti, evitando duplicati e consolidando i tag

- **Carica DB Default**  
  Ripristina il database predefinito (oltre 800 voci suddivise per categoria)

---

## Temi

<img width="421" height="172" alt="image" src="https://github.com/user-attachments/assets/d36b40a3-9afa-44a2-90a2-22ef9e7c7e20" />

Sono disponibili diversi temi grafici selezionabili.
La preferenza viene salvata automaticamente e applicata ai successivi accessi.
