import axios from 'axios';

// 1. criar a instancia do axios, o que se assemelha com agenda de telefones
// defino a url base para nao precisar digital manualmente
const api = axios.create({
    baseURL: 'http://localhost:3333',
});

// 2. crio o "Assistente" (O Interceptador)
// O .interceptors.request.use() "intercepta" cada requisicao antes que ela seja enviada

api.interceptors.request.use(async (config) => {
    // 3. Assistente verifica se o usuario possui o token (localStorage)
    const token = localStorage.getItem('token');

    // 4. se ele encontra o token
    if (token) {
        // "anexa" no headear de requisicao para o usuario poder navegar e o back nao o expulsar
        config.headers.Authorization = `Bearer ${token}`;
    }

    // 5. deixa a requisicao continuar, agora com o token anexado
    return config;
});

export default api;