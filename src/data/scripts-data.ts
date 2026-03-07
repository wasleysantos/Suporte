export interface Script {
  id: number;
  title: string;
  text: string;
  type: "script";
}

export interface Contact {
  id: number;
  title: string;
  text: string;
  type: "contact";
  phones?: string[];
  whatsapp?: string[];
  emails?: string[];
}

export interface FAQ {
  id: number;
  title: string;
  text: string;
  type: "faq";
}


export type Item = Script | Contact | FAQ;

export const scripts: Script[] = [
  {
    id: 1,
    title: "Solicitar mais detalhes",
    text: "Você poderia me fornecer mais detalhes?",
    type: "script",
  },
  {
    id: 2,
    title: "Canal exclusivo TI",
    text: "Olá, este canal é exclusivo para chamados em TI. Para outras questões, por favor,\nutilize o Portal de serviços https://portaldeservicos.pmenos.com.br",
    type: "script",
  },
  {
    id: 3,
    title: "Chamado encaminhado",
    text: "Chamado encaminhado para o setor responsável, você pode acompanhar pelo ticket pelo portal de serviços: ",
    type: "script",
  },
  {
    id: 4,
    title: "Precisa de algo mais",
    text: "Você precisa de mais alguma informação ou posso ajudar com algo mais?",
    type: "script",
  },
  {
    id: 5,
    title: "Finalizando atendimento",
    text: "Fico muito feliz de ajudar.\nApós o encerramento deste chamado, será enviada uma pesquisa de satisfação com o meu atendimento.\nConto com a sua participação. Até mais!",
    type: "script",
  },
  {
    id: 6,
    title: "Sem retorno da loja",
    text: "No momento você deve está ocupado(a). Eu entendo, encerrarei o atendimento por inatividade.\nVocê pode entrar em contato conosco a qualquer momento, será um prazer atendê-lo.\nObrigado.",
    type: "script",
  },
];

export const contacts: Contact[] = [
  {
    id: 7,
    title: "GRT - Conferência de Mercadoria",
    text: "Setor que pode melhor auxiliar nos eventos do Novo Conferência.\nLigue para o setor / Equipe GRT nos seguintes números\nFixo: (85) 3255-5481;\nPedro: (85) 99778-0083;\nGilmara: (85) 98943-8803;\nThaís: (85) 99147-6787.",
    type: "contact",
    phones: ["(85) 3255-5481", "(85) 99778-0083", "(85) 98943-8803", "(85) 99147-6787"],
  },
  {
    id: 8,
    title: "Trilogo",
    text: "Para casos de manutenção de cabos de internet, elétrica, tomadas, passagem de cabos,\nEntre em contato com a empresa parceira TRILOGO através do WhatsApp (85) 8956-7402",
    type: "contact",
    whatsapp: ["(85) 8956-7402"],
  },
  {
    id: 9,
    title: "Farmácia Popular",
    text: "Para casos relacionados ao Farmácia Popular,\nEntre em contato com o setor responsável através do WhatsApp (85) 9837-8640",
    type: "contact",
    whatsapp: ["(85) 9837-8640"],
  },
  {
    id: 10,
    title: "PBM",
    text: "Para casos relacionados ao PBM,\nEntre em contato com o setor responsável através do WhatsApp (85) 9871-5000",
    type: "contact",
    whatsapp: ["(85) 9871-5000"],
  },
  {
    id: 11,
    title: "VOKE",
    text: "Para casos relacionados a computadores, impressoras, leitores fixos, mouses, teclados,\nEntre em contato com a empresa responsável através do WhatsApp (31) 2125-4200",
    type: "contact",
    whatsapp: ["(31) 2125-4200"],
  },
  {
    id: 12,
    title: "CSC - Estorno/Cancelamento",
    text: "CSC - Cancelamentos de vendas\nCarta de Estorno\n(85) 3255-5491\n(85) 3255-5493\ncscestornodecartao@pmenos.com.br\nWhatsApp estorno - (85) 997616870",
    type: "contact",
    phones: ["(85) 3255-5491", "(85) 3255-5493"],
    whatsapp: ["(85) 997616870"],
    emails: ["cscestornodecartao@pmenos.com.br"],
  },
  {
    id: 13,
    title: "Escrita Fiscal",
    text: "Entre em contato com a Escrita Fiscal\n(85) 3255-5501\n(85) 3255-5549",
    type: "contact",
    phones: ["(85) 3255-5501", "(85) 3255-5549"],
  },
  {
    id: 14,
    title: "Meios de Pagamento",
    text: "Entre em contato com Meios de Pagamento:\nmeiosdepagamento@pmenos.com.br\n(85) 98814-3229",
    type: "contact",
    whatsapp: ["(85) 98814-3229"],
    emails: ["meiosdepagamento@pmenos.com.br"],
  },
  {
    id: 15,
    title: "Digital",
    text: "Entre em contato com Setor de Digital pelo WhatsApp: (85) 3255-5539",
    type: "contact",
    whatsapp: ["(85) 3255-5539"],
  },
  {
    id: 16,
    title: "Segurança Patrimonial",
    text: "Entre em contato com a Segurança Patrimonial pelo WhatsApp: (85) 9903-0108",
    type: "contact",
    whatsapp: ["(85) 9903-0108"],
  },
  {
    id: 17,
    title: "BrSupply",
    text: "BrSupply\nWhatsApp: (51) 9924-2668",
    type: "contact",
    whatsapp: ["(51) 9924-2668"],
  },
  {
    id: 18,
    title: "Telemetria",
    text: "Caso tenha alguma dúvida sobre telemetria ou problema podem entrar em contato.\nEciane Lopes: (85) 999083428\nAdryana Marinho: (85) 991845639",
    type: "contact",
    phones: ["(85) 999083428", "(85) 991845639"],
  },
  {
    id: 19,
    title: "SERVTIC",
    text: "Entre em contato com o SERVTIC pelo WhatsApp: (85) 99959-1799",
    type: "contact",
    whatsapp: ["(85) 99959-1799"],
  },
  {
    id: 20,
    title: "Pricefy",
    text: "Dúvidas com o Pricefy.\nEntre em contato com o Setor de Preços.\nE-mail: gpreços@pmenos.com.br\nFone: (85) 3255-4403 ou (85) 99603-0914",
    type: "contact",
    phones: ["(85) 3255-4403", "(85) 99603-0914"],
    emails: ["gpreços@pmenos.com.br"],
  },
  {
    id: 21,
    title: "Parcerias Estratégicas",
    text: "Entre em contato com o Parcerias Estratégicas pelo WhatsApp: (85) 9916-0216",
    type: "contact",
    whatsapp: ["(85) 9916-0216"],
  },
  {
    id: 22,
    title: "Sekron / Câmeras",
    text: "Entre em contato com a Sekron empresa responsável pela segurança das câmeras pelo WhatsApp: (11) 3528-3666",
    type: "contact",
    whatsapp: ["(11) 3528-3666"],
  },
  {
    id: 23,
    title: "InComm",
    text: "Entre em contato com a Suporte InComm exclusivo para filiais das Farmácias Pague Menos pelo WhatsApp: (11) 96588-7306",
    type: "contact",
    whatsapp: ["(11) 96588-7306"],
  },
  {
    id: 24,
    title: "Entrada Direta",
    text: "Entre em contato com a Entrada Direta pelo WhatsApp: (85) 9865-0130",
    type: "contact",
    whatsapp: ["(85) 9865-0130"],
  },
  {
    id: 25,
    title: "Convênios & Parcerias",
    text: "Entre em contato com o Convênios & Parcerias pelo WhatsApp: (85) 9956-2874",
    type: "contact",
    whatsapp: ["(85) 9956-2874"],
  },
  {
    id: 26,
    title: "Prevenção de Perdas",
    text: "Por favor entrar em contato com o setor responsável o Prevenção de perdas para verificar o caso.\nPrevenção de Perdas: (85) 3255-5517\nE-mail: prevencaodeperdas@pmenos.com.br",
    type: "contact",
    phones: ["(85) 3255-5517"],
    emails: ["prevencaodeperdas@pmenos.com.br"],
  },
  {
    id: 27,
    title: "Televendas",
    text: "Entre em contato com o setor de Televendas pelo WhatsApp: (85) 8148-6498",
    type: "contact",
    whatsapp: ["(85) 8148-6498"],
  },
 
];

export const faqs: FAQ[] = [
  {
    id: 28,
    title: "Como abrir chamado para acessos?",
    text: "Esse tipo de solicitação deve ser aberta na matrícula do gerente pelo Portal de Serviços, direcionada ao setor de Acessos e Processos. É necessário informar o nome e a matrícula da funcionária.",
    type: "faq",
  },
  {
    id: 29,
    title: "Quem deve abrir solicitação de acesso?",
    text: "A solicitação deve ser realizada utilizando a matrícula do gerente responsável pelo Portal de Serviços.",
    type: "faq",
  },
  {
    id: 30,
    title: "O que informar na solicitação?",
    text: "Informe sempre o nome completo e a matrícula da funcionária para agilizar o atendimento.",
    type: "faq",
  },
];
export const allItems: Item[] = [...scripts, ...contacts, ...faqs];

