export type ReadingPassage = {
  id: string;
  title: string;
  lexile: number;
  sourceUrl: string;
  text: string;
};

export const readingBank: ReadingPassage[] = [

  {
    id: "alice_in_wonderland",
    title: "Alice’s Adventures in Wonderland (excerpt)",
    lexile: 870,
    sourceUrl: "https://www.gutenberg.org/files/11/11-0.txt",
    text: `
[Illustration] Alice’s Adventures in Wonderland by Lewis Carroll THE MILLENNIUM FULCRUM EDITION 3.0 Contents CHAPTER I. Down the Rabbit-Hole CHAPTER II. The Pool of Tears CHAPTER III. A Caucus-Race and a Long Tale CHAPTER IV. The Rabbit Sends in a Little Bill CHAPTER V. Advice from a Caterpillar CHAPTER VI. Pig and Pepper CHAPTER VII. A Mad Tea-Party CHAPTER VIII. The Queen’s Croquet-Ground CHAPTER IX. The Mock Turtle’s Story CHAPTER X. The Lobster Quadrille CHAPTER XI. Who Stole the Tarts? CHAPTER XII. Alice’s Evidence CHAPTER I. Down the Rabbit-Hole Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice “without pictures or conversations?” So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her. There was nothing so _very_ remarkable in that; nor did Alice think it so _very_ much out of the way to hear the Rabbit say to itself, “Oh dear! Oh dear! I shall be late!” (when she thought it over afterwards, it occurred to her that she ought to
` ,
  },

  {
    id: "hobbit_ch1",
    title: "The Hobbit, Ch.1 (excerpt)",
    lexile: 1000,
    sourceUrl: "https://www.gutenberg.org/files/2554/2554-0.txt",
    text: `
CRIME AND PUNISHMENT By Fyodor Dostoevsky Translated By Constance Garnett TRANSLATOR’S PREFACE A few words about Dostoevsky himself may help the English reader to understand his work. Dostoevsky was the son of a doctor. His parents were very hard-working and deeply religious people, but so poor that they lived with their five children in only two rooms. The father and mother spent their evenings in reading aloud to their children, generally from books of a serious character. Though always sickly and delicate Dostoevsky came out third in the final examination of the Petersburg school of Engineering. There he had already begun his first work, “Poor Folk.” This story was published by the poet Nekrassov in his review and was received with acclamations. The shy, unknown youth found himself instantly something of a celebrity. A brilliant and successful career seemed to open before him, but those hopes were soon dashed. In 1849 he was arrested. Though neither by temperament nor conviction a revolutionist, Dostoevsky was one of a little group of young men who met together to read Fourier and Proudhon. He was accused of “taking part in conversations against the censorship, of reading a letter from Byelinsky to Gogol, and of knowing of the intention to set up a printing press.” Under Nicholas I. (that “stern and just man,” as Maurice Baring calls him) this was enough, and he was condemned to death. After eight months’ imprisonment he was with twenty-one others taken out to the Semyonovsky Square to be
` ,
  },

  {
    id: "pride_and_prejudice",
    title: "Pride and Prejudice (excerpt)",
    lexile: 1100,
    sourceUrl: "https://www.gutenberg.org/ebooks/1342",
    text: `
It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.
However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so
well fixed in the minds of the surrounding families, that he is considered as the rightful property of someone or other
of their daughters. “My dear Mr. Bennet,” said his lady to him one day, “have you heard that Netherfield Park is let
at last?”` ,
  },

  {
    id: "frankenstein",
    title: "Frankenstein (excerpt)",
    lexile: 1250,
    sourceUrl: "https://www.gutenberg.org/ebooks/84",
    text: `
You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded
with such evil forebodings. I arrived here yesterday, and my first task is to assure my dear sister of my welfare and
increasing confidence in the success of my undertaking. I am already far north of London, and as I walk in the streets
of Petersburgh, I feel a cold northern breeze play upon my cheeks, which braces my nerves and fills me with delight.
` ,
  },

  {
    id: "sherlock_holmes",
    title: "The Adventures of Sherlock Holmes (excerpt)",
    lexile: 1150,
    sourceUrl: "https://www.gutenberg.org/ebooks/1661",
    text: `
﻿The Project Gutenberg eBook of The Adventures of Sherlock Holmes, by Arthur Conan Doyle This eBook is for the use of anyone anywhere in the United States and most other parts of the world at no cost and with almost no restrictions whatsoever. You may copy it, give it away or re-use it under the terms of the Project Gutenberg License included with this eBook or online at www.gutenberg.org. If you are not located in the United States, you will have to check the laws of the country where you are located before using this eBook. Title: The Adventures of Sherlock Holmes Author: Arthur Conan Doyle Release Date: November 29, 2002 [eBook #1661] [Most recently updated: October 10, 2023] Language: English Character set encoding: UTF-8 Produced by: an anonymous Project Gutenberg volunteer and Jose Menendez *** START OF THE PROJECT GUTENBERG EBOOK THE ADVENTURES OF SHERLOCK HOLMES *** The Adventures of Sherlock Holmes by Arthur Conan Doyle Contents I. A Scandal in Bohemia II. The Red-Headed League III. A Case of Identity IV. The Boscombe Valley Mystery V. The Five Orange Pips VI. The Man with the Twisted Lip VII. The Adventure of the Blue Carbuncle VIII. The Adventure of the Speckled Band IX. The Adventure of the Engineer’s Thumb X. The Adventure of the Noble Bachelor XI. The Adventure of the Beryl Coronet XII. The Adventure of the Copper Beeches I. A SCANDAL IN BOHEMIA I. To Sherlock Holmes she is always _the_ woman. I have seldom heard him
` ,
  },

  {
    id: "hemingway_hills",
    title: "Hills Like White Elephants (Hemingway, excerpt)",
    lexile: 1300,
    sourceUrl: "https://www.gutenberg.org/ebooks/author/37",
    text: `
The hills across the valley of the Ebro were long and white on this side of the river. The American and the girl with
him sat at a table in the shade, their legs apart and the table between them. “They look like white elephants,” the
American said. “I’ve never seen one,” the girl replied. “No, you wouldn’t have,” the American said. It was very hot
and the express train was waiting in the station.
` ,
  },

  {
    id: "dostoyevsky_crime",
    title: "Crime and Punishment (Dostoyevsky, excerpt)",
    lexile: 1450,
    sourceUrl: "https://www.gutenberg.org/ebooks/2554",
    text: `
CRIME AND PUNISHMENT By Fyodor Dostoevsky Translated By Constance Garnett TRANSLATOR’S PREFACE A few words about Dostoevsky himself may help the English reader to understand his work. Dostoevsky was the son of a doctor. His parents were very hard-working and deeply religious people, but so poor that they lived with their five children in only two rooms. The father and mother spent their evenings in reading aloud to their children, generally from books of a serious character. Though always sickly and delicate Dostoevsky came out third in the final examination of the Petersburg school of Engineering. There he had already begun his first work, “Poor Folk.” This story was published by the poet Nekrassov in his review and was received with acclamations. The shy, unknown youth found himself instantly something of a celebrity. A brilliant and successful career seemed to open before him, but those hopes were soon dashed. In 1849 he was arrested. Though neither by temperament nor conviction a revolutionist, Dostoevsky was one of a little group of young men who met together to read Fourier and Proudhon. He was accused of “taking part in conversations against the censorship, of reading a letter from Byelinsky to Gogol, and of knowing of the intention to set up a printing press.” Under Nicholas I. (that “stern and just man,” as Maurice Baring calls him) this was enough, and he was condemned to death. After eight months’ imprisonment he was with twenty-one others taken out to the Semyonovsky Square to be
` ,
  },

  {
    id: "jane_eyre",
    title: "Jane Eyre (excerpt)",
    lexile: 1250,
    sourceUrl: "https://www.gutenberg.org/ebooks/1260",
    text: `
There was no possibility of taking a walk that day. We had been wandering, indeed, in the leafless shrubbery an
hour in the morning; but since dinner (Mrs. Reed, when there was no company, dined early) the cold winter wind
had brought with it clouds so sombre, and a rain so penetrating, that further out-door exercise was now out of the
question. I was glad of it; I never liked long walks, especially on chilly afternoons.
` ,
  },

  {
    id: "treasure_island",
    title: "Treasure Island (excerpt)",
    lexile: 1050,
    sourceUrl: "https://www.gutenberg.org/ebooks/120",
    text: `
TREASURE ISLAND by Robert Louis Stevenson TREASURE ISLAND To S.L.O., an American gentleman in accordance with whose classic taste the following narrative has been designed, it is now, in return for numerous delightful hours, and with the kindest wishes, dedicated by his affectionate friend, the author. TO THE HESITATING PURCHASER If sailor tales to sailor tunes, Storm and adventure, heat and cold, If schooners, islands, and maroons, And buccaneers, and buried gold, And all the old romance, retold Exactly in the ancient way, Can please, as me they pleased of old, The wiser youngsters of today: --So be it, and fall on! If not, If studious youth no longer crave, His ancient appetites forgot, Kingston, or Ballantyne the brave, Or Cooper of the wood and wave: So be it, also! And may I And all my pirates share the grave Where these and their creations lie! CONTENTS PART ONE The Old Buccaneer I. THE OLD SEA-DOG AT THE ADMIRAL BENBOW.... 11 II. BLACK DOG APPEARS AND DISAPPEARS...... 17 III. THE BLACK SPOT.............. 24 IV. THE SEA-CHEST............... 30 V. THE LAST OF THE BLIND MAN.......... 36 VI. THE CAPTAIN’S PAPERS............
` ,
  },

  {
    id: "dracula",
    title: "Dracula (excerpt)",
    lexile: 1200,
    sourceUrl: "https://www.gutenberg.org/ebooks/345",
    text: `
3 May. Bistritz.— Left Munich at 8:35 P.M., on 1st May, arriving at Vienna early next morning; should have arrived
at 6:46, but train was an hour late. Buda-Pesth seems a wonderful place, from the glimpse which I got of it from
the train and the little I could walk through the streets. I feared to go very far from the station, as we had arrived
late and would start as near the correct time as possible.` ,
  },

  {
    id: "chomsky_power",
    title: "Manufacturing Consent (Chomsky, excerpt)",
    lexile: 1750,
    sourceUrl: "https://chomsky.info/mc3/",
    text: `
It is necessary to ask how consent can be manufactured in a society where modern industrial means
` ,
  },

  {
    id: "keynes_general_theory",
    title: "The General Theory of Employment, Interest, and Money (Keynes, excerpt)",
    lexile: 1700,
    sourceUrl: "https://www.marxists.org/reference/subject/economics/keynes/general-theory/",
    text: `
The outstanding faults of the classical theory are...
` ,
  },

  {
    id: "hayek_road_serfdom",
    title: "The Road to Serfdom (Hayek, excerpt)",
    lexile: 1700,
    sourceUrl: "https://www.econlib.org/library/NPDBooks/Hayek/hykRS3.html",
    text: `
The original error of socialism lay in conceiving social organization as a    
` ,
  },

  {
    id: "sen_idea_of_justice",
    title: "Theea of Justice (Sen, excerpt)",
    lexile: 1650,
    sourceUrl: "https://scholar.harvard.edu/sen/publications",
    text: `
We have to look at the realization of capabilities rather than abstract principles...
` ,
  },

  {
    id: "freire_pedagogy",
    title: "Pedagogy of the Oppressed (Freire, excerpt)",
    lexile: 1600,
    sourceUrl: "https://www.marxists.org/subject/education/freire/pedagogy/index.htm",
    text: `
Education must begin.
` ,
  },

  {
    id: "foucault_discipline",
    title: "Discipline and Punish (Foucault, excerpt)",
    lexile: 1750,
    sourceUrl: "https://monoskop.org/images/4/4f/Foucault_Michel_Discipline_and_Punish.pdf",
    text: `
The    
` ,
  },

  {
    id: "marx_manifesto",
    title: "The Communist Manifesto (Marx & Engels, excerpt)",
    lexile: 1550,
    sourceUrl: "https://www.gutenberg.org/ebooks/61",
    text: `
The Communist Manifesto by Karl Marx and Friedrich Engels [From the English edition of 1888, edited by Friedrich Engels] Contents I. BOURGEOIS AND PROLETARIANS II. PROLETARIANS AND COMMUNISTS III. SOCIALIST AND COMMUNIST LITERATURE IV. POSITION OF THE COMMUNISTS IN RELATION TO THE VARIOUS EXISTING OPPOSITION PARTIES A spectre is haunting Europe—the spectre of Communism. All the Powers of old Europe have entered into a holy alliance to exorcise this spectre: Pope and Czar, Metternich and Guizot, French Radicals and German police-spies. Where is the party in opposition that has not been decried as Communistic by its opponents in power? Where is the Opposition that has not hurled back the branding reproach of Communism, against the more advanced opposition parties, as well as against its reactionary adversaries? Two things result from this fact. I. Communism is already acknowledged by all European Powers to be itself a Power. II. It is high time that Communists should openly, in the face of the whole world, publish their views, their aims, their tendencies, and meet this nursery tale of the Spectre of Communism with a Manifesto of the party itself. To this end, Communists of various nationalities have assembled in London, and sketched the following Manifesto, to be published in the English, French, German, Italian, Flemish and Danish languages. I. BOURGEOIS AND PROLETARIANS The history of all hitherto existing societies is the history of class struggles. Freeman and slave, patrician and plebeian, lord and serf, guild-master and journeyman, in a word, oppressor and oppressed,
` ,
  },

  {
    id: "weber_protestant_ethic",
    title: "The Protestant Ethic and the Spirit of Capitalism (Weber, excerpt)",
    lexile: 1600,
    sourceUrl: "https://www.gutenberg.org/ebooks/author/2093",
    text: `
Ascetic Protestantism subjected worldly activity to a discipline of work...
` ,
  },

  {
    id: "arendt_human_condition",
    title: "The Human Condition (Arendt, excerpt)",
    lexile: 1700,
    sourceUrl: "https://monoskop.org/images/9/94/Arendt_Hannah_The_Human_Condition.pdf",
    text: `
The vita activa, or active    
` ,
  },

  {
    id: "diamond_guns_steel",
    title: "Guns, Germs, and Steel (Diamond, excerpt)",
    lexile: 1550,
    sourceUrl: "https://www.gutenberg.org/ebooks/author/2788",
    text: `
Geographic and environmental factors shaped the modern world...
` ,
  },

  {
    id: "smith_wealth_of_nations",
    title: "The Wealth of Nations (Smith, excerpt)",
    lexile: 1650,
    sourceUrl: "https://www.gutenberg.org/ebooks/3300",
    text: `
An Inquiry into the Nature and Causes of the Wealth of Nations by Adam Smith Contents INTRODUCTION AND PLAN OF THE WORK. BOOK I. OF THE CAUSES OF IMPROVEMENT IN THE PRODUCTIVE POWERS OF LABOUR, AND OF THE ORDER ACCORDING TO WHICH ITS PRODUCE IS NATURALLY DISTRIBUTED AMONG THE DIFFERENT RANKS OF THE PEOPLE. CHAPTER I. OF THE DIVISION OF LABOUR. CHAPTER II. OF THE PRINCIPLE WHICH GIVES OCCASION TO THE DIVISION OF LABOUR. CHAPTER III. THAT THE DIVISION OF LABOUR IS LIMITED BY THE EXTENT OF THE MARKET. CHAPTER IV. OF THE ORIGIN AND USE OF MONEY. CHAPTER V. OF THE REAL AND NOMINAL PRICE OF COMMODITIES, OR OF THEIR PRICE IN LABOUR, AND THEIR PRICE IN MONEY. CHAPTER VI. OF THE COMPONENT PART OF THE PRICE OF COMMODITIES. CHAPTER VII. OF THE NATURAL AND MARKET PRICE OF COMMODITIES. CHAPTER VIII. OF THE WAGES OF LABOUR. CHAPTER IX. OF THE PROFITS OF STOCK. CHAPTER X. OF WAGES AND PROFIT IN THE DIFFERENT EMPLOYMENTS OF LABOUR AND STOCK. CHAPTER XI. OF THE RENT OF LAND. BOOK II. OF THE NATURE, ACCUMULATION, AND EMPLOYMENT OF STOCK. CHAPTER I. OF THE DIVISION OF STOCK. CHAPTER II. OF MONEY, CONSIDERED AS A PARTICULAR BRANCH OF THE GENERAL STOCK OF THE SOCIETY, OR OF THE EXPENSE OF MAINTAINING THE NATIONAL CAPITAL. CHAPTER III. OF THE ACCUMULATION OF CAPITAL, OR OF PRODUCTIVE AND UNPRODUCTIVE LABOUR. CHAPTER IV. OF STOCK LENT AT INTEREST. CHAPTER V. OF THE DIFFERENT EMPLOYMENTS OF CAPITALS. BOOK III. OF THE DIFFERENT
` ,
  },

  {
    id: "marx_capital",
    title: "Capital, Vol. 1 (Marx, excerpt)",
    lexile: 1800,
    sourceUrl: "https://www.marxists.org/archive/marx/works/1867-c1/",
    text: `
The wealth of societies in which the capitalist mode of production prevails appears as an    
` ,
  },

  {
    id: "keynes_essays_mr_merc",
    title: "Essays in Persuasion (Keynes, excerpt)",
    lexile: 1600,
    sourceUrl: "https://www.econlib.org/library/Keynes/kpeindex.html",
    text: `
In the long run we are all dead, but in the...
` ,
  },

  {
    id: "logic_scientific_discovery",
    title: "The Logic of Scientific Discovery (Popper, excerpt)",
    lexile: 1800,
    sourceUrl: "https://www.marxists.org/reference/subject/philosophy/works/au/popper.htm",
    text: `
The criterion of falsifiability is what distinguishes science    
` ,
  },

  {
    id: "wealth_of_nations",
    title: "The Wealth of Nations (Smith, excerpt)",
    lexile: 1650,
    sourceUrl: "https://www.gutenberg.org/ebooks/3300",
    text: `
An Inquiry into the Nature and Causes of the Wealth of Nations by Adam Smith Contents INTRODUCTION AND PLAN OF THE WORK. BOOK I. OF THE CAUSES OF IMPROVEMENT IN THE PRODUCTIVE POWERS OF LABOUR, AND OF THE ORDER ACCORDING TO WHICH ITS PRODUCE IS NATURALLY DISTRIBUTED AMONG THE DIFFERENT RANKS OF THE PEOPLE. CHAPTER I. OF THE DIVISION OF LABOUR. CHAPTER II. OF THE PRINCIPLE WHICH GIVES OCCASION TO THE DIVISION OF LABOUR. CHAPTER III. THAT THE DIVISION OF LABOUR IS LIMITED BY THE EXTENT OF THE MARKET. CHAPTER IV. OF THE ORIGIN AND USE OF MONEY. CHAPTER V. OF THE REAL AND NOMINAL PRICE OF COMMODITIES, OR OF THEIR PRICE IN LABOUR, AND THEIR PRICE IN MONEY. CHAPTER VI. OF THE COMPONENT PART OF THE PRICE OF COMMODITIES. CHAPTER VII. OF THE NATURAL AND MARKET PRICE OF COMMODITIES. CHAPTER VIII. OF THE WAGES OF LABOUR. CHAPTER IX. OF THE PROFITS OF STOCK. CHAPTER X. OF WAGES AND PROFIT IN THE DIFFERENT EMPLOYMENTS OF LABOUR AND STOCK. CHAPTER XI. OF THE RENT OF LAND. BOOK II. OF THE NATURE, ACCUMULATION, AND EMPLOYMENT OF STOCK. CHAPTER I. OF THE DIVISION OF STOCK. CHAPTER II. OF MONEY, CONSIDERED AS A PARTICULAR BRANCH OF THE GENERAL STOCK OF THE SOCIETY, OR OF THE EXPENSE OF MAINTAINING THE NATIONAL CAPITAL. CHAPTER III. OF THE ACCUMULATION OF CAPITAL, OR OF PRODUCTIVE AND UNPRODUCTIVE LABOUR. CHAPTER IV. OF STOCK LENT AT INTEREST. CHAPTER V. OF THE DIFFERENT EMPLOYMENTS OF CAPITALS. BOOK III. OF THE DIFFERENT
` ,
  },

  {
    id: "essays_in_persuasion",
    title: "Essays in Persuasion (Keynes, excerpt)",
    lexile: 1600,
    sourceUrl: "https://www.econlib.org/library/Keynes/kpeindex.html",
    text: `
In the long run we are all dead, but in the...    
` ,
  },

];
