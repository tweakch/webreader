// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { createAccessProof } from 'flags';
import flagsJson from '../../flags.json';
import handler from '../../api/.well-known/vercel/flags.js';

const SECRET = 'RSXoElPOiUAexXcWDI2qrhbat14SDyjSL1lXiqy3WTo';

beforeAll(() => {
  process.env.FLAGS_SECRET = SECRET;
});

function mockResponse() {
  const result = {};
  return {
    status(s) { result.status = s; return this; },
    json(b) { result.body = b; return this; },
    result,
  };
}

describe('/.well-known/vercel/flags', () => {
  it('rejects requests without an authorization header', async () => {
    const res = mockResponse();
    await handler({ headers: {} }, res);
    expect(res.result.status).toBe(401);
  });

  it('rejects requests with a malformed bearer token', async () => {
    const res = mockResponse();
    await handler({ headers: { authorization: 'Bearer not-a-real-token' } }, res);
    expect(res.result.status).toBe(401);
  });

  it('returns every flags.json entry when the access proof is valid', async () => {
    const token = await createAccessProof(SECRET);
    const res = mockResponse();
    await handler({ headers: { authorization: `Bearer ${token}` } }, res);
    expect(res.result.status).toBe(200);
    expect(Object.keys(res.result.body.definitions).sort()).toEqual(
      Object.keys(flagsJson).sort(),
    );
  });

  it('shapes each definition with options, origin, description, defaultValue', async () => {
    const token = await createAccessProof(SECRET);
    const res = mockResponse();
    await handler({ headers: { authorization: `Bearer ${token}` } }, res);
    const def = res.result.body.definitions['favorites'];
    expect(def.options).toEqual([
      { value: true, label: 'on' },
      { value: false, label: 'off' },
    ]);
    expect(def.defaultValue).toBe(true);
    expect(def.declaredInCode).toBe(true);
    expect(def.origin).toBe('/profile?flag=favorites');
    expect(def.description).toMatch(/Favoriten/);
    expect(def.description).toMatch(/released/);
  });

  it('handles variant flags like theme with labeled options', async () => {
    const token = await createAccessProof(SECRET);
    const res = mockResponse();
    await handler({ headers: { authorization: `Bearer ${token}` } }, res);
    const def = res.result.body.definitions['theme'];
    expect(def.defaultValue).toBe('light');
    expect(def.options.map((o) => o.label).sort()).toEqual(
      ['dark', 'dark-hc', 'light', 'light-hc', 'system'].sort(),
    );
    expect(def.description).toMatch(/hidden/);
  });
});
