import { db } from "./db";
import { tokenUsage, userTokenQuotas, users } from "@shared/schema";
import { eq, sql, and, gte, lte, desc, sum } from "drizzle-orm";

export interface TokenUsageData {
  userId: number;
  coachType: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model?: string;
  conversationId?: number;
}

export interface UserTokenStats {
  userId: number;
  username: string;
  totalTokensUsed: number;
  tokensUsedToday: number;
  tokensUsedThisMonth: number;
  monthlyQuota: number;
  dailyQuota: number;
  quotaRemaining: number;
  dailyQuotaRemaining: number;
  estimatedCost: number; // in dollars
  lastUsage?: Date;
}

// Daily token limit per user
export const DAILY_TOKEN_LIMIT = 16000;

// GPT-4o pricing (as of 2024): $5.00 per 1M input tokens, $15.00 per 1M output tokens
const TOKEN_PRICING = {
  'gpt-4o': {
    input: 0.000005, // $5 per 1M tokens
    output: 0.000015 // $15 per 1M tokens
  },
  'gpt-4': {
    input: 0.00003, // $30 per 1M tokens
    output: 0.00006 // $60 per 1M tokens
  }
};

export async function checkDailyTokenLimit(userId: number): Promise<{ canProceed: boolean; tokensUsedToday: number; remainingTokens: number }> {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  try {
    const result = await db
      .select({ 
        totalTokens: sql<number>`COALESCE(SUM(${tokenUsage.totalTokens}), 0)` 
      })
      .from(tokenUsage)
      .where(
        and(
          eq(tokenUsage.userId, userId),
          gte(tokenUsage.createdAt, startOfDay),
          lte(tokenUsage.createdAt, endOfDay)
        )
      );

    const tokensUsedToday = result[0]?.totalTokens || 0;
    const remainingTokens = Math.max(0, DAILY_TOKEN_LIMIT - tokensUsedToday);
    const canProceed = tokensUsedToday < DAILY_TOKEN_LIMIT;

    return {
      canProceed,
      tokensUsedToday,
      remainingTokens
    };
  } catch (error) {
    console.error('Error checking daily token limit:', error);
    // In case of error, allow interaction but log the issue
    return {
      canProceed: true,
      tokensUsedToday: 0,
      remainingTokens: DAILY_TOKEN_LIMIT
    };
  }
}

export async function trackTokenUsage(data: TokenUsageData): Promise<void> {
  try {
    // Calculate cost in cents
    const pricing = TOKEN_PRICING[data.model as keyof typeof TOKEN_PRICING] || TOKEN_PRICING['gpt-4o'];
    const cost = Math.round(
      (data.promptTokens * pricing.input + data.completionTokens * pricing.output) * 100
    );

    // Insert token usage record
    await db.insert(tokenUsage).values({
      userId: data.userId,
      coachType: data.coachType,
      promptTokens: data.promptTokens,
      completionTokens: data.completionTokens,
      totalTokens: data.totalTokens,
      cost,
      model: data.model || 'gpt-4o',
      conversationId: data.conversationId,
    });

    // Update user's current usage in quota table
    await updateUserQuotaUsage(data.userId, data.totalTokens);

    console.log(`Token usage tracked: ${data.totalTokens} tokens for user ${data.userId}, cost: $${cost/100}`);
  } catch (error) {
    console.error('Error tracking token usage:', error);
    throw error;
  }
}

export async function updateUserQuotaUsage(userId: number, tokensUsed: number): Promise<void> {
  try {
    // Check if user has a quota record
    const existingQuota = await db
      .select()
      .from(userTokenQuotas)
      .where(eq(userTokenQuotas.userId, userId))
      .limit(1);

    if (existingQuota.length === 0) {
      // Create new quota record for user
      await db.insert(userTokenQuotas).values({
        userId,
        monthlyQuota: 500000,
        currentUsage: tokensUsed,
        lastResetDate: new Date(),
        quotaResetDay: 1,
        isActive: true,
      });
    } else {
      // Check if we need to reset monthly quota
      const quota = existingQuota[0];
      const now = new Date();
      const lastReset = new Date(quota.lastResetDate!);
      
      let shouldReset = false;
      if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        if (now.getDate() >= quota.quotaResetDay!) {
          shouldReset = true;
        }
      }

      if (shouldReset) {
        // Reset monthly usage
        await db
          .update(userTokenQuotas)
          .set({
            currentUsage: tokensUsed,
            lastResetDate: now,
            updatedAt: now,
          })
          .where(eq(userTokenQuotas.userId, userId));
      } else {
        // Add to current usage
        await db
          .update(userTokenQuotas)
          .set({
            currentUsage: sql`${userTokenQuotas.currentUsage} + ${tokensUsed}`,
            updatedAt: now,
          })
          .where(eq(userTokenQuotas.userId, userId));
      }
    }
  } catch (error) {
    console.error('Error updating user quota usage:', error);
    throw error;
  }
}

export async function checkUserQuota(userId: number): Promise<{
  hasQuota: boolean;
  remainingTokens: number;
  monthlyQuota: number;
  currentUsage: number;
}> {
  try {
    const quota = await db
      .select()
      .from(userTokenQuotas)
      .where(eq(userTokenQuotas.userId, userId))
      .limit(1);

    if (quota.length === 0) {
      // No quota record, create one with default values
      await db.insert(userTokenQuotas).values({
        userId,
        monthlyQuota: 500000,
        currentUsage: 0,
      });
      
      return {
        hasQuota: true,
        remainingTokens: 500000,
        monthlyQuota: 500000,
        currentUsage: 0,
      };
    }

    const userQuota = quota[0];
    const remainingTokens = Math.max(0, userQuota.monthlyQuota! - userQuota.currentUsage!);
    
    return {
      hasQuota: remainingTokens > 0,
      remainingTokens,
      monthlyQuota: userQuota.monthlyQuota!,
      currentUsage: userQuota.currentUsage!,
    };
  } catch (error) {
    console.error('Error checking user quota:', error);
    // Return safe defaults on error
    return {
      hasQuota: false,
      remainingTokens: 0,
      monthlyQuota: 500000,
      currentUsage: 500000,
    };
  }
}

export async function getUserTokenStats(userId?: number): Promise<UserTokenStats[]> {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Build separate queries based on whether userId is provided
    let queryResults;
    
    if (userId) {
      queryResults = await db
        .select({
          userId: users.id,
          username: users.username,
          totalTokensUsed: sql<number>`COALESCE(SUM(${tokenUsage.totalTokens}), 0)`,
          tokensUsedToday: sql<number>`COALESCE(SUM(CASE WHEN ${tokenUsage.createdAt} >= ${startOfDay} AND ${tokenUsage.createdAt} < ${endOfDay} THEN ${tokenUsage.totalTokens} ELSE 0 END), 0)`,
          tokensUsedThisMonth: sql<number>`COALESCE(SUM(CASE WHEN ${tokenUsage.createdAt} >= ${startOfMonth} THEN ${tokenUsage.totalTokens} ELSE 0 END), 0)`,
          totalCost: sql<number>`COALESCE(SUM(${tokenUsage.cost}), 0)`,
          monthlyQuota: sql<number>`COALESCE(${userTokenQuotas.monthlyQuota}, 500000)`,
          currentUsage: sql<number>`COALESCE(${userTokenQuotas.currentUsage}, 0)`,
        })
        .from(users)
        .leftJoin(tokenUsage, eq(users.id, tokenUsage.userId))
        .leftJoin(userTokenQuotas, eq(users.id, userTokenQuotas.userId))
        .where(eq(users.id, userId))
        .groupBy(users.id, users.username, userTokenQuotas.monthlyQuota, userTokenQuotas.currentUsage);
    } else {
      queryResults = await db
        .select({
          userId: users.id,
          username: users.username,
          totalTokensUsed: sql<number>`COALESCE(SUM(${tokenUsage.totalTokens}), 0)`,
          tokensUsedToday: sql<number>`COALESCE(SUM(CASE WHEN ${tokenUsage.createdAt} >= ${startOfDay} AND ${tokenUsage.createdAt} < ${endOfDay} THEN ${tokenUsage.totalTokens} ELSE 0 END), 0)`,
          tokensUsedThisMonth: sql<number>`COALESCE(SUM(CASE WHEN ${tokenUsage.createdAt} >= ${startOfMonth} THEN ${tokenUsage.totalTokens} ELSE 0 END), 0)`,
          totalCost: sql<number>`COALESCE(SUM(${tokenUsage.cost}), 0)`,
          monthlyQuota: sql<number>`COALESCE(${userTokenQuotas.monthlyQuota}, 500000)`,
          currentUsage: sql<number>`COALESCE(${userTokenQuotas.currentUsage}, 0)`,
        })
        .from(users)
        .leftJoin(tokenUsage, eq(users.id, tokenUsage.userId))
        .leftJoin(userTokenQuotas, eq(users.id, userTokenQuotas.userId))
        .groupBy(users.id, users.username, userTokenQuotas.monthlyQuota, userTokenQuotas.currentUsage);
    }

    return queryResults.map(user => ({
      userId: user.userId,
      username: user.username,
      totalTokensUsed: user.totalTokensUsed,
      tokensUsedToday: user.tokensUsedToday,
      tokensUsedThisMonth: user.tokensUsedThisMonth,
      monthlyQuota: user.monthlyQuota,
      dailyQuota: DAILY_TOKEN_LIMIT,
      quotaRemaining: Math.max(0, user.monthlyQuota - user.currentUsage),
      dailyQuotaRemaining: Math.max(0, DAILY_TOKEN_LIMIT - user.tokensUsedToday),
      estimatedCost: user.totalCost / 100, // convert cents to dollars
      lastUsage: undefined, // We'll get this separately if needed
    }));
  } catch (error) {
    console.error('Error getting user token stats:', error);
    return [];
  }
}

export async function getTokenUsageByPeriod(
  userId?: number,
  period: 'day' | 'week' | 'month' = 'month'
): Promise<Array<{ date: string; tokens: number; cost: number }>> {
  try {
    let dateFormat: string;
    let interval: string;
    
    switch (period) {
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        interval = '30 days';
        break;
      case 'week':
        dateFormat = 'YYYY-"W"WW';
        interval = '12 weeks';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        interval = '12 months';
        break;
    }

    const baseQuery = db
      .select({
        date: sql<string>`TO_CHAR(${tokenUsage.createdAt}, '${dateFormat}')`,
        tokens: sql<number>`SUM(${tokenUsage.totalTokens})`,
        cost: sql<number>`SUM(${tokenUsage.cost})`,
      })
      .from(tokenUsage)
      .groupBy(sql`TO_CHAR(${tokenUsage.createdAt}, '${dateFormat}')`)
      .orderBy(sql`TO_CHAR(${tokenUsage.createdAt}, '${dateFormat}')`);

    let query;
    if (userId) {
      query = db
        .select({
          date: sql<string>`TO_CHAR(${tokenUsage.createdAt}, '${dateFormat}')`,
          tokens: sql<number>`SUM(${tokenUsage.totalTokens})`,
          cost: sql<number>`SUM(${tokenUsage.cost})`,
        })
        .from(tokenUsage)
        .where(eq(tokenUsage.userId, userId))
        .groupBy(sql`TO_CHAR(${tokenUsage.createdAt}, '${dateFormat}')`)
        .orderBy(sql`TO_CHAR(${tokenUsage.createdAt}, '${dateFormat}')`);
    } else {
      query = baseQuery;
    }

    const results = await query;

    return results.map(row => ({
      date: row.date,
      tokens: row.tokens,
      cost: row.cost / 100, // convert cents to dollars
    }));
  } catch (error) {
    console.error('Error getting token usage by period:', error);
    return [];
  }
}

export async function getAggregatedTokenStats(): Promise<{
  totalTokens: number;
  totalCost: number;
  activeUsers: number;
  avgTokensPerUser: number;
}> {
  try {
    // Get aggregated totals directly from token_usage table
    const [aggregates] = await db
      .select({
        totalTokens: sql<number>`COALESCE(SUM(${tokenUsage.totalTokens}), 0)`,
        totalCost: sql<number>`COALESCE(SUM(${tokenUsage.cost}), 0)`,
        activeUsers: sql<number>`COUNT(DISTINCT ${tokenUsage.userId})`,
      })
      .from(tokenUsage);

    // Get total number of users for average calculation
    const [userCount] = await db
      .select({
        totalUsers: sql<number>`COUNT(*)`,
      })
      .from(users);

    const avgTokensPerUser = userCount.totalUsers > 0 ? aggregates.totalTokens / userCount.totalUsers : 0;

    return {
      totalTokens: aggregates.totalTokens,
      totalCost: aggregates.totalCost / 100, // convert cents to dollars
      activeUsers: aggregates.activeUsers,
      avgTokensPerUser
    };
  } catch (error) {
    console.error('Error getting aggregated token stats:', error);
    return {
      totalTokens: 0,
      totalCost: 0,
      activeUsers: 0,
      avgTokensPerUser: 0
    };
  }
}

export async function updateUserQuota(userId: number, newQuota: number): Promise<void> {
  try {
    const existingQuota = await db
      .select()
      .from(userTokenQuotas)
      .where(eq(userTokenQuotas.userId, userId))
      .limit(1);

    if (existingQuota.length === 0) {
      await db.insert(userTokenQuotas).values({
        userId,
        monthlyQuota: newQuota,
        currentUsage: 0,
      });
    } else {
      await db
        .update(userTokenQuotas)
        .set({
          monthlyQuota: newQuota,
          updatedAt: new Date(),
        })
        .where(eq(userTokenQuotas.userId, userId));
    }
  } catch (error) {
    console.error('Error updating user quota:', error);
    throw error;
  }
}