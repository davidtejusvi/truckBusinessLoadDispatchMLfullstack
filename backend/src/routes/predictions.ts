import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';

// ML prediction microservice (FEAT-001). Overridable per environment
// (Docker Compose / Helm) while defaulting to local dev.
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// The global fetch Response type (@types/node ^20 provides it). We avoid
// naming it `Response` because that name is imported from express above, so we
// derive the upstream type from `fetch` itself to keep the two distinct.
type FetchResponse = Awaited<ReturnType<typeof fetch>>;

const router = Router();

// Forward an ML-service error: when the upstream returned non-2xx, read its
// JSON body and mirror the upstream status + body back to the client. Returns
// true when an error was forwarded (caller should stop); false when the
// upstream succeeded and the caller may read the body.
async function forwardUpstreamError(res: Response, upstream: FetchResponse): Promise<boolean> {
  if (upstream.ok) return false;
  const body = await upstream.json();
  res.status(upstream.status).json(body);
  return true;
}

// Specific named routes (rate, fuel-cost) MUST come before /fuel/:market and
// /demand/:market, otherwise Express treats 'rate'/'fuel-cost' as the market
// param (same pattern as the loads.ts comment about named routes before /:id).
router.get('/rate', authenticate, async (req: Request, res: Response) => {
  try {
    const { market, equipmentType, distance, dayOfWeek, fuelPrice } = req.query;
    const upstream = await fetch(`${ML_SERVICE_URL}/predict/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        market,
        equipment_type: equipmentType,
        distance: Number(distance),
        day_of_week: Number(dayOfWeek),
        fuel_price: Number(fuelPrice),
      }),
    });
    if (await forwardUpstreamError(res, upstream)) return;
    const body = await upstream.json();
    res.json(body);
  } catch {
    res.status(502).json({ error: 'ML service unavailable' });
  }
});

router.get('/fuel-cost', authenticate, async (req: Request, res: Response) => {
  try {
    const { market, distance } = req.query;
    const upstream = await fetch(`${ML_SERVICE_URL}/fuel/cost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        market,
        distance: Number(distance),
      }),
    });
    if (await forwardUpstreamError(res, upstream)) return;
    const body = await upstream.json();
    res.json(body);
  } catch {
    res.status(502).json({ error: 'ML service unavailable' });
  }
});

router.post('/demand/forecast', authenticate, async (req: Request, res: Response) => {
  try {
    const upstream = await fetch(`${ML_SERVICE_URL}/demand/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    if (await forwardUpstreamError(res, upstream)) return;
    const body = await upstream.json();
    res.json(body);
  } catch {
    res.status(502).json({ error: 'ML service unavailable' });
  }
});

router.get('/fuel/:market', authenticate, async (req: Request, res: Response) => {
  try {
    const upstream = await fetch(`${ML_SERVICE_URL}/fuel/price/${req.params.market}`);
    if (await forwardUpstreamError(res, upstream)) return;
    const body = await upstream.json();
    res.json(body);
  } catch {
    res.status(502).json({ error: 'ML service unavailable' });
  }
});

router.get('/demand/:market', authenticate, async (req: Request, res: Response) => {
  try {
    const upstream = await fetch(`${ML_SERVICE_URL}/demand/heatmap/${req.params.market}`);
    if (await forwardUpstreamError(res, upstream)) return;
    const body = await upstream.json();
    res.json(body);
  } catch {
    res.status(502).json({ error: 'ML service unavailable' });
  }
});

export default router;
