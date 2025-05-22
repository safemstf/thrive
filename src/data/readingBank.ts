export type ReadingPassage = {
  id: string;
  title: string;
  lexile: number;      // approximate, max 1700
  sourceUrl: string;   // for attribution / fetching
  text: string;        // cut down to ~200–300 words per passage
};

export const readingBank: ReadingPassage[] = [
  {
    id: "alice_in_wonderland",
    title: "Alice’s Adventures in Wonderland (excerpt)",
    lexile: 870,
    sourceUrl: "https://www.gutenberg.org/ebooks/11",
    text: `Alice was beginning to get very tired of sitting by her sister on the bank...`
  },
  {
    id: "hobbit_ch1",
    title: "The Hobbit, Ch.1 (excerpt)",
    lexile: 1000,
    sourceUrl: "https://www.gutenberg.org/ebooks/author/131",
    text: `In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole...`
  },
  {
    id: "pride_and_prejudice",
    title: "Pride and Prejudice (excerpt)",
    lexile: 1100,
    sourceUrl: "https://www.gutenberg.org/ebooks/1342",
    text: `It is a truth universally acknowledged, that a single man in possession of a good fortune...`
  },
  {
    id: "frankenstein",
    title: "Frankenstein (excerpt)",
    lexile: 1250,
    sourceUrl: "https://www.gutenberg.org/ebooks/84",
    text: `You will rejoice to hear that no disaster has accompanied the commencement of an enterprise...`
  },
  {
    id: "sherlock_holmes",
    title: "The Adventures of Sherlock Holmes (excerpt)",
    lexile: 1150,
    sourceUrl: "https://www.gutenberg.org/ebooks/1661",
    text: `To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name...`
  },
  {
    id: "hemingway_hills",
    title: "Hills Like White Elephants (Hemingway, excerpt)",
    lexile: 1300,
    sourceUrl: "https://www.gutenberg.org/ebooks/author/37",
    text: `The hills across the valley of the Ebro were long and white...`
  },
  {
    id: "dostoyevsky_crime",
    title: "Crime and Punishment (Dostoyevsky, excerpt)",
    lexile: 1450,
    sourceUrl: "https://www.gutenberg.org/ebooks/2554",
    text: `On an exceptionally hot evening early in July a young man came out of the garret...`
  },
  {
    id: "jane_eyre",
    title: "Jane Eyre (excerpt)",
    lexile: 1250,
    sourceUrl: "https://www.gutenberg.org/ebooks/1260",
    text: `There was no possibility of taking a walk that day...`
  },
  {
    id: "treasure_island",
    title: "Treasure Island (excerpt)",
    lexile: 1050,
    sourceUrl: "https://www.gutenberg.org/ebooks/120",
    text: `Squire Trelawney, Dr. Livesey, and the rest of these gentlemen having asked me...`
  },
  {
    id: "dracula",
    title: "Dracula (excerpt)",
    lexile: 1200,
    sourceUrl: "https://www.gutenberg.org/ebooks/345",
    text: `3 May. Bistritz.—Left Munich at 8:35 P.M....`
  },
  {
    id: "war_and_peace",
    title: "War and Peace (Tolstoy, excerpt)",
    lexile: 1400,
    sourceUrl: "https://www.gutenberg.org/ebooks/2600",
    text: `“Eh bien, mon prince,” said Anna Pavlovna...`
  },
 {
    id: "chomsky_structuralist_essay",
    title: "Syntactic Structures (Chomsky, excerpt)",
    lexile: 1800,
    sourceUrl: "https://www.chomsky.info/syntactic.htm",
    text: `In the course of this discussion we shall examine the essential properties of phrase structure grammars...`
  },
  {
    id: "chomsky_power",
    title: "Manufacturing Consent (Chomsky, excerpt)",
    lexile: 1750,
    sourceUrl: "https://chomsky.info/mc3/",
    text: `It is necessary to ask how consent can be manufactured in a society where modern industrial means of communication are concentrated in the hands of a few...`
  },
  {
    id: "keynes_general_theory",
    title: "The General Theory of Employment, Interest, and Money (Keynes, excerpt)",
    lexile: 1700,
    sourceUrl: "https://www.marxists.org/reference/subject/economics/keynes/general-theory/",
    text: `The outstanding faults of the classical theory are...`
  },
  {
    id: "hayek_road_serfdom",
    title: "The Road to Serfdom (Hayek, excerpt)",
    lexile: 1700,
    sourceUrl: "https://www.econlib.org/library/NPDBooks/Hayek/hykRS3.html",
    text: `The original error of socialism lay in conceiving social organization as a purely mechanical system...`
  },
  {
    id: "popper_scientific_discovery",
    title: "The Logic of Scientific Discovery (Popper, excerpt)",
    lexile: 1800,
    sourceUrl: "https://www.marxists.org/reference/subject/philosophy/works/au/popper.htm",
    text: `The criterion of falsifiability is what distinguishes science from non-science...`
  },
  {
    id: "sen_idea_of_justice",
    title: "The Idea of Justice (Sen, excerpt)",
    lexile: 1650,
    sourceUrl: "https://scholar.harvard.edu/sen/publications",
    text: `We have to look at the realization of capabilities rather than abstract principles...`
  },
  {
    id: "freire_pedagogy",
    title: "Pedagogy of the Oppressed (Freire, excerpt)",
    lexile: 1600,
    sourceUrl: "https://www.marxists.org/subject/education/freire/pedagogy/index.htm",
    text: `Education must begin with the solution of the teacher-student contradiction...`
  },
  {
    id: "foucault_discipline",
    title: "Discipline and Punish (Foucault, excerpt)",
    lexile: 1750,
    sourceUrl: "https://monoskop.org/images/4/4f/Foucault_Michel_Discipline_and_Punish.pdf",
    text: `The body is directly captured by the coercion of power: an anatomo-politics of the human body...`
  },
  {
    id: "marx_manifesto",
    title: "The Communist Manifesto (Marx & Engels, excerpt)",
    lexile: 1550,
    sourceUrl: "https://www.gutenberg.org/ebooks/61",
    text: `Workers of the world unite! You have nothing to lose but your chains...`
  },
  {
    id: "weber_protestant_ethic",
    title: "The Protestant Ethic and the Spirit of Capitalism (Weber, excerpt)",
    lexile: 1600,
    sourceUrl: "https://www.gutenberg.org/ebooks/author/2093",
    text: `Ascetic Protestantism subjected worldly activity to a discipline of work...`
  },
  {
    id: "arendt_human_condition",
    title: "The Human Condition (Arendt, excerpt)",
    lexile: 1700,
    sourceUrl: "https://monoskop.org/images/9/94/Arendt_Hannah_The_Human_Condition.pdf",
    text: `The vita activa, or active life, and an understanding of the political realm...`
  },
  {
    id: "diamond_guns_steel",
    title: "Guns, Germs, and Steel (Diamond, excerpt)",
    lexile: 1550,
    sourceUrl: "https://www.gutenberg.org/ebooks/author/2788",
    text: `Geographic and environmental factors shaped the modern world...`
  },
  {
    id: "smith_wealth_of_nations",
    title: "The Wealth of Nations (Smith, excerpt)",
    lexile: 1650,
    sourceUrl: "https://www.gutenberg.org/ebooks/3300",
    text: `The annual labour of every nation is the fund which originally supplies it...`
  },
  {
    id: "marx_capital",
    title: "Capital, Vol. 1 (Marx, excerpt)",
    lexile: 1800,
    sourceUrl: "https://www.marxists.org/archive/marx/works/1867-c1/",
    text: `The wealth of societies in which the capitalist mode of production prevails appears as an immense accumulation...`
  },
  {
    id: "keynes_essays_mr_merc",
    title: "Essays in Persuasion (Keynes, excerpt)",
    lexile: 1600,
    sourceUrl: "https://www.econlib.org/library/Keynes/kpeindex.html",
    text: `In the long run we are all dead, but in the...`
  }, 


{
    id: "logic_scientific_discovery",
    title: "The Logic of Scientific Discovery (Popper, excerpt)",
    lexile: 1800,
    sourceUrl: "https://www.marxists.org/reference/subject/philosophy/works/au/popper.htm",
    text: `The criterion of falsifiability is what distinguishes science from non-science...`
  },
  {
    id: "sen_idea_of_justice",
    title: "The Idea of Justice (Sen, excerpt)",
    lexile: 1650,
    sourceUrl: "https://scholar.harvard.edu/sen/publications",
    text: `We have to look at the realization of capabilities rather than abstract principles...`
  },
  {
    id: "freire_pedagogy",
    title: "Pedagogy of the Oppressed (Freire, excerpt)",
    lexile: 1600,
    sourceUrl: "https://www.marxists.org/subject/education/freire/pedagogy/index.htm",
    text: `Education must begin with the solution of the teacher-student contradiction...`
  },
  {
    id: "foucault_discipline",
    title: "Discipline and Punish (Foucault, excerpt)",
    lexile: 1750,
    sourceUrl: "https://monoskop.org/images/4/4f/Foucault_Michel_Discipline_and_Punish.pdf",
    text: `The body is directly captured by the coercion of power: an anatomo-politics of the human body...`
  },
  {
    id: "marx_manifesto",
    title: "The Communist Manifesto (Marx & Engels, excerpt)",
    lexile: 1550,
    sourceUrl: "https://www.gutenberg.org/ebooks/61",
    text: `Workers of the world unite! You have nothing to lose but your chains...`
  },
  {
    id: "weber_protestant_ethic",
    title: "The Protestant Ethic and the Spirit of Capitalism (Weber, excerpt)",
    lexile: 1600,
    sourceUrl: "https://www.gutenberg.org/ebooks/author/2093",
    text: `Ascetic Protestantism subjected worldly activity to a discipline of work...`
  },
  {
    id: "arendt_human_condition",
    title: "The Human Condition (Arendt, excerpt)",
    lexile: 1700,
    sourceUrl: "https://monoskop.org/images/9/94/Arendt_Hannah_The_Human_Condition.pdf",
    text: `The vita activa, or active life, and an understanding of the political realm...`
  },
  {
    id: "diamond_guns_steel",
    title: "Guns, Germs, and Steel (Diamond, excerpt)",
    lexile: 1550,
    sourceUrl: "https://www.gutenberg.org/ebooks/author/2788",
    text: `Geographic and environmental factors shaped the modern world...`
  },
  {
    id: "wealth_of_nations",
    title: "The Wealth of Nations (Smith, excerpt)",
    lexile: 1650,
    sourceUrl: "https://www.gutenberg.org/ebooks/3300",
    text: `The annual labour of every nation is the fund which originally supplies it...`
  },
  {
    id: "marx_capital",
    title: "Capital, Vol. 1 (Marx, excerpt)",
    lexile: 1800,
    sourceUrl: "https://www.marxists.org/archive/marx/works/1867-c1/",
    text: `The wealth of societies in which the capitalist mode of production prevails appears as an immense accumulation...`
  },
  {
    id: "essays_in_persuasion",
    title: "Essays in Persuasion (Keynes, excerpt)",
    lexile: 1600,
    sourceUrl: "https://www.econlib.org/library/Keynes/kpeindex.html",
    text: `In the long run we are all dead, but in the...`
  },
];