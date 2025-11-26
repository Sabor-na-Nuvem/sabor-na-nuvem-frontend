/* eslint-disable prefer-destructuring */
import { ESTADOS_BRASIL } from '../constants/estados';

export const normalizeText = (text) =>
  text
    ? text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    : '';

export const getStateCode = (fullStateName) => {
  if (!fullStateName) return '';
  const normalized = normalizeText(fullStateName);
  const map = {
    acre: 'AC',
    alagoas: 'AL',
    amapa: 'AP',
    amazonas: 'AM',
    bahia: 'BA',
    ceara: 'CE',
    'distrito federal': 'DF',
    'espirito santo': 'ES',
    goias: 'GO',
    maranhao: 'MA',
    'mato grosso': 'MT',
    'mato grosso do sul': 'MS',
    'minas gerais': 'MG',
    para: 'PA',
    paraiba: 'PB',
    parana: 'PR',
    pernambuco: 'PE',
    piaui: 'PI',
    'rio de janeiro': 'RJ',
    'rio grande do norte': 'RN',
    'rio grande do sul': 'RS',
    rondonia: 'RO',
    roraima: 'RR',
    'santa catarina': 'SC',
    'sao paulo': 'SP',
    sergipe: 'SE',
    tocantins: 'TO',
  };
  if (fullStateName.length === 2 && ESTADOS_BRASIL.includes(fullStateName.toUpperCase())) {
    return fullStateName.toUpperCase();
  }
  return map[normalized] || '';
};

export const formatAddress = (endereco) => {
  if (!endereco) return 'Endereço não informado';

  // Garante que não teremos 'undefined' ou 'null' na string
  const logradouro = endereco.logradouro || '';
  const numero = endereco.numero || 'S/N';
  const complemento = endereco.complemento;
  const bairro = endereco.bairro || '';
  const cidade = endereco.cidade || '';
  const estado = endereco.estado || '';
  const cep = endereco.cep || '';

  // Montagem das partes
  let formatted = `${logradouro}, ${numero}`;

  if (complemento) {
    formatted += `, ${complemento}`;
  }

  if (bairro) {
    formatted += ` - ${bairro}`;
  }

  if (cidade && estado) {
    formatted += `, ${cidade} - ${estado}`;
  }

  if (cep) {
    const cepFormatado = cep.replace(/\D/g, '').replace(/^(\d{5})(\d{3})/, '$1-$2');
    formatted += `, ${cepFormatado}`;
  }

  return formatted;
};

export const formatAddressShort = (endereco) => {
  if (!endereco) return '';
  return `${endereco.logradouro || ''}, ${endereco.numero || 'S/N'}`;
};
