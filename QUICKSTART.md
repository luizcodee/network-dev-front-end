# 📱 Network Dev - Mobile App

## 🚀 Como Rodar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Iniciar o App
```bash
npm start
```

### 3. Abrir no Dispositivo
- **Android**: Pressione `a` ou escaneie o QR Code com Expo Go
- **iOS**: Pressione `i` ou escaneie o QR Code com Expo Go
- **Web**: Pressione `w`

---

## 🔧 Configuração

### Backend URL
O app está configurado para conectar em:
- **IP**: `192.168.1.4`
- **Porta**: `8080`
- **Base URL**: `http://192.168.1.4:8080/api`

**Se o IP da sua máquina mudou:**
1. Descubra o novo IP: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
2. Edite `src/services/api.ts` e atualize o IP
3. Reinicie o app

---

## 🔐 Login de Teste

Use estas credenciais para testar:
- **Email**: `luiz.henrique@proxnet.com`
- **Senha**: `senha123`

Ou crie uma nova conta clicando em "Criar conta"

---

## 📂 Estrutura do Projeto

```
src/
├── assets/          # Imagens e recursos
├── config/          # Configurações (Firebase)
├── navigation/      # Navegação entre telas
├── screens/         # Telas do app
│   ├── LoginScreen.tsx
│   ├── CreateProfileScreen.tsx
│   ├── HomeScreen.tsx
│   ├── FeedScreen.tsx
│   ├── MyProfileScreen.tsx
│   └── ConnectionScreen.tsx
├── services/        # Serviços de API
│   ├── api.ts       # Configuração Axios
│   ├── auth.ts      # Login/Registro
│   └── userService.ts
└── utils/           # Utilitários
```

---

## 🐛 Problemas Comuns

### "Network Error"
- Verifique se o backend está rodando
- Verifique se o IP em `api.ts` está correto
- Certifique-se de estar na mesma rede Wi-Fi

### "Expo Go não conecta"
- Celular e computador devem estar na mesma rede
- Desative VPN se estiver usando
- Tente usar o modo Tunnel: `expo start --tunnel`

---

## 📚 Documentação Completa

Veja `INTEGRACAO.md` para guia completo de integração com o backend.

---

**Desenvolvido pela equipe Net-Dev** ❤️
