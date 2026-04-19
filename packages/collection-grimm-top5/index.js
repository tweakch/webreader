import manifest from './collection.json';
import aschenputtel from './stories/aschenputtel/content.md?raw';
import hansel_und_gretel from './stories/hansel_und_gretel/content.md?raw';
import rapunzel from './stories/rapunzel/content.md?raw';
import rotkaeppchen from './stories/rotkaeppchen/content.md?raw';
import schneewittchen from './stories/schneewittchen/content.md?raw';

import aschenputtelCover from './stories/aschenputtel/cover.svg?url';
import hansel_und_gretelCover from './stories/hansel_und_gretel/cover.svg?url';
import rapunzelCover from './stories/rapunzel/cover.svg?url';
import rotkaeppchenCover from './stories/rotkaeppchen/cover.svg?url';
import schneewittchenCover from './stories/schneewittchen/cover.svg?url';

import aschenputtelSchweizerdeutsch from './stories/aschenputtel/adaptions/schweizerdeutsch/content.md?raw';

export { manifest };

export const stories = {
  aschenputtel,
  hansel_und_gretel,
  rapunzel,
  rotkaeppchen,
  schneewittchen,
};

export const covers = {
  aschenputtel: aschenputtelCover,
  hansel_und_gretel: hansel_und_gretelCover,
  rapunzel: rapunzelCover,
  rotkaeppchen: rotkaeppchenCover,
  schneewittchen: schneewittchenCover,
};

export const adaptions = {
  aschenputtel: {
    schweizerdeutsch: aschenputtelSchweizerdeutsch,
  },
};

export default { manifest, stories, covers, adaptions };
