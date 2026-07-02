const key = "crminstituto-data-v1";

const products = [
  ["240470", "T-Cap Bege (CIC) - protetor microfone", "Acessório", 1100],
  ["225683", "CARREGADOR SONIC PLUS", "Carregador", 600],
  ["003040854", "Desumidificador KidCat Sonic", "Acessório", 18],
  ["149283", "Recep. 85 miniFit 3L", "Receptor", 170],
  ["149284", "Recep. 85 miniFit 3R", "Receptor", 170],
  ["149315", "Domo Power 8mm", "Domo", 50],
  ["149316", "RADIANT 20 MNR", "AASI", 50],
  ["130091", "WAX PROTECTION SET PROWAX MINIFIT", "Ferramenta", 71.3],
  ["234759", "RADIANT100 MNR RECARREGÁVEL", "AASI", 1575],
  ["240749", "RADIANT 60 MNR RECARREGÁVEL", "AASI", 935],
  ["234772", "RADIANT 20 MNR RECARREGÁVEL", "AASI", 880],
  ["248369", "TREK 40 Super Power", "AASI", 1133],
  ["247787", "TREK 40 Ultra Power", "AASI", 1133],
  ["197014", "CAPTIVATE 100 MINIRITE Recarregável", "AASI", 2200],
  ["196447", "CAPTIVATE 100 MINIRITE", "AASI", 2178],
  ["196429", "CAPTIVATE 100 BTE 105", "AASI", 1925],
  ["197020", "CAPTIVATE 80 MINIRITE Recarregável", "AASI", 1600],
  ["196454", "CAPTIVATE 80 MINIRITE", "AASI", 1628],
  ["196435", "CAPTIVATE 80 BTE 105", "AASI", 1573],
  ["197026", "CAPTIVATE 60 MINIRITE Recarregável", "AASI", 1400],
  ["196460", "CAPTIVATE 60 MINIRITE", "AASI", 1265],
  ["196441", "CAPTIVATE 60 BTE 105", "AASI", 1210],
  ["215144", "CAPTIVATE 40 MINIRITE Recarregável", "AASI", 950],
  ["215325", "CAPTIVATE 40 MINIRITE", "AASI", 935],
  ["215349", "CAPTIVATE 40 BTE 105", "AASI", 880],
  ["215331", "CAPTIVATE 20 MINIRITE", "AASI", 825],
  ["215355", "CAPTIVATE 20 BTE 105", "AASI", 770],
  ["149272", "Recep. 60 miniFit 1L", "Receptor", 170],
  ["149271", "Recep. 60 miniFit 1R", "Receptor", 170],
  ["149276", "Recep. 60 miniFit 3L", "Receptor", 170],
  ["149275", "Recep. 60 miniFit 3R", "Receptor", 170],
  ["218359", "Domo Aberto 5 mm", "Domo", 50],
  ["149303", "Domo Aberto 6 mm", "Domo", 50],
  ["149304", "Domo Aberto 8 mm", "Domo", 50],
  ["149305", "Domo Aberto 10 mm", "Domo", 50],
  ["156557", "Sonic 13", "Pilha", 600],
  ["152606", "Sonic 312", "Pilha", 650]
].map(([code, name, category, price], index) => ({ id: `prod-${index + 1}`, code, name, category, price, active: true }));

export const initialData = {
  patients: [
    {
      id: "pac-1",
      name: "Romilda Alves Faria",
      cpf: "",
      birthDate: "",
      phone: "(34) 99999-9999",
      city: "Uberlândia",
      address: "",
      status: "Pedido",
      source: "WhatsApp",
      notes: "Paciente do modelo 647.13.26. Pedido Sonic cadastrado como exemplo operacional.",
      createdAt: "2026-04-28T09:00:00.000Z"
    },
    {
      id: "pac-2",
      name: "Claudineia Elizabeti da Silva Hubener",
      cpf: "825.446.541-04",
      birthDate: "1977-07-18",
      phone: "(65) 99999-9999",
      city: "Juína",
      address: "",
      status: "Faturado",
      source: "Site",
      notes: "Modelo de termo de recebimento com NF 124.081.",
      createdAt: "2026-06-11T09:00:00.000Z"
    }
  ],
  appointments: [
    {
      id: "age-1",
      patientId: "pac-1",
      startsAt: "2026-07-02T09:00",
      type: "Retorno adaptação",
      audiologist: "Fga Brendda Maia de Sousa",
      unitId: "uni-1",
      confirmed: false,
      notes: "Confirmar presença um dia antes pelo WhatsApp."
    },
    {
      id: "age-2",
      patientId: "pac-2",
      startsAt: "2026-07-03T14:00",
      type: "Entrega aparelho",
      audiologist: "Fonoaudiólogo IMOUVIR",
      unitId: "uni-2",
      confirmed: true,
      notes: "Levar termo de recebimento para assinatura."
    }
  ],
  documents: [],
  units: [
    {
      id: "uni-1",
      city: "Uberlândia",
      state: "MG",
      recipient: "Fga Brendda Maia de Sousa",
      company: "ASSOCIAÇÃO DOS SURDOS E MUDOS DE UBERLÂNDIA - ASUL",
      address: "Rua Matheus Vaz, nº 865, Bairro Luizote de Freitas II",
      cep: "38.414-308",
      active: true
    },
    {
      id: "uni-2",
      city: "Cuiabá",
      state: "MT",
      recipient: "Instituto Maçônico Ouvir - IMOUVIR",
      company: "INSTITUTO MAÇÔNICO OUVIR - IMOUVIR",
      address: "Unidade Cuiabá/MT",
      cep: "",
      active: true
    }
  ],
  products,
  orders: [
    {
      id: "ped-1",
      patientId: "pac-1",
      unitId: "uni-1",
      orderNumber: "OC 647.13.26",
      paymentCondition: "5X BOLETO",
      status: "Pedido",
      invoiceNumber: "",
      invoiceDate: "",
      serialNumbers: "",
      createdAt: "2026-04-28T12:00:00.000Z",
      items: [
        { id: "item-1", productId: "prod-1", code: "240470", description: "T-Cap Bege (CIC) - protetor microfone", quantity: 2, unitPrice: 1100, bonus: false },
        { id: "item-2", productId: "prod-2", code: "225683", description: "CARREGADOR SONIC PLUS", quantity: 1, unitPrice: 700, bonus: false },
        { id: "item-3", productId: "prod-3", code: "003040854", description: "Desumidificador KidCat Sonic", quantity: 1, unitPrice: 18, bonus: true },
        { id: "item-4", productId: "prod-4", code: "149283", description: "Recep. 85 miniFit 3L", quantity: 1, unitPrice: 170, bonus: true },
        { id: "item-5", productId: "prod-5", code: "149284", description: "Recep. 85 miniFit 3R", quantity: 1, unitPrice: 170, bonus: true }
      ]
    },
    {
      id: "ped-2",
      patientId: "pac-2",
      unitId: "uni-2",
      orderNumber: "663.01.26",
      paymentCondition: "Faturado",
      status: "Faturado",
      invoiceNumber: "124.081",
      invoiceDate: "2026-06-22",
      serialNumbers: "96476026\n96476184",
      createdAt: "2026-06-11T12:00:00.000Z",
      items: [
        { id: "item-6", productId: "prod-24", code: "215325", description: "SONIC CV40 B 105", quantity: 2, unitPrice: 935, bonus: false }
      ]
    }
  ]
};

export function loadData() {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : initialData;
  } catch {
    return initialData;
  }
}

export function saveData(data) {
  localStorage.setItem(key, JSON.stringify(data));
}
