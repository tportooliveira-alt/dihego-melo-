# DM81 Consultoria & Finanças — Site de Vendas de Veículos

Site completo da DM81 Consultoria & Finanças para compra e venda de veículos em geral (carros, motos, caminhões, utilitários, ônibus, carretas e tratores), com página de consórcios e cartas contempladas, feito em **HTML, CSS e JavaScript puros** — sem instalação, sem servidor, sem dependências. Funciona direto no GitHub Pages ou em qualquer hospedagem estática.

## Páginas

| Página | Arquivo | O que faz |
| --- | --- | --- |
| Início | `index.html` | Hero com busca, categorias, destaques, vantagens e estoque completo com filtros (tipo, marca, preço, ano, câmbio), busca por texto e ordenação. |
| Detalhes | `veiculo.html?id=N` | Ficha completa do veículo: especificações, opcionais, descrição, **simulador de financiamento** (tabela Price), botão de interesse via WhatsApp e veículos semelhantes. |
| Consórcios | `consorcio.html` | Consórcios e cartas contempladas em parceria com a Perim Consórcios: o que é, vantagens e simulação pelo WhatsApp. |
| Venda seu veículo | `vender.html` | Formulário de avaliação que envia os dados direto para o WhatsApp da loja. |
| Contato | `contato.html` | Canais de atendimento e formulário de mensagem via WhatsApp. |

## Como personalizar

Tudo que muda com frequência está em **`js/data.js`**:

### 1. Dados da loja

No final do arquivo, edite o objeto `LOJA`:

```js
const LOJA = {
  nome: "DM81 Consultoria & Finanças",
  telefone: "(11) 99999-9999",
  whatsapp: "5511999999999", // somente números, com DDI 55 — usado nos botões de WhatsApp
  email: "contato@dm81.com.br",
  // ...
};
```

> **Importante:** troque o número `whatsapp` pelo número real da loja para os botões "Chamar no WhatsApp" funcionarem.

### 2. Estoque de veículos

Cada anúncio é um objeto na lista `VEICULOS`. Para adicionar um veículo, copie um bloco existente e altere os campos:

```js
{
  id: 15,                    // único, usado na URL veiculo.html?id=15
  tipo: "carro",             // carro | moto | caminhao | utilitario | onibus | carreta | trator
  marca: "Fiat",
  modelo: "Argo",
  versao: "1.0 Drive",
  ano: 2023,
  km: 20000,
  preco: 72900,
  combustivel: "Flex",
  cambio: "Manual",
  cor: "Branco",
  destaque: true,            // true = aparece na seção "Destaques da semana"
  descricao: "Texto do anúncio...",
  opcionais: ["Ar-condicionado", "Direção elétrica"],
  g1: "#1f6feb", g2: "#0d3b8f",  // cores do gradiente da arte do card
  icone: "carro",            // carro | sedan | suv | picape | moto | caminhao | van | onibus | carreta | trator
},
```

As imagens dos anúncios são artes vetoriais (SVG) geradas automaticamente com a silhueta do tipo do veículo — o site funciona sem precisar hospedar fotos. Quando quiser usar fotos reais, é só evoluir a função `svgVeiculo` em `js/main.js` para exibir um `<img>` quando o veículo tiver um campo `foto`.

## Como publicar no GitHub Pages

1. No repositório, vá em **Settings → Pages**.
2. Em **Source**, escolha a branch principal e a pasta `/ (root)`.
3. Salve — em alguns minutos o site estará no ar em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

## Como rodar localmente

Basta abrir o `index.html` no navegador, ou servir a pasta:

```bash
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

## Estrutura

```
├── index.html        # página inicial + catálogo com filtros
├── veiculo.html      # detalhes do anúncio + simulador de financiamento
├── consorcio.html    # consórcios e cartas contempladas
├── vender.html       # formulário "venda seu veículo"
├── contato.html      # contato
├── img/              # imagens (arte promocional do consórcio)
├── css/style.css     # todos os estilos
└── js/
    ├── data.js       # ESTOQUE + dados da loja (edite aqui!)
    ├── main.js       # cards, filtros, artes SVG, WhatsApp
    ├── veiculo.js    # página de detalhes + simulador
    └── vender.js     # formulário de venda
```
