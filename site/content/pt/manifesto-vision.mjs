// Public ideas recovered from the original technology and product manifesto.
export const vision = {
  opening: {
    note: 'Mais inteligência para construir. Mais humanidade para escolher.',
    cta: 'Explore a tese',
    chapters: [
      'O que mudou',
      'O que construímos',
      'Como construímos',
      'O que combinamos'
    ],
    captions: [
      'Julgamento',
      'Produto que aprende',
      'Autonomia com freios',
      'Impacto multiplicado'
    ]
  },
  evolution: {
    kicker: '01 · O que mudou',
    title: [
      'Escrever código está quase resolvido.',
      'Engenharia não está.'
    ],
    lead: 'O manifesto de fevereiro pedia método acima de ferramenta. O de outubro mantém o método e muda a ambição: aumentar o impacto de cada pessoa.',
    head: [
      'Fevereiro',
      'Outubro'
    ],
    rows: [
      [
        'A IA é um dev mediano.',
        'A IA faz a maior parte do trabalho quando você sabe o que quer.'
      ],
      [
        'Escrever código ainda é o trabalho pesado.',
        'Definir o problema e garantir o resultado viraram o trabalho pesado.'
      ],
      [
        'Crescer o time para aumentar a entrega.',
        'Multiplicar a capacidade de cada pessoa para aumentar o impacto.'
      ]
    ],
    stays: 'O que continua: quem sobe é responsável. Dev pensa produto. PM entende engenharia. Débito técnico é de todos. Ninguém terceiriza o pensar.'
  },
  learning: {
    kicker: '02 · O que construímos',
    title: [
      'O produto deve melhorar',
      'a cada uso.'
    ],
    lead: 'Uma entrega não termina no deploy. Cada ação gera dado, cada decisão encontra um resultado e esse resultado volta ao sistema. A próxima decisão fica melhor.',
    stages: [
      [
        'Datificação',
        'Capture a ação quando ela acontece. Dado estruturado, não uma planilha feita depois.'
      ],
      [
        'Desfecho atribuível',
        'Registre se deu certo e ligue o resultado à decisão que o produziu.'
      ],
      [
        'Algoritmização',
        'A decisão recorrente entra no sistema: medida, corrigida e melhorada.'
      ]
    ],
    loop: [
      'Operação',
      'Dado',
      'Desfecho atribuível',
      'Sistema aprende',
      'Melhor e mais barato'
    ],
    loopNotes: [
      'O produto em uso',
      'O que aconteceu',
      'O resultado da decisão',
      'O que aprendemos',
      'Mais valor por operação'
    ],
    loopCenter: [
      'Cada volta fortalece',
      'a próxima.'
    ],
    loopCaption: 'O resultado volta à decisão. Mais operação gera mais aprendizado, que melhora a próxima operação.',
    advantage: 'O modelo se aluga. A ferramenta se copia. O aprendizado da operação se acumula.',
    advantageText: 'Quem só empacota uma API precisa disputar com a próxima versão do modelo. Quem fecha o ciclo usa cada modelo novo para multiplicar o que já aprendeu.',
    questionsTitle: 'Quatro perguntas antes do roadmap',
    questions: [
      'Qual decisão este produto toma ou apoia?',
      'Qual desfecho prova se a decisão foi boa?',
      'Como esse desfecho retorna ao sistema, ligado à decisão que o gerou?',
      'Qual métrica de aprendizado melhora com o tempo por causa disso?'
    ],
    questionsNote: 'Entram na spec. Não é mais um documento: é deixar explícito como o produto vai aprender.',
    measures: [
      [
        'Produto vivo',
        'Uso, adoção e satisfação mostram que alguém usa.'
      ],
      [
        'Produto aprendendo',
        'A taxa de acerto ao longo do tempo mostra que o sistema está ficando melhor. O começo é uma linha de base, não uma cobrança.'
      ]
    ],
    traps: [
      [
        'O sinal demora?',
        'Defina um indicador de curto prazo e confira se ele continua representando o resultado real.'
      ],
      [
        'O dado resolve o gargalo?',
        'Instrumente a restrição do negócio. Capturar o que é fácil pode gerar muito dado e nenhum resultado.'
      ]
    ]
  },
  proof: {
    kicker: 'Autonomia com evidência',
    title: [
      'Humano nas pontas.',
      'Máquina no meio.'
    ],
    lead: 'Você define o problema e os critérios. O agente executa e traz prova. A revisão é feita com outro contexto. Você decide se o resultado merece existir no mundo.',
    nodes: [
      'Você define',
      'Agente implementa',
      'Checks + review',
      'Você aprova'
    ],
    notes: [
      'Intenção e critérios',
      'Código e testes',
      'Evidência independente',
      'Intenção, risco e arquitetura'
    ],
    caption: 'A pessoa decide nas pontas. Os freios automáticos param a linha no meio. O agente que implementa não aprova a própria entrega.',
    layers: [
      [
        'Checks determinísticos',
        'Tipos, lint e testes barram o erro que já sabemos reconhecer. São rápidos, mas teste verde sozinho não prova que a solução está certa.'
      ],
      [
        'Revisor independente',
        'Outro agente lê o diff, aplica os Standards e confronta a spec. Corrige o que consegue; devolve à pessoa o que exige uma decisão.'
      ],
      [
        'Julgamento humano',
        'Você revisa o problema, o risco, a arquitetura e a experiência. Quanto maior o impacto e mais difícil voltar, mais profunda a revisão.'
      ]
    ],
    loopTitle: 'O mesmo finding não merece a mesma conversa duas vezes.',
    loopLead: 'Corrigir a PR resolve hoje. Melhorar o sistema resolve a próxima. Uma regra mecânica vira check; uma regra de julgamento vira Standard.',
    loop: [
      'Finding',
      'Corrigir',
      'Check ou Standard',
      'Próxima entrega'
    ],
    loopNotes: [
      'O erro apareceu',
      'Resolva a causa',
      'Registre o aprendizado',
      'O sistema já sabe'
    ],
    loopCaption: 'A retro fecha o ciclo entre produção, revisão e a próxima implementação.'
  },
  economics: {
    kicker: 'Recurso a serviço do resultado',
    title: [
      'Frugal com o dinheiro.',
      'Ambicioso com o retorno.'
    ],
    lead: 'Meça o custo com o bolso da empresa. Uma ferramenta que destrava uma entrega não deve ser comparada só com o preço da assinatura, mas com o valor e o tempo que ela libera.',
    items: [
      [
        'Peça o recurso',
        'Conta, crédito, ferramenta, ambiente. Se o limite impede uma boa entrega, traga o problema e o retorno esperado.'
      ],
      [
        'Mostre o resultado',
        'Qualidade em produção, correção rápida, menos retrabalho e impacto no cliente. Consumo de token não é produtividade.'
      ],
      [
        'Aprenda a pedir mais',
        'Limite sobrando toda semana pode ser sinal de que você delega pouco. Teste problemas maiores; meça o que melhorou.'
      ]
    ],
    close: 'Qualidade antes de economia de token. Recurso com propósito. Resultado como medida.'
  },
  harness: {
    kicker: 'O sistema também precisa evoluir',
    title: [
      'Uma boa feature não deveria exigir',
      'ler duas mil linhas para confiar.'
    ],
    lead: 'Esse é o destino. Ainda não estamos lá. Cada erro que vira regra, cada teste que prova uma promessa e cada revisão independente nos aproxima dele.',
    nodes: [
      'Hoje',
      'Aprendizado vira regra',
      'Mais confiança'
    ],
    notes: [
      'Muito código para ler',
      'Checks, skills e Standards',
      'Julgamento no que importa'
    ],
    caption: 'Confiança se constrói com evidência acumulada. Autonomia cresce junto com a capacidade de verificar.',
    items: [
      [
        'Um dono para o sistema',
        'O ambiente de agentes, as skills e os freios precisam de cuidado contínuo.'
      ],
      [
        'Iteração toda semana',
        'Trazer o que funcionou, descartar hype e ajustar o que atrapalha.'
      ],
      [
        'Pareamento e repertório',
        'Nivelar o time e compartilhar casos completos, do problema ao resultado.'
      ],
      [
        'Indicadores de entrega e qualidade',
        'Acompanhar impacto, regressão e tempo de correção. Token não é o placar.'
      ]
    ],
    boundary: 'O destino inclui mais autonomia para mudanças fáceis de reverter, quando houver confiança nos freios. Hoje, o merge continua sendo uma decisão humana.'
  },
  pact: {
    kicker: '04 · O que combinamos',
    title: 'Cada lado entrega o seu.',
    lead: 'Autonomia precisa de contexto, recurso e confiança. Em troca, o time assume o problema do começo ao resultado. O acordo vale para os dois lados.',
    head: [
      'A liderança entrega',
      'O time entrega'
    ],
    rows: [
      [
        'Contexto e o porquê de cada demanda',
        'Ownership do problema ao resultado'
      ],
      [
        'Repertório, pareamento e rituais',
        'Uso inteligente de IA e ensinar o time'
      ],
      [
        'Contas, créditos e ferramentas',
        'Retorno medido em produção'
      ],
      [
        'Tempo reservado para débito técnico',
        'Arquitetura sólida e código simples'
      ],
      [
        'Review e decisão rápidos',
        'Entrega rápida, no nível de risco certo'
      ],
      [
        'Espaço para encontrar e corrigir erros',
        'Todo erro vira melhoria no sistema'
      ],
      [
        'Retirar o que não funciona',
        'Feedback honesto sobre ferramentas e processos'
      ]
    ]
  },
  profile: {
    kicker: 'O perfil que cresce aqui',
    title: [
      'A régua sobe.',
      'O time cresce.'
    ],
    lead: 'A capacidade de executar se multiplicou. O que vamos valorizar é a capacidade de transformar essa execução em um produto melhor.',
    items: [
      [
        'Ownership',
        'Encontrar o problema e levar a solução até o fim.'
      ],
      [
        'Julgamento técnico e taste',
        'Arquitetura sólida, código simples e produto bonito.'
      ],
      [
        'Qualidade medida',
        'Pouca regressão, poucos bugs e correção rápida.'
      ],
      [
        'Uso inteligente de IA',
        'Pedir grande, desafiar a resposta e exigir prova.'
      ],
      [
        'Conhecimento do negócio',
        'Entender o cliente e o domínio da sua frente.'
      ],
      [
        'Ensinar o time',
        'Trazer de volta o que funciona e multiplicar os outros.'
      ]
    ]
  },
  diagrams: {
    legend: [
      'Pessoa decide',
      'Agente executa',
      'Check verifica'
    ],
    bottleneckCaption: 'Antes, a execução restringia a entrega. Agora, a decisão e a verificação precisam acompanhar a capacidade de construir.',
    workflowCaption: 'Planejamento prova o valor. Hardening transforma o corte aprovado em produção. Cada G é uma decisão de uma pessoa.',
    gateNames: [
      'Problema aceito',
      'Intent aprovado',
      'Pronto para demo',
      'Demo provou valor',
      'Plano técnico aprovado',
      'PR pronta para merge',
      'Entregue de verdade'
    ],
    planning: '01 · Provar o valor',
    hardening: '02 · Construir com rigor',
    workflowNodes: [
      'Problema',
      'Intent',
      'Grill',
      'Demo',
      'Spec e corte da v1',
      'Fatias + implementação',
      'Revisão + PR',
      'Produção + retro'
    ],
    workflowNotes: [
      'Uma dor real',
      'Resultado e limites',
      'Você decide; a IA entrevista',
      'O usuário experimenta',
      'O TL decide o que fica',
      'Uma entrega demonstrável por fatia',
      'Checks, bot e pessoa',
      'Resultado volta ao sistema'
    ],
    valueGate: 'Provou valor?',
    yes: 'Sim',
    retry: 'Ainda não: volte ao grill',
    small: [
      'Problema pequeno',
      'Agente tenta',
      'Resultado funciona?'
    ],
    smallNotes: [
      'Print e contexto',
      'Correção proporcional',
      'Verifique a entrega'
    ],
    smallCaption: 'Se a tentativa revelar uma decisão maior, volte ao planejamento. O rigor acompanha o problema.',
    cut: [
      'Demo ampla',
      'Corte da v1',
      'Hardening',
      'Produção'
    ],
    cutNotes: [
      'Explore possibilidades',
      'Escolha o que provou valor',
      'Reaproveite ou reescreva',
      'Só o corte aprovado'
    ],
    cutCaption: 'A demo pode ser grande. A versão de produção é um corte deliberado, aprovado no G4.',
    risk: [
      'Verificar',
      'Merge',
      'Observar e reverter'
    ],
    riskNotes: [
      'Testes, review e evidência',
      'Uma pessoa decide',
      'Flag, monitoramento e revert'
    ],
    riskCaption: 'Verificação antes. Observação depois. Uma rota de volta pronta desde o começo.'
  }
};
