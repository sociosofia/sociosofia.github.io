export const COURSE = {
  id: 'sesi-rio-claro-sociologia-1ano',
  school: 'SESI Rio Claro',
  year: '1º ano',
  discipline: 'Sociologia',
  title: 'Sociologia · 1º ano',
  description: 'Um percurso anual para acompanhar as aulas, retomar conceitos e revisar os capítulos do livro.',
  sourcePath: '/alunos/sociologia-1ano/',
  stages: [
    {
      id: 'etapa-1',
      name: '1ª etapa',
      description: 'Do nascimento da Sociologia à análise da desigualdade.',
      chapters: [
        { id: 1, title: 'Fundação e construção do pensamento sociológico', pages: '12–29' },
        { id: 2, title: 'A dinâmica das relações entre indivíduo e sociedade', pages: '30–41' },
        { id: 3, title: 'Processo de socialização e suas instituições', pages: '42–55' },
        { id: 4, title: 'Caracterizando a mobilidade e a desigualdade sociais', pages: '56–69' }
      ]
    },
    {
      id: 'etapa-2',
      name: '2ª etapa',
      description: 'Diferença, violência, cultura, ideologia e resistência.',
      chapters: [
        { id: 5, title: 'Diferentes, sim. Desiguais, não! Reflexões sobre a origem da violência', pages: '70–93' },
        { id: 6, title: 'Ninguém é igual a ninguém: culturas, diferenças e diversidades', pages: '94–101' },
        { id: 7, title: 'Ideologia: cultura, sociedade e resistência', pages: '102–117' }
      ]
    },
    {
      id: 'etapa-3',
      name: '3ª etapa',
      description: 'Problemas contemporâneos: ambiente, tecnologia e migrações.',
      chapters: [
        { id: 8, title: 'Sustentabilidade e meio ambiente: o que eu tenho a ver com isso?', pages: '118–141' },
        { id: 9, title: 'Sociedade digitalizada: comunicação, informação e tecnologia', pages: '142–161' },
        { id: 10, title: 'Fluxos globais, migrações e xenofobia', pages: '162–185' }
      ]
    }
  ]
};

export const CHAPTERS = COURSE.stages.flatMap((stage) =>
  stage.chapters.map((chapter) => ({ ...chapter, stageId: stage.id, stageName: stage.name }))
);
