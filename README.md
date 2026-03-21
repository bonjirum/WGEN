# ⚡ PACK-A-PUNCHLINER

Generatore di parole e frasi per cypher freestyle. Estrai elementi casuali da un database personalizzabile, filtra per categoria e gestisci il tuo archivio direttamente nel browser.

---

## Generazione

<img width="422" height="65" alt="image" src="https://github.com/user-attachments/assets/211faa75-3a02-4860-aa3b-33bdfcbf148b" />

Seleziona quante voci vuoi estrarre (1–10) e premi **GENERA**. Le voci vengono visualizzate a schermo alternando due colori per distinguerle facilmente.

Il tasto **SPAZIO** nella versione desktop genera nuovi risultati senza cliccare su GENERA.

### Logica a mazzo chiuso
Una voce non viene ripetuta finché tutte le altre del pool attivo non sono state estratte almeno una volta. **SHUFFLE** resetta e rimescola il mazzo in qualsiasi momento. Anche modificare i filtri resetta il mazzo automaticamente.

---

## Filtri Categoria

<img width="423" height="414" alt="image" src="https://github.com/user-attachments/assets/e91498ac-102c-4dce-a5cb-7a8d9fd0e7cd" />

Ogni voce del database appartiene a uno o più tag. Attivando un tag, la generazione si limita alle voci che lo contengono. Più tag attivi contemporaneamente producono un'estrazione combinata.

---

## Database Editor

![databaseeditor](https://github.com/user-attachments/assets/8831ace4-c62f-4ba4-8f6a-fe4be1f8fb0f)

Pannello per gestire le voci salvate nel browser.

**Inserimento massivo** — incolla più voci nell'area di testo (una per riga) e assegna loro i tag. Le voci già presenti non vengono duplicate: se una voce esiste già, vengono aggiunti solo i tag nuovi.

**Tabella archivio** — cerca per testo o filtra per tag. Modifica le voci direttamente in riga, aggiungi o rimuovi tag, elimina singole voci. Il database è paginato per gestire archivi estesi.

---

## Backup

<img width="425" height="418" alt="image" src="https://github.com/user-attachments/assets/6d931db7-af3e-42c2-998e-6d49942cda95" />

- **Export** — scarica l'intero database come file `.json`
- **Import** — carica un file `.json` precedentemente esportato; le voci vengono unite a quelle esistenti, i duplicati ignorati e i tag unificati
- **Carica DB Default** — ripristina il database predefinito con 800+ voci suddivise per categoria

---

## Temi

<img width="421" height="172" alt="image" src="https://github.com/user-attachments/assets/d36b40a3-9afa-44a2-90a2-22ef9e7c7e20" />

Quattro temi grafici selezionabili: **Switch**, **Cyberpunk**, **Retrowave**, **Marvin**. La scelta viene salvata automaticamente.
