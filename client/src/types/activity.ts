/**
 * Interface for platform activity data item
 */
export interface ActivityData {
  count: number;
  active: boolean;
  lastUpdate: Date;
}

/**
 * Map of platform IDs to their activity data
 */
export interface ActivityDataMap {
  [platformId: string]: ActivityData;
}

/**
 * Interface for activity statistics by platform
 */
export interface PlatformActivityStats {
  platform: string;
  count: number;
  percentage?: number;
}

/**
 * Interface for activity update message
 */
export interface ActivityUpdateMessage {
  type: string;
  data: {
    platform: string;
    action: 'create' | 'update' | 'delete';
    postId: number | string;
    timestamp?: string;
  };
}

/**
 * Interface for activity summary data
 */
export interface ActivitySummary {
  total: number;
  platforms: PlatformActivityStats[];
  startDate: Date;
  endDate: Date;
}