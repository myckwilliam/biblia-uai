# Guia de estilo — o causo mineiro

O narrador da Bíblia Uai é um mineiro de prosa mansa, da roça, que conhece a história de cor e gosta de contar causo no alpendre. Ele num tem pressa, num quer convencer ninguém e trata a fé com respeito — mas também sabe rir.

## A voz

- **Calma e desconfiada.** Mineiro pensa duas vezes antes de falar. A frase pode começar com “Olha só…”, “Presta atenção, sô…”, “O causo é assim…”.
- **Understatement.** O milagre é contado como se fosse a coisa mais natural do mundo: “Aí Deus falou… e a luz apareceu, uai.”
- **Humor de observação, não de deboche.** O riso vem do jeito de contar, das comparações com a roça, do espanto contido. Nunca da fé ou das pessoas.
- **Ternura.** A Bíblia Uai é um presente. O tom é de quem conta pra alguém querido, não de quem faz piada da religião.

## Convenções de escrita

| Mineirês | Português padrão |
| --- | --- |
| ocê / ocês | você / vocês |
| num (antes do verbo) | não |
| tá, tô, tava | está, estou, estava |
| pra, pro, pras, pros | para, para o, para as, para os |
| que nem | como, igual a |
| causo | história, episódio |
| trem | coisa |
| bão | bom |
| sô | senhor (vocativo) |
| benza Deus | expressão de espanto/agradecimento |
| uai | ênfase, espanto, pausa |
| demais da conta | muito |
| na roça | no campo |
| de roça | caseiro, simples |

- Use **“uai” com moderação**: uma vez a cada dois ou três versículos basta. Se todo versículo termina em “uai”, vira caricatura.
- Pode cortar o “r” do infinitivo (“andá”, “fazê”, “comê”), mas sem exagero. O texto precisa continuar legível.
- Pode usar “nós vai”, “a gente vai”, “ocês vão”. Misture naturalmente.
- Evite gírias de outras regiões ( “mano”, “tipo assim”, “bagulho”).
- Mantenha nomes próprios e termos teológicos: Deus, Jesus, Cristo, Espírito Santo, profeta, apóstolo, fariseu, manjedoura.
- Não troque “Senhor” por “chefe” nem “discípulos” por “turma” só pra forçar graça.

## Fidelidade ao texto

1. **Uma entrada por versículo**, na mesma ordem e com o mesmo número.
2. **Não invente doutrina, cena ou personagem.** A piada pode estar na voz, não no conteúdo.
3. **Não corte o sentido.** Se o versículo é uma promessa, a promessa continua lá; se é uma ordem, a ordem continua.
4. **Pode condensar** repetições do original, mas não omita a ideia central.
5. **Diálogos** usam travessão (—) e aspas curvas (“ ”) quando houver citação dentro da fala.
6. **Nada de ironia com quem sofre.** Em passagens de dor, doença e morte, o humor sai de cena e a ternura assume.

## Exemplos

**Gênesis 1:1**
> No começo de tudo, quando ainda num tinha nada, nada mesmo, Deus criou o céu e a terra. E foi assim, sem mais conversa.

**Salmo 23:1**
> O Senhor é meu pastor. Num me falta nada, não.

**João 3:16**
> Porque Deus amou o mundo de um jeito tão grande que deu o Filho único dele, pra que todo mundo que crê nele num morra, não, mas tenha a vida eterna.

**Isaías 41:10**
> Num tenha medo, que eu tô com ocê; num se assombre, que eu sou o seu Deus. Eu fortaleço ocê, ajudo ocê e seguro ocê com a minha mão direita de justiça.

**1 Coríntios 13:4**
> O amor é paciente, o amor é bondoso. Num tem inveja, num é orgulhoso, num é arrogante.

## Checklist antes de publicar um capítulo

- [ ] Todos os versículos do capítulo estão presentes, na ordem.
- [ ] O sentido de cada versículo foi preservado.
- [ ] O texto soa como uma pessoa falando, não como uma lista de piadas.
- [ ] “Uai” não aparece em toda frase.
- [ ] Nomes e termos teológicos estão corretos.
- [ ] Passagens tristes foram tratadas com cuidado.
- [ ] A contagem de versículos do site foi atualizada.

## Expandindo com o OpenCode

O script `scripts/expandir.mjs` lê um capítulo da BCC, monta um prompt com estas regras e chama `opencode run` usando a autenticação do seu OpenCode. O resultado sai em `data/gerado/` pra revisão manual. Sempre revise: o modelo pode escorregar no tom ou cortar um versículo.
