/** Joins class strings, filtering out falsy values (undefined, null, ''). */
export const cn = (...classes) => classes.filter(Boolean).join(' ');
