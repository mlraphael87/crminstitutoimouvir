import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  CalendarDays,
  Check,
  ClipboardList,
  Download,
  FileText,
  FolderOpen,
  Home,
  MessageCircle,
  Package,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
  Upload,
  Users
} from "lucide-react";
import "./styles.css";
import { initialData, loadData, loadRemoteData, saveData, setAccessCode } from "./storage";

const stages = [
  "Lead",
  "Agendado",
  "Confirmado",
  "Teste realizado",
  "Pedido",
  "Faturado",
  "Entregue"
];

const views = [
  ["dashboard", "Dashboard", Activity],
  ["patients", "Pacientes", Users],
  ["calendar", "Agenda", CalendarDays],
  ["orders", "Pedidos", ClipboardList],
  ["documents", "Documentos", FileText],
  ["settings", "Cadastros", Settings]
];

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function phoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function whatsappHref(phone, text) {
  const digits = phoneDigits(phone);
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function App() {
  const [data, setData] = useState(loadData);
  const [view, setView] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    loadRemoteData().then((remote) => {
      if (remote?.authRequired) {
        setLocked(true);
        return;
      }
      if (remote) {
        setData(remote);
        saveData(remote, { remote: false });
      }
    });
  }, []);

  function commit(next) {
    setData(next);
    saveData(next);
  }

  async function unlock(code) {
    setAccessCode(code);
    const remote = await loadRemoteData();
    if (remote?.authRequired) {
      setLocked(true);
      return;
    }
    if (remote) setData(remote);
    setLocked(false);
  }

  const filteredPatients = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return data.patients;
    return data.patients.filter((patient) =>
      [patient.name, patient.cpf, patient.phone, patient.city, patient.status]
        .filter(Boolean)
        .some((item) => item.toLowerCase().includes(term))
    );
  }, [data.patients, query]);

  if (locked) {
    return <AccessScreen onSubmit={unlock} />;
  }

  function updateCollection(key, updater) {
    commit({ ...data, [key]: updater(data[key]) });
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <img src="/logo-imouvir-header.png" alt="IMOUVIR" />
          <div>
            <strong>CRMINSTITUTO</strong>
            <span>Gestão auditiva</span>
          </div>
        </div>
        <nav>
          {views.map(([id, label, Icon]) => (
            <button className={view === id ? "active" : ""} key={id} onClick={() => setView(id)}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <strong>Paulo Leite</strong>
          <span>Controle operacional</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p>Instituto Maçônico Ouvir - IMOUVIR</p>
            <h1>{views.find(([id]) => id === view)?.[1]}</h1>
          </div>
          <label className="search">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar paciente, CPF, cidade ou status" />
          </label>
        </header>

        {view === "dashboard" && <Dashboard data={data} setView={setView} />}
        {view === "patients" && <Patients data={data} patients={filteredPatients} updateCollection={updateCollection} />}
        {view === "calendar" && <CalendarView data={data} updateCollection={updateCollection} />}
        {view === "orders" && <Orders data={data} updateCollection={updateCollection} commit={commit} />}
        {view === "documents" && <Documents data={data} updateCollection={updateCollection} />}
        {view === "settings" && <SettingsView data={data} updateCollection={updateCollection} commit={commit} />}
      </main>
    </div>
  );
}

function AccessScreen({ onSubmit }) {
  const [code, setCode] = useState("");
  return (
    <main className="access-screen">
      <section className="access-panel">
        <img src="/logo-imouvir-header.png" alt="IMOUVIR" />
        <h1>CRMINSTITUTO</h1>
        <p>Acesso restrito à operação IMOUVIR.</p>
        <form onSubmit={(event) => { event.preventDefault(); onSubmit(code); }}>
          <label>Código de acesso<input value={code} onChange={(event) => setCode(event.target.value)} type="password" autoFocus required /></label>
          <button className="primary">Entrar</button>
        </form>
      </section>
    </main>
  );
}

function Dashboard({ data, setView }) {
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 1);
  const tomorrow = nextDay.toISOString().slice(0, 10);
  const confirmations = data.appointments.filter((item) => item.startsAt.slice(0, 10) === tomorrow && !item.confirmed);
  const totalPipeline = data.orders.reduce((sum, order) => sum + order.items.reduce((acc, item) => acc + (item.bonus ? 0 : item.quantity * item.unitPrice), 0), 0);
  const openOrders = data.orders.filter((order) => !["Entregue", "Cancelado"].includes(order.status));

  return (
    <section className="stack">
      <div className="metric-grid">
        <Metric label="Pacientes ativos" value={data.patients.length} detail="histórico e anexos centralizados" />
        <Metric label="Confirmar amanhã" value={confirmations.length} detail="links diretos para WhatsApp" />
        <Metric label="Pedidos em aberto" value={openOrders.length} detail="faturamento, envio e retorno" />
        <Metric label="Valor em pedidos" value={money.format(totalPipeline)} detail="sem itens bonificados" />
      </div>
      <div className="content-grid two">
        <Panel title="Agenda de confirmação">
          {confirmations.length === 0 ? <Empty text="Nenhum atendimento pendente para amanhã." /> : confirmations.map((appointment) => {
            const patient = data.patients.find((item) => item.id === appointment.patientId);
            return (
              <div className="row-card" key={appointment.id}>
                <div>
                  <strong>{patient?.name}</strong>
                  <span>{appointment.startsAt.replace("T", " ")} - {appointment.type}</span>
                </div>
                <a className="icon-link" href={whatsappHref(patient?.phone, `Olá, ${patient?.name}. Passando para confirmar seu atendimento IMOUVIR em ${new Date(appointment.startsAt).toLocaleString("pt-BR")}. Podemos confirmar sua presença?`)} target="_blank" rel="noreferrer">
                  <MessageCircle size={18} /> Confirmar
                </a>
              </div>
            );
          })}
        </Panel>
        <Panel title="Funil de processos">
          <div className="pipeline">
            {stages.map((stage) => {
              const count = data.patients.filter((patient) => patient.status === stage).length;
              return (
                <button key={stage} onClick={() => setView("patients")}>
                  <span>{count}</span>
                  {stage}
                </button>
              );
            })}
          </div>
        </Panel>
      </div>
      <Panel title="Pedidos recentes">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Pedido</th><th>Paciente</th><th>Status</th><th>NF</th><th>Total</th></tr></thead>
            <tbody>
              {data.orders.slice(0, 8).map((order) => {
                const patient = data.patients.find((item) => item.id === order.patientId);
                const total = order.items.reduce((sum, item) => sum + (item.bonus ? 0 : item.quantity * item.unitPrice), 0);
                return <tr key={order.id}><td>{order.orderNumber}</td><td>{patient?.name}</td><td><Badge>{order.status}</Badge></td><td>{order.invoiceNumber || "Aguardando"}</td><td>{money.format(total)}</td></tr>;
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  );
}

function Patients({ data, patients, updateCollection }) {
  const blank = { name: "", cpf: "", birthDate: "", phone: "", city: "Uberlândia", address: "", status: "Lead", source: "WhatsApp", notes: "" };
  const [form, setForm] = useState(blank);

  function submit(event) {
    event.preventDefault();
    const patient = { ...form, id: uid("pac"), createdAt: new Date().toISOString() };
    updateCollection("patients", (items) => [patient, ...items]);
    setForm(blank);
  }

  function setStatus(id, status) {
    updateCollection("patients", (items) => items.map((item) => item.id === id ? { ...item, status } : item));
  }

  return (
    <section className="content-grid form-left">
      <Panel title="Novo paciente">
        <form className="form" onSubmit={submit}>
          <Input label="Nome completo" value={form.name} onChange={(name) => setForm({ ...form, name })} required />
          <Input label="CPF" value={form.cpf} onChange={(cpf) => setForm({ ...form, cpf })} />
          <Input label="Data de nascimento" type="date" value={form.birthDate} onChange={(birthDate) => setForm({ ...form, birthDate })} />
          <Input label="Telefone WhatsApp" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} required />
          <Input label="Cidade" value={form.city} onChange={(city) => setForm({ ...form, city })} required />
          <Input label="Endereço" value={form.address} onChange={(address) => setForm({ ...form, address })} />
          <Select label="Status" value={form.status} onChange={(status) => setForm({ ...form, status })} options={stages} />
          <Textarea label="Observações" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} />
          <button className="primary"><Plus size={18} /> Cadastrar paciente</button>
        </form>
      </Panel>
      <Panel title="Pacientes">
        <div className="cards-list">
          {patients.map((patient) => (
            <article className="patient-card" key={patient.id}>
              <div>
                <strong>{patient.name}</strong>
                <span>{patient.city} - {patient.phone}</span>
                <p>{patient.notes}</p>
              </div>
              <div className="card-actions">
                <select value={patient.status} onChange={(event) => setStatus(patient.id, event.target.value)}>
                  {stages.map((stage) => <option key={stage}>{stage}</option>)}
                </select>
                <a className="icon-link" href={whatsappHref(patient.phone, `Olá, ${patient.name}. Aqui é da IMOUVIR. Podemos falar sobre seu atendimento auditivo?`)} target="_blank" rel="noreferrer">
                  <MessageCircle size={17} /> WhatsApp
                </a>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function CalendarView({ data, updateCollection }) {
  const [date, setDate] = useState(todayIso());
  const [form, setForm] = useState({ patientId: data.patients[0]?.id || "", startsAt: `${todayIso()}T09:00`, type: "Teste inicial", audiologist: "Fonoaudiólogo", unitId: data.units[0]?.id || "", notes: "" });
  const month = date.slice(0, 7);
  const appointments = data.appointments.filter((item) => item.startsAt.startsWith(month)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  function submit(event) {
    event.preventDefault();
    updateCollection("appointments", (items) => [{ ...form, id: uid("age"), confirmed: false }, ...items]);
  }

  function toggleConfirmed(id) {
    updateCollection("appointments", (items) => items.map((item) => item.id === id ? { ...item, confirmed: !item.confirmed } : item));
  }

  return (
    <section className="content-grid form-left">
      <Panel title="Agendar atendimento">
        <form className="form" onSubmit={submit}>
          <Select label="Paciente" value={form.patientId} onChange={(patientId) => setForm({ ...form, patientId })} options={data.patients.map((p) => [p.id, p.name])} />
          <Input label="Data e hora" type="datetime-local" value={form.startsAt} onChange={(startsAt) => setForm({ ...form, startsAt })} required />
          <Select label="Tipo" value={form.type} onChange={(type) => setForm({ ...form, type })} options={["Teste inicial", "Retorno adaptação", "Entrega aparelho", "Ajuste", "Pós-venda"]} />
          <Input label="Fonoaudiólogo" value={form.audiologist} onChange={(audiologist) => setForm({ ...form, audiologist })} />
          <Select label="Unidade" value={form.unitId} onChange={(unitId) => setForm({ ...form, unitId })} options={data.units.map((u) => [u.id, `${u.city}/${u.state}`])} />
          <Textarea label="Notas" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} />
          <button className="primary"><CalendarDays size={18} /> Salvar agenda</button>
        </form>
      </Panel>
      <Panel title="Calendário">
        <div className="calendar-head">
          <input type="month" value={month} onChange={(event) => setDate(`${event.target.value}-01`)} />
        </div>
        <div className="calendar-list">
          {appointments.map((appointment) => {
            const patient = data.patients.find((item) => item.id === appointment.patientId);
            const unit = data.units.find((item) => item.id === appointment.unitId);
            return (
              <article key={appointment.id} className="appointment">
                <time>{new Date(appointment.startsAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</time>
                <div>
                  <strong>{patient?.name}</strong>
                  <span>{appointment.type} - {unit?.city}/{unit?.state}</span>
                </div>
                <button className={appointment.confirmed ? "success" : "ghost"} onClick={() => toggleConfirmed(appointment.id)}>
                  <Check size={17} /> {appointment.confirmed ? "Confirmado" : "Confirmar"}
                </button>
                <a className="icon-link" href={whatsappHref(patient?.phone, `Olá, ${patient?.name}. Seu atendimento IMOUVIR está agendado para ${new Date(appointment.startsAt).toLocaleString("pt-BR")}. Podemos confirmar sua presença?`)} target="_blank" rel="noreferrer"><MessageCircle size={17} /></a>
              </article>
            );
          })}
        </div>
      </Panel>
    </section>
  );
}

function Orders({ data, updateCollection }) {
  const [draft, setDraft] = useState({
    patientId: data.patients[0]?.id || "",
    unitId: data.units[0]?.id || "",
    orderNumber: `OC ${new Date().getFullYear().toString().slice(2)}.${String(data.orders.length + 1).padStart(2, "0")}`,
    paymentCondition: "5X BOLETO",
    status: "Pedido",
    invoiceNumber: "",
    invoiceDate: "",
    serialNumbers: "",
    items: []
  });

  function addItem(productId, bonus = false) {
    const product = data.products.find((item) => item.id === productId);
    if (!product) return;
    setDraft({ ...draft, items: [...draft.items, { id: uid("item"), productId, code: product.code, description: product.name, quantity: 1, unitPrice: product.price, bonus }] });
  }

  function submit(event) {
    event.preventDefault();
    updateCollection("orders", (items) => [{ ...draft, id: uid("ped"), createdAt: new Date().toISOString() }, ...items]);
  }

  return (
    <section className="stack">
      <Panel title="Novo pedido de aparelho">
        <form className="order-form" onSubmit={submit}>
          <Select label="Paciente" value={draft.patientId} onChange={(patientId) => setDraft({ ...draft, patientId })} options={data.patients.map((p) => [p.id, p.name])} />
          <Select label="Unidade de entrega" value={draft.unitId} onChange={(unitId) => setDraft({ ...draft, unitId })} options={data.units.map((u) => [u.id, `${u.city}/${u.state}`])} />
          <Input label="Número do pedido" value={draft.orderNumber} onChange={(orderNumber) => setDraft({ ...draft, orderNumber })} required />
          <Select label="Condição de pagamento" value={draft.paymentCondition} onChange={(paymentCondition) => setDraft({ ...draft, paymentCondition })} options={["5X BOLETO", "6X BOLETO", "3X BOLETO", "CARTÃO DE CRÉDITO", "DEPÓSITO EM CONTA", "BONIFICAÇÃO"]} />
          <Input label="Nota fiscal" value={draft.invoiceNumber} onChange={(invoiceNumber) => setDraft({ ...draft, invoiceNumber })} />
          <Input label="Data da NF" type="date" value={draft.invoiceDate} onChange={(invoiceDate) => setDraft({ ...draft, invoiceDate })} />
          <Textarea label="Números de série, um por linha" value={draft.serialNumbers} onChange={(serialNumbers) => setDraft({ ...draft, serialNumbers })} />
          <div className="span-all product-picker">
            <select onChange={(event) => addItem(event.target.value, false)} defaultValue="">
              <option value="" disabled>Adicionar item pago</option>
              {data.products.filter((item) => item.active).map((product) => <option key={product.id} value={product.id}>{product.code} - {product.name}</option>)}
            </select>
            <select onChange={(event) => addItem(event.target.value, true)} defaultValue="">
              <option value="" disabled>Adicionar bonificação</option>
              {data.products.filter((item) => item.active).map((product) => <option key={product.id} value={product.id}>{product.code} - {product.name}</option>)}
            </select>
          </div>
          <div className="span-all table-wrap">
            <table>
              <thead><tr><th>Código</th><th>Descrição</th><th>Qtd</th><th>Valor</th><th>Tipo</th></tr></thead>
              <tbody>
                {draft.items.map((item) => <tr key={item.id}><td>{item.code}</td><td>{item.description}</td><td>{item.quantity}</td><td>{money.format(item.unitPrice)}</td><td>{item.bonus ? "Bonificação" : "Pago"}</td></tr>)}
              </tbody>
            </table>
          </div>
          <button className="primary span-all"><Save size={18} /> Salvar pedido</button>
        </form>
      </Panel>
      <Panel title="Pedidos">
        <div className="cards-list">
          {data.orders.map((order) => {
            const patient = data.patients.find((item) => item.id === order.patientId);
            const total = order.items.reduce((sum, item) => sum + (item.bonus ? 0 : item.quantity * item.unitPrice), 0);
            return (
              <article className="order-card" key={order.id}>
                <div>
                  <strong>{order.orderNumber} - {patient?.name}</strong>
                  <span>{order.status} - {order.paymentCondition} - {money.format(total)}</span>
                </div>
                <div className="card-actions">
                  <button onClick={() => printOrder(data, order)}><Download size={17} /> Pedido fábrica</button>
                  <button onClick={() => printTerms(data, order)}><FileText size={17} /> Termos</button>
                </div>
              </article>
            );
          })}
        </div>
      </Panel>
    </section>
  );
}

function Documents({ data, updateCollection }) {
  function upload(patientId, files) {
    const readers = [...files].map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ id: uid("doc"), patientId, name: file.name, kind: file.type || "arquivo", dataUrl: reader.result, uploadedAt: new Date().toISOString() });
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then((docs) => updateCollection("documents", (items) => [...docs, ...items]));
  }

  return (
    <section className="stack">
      <Panel title="Anexos por paciente">
        <div className="cards-list">
          {data.patients.map((patient) => (
            <article className="patient-card" key={patient.id}>
              <div>
                <strong>{patient.name}</strong>
                <span>{data.documents.filter((doc) => doc.patientId === patient.id).length} documento(s)</span>
              </div>
              <label className="upload-button">
                <Upload size={17} /> Anexar exame, comprovante ou NF
                <input type="file" multiple onChange={(event) => upload(patient.id, event.target.files)} />
              </label>
            </article>
          ))}
        </div>
      </Panel>
      <Panel title="Histórico documental">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Paciente</th><th>Arquivo</th><th>Tipo</th><th>Data</th><th>Abrir</th></tr></thead>
            <tbody>
              {data.documents.map((doc) => {
                const patient = data.patients.find((item) => item.id === doc.patientId);
                return <tr key={doc.id}><td>{patient?.name}</td><td>{doc.name}</td><td>{doc.kind}</td><td>{new Date(doc.uploadedAt).toLocaleString("pt-BR")}</td><td><a href={doc.dataUrl} download={doc.name}>Baixar</a></td></tr>;
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  );
}

function SettingsView({ data, updateCollection, commit }) {
  const [product, setProduct] = useState({ code: "", name: "", category: "AASI", price: 0 });
  const [unit, setUnit] = useState({ city: "", state: "", recipient: "", company: "", address: "", cep: "" });

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `crminstituto-backup-${todayIso()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => commit(JSON.parse(reader.result));
    reader.readAsText(file);
  }

  return (
    <section className="content-grid two">
      <Panel title="Produtos e aparelhos">
        <form className="inline-form" onSubmit={(event) => { event.preventDefault(); updateCollection("products", (items) => [{ ...product, id: uid("prod"), price: Number(product.price), active: true }, ...items]); setProduct({ code: "", name: "", category: "AASI", price: 0 }); }}>
          <Input label="Código" value={product.code} onChange={(code) => setProduct({ ...product, code })} required />
          <Input label="Nome" value={product.name} onChange={(name) => setProduct({ ...product, name })} required />
          <Input label="Categoria" value={product.category} onChange={(category) => setProduct({ ...product, category })} />
          <Input label="Preço" type="number" value={product.price} onChange={(price) => setProduct({ ...product, price })} />
          <button className="primary"><Plus size={17} /> Produto</button>
        </form>
        <div className="compact-list">
          {data.products.map((item) => <div key={item.id}><span>{item.code} - {item.name}</span><button onClick={() => updateCollection("products", (items) => items.filter((p) => p.id !== item.id))}><Trash2 size={16} /></button></div>)}
        </div>
      </Panel>
      <Panel title="Unidades e endereços">
        <form className="inline-form" onSubmit={(event) => { event.preventDefault(); updateCollection("units", (items) => [{ ...unit, id: uid("uni"), active: true }, ...items]); setUnit({ city: "", state: "", recipient: "", company: "", address: "", cep: "" }); }}>
          <Input label="Cidade" value={unit.city} onChange={(city) => setUnit({ ...unit, city })} required />
          <Input label="UF" value={unit.state} onChange={(state) => setUnit({ ...unit, state })} required />
          <Input label="Destinatário" value={unit.recipient} onChange={(recipient) => setUnit({ ...unit, recipient })} />
          <Input label="Empresa" value={unit.company} onChange={(company) => setUnit({ ...unit, company })} />
          <Input label="Endereço completo" value={unit.address} onChange={(address) => setUnit({ ...unit, address })} required />
          <Input label="CEP" value={unit.cep} onChange={(cep) => setUnit({ ...unit, cep })} />
          <button className="primary"><Home size={17} /> Unidade</button>
        </form>
        <div className="compact-list">
          {data.units.map((item) => <div key={item.id}><span>{item.city}/{item.state} - {item.address}</span><button onClick={() => updateCollection("units", (items) => items.filter((u) => u.id !== item.id))}><Trash2 size={16} /></button></div>)}
        </div>
      </Panel>
      <Panel title="Backup e banco de dados">
        <div className="backup-actions">
          <button onClick={exportData}><Download size={17} /> Exportar JSON</button>
          <label className="upload-button"><Upload size={17} /> Importar JSON<input type="file" accept="application/json" onChange={(event) => importData(event.target.files[0])} /></label>
          <button onClick={() => commit(initialData)}><FolderOpen size={17} /> Restaurar dados iniciais</button>
        </div>
      </Panel>
    </section>
  );
}

function printOrder(data, order) {
  const patient = data.patients.find((item) => item.id === order.patientId);
  const unit = data.units.find((item) => item.id === order.unitId);
  const rows = order.items.map((item) => `<tr><td>${item.code}</td><td>${item.description}</td><td>${item.quantity}</td><td>${money.format(item.unitPrice)}</td><td>${item.bonus ? "Bonificação" : "Pago"}</td></tr>`).join("");
  openPrint(`Pedido de Faturamento ${order.orderNumber}`, `
    <h1>Pedido de Faturamento</h1>
    <p><strong>Referência:</strong> ${order.orderNumber} - PCT ${patient?.name}</p>
    <p><strong>Cliente:</strong> INSTITUTO MAÇÔNICO OUVIR - IMOUVIR</p>
    <p><strong>Paciente:</strong> ${patient?.name} | CPF ${patient?.cpf || ""}</p>
    <h2>Endereço de entrega</h2>
    <p>Destinatário: ${unit?.recipient || ""}<br>Empresa: ${unit?.company || ""}<br>${unit?.address || ""}<br>${unit?.city}/${unit?.state} - CEP ${unit?.cep || ""}</p>
    <h2>Itens</h2><table><thead><tr><th>Código</th><th>Descrição</th><th>Qtd</th><th>Valor unitário</th><th>Tipo</th></tr></thead><tbody>${rows}</tbody></table>
    <p><strong>Condição de pagamento:</strong> ${order.paymentCondition}</p>
    <p>Favor informar no campo de informações complementares da nota fiscal o número do pedido e nome do paciente indicados acima.</p>
  `);
}

function printTerms(data, order) {
  const patient = data.patients.find((item) => item.id === order.patientId);
  const serials = order.serialNumbers.split(/\n+/).filter(Boolean).map((serial) => `<p>NS - ${serial}</p>`).join("");
  openPrint(`Termos ${patient?.name}`, `
    <h1>Termo de Recebimento</h1>
    <h2>PROJETO SAÚDE AUDITIVA - INSTITUTO MAÇÔNICO OUVIR - IMOUVIR</h2>
    <p>Através deste termo confirmo o recebimento do(s) aparelho(s) auditivo(s) e respectiva nota fiscal descritos no quadro abaixo, bem como recebi as orientações e cuidados necessários para proteção e bom funcionamento do(s) aparelho(s).</p>
    <p><strong>${order.orderNumber} - PCT ${patient?.name}</strong></p>
    <p><strong>NF ${order.invoiceNumber || "________________"} ${order.invoiceDate ? `DE ${new Date(order.invoiceDate).toLocaleDateString("pt-BR")}` : ""}</strong></p>
    ${serials || "<p>NS - __________________________</p>"}
    <p><strong>Garantia do fabricante:</strong> 1 ano para defeitos de fabricação do aparelho, com exceção dos receptores, que possuem 3 meses de garantia mediante análise e aprovação do laboratório.</p>
    <p>Cuiabá/MT, ____ de ____________________ de ${new Date().getFullYear()}</p>
    <p class="signature">Assinatura</p>
    <hr>
    <h1>Termo de Responsabilidade e Autorização de Uso e Direitos de Imagem Individual</h1>
    <p>Declaro que concordo, sem ressalvas, em participar de campanhas de divulgação do Instituto Maçônico Ouvir, autorizando o uso de minha imagem, nome, depoimento e voz em materiais institucionais e publicitários por prazo indeterminado.</p>
    <p>Nome: ${patient?.name}<br>CPF: ${patient?.cpf || ""}<br>Endereço: ${patient?.address || ""}<br>Cidade/Estado: ${patient?.city}<br>Data nasc.: ${patient?.birthDate ? new Date(patient.birthDate).toLocaleDateString("pt-BR") : ""}<br>Fone: ${patient?.phone}</p>
    <p>Cuiabá/MT, ____ de ____________________ de ${new Date().getFullYear()}</p>
    <p class="signature">Assinatura</p>
  `);
}

function openPrint(title, body) {
  const popup = window.open("", "_blank");
  popup.document.write(`<html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;color:#1f2937;margin:40px;line-height:1.45}h1{color:#0a7f83}h2{font-size:16px}table{width:100%;border-collapse:collapse;margin:18px 0}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}.signature{margin-top:70px;border-top:1px solid #111;width:280px;text-align:center;padding-top:8px}@media print{button{display:none}}</style></head><body>${body}<script>window.print()</script></body></html>`);
  popup.document.close();
}

function Metric({ label, value, detail }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong><p>{detail}</p></article>;
}

function Panel({ title, children }) {
  return <section className="panel"><h2>{title}</h2>{children}</section>;
}

function Empty({ text }) {
  return <div className="empty">{text}</div>;
}

function Badge({ children }) {
  return <span className="badge">{children}</span>;
}

function Input({ label, value, onChange, type = "text", required = false }) {
  return <label>{label}<input type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Textarea({ label, value, onChange }) {
  return <label className="span-all">{label}<textarea value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Select({ label, value, onChange, options }) {
  return (
    <label>{label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => Array.isArray(option) ? <option key={option[0]} value={option[0]}>{option[1]}</option> : <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

createRoot(document.getElementById("root")).render(<App />);
