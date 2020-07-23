# Projeto

Projeto desenvolvido em Node.js e banco de dados Redis com distribuição via containers Docker.

# Dependências

Para compilar e fazer o deploy da aplicação instale os seguintes componentes em sua máquina:

- [Node](https://nodejs.org/en/download/)
- [Docker](https://docs.docker.com/install/#supported-platforms)

# Build

Para instalar os pacotes utilizados na api, execute o comando no diretório raiz do projeto:

`npm install`

Na sequência, execute o seguinte comando para compilar o projeto:

`npm run build`

# Deploy

A aplicação e o banco de dados serão distribuídos via containers Docker.

Para facilitar, existe um arquivo docker-compose no diretório raiz do projeto que criará a imagem docker da API e irá fazer o deploy na mesma máquina de Build, onde já temos o Docker instalado e o projeto compilado.

## Deploy via Docker Compose

O deploy por Docker Compose é uma forma mais simplificada e automatizada de criar os containers do banco Redis e da API na máquina local. Para isso, execute o seguinte comando no diretório raiz do projeto:

`docker-compose up -d --build`

Após a criação dos containers, a API poderá ser acessada atráves da URL [localhost:3000/api](http://localhost:3000/api).

## Deploy via imagens Docker

Podemos instanciar o banco e a API em diferentes hosts através de suas imagens Docker.
Para isso, no diretório raiz do projeto, execute o comando abaixo para compilar e gerar a imagem Docker da API:

`npm run build-docker-image`

### Deploy da aplicação

Para instanciar os containers do banco e da API isoladamente é necessário informar alguns parâmetros no momento da sua execução.

### Criar um container do Redis

Para criar uma nova instância do banco Redis, execute:

`docker run --rm --name service-poll-db -p 6379:6379 -d redis:alpine`

O exemplo acima cria uma instância do banco Redis no host onde foi executado o comando expondo a porta 6379 para conexão.

### Criar um container da API

Para iniciar uma instância da API, execute o comando abaixo substituindo `[ip adrress]` pelo ip do host acima, que mantém um container do banco Redis em execução:

`docker run --rm --name service-poll -p 3000:3000 --env DB_HOST=redis://[ip adrress]:6379 -d service-poll`

Após a criação, a API poderá ser acessada atráves da URL [localhost:3000/api](http://localhost:3000/api).
