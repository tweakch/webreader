import manifest from './collection.json';
import der_wolf_und_die_sieben_jungen_geisslein from './stories/der_wolf_und_die_sieben_jungen_geisslein/content.md?raw';
import katze_und_maus_in_gesellschaft from './stories/katze_und_maus_in_gesellschaft/content.md?raw';
import die_bremer_stadtmusikanten from './stories/die_bremer_stadtmusikanten/content.md?raw';
import der_hund_und_der_sperling from './stories/der_hund_und_der_sperling/content.md?raw';
import der_wolf_und_der_fuchs from './stories/der_wolf_und_der_fuchs/content.md?raw';
import der_fuchs_und_die_katze from './stories/der_fuchs_und_die_katze/content.md?raw';
import die_bienenkonigin from './stories/die_bienenkonigin/content.md?raw';
import der_zaunkoenig_und_der_baer from './stories/der_zaunkoenig_und_der_baer/content.md?raw';
import die_eule from './stories/die_eule/content.md?raw';
import der_hase_und_der_igel from './stories/der_hase_und_der_igel/content.md?raw';
import die_scholle from './stories/die_scholle/content.md?raw';
import rohrdommel_und_wiedehopf from './stories/rohrdommel_und_wiedehopf/content.md?raw';

import openingIllustration from './assets/opening.svg?url';
import endingIllustration from './assets/ending.svg?url';
import ornamentIllustration from './assets/ornament.svg?url';

export { manifest };

export const stories = {
  der_wolf_und_die_sieben_jungen_geisslein,
  katze_und_maus_in_gesellschaft,
  die_bremer_stadtmusikanten,
  der_hund_und_der_sperling,
  der_wolf_und_der_fuchs,
  der_fuchs_und_die_katze,
  die_bienenkonigin,
  der_zaunkoenig_und_der_baer,
  die_eule,
  der_hase_und_der_igel,
  die_scholle,
  rohrdommel_und_wiedehopf,
};

export const illustrations = {
  opening: openingIllustration,
  ending: endingIllustration,
  ornament: ornamentIllustration,
};

export default { manifest, stories, illustrations };
