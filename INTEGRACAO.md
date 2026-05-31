# 🔗 Guia de Integração Backend + Mobile

## ✅ Status da Integração
- **Backend**: Spring Boot rodando em `http://192.168.1.4:8080`
- **Mobile**: React Native/Expo configurado para conectar em `http://192.168.1.4:8080/api`
- **CORS**: Configurado e liberado para todas as origens

---

## 🚀 Como Rodar os Projetos

### 1. Backend (Spring Boot)

```bash
# Navegar até a pasta do backend
cd "c:\Users\luizc\OneDrive\Desktop\App facul 2026"

# Rodar o backend
mvn spring-boot:run
```

**Verificar se está rodando:**
```bash
curl http://localhost:8080/api/posts
```

---

### 2. Mobile (React Native/Expo)

```bash
# Navegar até a pasta do mobile
cd "C:\Projeto front end\network-dev"

# Instalar dependências (primeira vez)
npm install

# Rodar o app
npm start
```

**Opções após `npm start`:**
- Pressione `a` para abrir no Android
- Pressione `i` para abrir no iOS
- Pressione `w` para abrir no navegador (web)
- Escaneie o QR Code com o app Expo Go no celular

---

## 🔧 Configuração Atual

### IP da Máquina
- **IP Atual**: `192.168.1.4`
- **Porta Backend**: `8080`
- **Base URL API**: `http://192.168.1.4:8080/api`

### Arquivo Configurado
- `src/services/api.ts` - Configuração do Axios com IP correto

---

## 🧪 Testar a Integração

### 1. Testar Backend (via cURL ou Postman)

```bash
# Testar se backend está respondendo
curl http://192.168.1.4:8080/api/posts

# Testar login
curl -X POST http://192.168.1.4:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"luiz.henrique@proxnet.com\",\"password\":\"senha123\"}"
```

### 2. Testar Mobile

1. Abra o app no celular ou emulador
2. Tente fazer login com:
   - **Email**: `luiz.henrique@proxnet.com`
   - **Senha**: `senha123`
3. Se funcionar, você verá a tela Home com o feed

---

## 🐛 Troubleshooting

### Problema: "Network Error" no mobile

**Causa**: IP incorreto ou backend não está rodando

**Solução**:
1. Verifique se o backend está rodando: `curl http://localhost:8080/api/posts`
2. Verifique o IP da máquina: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
3. Atualize o IP em `src/services/api.ts`
4. Reinicie o app mobile

---

### Problema: "Connection refused"

**Causa**: Firewall bloqueando a porta 8080

**Solução**:
```bash
# Windows - Liberar porta 8080
netsh advfirewall firewall add rule name="Spring Boot" dir=in action=allow protocol=TCP localport=8080
```

---

### Problema: CORS Error

**Causa**: Backend não está aceitando requisições do mobile

**Solução**: O CORS já está configurado em `SecurityConfig.java`. Se ainda houver erro, verifique se o backend foi reiniciado após a configuração.

---

## 📱 Endpoints Disponíveis

### Autenticação
- `POST /api/users/register` - Registrar novo usuário
- `POST /api/users/login` - Fazer login

### Usuários
- `GET /api/users/{id}` - Buscar usuário por ID
- `PUT /api/users/{id}` - Atualizar perfil
- `POST /api/users/{id}/upload-profile-image` - Upload de foto

### Posts
- `GET /api/posts` - Listar posts (feed)
- `POST /api/posts` - Criar post (apenas texto)
- `POST /api/posts/create-with-image` - Criar post com imagem

### Proximidade
- `POST /api/proximity/detect` - Registrar detecção BLE

---

## 🔐 Usuários de Teste

| Email | Senha | Nome |
|-------|-------|------|
| luiz.henrique@proxnet.com | senha123 | Luiz Henrique |
| joice.barbosa@proxnet.com | senha123 | Joice Barbosa |
| adriel.pereira@proxnet.com | senha123 | Adriel Pereira |

---

## 📝 Checklist de Integração

- [x] Backend configurado e rodando
- [x] CORS habilitado no backend
- [x] IP atualizado no mobile
- [x] Serviços de API configurados (api.ts, auth.ts, userService.ts)
- [ ] Testar login no mobile
- [ ] Testar registro de novo usuário
- [ ] Testar feed de posts
- [ ] Testar upload de imagem

---

## 🎯 Próximos Passos

1. **Rodar o backend**: `mvn spring-boot:run`
2. **Rodar o mobile**: `npm start`
3. **Testar login** com usuário de teste
4. **Verificar feed** de posts
5. **Testar criação** de novo post

---

**Desenvolvido pela equipe Net-Dev** ❤️
