import { Request, Response, NextFunction } from 'express'
import admin from 'firebase-admin'
import { User } from '../types/index.js'

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (process.env.DEV_MODE === 'true') {
    (req as any).user = { uid: 'dev-admin', email: 'dev@admin.local', role: 'admin' };
    return next();
  }

  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
  }

  const token = authHeader.substring(7)

  try {
    const decodedToken = await admin.auth().verifyIdToken(token)
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: (decodedToken.role as 'admin' | 'volunteer' | 'reporter') || 'reporter',
    }
    next()
  } catch (error) {
    console.error('Token verification error:', error)
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}
