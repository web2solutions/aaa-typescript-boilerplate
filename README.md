# Run: AnyWhere, AnyHow, AnyTime Typescript Boilertplate

This is a boilerplate to build REST APIs, Monolithic Modular and Microservice applications with Typescript.

The application aims to run `Anywhere, Anytime, Anyhow`. `Dedicated servers`, `virtual machines`, `containers`, `EC2`, `ECS` or `lambdas`, with `Express`, `Fastify`, `Hyper-Express` and `serverless`.

It was built based on a simplistic interpretation of Hexagonal Architecture and the Domain Driven Design philosophy.

It implements concurrency control through a mutex implementation to achieve data consistency between the different domains.

It follows an 100% agnostic approach totally focused on `architecture principles` rather than `vendor based` solutions.

It is being built using TDD techniques since from the scratch. Due the lack of time, actually it just provide test suites for `integration tests`. It actually covers 100% of the end points.

It can be used as boilerplate to create `modular monolith`or `microservice` applications.

`CI status:`

- main branch

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/web2solutions/aaa-typescript-boilerplate/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/web2solutions/aaa-typescript-boilerplate/tree/main)

- dev branch

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/web2solutions/aaa-typescript-boilerplate/tree/dev.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/web2solutions/aaa-typescript-boilerplate/tree/dev)

[![Known Vulnerabilities](https://snyk.io/test/github/web2solutions/aaa-typescript-boilerplate/badge.svg)](https://snyk.io/test/github/web2solutions/aaa-typescript-boilerplate)

### Project features high level overview

It implements incoming data validation, in the infrastructure level, through custom logic and based in the Open API specification.

It implements basic HTTP auth mechanism with a custom role system. Replaceable with other auth mechanisms. Tied to the API OAS spec.

It implements a HTTP web server port actually implementing adapters for Express.js,  Fastify and Hyper-Express. A serverless implementation is coming soon.

It implements an agnostic data repository port that actually writes/reads data from a In Memory database adapter. It is easily replaceable with Mongoose, Sequelize, etc.

### Classes' diagram

Diagram illustrating the components:

![Diagram](doc/miro.png "Diagram")

https://miro.com/app/board/uXjVNq5nWJY=/?share_link_id=603404471489

### API documentation

The API doc might be visualized at: http://localhost:3000/doc/

***Note:*** Remember to start the application before trying to reach it through the browser.

### Request data workflow through the architecture's components

Request Handler -> Controller -> Domain Service -> Domain Use Case -> Data Repository -> Data Adapter -> DBClient

### Response data workflow through the architecture's components

Request Handler <- Controller <- Domain Service <- Domain Use Case <- Data Repository <- Data Adapter <- DBClient

### Main components and their responsibility scope

#### 1.`Request Handlers`

It is the entry point in a request to the service. 

`It is a infrastructure's component.`

It performs params, body, url and access permission validations against the incoming request, using the associated OAS specification for each end point.

It may offers adapters for different outside service interfaces:

- HTTP - Lambdas (AWS, Azure, Google)
- HTTP - Express
- HTTP - Fastify
- HTTP - Hyper-Express
- HTTP - etc
- Events/SQS
- Events/SNS
- Events/etc

#### 2.`Domain Service`

It is the entry point for the application core (domains).

`It is a domain's component.`

May works as aggregation root / bounded contexts talking directly to injected domain services (aka domains and subdomains).

It should be the unique option working as communication interface between `infrastructure` and `domain components`.

It has a databaseClient adapter and a mutexClient adapter injected on it instance.

It may lock resources to avoid race conditions by using the injected mutexClient.

It knows it internal domain use cases.

It doesn't knows external domain use cases.

#### 3.`Use Case`

The `Use Cases`, as the meaning of the words, are the use cases implemented in the Product. 

They represents the features delivered to the customers.

`It is a domain's component.` They known and are consumed by the `Domain Service` component only.

They are the point entry for all `Data Repository` calls. They handle `Data Models` rather than raw objects.

They have an associated `Data Repository` that is injected into it scope when calling `Use Case` clojure.

#### 4.`Data Repository`

The `Data Repository` layer implements, in a agnostic manner, all actions related to the data persistency.

It does not talk directly to a database. I has a port to adapt different Database Clients.

`It is a domain's component.` They are consumed by `Use Case` component only.

#### 5.`Data Adapter`

The `Data adapter` is a kind of database client implementation that respect the `Data Repository` port.

It may implement database access through native drivers or ORMs and ODMs.

`It is a domain's component.`

## Required stack

- Node.js (20 preferred)
- Typescript
- Jest
- Redis - used to implement mutex (included as Docker image)
- OpenAPI official typings
- yaml - yaml parser
- Express


## Evaluating the application

1. Install the project

```bash
    npm install
```

2. Run Redis (if you don't have already)

```bash
    npm run docker:composeredis
```

### Run the entire test suite

```bash
    npm test
```

### Run the API - 3000 port

Run with Express

```bash
    npm run dev:fastify
```

Run with Fastify

```bash
    npm run dev:fastify
```

1. Reach the URL http://localhost:3000/doc/ and click in the `Version 1.0.0`. It will open the API documentation.
2. Reach http://localhost:3000/docs/1.0.0 to see the JSON version of the API documentation.


## Contributing to the project

1. Create a new branch.
2. `Run the app in TDD mode - live reload of tests`

```bash
  npm run tdd
```

3. Make your changes.
4. Commit it
5. Ask for PR


### Tooling

`lint code`

```bash
  npm run lint
```

`lint && fix code`

```bash
  npm run lint:fix
```

`commit`

It will run `lint` and `test` before asking info about the commit

```bash
  npm run commit
```

`Commiting code`

Commit messages must follow the [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines)

It generates a changelog following the [Commitizen conventional changelog](https://commitizen-tools.github.io/commitizen/changelog/)


## Backlog and project management

https://github.com/users/web2solutions/projects/1



## Chief engineer at WEB2 Solutions (my own startup) 2008 / 2012

- Developed $dhx (https://github.com/web2solutions/dhx), a JS framework to support the development of big and complex SPAs. It had features such as module system, lazy loading, full featured AJAX implementation built over the xmlHTTP, a simple ORM initially based on the localStorage and then webSQL.

- Developed the Imovél Manager, an ERP for the Real Estate industry having a SPA in the front end and a asynchronous API in the backend built with Perl. The Imovel Manager had 12 modules in the SPA side, such as Cash Flow, CRM and Inventory. Demo: https://dhtmlx.com/blog/customer-spotlight-dhtmlx-cash-flow/

- Developed the Advogado Manager from the scratch. An ERP SaaS for the Lawyer & Attorney industry. It was the first software in the marketing offering realtime updates for process in Brazilian justice branches and courts. It had a SPA in the front, implemented as offline first application and a asynchronous REST API built with Perl in the backend.

- Worked as a consultant and mentor in the development of RIA and SPAs for companies such as CAIRS Solutions, assisting from the training of engineers in Javascript (VanillaJS) to the design of the first SPA version of the "My Adoption Portal", thus enabling the company to decouple the entire frontend layer of their monolith made with PHP.

## Lead Software Engineer at CAIRS Solutions -  2013 / 2020

- Created the CAIRS framework, a VanillaJS framework built only to support the development of large and complex SPAs and PWAs at CAIRS Solutions. It had features such as smart rendering (high performance technique to load huge amount of data into grids), module system/loader, full featured AJAX implementation built over the xmlHTTP, a simple ORM initially based on the localStorage and then webSQL.

- Decoupled the backend and frontend of 2 ERP monolithic PHP applications starting by designing from the scratch Single Page Applications connecting to the new designed REST APIs.

- Mentored the team in learning concepts from Rich Internet Application and Single Page Application to the development of complex frontend applications using frameworks such as DHTMLX, ExtJS, Dojo, Vue and React.

- Built a "Document Sign In" RIA application, similar to the current DocuSign product to support the My Adoption Portal at CAIRS.

- Built the CAIRS Form Builder, a frontend "No-Code" application that allow clients to build dynamic forms.

- Built the CAIRS Table Builder, a frontend "No-Code" application that allow clients to build dynamic grids.


## Open Source Projects - 2005 / 2024


- 2015 - Created the dhxMVP, A full featured framework for building offline first, SPAs, PWAs, browser extensions and Electron applications.

Repo: https://github.com/web2solutions/dhxMVP
App demo: https://web2solutions.github.io/dhxMVP/

- 2012 - Created the $dhx, a VanillaJS framework for realtime && offline enterprise web applications. (No documentation)

https://github.com/web2solutions/dhx

- 2015 - Decepticons - a foundational framework for Single Page Applications, providing features such as Data Stores, Event System, Persistence Layer, Messaging and other. (No documentation)

https://github.com/web2solutions/decepticons
https://github.com/web2solutions/unicron-sdk

- 2020 - Created the Voodux, "with bateries included" offline first, agnostic and scalable, framework "M" layer for all kinds of Javascript application, supporting VanillaJS, Vue, React, DHTMLX.

Doc: https://web2solutions.github.io/voodux/code/index.html

- Starting back at 2007, as a Perl Monger, promoted the adoption of VanillaJS to build rich frontend applications through open source communities and events,  actively participating in the initial efforts in the software community that drove the movement of decoupling the user interfaces as frontend application from the monoliths applications from that time.

Articles: 

- https://eduardo-almeida-blog.vercel.app/blog/lazy-loading
- https://eduardo-almeida-blog.vercel.app/blog/quick-sort
- https://eduardo-almeida-blog.vercel.app/blog/bubble-sort
- https://sao-paulo.pm.org/pub/deploy-de-aplicativo-rico-para-web-com-plack-e-cgi