import { useMemo, useRef, useState } from "react";
import { Button, Card, CardHeader, EmptyState, Icon, PageHeader, Select, useToast } from "../components/ui";
import { useWorkspace } from "../context/WorkspaceContext";
import {
  IMPORT_FIELDS,
  IMPORT_TEMPLATES,
  buildImportPreview,
  createAutoMapping,
  downloadTextFile,
  parseDelimitedText,
  petsToCsv,
} from "../utils/importExport";

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Unable to read file."));
    reader.readAsText(file);
  });
}

function createBackupPayload(pets) {
  return {
    app: "PetPassport",
    version: "beta-data-center-v1",
    exportedAt: new Date().toISOString(),
    count: pets.length,
    pets,
  };
}

function getStats(previewRows) {
  return {
    total: previewRows.length,
    valid: previewRows.filter((row) => row.valid && !row.duplicate).length,
    duplicates: previewRows.filter((row) => row.duplicate).length,
    errors: previewRows.filter((row) => !row.valid).length,
  };
}

function templateById(sourceId) {
  return IMPORT_TEMPLATES.find((template) => template.id === sourceId) || IMPORT_TEMPLATES[0];
}

export default function DataCenter({ pets = [], addPet, setPage }) {
  const { workspace } = useWorkspace();
  const { showToast } = useToast();
  const importInputRef = useRef(null);
  const restoreInputRef = useRef(null);
  const [sourceId, setSourceId] = useState("morphmarket");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const [restorePreview, setRestorePreview] = useState(null);

  const selectedTemplate = templateById(sourceId);
  const previewRows = useMemo(() => buildImportPreview(rows, mapping, pets, sourceId), [rows, mapping, pets, sourceId]);
  const stats = useMemo(() => getStats(previewRows), [previewRows]);
  const importableRows = previewRows.filter((row) => row.valid && !row.duplicate);

  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await readFileAsText(file);
      const parsed = parseDelimitedText(text);
      const autoMapping = createAutoMapping(parsed.headers);

      setFileName(file.name);
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setMapping(autoMapping);
      setRestorePreview(null);

      showToast({
        variant: "success",
        title: "File ready for preview",
        message: `${parsed.rows.length} rows found. Review mapping before importing.`,
      });
    } catch (error) {
      console.error(error);
      showToast({ variant: "error", title: "Import failed", message: error.message || "Could not read that file." });
    } finally {
      event.target.value = "";
    }
  }

  async function handleRestoreFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await readFileAsText(file);
      const parsed = JSON.parse(text);
      const restoredPets = Array.isArray(parsed) ? parsed : parsed.pets;

      if (!Array.isArray(restoredPets)) throw new Error("That backup does not contain a pets array.");

      setRestorePreview({ fileName: file.name, pets: restoredPets });
      setHeaders([]);
      setRows([]);
      setMapping({});

      showToast({
        variant: "success",
        title: "Backup preview ready",
        message: `${restoredPets.length} animals found. Review before importing.`,
      });
    } catch (error) {
      console.error(error);
      showToast({ variant: "error", title: "Restore preview failed", message: error.message || "Could not read backup." });
    } finally {
      event.target.value = "";
    }
  }

  async function handleBulkImport() {
    if (!addPet) return;
    if (importableRows.length === 0) {
      showToast({ variant: "error", title: "Nothing ready to import", message: "Fix errors or remove duplicates first." });
      return;
    }

    setImporting(true);
    let imported = 0;

    try {
      for (const row of importableRows) {
        await addPet(row.pet);
        imported += 1;
      }

      showToast({
        variant: "success",
        title: "Collection imported",
        message: `${imported} animals were added to PetPassport.`,
      });
      setHeaders([]);
      setRows([]);
      setMapping({});
      setFileName("");
    } catch (error) {
      console.error(error);
      showToast({
        variant: "error",
        title: "Import stopped",
        message: `${imported} animals imported before the error: ${error.message || "Unknown error"}`,
      });
    } finally {
      setImporting(false);
    }
  }

  async function handleRestoreImport() {
    if (!restorePreview?.pets?.length) return;
    setImporting(true);
    let imported = 0;

    try {
      for (const pet of restorePreview.pets) {
        await addPet({ ...pet, name: pet.name || "Imported animal", species: pet.species || "Unknown" });
        imported += 1;
      }

      showToast({ variant: "success", title: "Backup imported", message: `${imported} animals were restored as new Passports.` });
      setRestorePreview(null);
    } catch (error) {
      console.error(error);
      showToast({ variant: "error", title: "Restore stopped", message: `${imported} animals restored before the error.` });
    } finally {
      setImporting(false);
    }
  }

  function updateMapping(header, value) {
    setMapping((current) => ({ ...current, [header]: value }));
  }

  function downloadBackup() {
    const payload = createBackupPayload(pets);
    downloadTextFile("petpassport-backup.json", JSON.stringify(payload, null, 2), "application/json");
    showToast({ variant: "success", title: "Backup downloaded", message: "Your collection JSON backup was created." });
  }

  function downloadCsv() {
    downloadTextFile("petpassport-collection.csv", petsToCsv(pets), "text/csv");
    showToast({ variant: "success", title: "CSV exported", message: "Your collection CSV was created." });
  }

  function printCollection() {
    window.print();
  }

  return (
    <div className="feed dataCenterPage">
      <PageHeader
        eyebrow={`${workspace.shortLabel} module`}
        title="Data Center"
        description="Import collections, preview spreadsheet data, detect duplicates, export backups, and protect Passport history."
        icon={<Icon name="database" size={22} />}
      />

      <section className="moduleHero dataCenterHero" style={{ "--workspace-card-accent": workspace.accent }}>
        <div>
          <p className="section-eyebrow">Import and migration hub</p>
          <h1>Bring your collection into PetPassport</h1>
          <p>{selectedTemplate.description}</p>
        </div>
        <div className="moduleHeroActions">
          <Button leftIcon={<Icon name="upload" size={16} />} onClick={() => importInputRef.current?.click()}>
            Upload CSV/export
          </Button>
          <Button variant="outline" leftIcon={<Icon name="download" size={16} />} onClick={downloadBackup}>
            Download backup
          </Button>
        </div>
      </section>

      <input ref={importInputRef} type="file" accept=".csv,.tsv,.txt" onChange={handleImportFile} hidden />
      <input ref={restoreInputRef} type="file" accept=".json" onChange={handleRestoreFile} hidden />

      <div className="moduleSectionGrid dataCenterActionGrid">
        <Card className="dataCenterActionCard">
          <CardHeader
            icon={<Icon name="upload" size={18} />}
            title="MorphMarket file import"
            description="Upload official CSV/export files, map columns, preview animals, and detect duplicates before saving."
          />
          <Button fullWidth onClick={() => { setSourceId("morphmarket"); importInputRef.current?.click(); }}>
            Import MorphMarket CSV
          </Button>
        </Card>
        <Card className="dataCenterActionCard">
          <CardHeader
            icon={<Icon name="file" size={18} />}
            title="Spreadsheet migration"
            description="Support breeder inventory sheets, rescue intake sheets, and generic animal CSVs with mapping templates."
          />
          <Button fullWidth variant="outline" onClick={() => { setSourceId("generic"); importInputRef.current?.click(); }}>
            Import spreadsheet CSV
          </Button>
        </Card>
        <Card className="dataCenterActionCard">
          <CardHeader
            icon={<Icon name="database" size={18} />}
            title="Backup and restore"
            description="Export JSON backups, restore local files, merge records, and preserve existing Passports safely."
          />
          <div className="dataCenterButtonStack">
            <Button fullWidth variant="outline" onClick={downloadBackup}>Export JSON backup</Button>
            <Button fullWidth variant="ghost" onClick={() => restoreInputRef.current?.click()}>Preview restore file</Button>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          icon={<Icon name="settings" size={18} />}
          title="Import source and mapping"
          description="Choose the kind of file, then confirm which spreadsheet columns become PetPassport fields."
        />
        <div className="dataCenterToolbar">
          <label>
            <span>Source template</span>
            <Select value={sourceId} onChange={(event) => setSourceId(event.target.value)}>
              {IMPORT_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>{template.label}</option>
              ))}
            </Select>
          </label>
          <div className="dataCenterToolbarActions">
            <Button variant="outline" leftIcon={<Icon name="upload" size={16} />} onClick={() => importInputRef.current?.click()}>
              Choose file
            </Button>
            <Button variant="ghost" onClick={() => setMapping(createAutoMapping(headers))} disabled={headers.length === 0}>
              Auto-map columns
            </Button>
          </div>
        </div>

        {fileName && <p className="dataCenterFileName">Previewing: <strong>{fileName}</strong></p>}

        {headers.length > 0 ? (
          <div className="mappingGrid">
            {headers.map((header) => (
              <label key={header} className="mappingField">
                <span>{header}</span>
                <Select value={mapping[header] || "ignore"} onChange={(event) => updateMapping(header, event.target.value)}>
                  {IMPORT_FIELDS.map((field) => (
                    <option key={field.key} value={field.key}>{field.label}</option>
                  ))}
                </Select>
              </label>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Icon name="upload" size={24} />}
            title="No import file selected"
            description="Upload a CSV, TSV, or exported spreadsheet file. For Excel files, save or export as CSV first."
          />
        )}
      </Card>

      {previewRows.length > 0 && (
        <Card>
          <CardHeader
            icon={<Icon name="search" size={18} />}
            title="Import preview"
            description="Review animals before saving. Duplicates are skipped unless we later add merge/update modes."
          />
          <div className="importStatsGrid">
            <div><strong>{stats.total}</strong><span>Total rows</span></div>
            <div><strong>{stats.valid}</strong><span>Ready to import</span></div>
            <div><strong>{stats.duplicates}</strong><span>Possible duplicates</span></div>
            <div><strong>{stats.errors}</strong><span>Needs fixing</span></div>
          </div>
          <div className="dataCenterTableWrap">
            <table className="dataCenterTable">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Name</th>
                  <th>Species</th>
                  <th>Morph</th>
                  <th>Sex</th>
                  <th>Status</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.slice(0, 50).map((row) => (
                  <tr key={row.id} className={!row.valid ? "is-error" : row.duplicate ? "is-warning" : "is-ready"}>
                    <td>{row.sourceRow}</td>
                    <td>{row.pet.name || "—"}</td>
                    <td>{row.pet.species || "—"}</td>
                    <td>{row.pet.morph || "—"}</td>
                    <td>{row.pet.sex || "—"}</td>
                    <td>{row.pet.status || "—"}</td>
                    <td>{!row.valid ? row.errors.join(", ") : row.duplicate ? row.warnings.join(", ") : "Ready"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {previewRows.length > 50 && <p className="dataCenterFileName">Showing first 50 rows for preview.</p>}
          <div className="dataCenterFooterActions">
            <Button loading={importing} disabled={importableRows.length === 0} onClick={handleBulkImport} leftIcon={<Icon name="check" size={16} />}>
              Import {importableRows.length} ready animals
            </Button>
            <Button variant="outline" onClick={() => { setRows([]); setHeaders([]); setMapping({}); setFileName(""); }}>
              Clear preview
            </Button>
          </div>
        </Card>
      )}

      {restorePreview && (
        <Card>
          <CardHeader
            icon={<Icon name="database" size={18} />}
            title="Backup restore preview"
            description="This beta restore creates new Passports from the backup. Merge/replace modes come later."
          />
          <div className="importStatsGrid">
            <div><strong>{restorePreview.pets.length}</strong><span>Animals found</span></div>
            <div><strong>{pets.length}</strong><span>Existing animals</span></div>
          </div>
          <p className="dataCenterFileName">Previewing: <strong>{restorePreview.fileName}</strong></p>
          <div className="dataCenterFooterActions">
            <Button loading={importing} onClick={handleRestoreImport}>Import backup as new Passports</Button>
            <Button variant="outline" onClick={() => setRestorePreview(null)}>Cancel restore</Button>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader
          icon={<Icon name="download" size={18} />}
          title="Exports and reporting"
          description="Use these for beta backups, spreadsheets, and simple printable collection reports."
        />
        <div className="dataCenterFooterActions">
          <Button variant="outline" onClick={downloadCsv}>Export collection CSV</Button>
          <Button variant="outline" onClick={downloadBackup}>Export JSON backup</Button>
          <Button variant="ghost" onClick={printCollection}>Print / Save as PDF</Button>
          <Button variant="ghost" onClick={() => setPage?.("Pets")}>Back to collection</Button>
        </div>
      </Card>
    </div>
  );
}
