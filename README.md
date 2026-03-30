# ⚡ PACK-A-PUNCHLINER

Applicazione web per la generazione di parole e frasi pensate per il cypher freestyle.  
Consente di estrarre elementi casuali da un database personalizzabile, filtrare per categoria e gestire l’intero archivio direttamente nel browser.

---

## Generazione

<img width="426" height="61" alt="image" src="https://github.com/user-attachments/assets/07ea6d71-3907-4c02-a31d-50e57bef79e3" />


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

<img width="410" height="124" alt="image" src="https://github.com/user-attachments/assets/beb9b2ff-9b20-4247-b4e1-fab01c55ee76" />


Ogni voce del database è associata a uno o più tag.

- Attivando un tag, la generazione viene limitata alle voci che lo contengono.
- È possibile attivare più tag contemporaneamente per combinare diversi insiemi di dati.

I filtri influenzano direttamente il mazzo di estrazione.

---

## Database Editor

<img width="421" height="455" alt="image" src="https://github.com/user-attachments/assets/3b8f92f7-f29a-4f59-a868-5ff36b2dbe8f" />


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

<img width="419" height="176" alt="image" src="https://github.com/user-attachments/assets/01d547bf-8306-4a69-b4c3-c43dcc1d6ab7" />

- **Export**  
  Esporta l’intero database in formato `.json`

- **Import**  
  Importa un file `.json` precedentemente salvato  
  Le voci vengono unite a quelle esistenti, evitando duplicati e consolidando i tag

- **Carica DB Default**  
  Ripristina il database predefinito (oltre 800 voci suddivise per categoria)

---

## Temi

<img width="419" height="330" alt="image" src="https://github.com/user-attachments/assets/d0eafda3-fd5e-44c1-bf20-31f0bb003123" />


Sono disponibili diversi temi grafici selezionabili.
La preferenza viene salvata automaticamente e applicata ai successivi accessi.
