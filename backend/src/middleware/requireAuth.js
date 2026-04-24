import jwt from "jsonwebtoken";
import { createRemoteJWKSet, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "dev-change-me";
const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const SUPABASE_JWT_AUD = process.env.SUPABASE_JWT_AUD || "authenticated";

let jwks;
function getSupabaseJwks() {
  if (!SUPABASE_URL) return null;
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`));
  }
  return jwks;
}

export async function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const [scheme, token] = auth.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Missing or invalid authorization token" });
  }

  try {
    let payload;
    const supabaseJwks = getSupabaseJwks();
    if (supabaseJwks) {
      const verified = await jwtVerify(token, supabaseJwks, {
        issuer: `${SUPABASE_URL}/auth/v1`,
        audience: SUPABASE_JWT_AUD,
      });
      payload = verified.payload;
    } else {
      payload = jwt.verify(token, JWT_SECRET);
    }
    req.userId = payload.sub;
    req.authClaims = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
