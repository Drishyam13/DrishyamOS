import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { UserRole } from '@drishyam/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'drishyam-jwt-secret-key-super-secure-change-in-prod';
const EDGE_SERVICE_TOKEN = process.env.EDGE_SERVICE_TOKEN || 'drishyam-edge-service-secret-token-123';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
  membership?: {
    id: string;
    organizationId: string;
    role: UserRole;
    siteIds: string[];
  };
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication token required' } });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; organizationId?: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { memberships: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User invalid or deactivated' } });
    }

    const membership = decoded.organizationId
      ? user.memberships.find((m) => m.organizationId === decoded.organizationId)
      : user.memberships[0];

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    };

    if (membership) {
      req.membership = {
        id: membership.id,
        organizationId: membership.organizationId,
        role: membership.role as UserRole,
        siteIds: JSON.parse(membership.siteIds || '[]'),
      };
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Token expired or invalid' } });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.membership) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Organization membership required' } });
    }

    if (!allowedRoles.includes(req.membership.role)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient role permissions' } });
    }

    next();
  };
}

export function authenticateEdgeService(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-edge-token'] || req.headers['authorization']?.replace('Bearer ', '');

  if (!token || token !== EDGE_SERVICE_TOKEN) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED_EDGE', message: 'Invalid edge service token' } });
  }

  next();
}
