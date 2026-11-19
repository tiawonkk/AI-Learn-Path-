// Deterministic seeded PRNG (Mulberry32) so CSV ground-truth labels
// match the downloadable public/datasets/*.csv files 100%.

function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rng: () => number): number {
  const u1 = Math.max(1e-7, rng());
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export interface GeneratedDataset {
  trainCsv: string;
  testFeaturesCsv: string;
  testGroundTruth: number[];
}

export function generateHousingRegressionDataset(): GeneratedDataset {
  const rng = createRng(3022026);
  const trainRows = ['id,area_norm,rooms,age_norm,distance_km,price_index'];
  const testRows = ['id,area_norm,rooms,age_norm,distance_km'];
  const groundTruth: number[] = [];

  const makeRow = (id: number) => {
    const area = Number((rng() * 3.2 - 1.2).toFixed(4));
    const rooms = Math.floor(rng() * 5) + 1;
    const age = Number((rng() * 2.5 - 1.0).toFixed(4));
    const dist = Number((1 + rng() * 14).toFixed(3));
    const noise = gaussian(rng) * 0.14;
    const price = Number(
      (2.4 + 1.85 * area + 0.42 * rooms - 0.55 * age - 0.08 * dist + noise).toFixed(4)
    );
    return { id, area, rooms, age, dist, price };
  };

  for (let i = 0; i < 240; i += 1) {
    const r = makeRow(i);
    trainRows.push(`${r.id},${r.area},${r.rooms},${r.age},${r.dist},${r.price}`);
  }
  for (let i = 0; i < 80; i += 1) {
    const r = makeRow(i);
    testRows.push(`${r.id},${r.area},${r.rooms},${r.age},${r.dist}`);
    groundTruth.push(r.price);
  }

  return {
    trainCsv: trainRows.join('\n'),
    testFeaturesCsv: testRows.join('\n'),
    testGroundTruth: groundTruth,
  };
}

export function generateCreditRiskClassificationDataset(): GeneratedDataset {
  const rng = createRng(3042026);
  const trainRows = ['id,debt_ratio,credit_util,late_payments,income_k,savings_ratio,default_risk'];
  const testRows = ['id,debt_ratio,credit_util,late_payments,income_k,savings_ratio'];
  const groundTruth: number[] = [];

  const makeRow = (id: number) => {
    const debtRatio = Number((0.08 + rng() * 0.85).toFixed(4));
    const creditUtil = Number((0.05 + rng() * 0.92).toFixed(4));
    const latePayments = Math.floor(rng() * 6);
    const incomeK = Number((28 + rng() * 140).toFixed(2));
    const savingsRatio = Number((0.01 + rng() * 0.45).toFixed(4));

    const logit =
      -3.35 +
      3.1 * debtRatio +
      2.35 * creditUtil +
      0.85 * latePayments -
      0.022 * incomeK -
      3.2 * savingsRatio +
      gaussian(rng) * 0.35;
    const prob = 1 / (1 + Math.exp(-logit));
    const label = prob >= 0.5 ? 1 : 0;

    return { id, debtRatio, creditUtil, latePayments, incomeK, savingsRatio, label };
  };

  for (let i = 0; i < 360; i += 1) {
    const r = makeRow(i);
    trainRows.push(
      `${r.id},${r.debtRatio},${r.creditUtil},${r.latePayments},${r.incomeK},${r.savingsRatio},${r.label}`
    );
  }
  for (let i = 0; i < 120; i += 1) {
    const r = makeRow(i);
    testRows.push(
      `${r.id},${r.debtRatio},${r.creditUtil},${r.latePayments},${r.incomeK},${r.savingsRatio}`
    );
    groundTruth.push(r.label);
  }

  return {
    trainCsv: trainRows.join('\n'),
    testFeaturesCsv: testRows.join('\n'),
    testGroundTruth: groundTruth,
  };
}

export function generateMoonsDlDataset(): GeneratedDataset {
  const rng = createRng(4042026);
  const trainRows = ['id,x1,x2,label'];
  const testRows = ['id,x1,x2'];
  const groundTruth: number[] = [];

  const makeMoonPoint = (id: number, label: 0 | 1) => {
    const angle = rng() * Math.PI;
    const noiseX = gaussian(rng) * 0.16;
    const noiseY = gaussian(rng) * 0.16;
    if (label === 0) {
      const x1 = Number((Math.cos(angle) + noiseX).toFixed(5));
      const x2 = Number((Math.sin(angle) + noiseY).toFixed(5));
      return { id, x1, x2, label };
    }
    const x1 = Number((1 - Math.cos(angle) + noiseX).toFixed(5));
    const x2 = Number((0.5 - Math.sin(angle) + noiseY).toFixed(5));
    return { id, x1, x2, label };
  };

  for (let i = 0; i < 480; i += 1) {
    const label: 0 | 1 = i % 2 === 0 ? 0 : 1;
    const r = makeMoonPoint(i, label);
    trainRows.push(`${r.id},${r.x1},${r.x2},${r.label}`);
  }
  for (let i = 0; i < 120; i += 1) {
    const label: 0 | 1 = i % 2 === 0 ? 0 : 1;
    const r = makeMoonPoint(i, label);
    testRows.push(`${r.id},${r.x1},${r.x2}`);
    groundTruth.push(r.label);
  }

  return {
    trainCsv: trainRows.join('\n'),
    testFeaturesCsv: testRows.join('\n'),
    testGroundTruth: groundTruth,
  };
}

export const TRACK03_REG_TRUTH = generateHousingRegressionDataset().testGroundTruth;
export const TRACK03_EXAM_TRUTH = generateCreditRiskClassificationDataset().testGroundTruth;
export const TRACK04_EXAM_TRUTH = generateMoonsDlDataset().testGroundTruth;
