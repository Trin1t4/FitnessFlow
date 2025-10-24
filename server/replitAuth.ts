// Replit Auth integration con openid-client v6
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import pg from "pg";

const PgSession = connectPg(session);

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

export async function setupAuth(app: Express) {
  // ✅ Verifica SESSION_SECRET
  if (!process.env.SESSION_SECRET) {
    console.warn("⚠️ SESSION_SECRET mancante, usando fallback (non sicuro per production!)");
  }

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    verified(null, user);
  };

  // ✅ Configurazione ambiente-aware per cookie
  const isProduction = process.env.NODE_ENV === "production";
  const isReplit = !!process.env.REPL_SLUG || !!process.env.REPLIT_DOMAINS;
  const isHttps = isProduction || isReplit;

  console.log("🍪 Cookie config:", { isProduction, isReplit, isHttps });

  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "trainsmart-secret-key-2024-fallback",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 giorni
        httpOnly: true,
        secure: isHttps, // ✅ true su Replit (HTTPS) anche se development
        sameSite: "lax", // ✅ "lax" perché frontend e backend sono sullo stesso dominio
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // ✅ Serializzazione/Deserializzazione Passport per sessioni
  passport.serializeUser((user: any, done) => {
    console.log("📝 Serializing user:", JSON.stringify(user, null, 2));
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    console.log("📖 Deserializing user:", JSON.stringify(user, null, 2));
    done(null, user);
  });

  // ✅ Login con redirect_uri dinamico basato sull'hostname
  app.get("/api/login", async (req, res, next) => {
    // Determina callbackURL dalla richiesta corrente
    const protocol = req.protocol || 'https';
    const host = req.get('host');
    const callbackURL = `${protocol}://${host}/api/callback`;
    
    console.log("🔐 Iniziando login OAuth...");
    console.log("🔐 OAuth redirect_uri dinamico:", callbackURL);

    // Crea strategia dinamica con il callbackURL corretto
    const dynamicStrategy = new Strategy(
      {
        name: "replitauth-dynamic",
        config,
        scope: "openid email profile offline_access",
        callbackURL,
      },
      verify,
    );

    // Usa la strategia dinamica solo per questa richiesta
    passport.use(dynamicStrategy);
    
    passport.authenticate("replitauth-dynamic", {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", async (req, res, next) => {
    // Determina callbackURL dalla richiesta corrente (deve corrispondere al login)
    const protocol = req.protocol || 'https';
    const host = req.get('host');
    const callbackURL = `${protocol}://${host}/api/callback`;
    
    console.log("🔁 OAuth callback ricevuto da:", callbackURL);
    console.log("🔑 Query params:", req.query);

    // Crea strategia dinamica con il callbackURL corretto
    const dynamicStrategy = new Strategy(
      {
        name: "replitauth-callback",
        config,
        scope: "openid email profile offline_access",
        callbackURL,
      },
      verify,
    );

    // Usa la strategia dinamica solo per questa richiesta
    passport.use(dynamicStrategy);
    
    passport.authenticate("replitauth-callback", {
      successReturnToOrRedirect: "/",
      failureRedirect: "/?error=auth_failed",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });

  app.get("/api/auth/user", (req, res) => {
    console.log("🔍 /api/auth/user chiamato - isAuthenticated:", req.isAuthenticated(), "user:", req.user ? "presente" : "assente", "session:", req.session.id);
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
