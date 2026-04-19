import manifest from './collection.json';
import aschenputtel from './stories/aschenputtel/content.md?raw';
import hansel_und_gretel from './stories/hansel_und_gretel/content.md?raw';
import rapunzel from './stories/rapunzel/content.md?raw';
import rotkaeppchen from './stories/rotkaeppchen/content.md?raw';
import schneewittchen from './stories/schneewittchen/content.md?raw';

export { manifest };

export const stories = {
  aschenputtel,
  hansel_und_gretel,
  rapunzel,
  rotkaeppchen,
  schneewittchen,
};

export default { manifest, stories };
