# ⚡ PACK-A-PUNCHLINER

Generatore di parole e frasi per cypher freestyle. Estrai elementi casuali da un database personalizzabile, filtra per categoria e gestisci il tuo archivio direttamente nel browser.

---

## Generazione

Seleziona quante voci vuoi estrarre (1–10) e premi **GENERA**. Le voci vengono visualizzate a schermo alternando due colori per distinguerle facilmente.

Il tasto **SPAZIO** genera nuovi risultati senza usare il mouse.

### Logica a mazzo chiuso
Una voce non viene ripetuta finché tutte le altre del pool attivo non sono state estratte almeno una volta. **SHUFFLE** resetta e rimescola il mazzo in qualsiasi momento. Anche modificare i filtri resetta il mazzo automaticamente.

---

## Filtri Categoria

Ogni voce del database appartiene a uno o più tag. Attivando un tag, la generazione si limita alle voci che lo contengono. Più tag attivi contemporaneamente producono un'estrazione combinata.

---

## Database Editor

Pannello per gestire le voci salvate nel browser.

**Inserimento massivo** — incolla più voci nell'area di testo (una per riga) e assegna loro i tag. Le voci già presenti non vengono duplicate: se una voce esiste già, vengono aggiunti solo i tag nuovi.

**Tabella archivio** — cerca per testo o filtra per tag. Modifica le voci direttamente in riga, aggiungi o rimuovi tag, elimina singole voci. Il database è paginato per gestire archivi estesi.

---

## Backup

- **Export** — scarica l'intero database come file `.json`
- **Import** — carica un file `.json` precedentemente esportato; le voci vengono unite a quelle esistenti, i duplicati ignorati e i tag unificati
- **Carica DB Default** — ripristina il database predefinito con 800+ voci suddivise per categoria

---

## Temi

Quattro temi grafici selezionabili: **Switch**, **Cyberpunk**, **Retrowave**, **Marvin**. La scelta viene salvata automaticamente.
