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
