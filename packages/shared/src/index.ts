export enum UserRole {
  SUPER_ADMIN = 'SuperAdmin',
  ORG_ADMIN = 'OrgAdmin',
  SITE_MANAGER = 'SiteManager',
  OPERATOR = 'Operator',
  VIEWER = 'Viewer',
}

export enum AlertType {
  WEAPON = 'weapon',
  VIOLENCE = 'violence',
  INTRUSION = 'intrusion',
  LOITERING = 'loitering',
}

export enum AlertSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum AlertStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
}

export enum CameraStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  DEGRADED = 'degraded',
}

export enum WatchlistCategory {
  BLACKLIST = 'blacklist',
  VIP = 'vip',
  RESTRICTED = 'restricted',
}

export interface Point {
  x: number;
  y: number;
}

export interface PolygonZone {
  id: string;
  name: string;
  type: AlertType.INTRUSION | AlertType.LOITERING;
  points: Point[];
  enabled: boolean;
  minDurationSeconds?: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  confidence: number;
}

export interface CameraConfig {
  fps?: number;
  resolution?: string;
  enabledClasses: AlertType[];
  confidenceThresholds: Record<AlertType, number>;
  zones: PolygonZone[];
  faceBlurEnabled?: boolean;
}

export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organizationId: string;
  siteIds?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface OrganizationDTO {
  id: string;
  name: string;
  slug: string;
  retentionDays: number;
  settings?: Record<string, any>;
  createdAt: string;
}

export interface SiteDTO {
  id: string;
  organizationId: string;
  name: string;
  address?: string;
  timezone: string;
  cameraCount?: number;
  activeAlertCount?: number;
  createdAt: string;
}

export interface CameraDTO {
  id: string;
  siteId: string;
  organizationId: string;
  siteName?: string;
  name: string;
  rtspUrl: string;
  onvifHost?: string;
  status: CameraStatus;
  lastSeenAt?: string;
  config: CameraConfig;
  createdAt: string;
}

export interface AlertActionDTO {
  id: string;
  alertId: string;
  userId: string;
  userName?: string;
  userRole?: string;
  action: 'acknowledge' | 'resolve' | 'false_positive' | 'escalate' | 'comment';
  note?: string;
  createdAt: string;
}

export interface AlertDTO {
  id: string;
  organizationId: string;
  siteId: string;
  siteName?: string;
  cameraId: string;
  cameraName?: string;
  alertType: AlertType;
  severity: AlertSeverity;
  confidence: number;
  status: AlertStatus;
  detectedAt: string;
  clipUrl?: string;
  thumbnailUrl?: string;
  metadata?: {
    bboxes?: BoundingBox[];
    durationMs?: number;
    frameWidth?: number;
    frameHeight?: number;
    zoneName?: string;
  };
  acknowledgedBy?: string;
  acknowledgedByName?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  actions?: AlertActionDTO[];
  createdAt: string;
}

export interface FaceWatchlistDTO {
  id: string;
  organizationId: string;
  name: string;
  category: WatchlistCategory;
  notes?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AutomatedRuleDTO {
  id: string;
  organizationId: string;
  name: string;
  triggerSeverity: AlertSeverity;
  triggerType?: AlertType;
  actionType: 'trigger_siren' | 'lock_doors' | 'send_sms' | 'escalate';
  enabled: boolean;
  createdAt: string;
}

export interface AnalyticsSummaryDTO {
  totalAlerts: number;
  criticalAlerts: number;
  avgResponseTimeSeconds: number;
  falsePositivePercentage: number;
  alertsByType: Record<string, number>;
  hourlyAlertDistribution: Array<{ hour: string; count: number }>;
}

export interface EventIngestPayload {
  cameraId: string;
  alertType: AlertType;
  severity: AlertSeverity;
  confidence: number;
  detectedAt: string;
  clipPath?: string;
  thumbnailPath?: string;
  metadata?: {
    bboxes?: BoundingBox[];
    durationMs?: number;
    zoneName?: string;
  };
}

export interface SocketAlertCreatedPayload {
  alert: AlertDTO;
}

export interface SocketAlertUpdatedPayload {
  alert: AlertDTO;
}

export interface SocketCameraHealthPayload {
  cameraId: string;
  status: CameraStatus;
  lastSeenAt: string;
}
