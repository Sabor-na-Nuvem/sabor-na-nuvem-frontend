import api from './api';

export const buscarEnderecoPorCoordenadas = async (lat, lon) => {
  const response = await api.get('/geocoding/reverse', {
    params: { lat, lon },
  });
  return response;
};

export const buscarCoordenadasPorEndereco = async (query) => {
  const response = await api.get('/geocoding/search', {
    params: { endereco: query },
  });
  return response;
};
