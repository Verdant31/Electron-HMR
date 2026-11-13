<h1 align="center">Electron HMR</h1>
<p align="center">Atalhos no computador disparados por gestos de mão na webcam.</p>
<p align="center"><strong>Electron</strong> · React · TypeScript · Python · MediaPipe · TensorFlow</p>

<p align="center"><img src="assets/hands/26b2f662-3c33-4dc6-95a4-809622c59c5e-removebg-preview.png" height="220" alt="Símbolo A: mão fechada com o polegar estendido para o lado"> <img src="assets/hands/be9bb54f-ee56-4e75-bf53-2cd8d7f65061-removebg-preview.png" height="220" alt="Símbolo B: mão aberta com os dedos estendidos"></p>

Interface desktop do [HMR](https://github.com/Verdant31/HMR), trabalho da faculdade de 2022. Você faz um símbolo com a mão, move a mão numa direção e o app executa a ação que você associou àquele gesto: abrir uma aba no navegador, aumentar ou diminuir o volume ou abrir um projeto no VS Code.

## Como funciona

O app tem duas telas:

- **Guia.** Explica os símbolos e abre uma prévia da webcam com os pontos da mão desenhados, para você se posicionar no centro da imagem.
- **Configurações.** Para cada direção do símbolo A (cima, baixo, esquerda e direita), você escolhe uma ação. Também escolhe a pasta de projeto que o gesto do VS Code vai abrir. As escolhas ficam salvas com o `electron-store`.

Ao clicar em iniciar, a janela se esconde e o processo principal do Electron roda `code/main.py` num terminal (PowerShell no Windows, `sh` no Linux). O script usa o mesmo reconhecimento do HMR:

1. O MediaPipe localiza os 21 pontos da mão e a imagem é recortada em volta dela.
2. As distâncias entre cada par de pontos viram 840 atributos, que uma rede densa classifica como símbolo A, B ou nenhum.
3. Com o símbolo mantido por mais de 30 quadros, o script acompanha a mão e decide a direção do movimento.
4. O script imprime o gesto, como `A direita`. O Electron lê a saída, executa a ação configurada e roda o script de novo para o próximo gesto.

| Ação | Como é executada |
| --- | --- |
| Abrir uma aba no navegador | Abre o Google no Chrome |
| Aumentar ou diminuir o volume | Sobe ou desce o volume em 30 pontos percentuais pela API de áudio do Windows, em `code/volume.ps1` |
| Abrir o VS Code | Roda `code <pasta>` com a pasta escolhida nas configurações |

## Instalar

Requer Node.js, Python 3.10 e uma webcam. Instale as dependências do Electron:

```powershell
npm install
```

E as do reconhecimento, no Python que o terminal vai usar:

```powershell
pip install tensorflow==2.10 "mediapipe<0.10.15" opencv-python scikit-learn pandas pillow
```

Os caminhos dos scripts Python estão fixos para a máquina em que o projeto foi feito (`C:/Users/Administrador/Desktop/ProjectHMR/...`). Antes de rodar, ajuste-os para a pasta do seu clone em `src/main/util.ts`, `src/main/scripts.ts` e `code/main.py`.

## Usar

```powershell
npm start
```

Configure as ações na tela de configurações, salve e clique em iniciar. Faça o símbolo A no centro da webcam, segure até o movimento começar e mova a mão numa direção até ela sair do quadro.

## Limitações

- A tela de guia fala em 8 ações (dois símbolos × quatro direções), mas só as quatro direções do símbolo A estão ligadas a ações. O símbolo B é reconhecido e ainda não dispara nada.
- O controle de volume só funciona no Windows.
- A aba nova abre sempre no Chrome.

## Créditos

Construído sobre o [Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate), sob a licença MIT, que está em `LICENSE`.
