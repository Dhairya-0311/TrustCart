import { env } from '../config/env';
import { logger } from '../utils/logger';
import { AIError } from '../middleware/error.middleware';

/**
 * AI Service — abstraction layer for LLM calls.
 * Uses Google Gemini Flash 2.2 via LangChain.
 */

let chatModel: any = null;

/**
 * Initialize and return the Google Gemini chat model
 */
export async function getChatModel() {
  if (chatModel) return chatModel;

  try {
    if (env.GOOGLE_API_KEY) {
      const { ChatGoogleGenerativeAI } = await import('@langchain/google-genai');
      chatModel = new ChatGoogleGenerativeAI({
        apiKey: env.GOOGLE_API_KEY,
        model: env.AI_MODEL || 'gemini-2.0-flash',
        temperature: 0.3,
        maxOutputTokens: 4096,
        maxRetries: 0,
      });
      logger.info(`🤖 AI Provider: Google Gemini (${env.AI_MODEL})`);
    } else {
      logger.warn('⚠️ No GOOGLE_API_KEY configured. Agent will use heuristic-only mode.');
      return null;
    }

    return chatModel;
  } catch (error) {
    logger.error('Failed to initialize Gemini model:', error);
    throw new AIError('Failed to initialize AI service');
  }
}

/**
 * Generate a text completion for review sentiment summary
 */
export async function generateSentimentSummary(
  productName: string,
  reviewStats: {
    totalReviews: number;
    fakePercentage: number;
    avgRating: number;
    adjustedRating: number;
    suspiciousPatterns: string[];
  }
): Promise<string> {
  const model = await getChatModel();

  if (!model) {
    // Fallback: generate a heuristic summary
    return generateHeuristicSummary(productName, reviewStats);
  }

  try {
    const prompt = `Summarize the review analysis for "${productName}" in 1-2 sentences for an Indian consumer.
Stats: ${reviewStats.totalReviews} total reviews, ${reviewStats.fakePercentage.toFixed(1)}% potentially fake, average rating ${reviewStats.avgRating.toFixed(1)}/5 (adjusted: ${reviewStats.adjustedRating.toFixed(1)}/5).
Suspicious patterns found: ${reviewStats.suspiciousPatterns.join(', ') || 'none'}.
Be concise, direct, and helpful.`;

    const response = await model.invoke(prompt);
    return response.content as string;
  } catch (error) {
    logger.warn('AI sentiment summary failed, using heuristic:', error);
    return generateHeuristicSummary(productName, reviewStats);
  }
}

/**
 * Heuristic fallback for sentiment summary
 */
function generateHeuristicSummary(
  productName: string,
  stats: {
    totalReviews: number;
    fakePercentage: number;
    avgRating: number;
    adjustedRating: number;
    suspiciousPatterns: string[];
  }
): string {
  const parts: string[] = [];

  if (stats.fakePercentage > 40) {
    parts.push(`${productName} has a high proportion of potentially fake reviews (${stats.fakePercentage.toFixed(0)}%)`);
  } else if (stats.fakePercentage > 20) {
    parts.push(`${productName} has some questionable reviews (${stats.fakePercentage.toFixed(0)}% flagged)`);
  } else {
    parts.push(`${productName} reviews appear mostly authentic`);
  }

  if (stats.adjustedRating < stats.avgRating - 0.5) {
    parts.push(`the adjusted rating drops to ${stats.adjustedRating.toFixed(1)}/5 after removing suspicious reviews`);
  }

  if (stats.suspiciousPatterns.length > 0) {
    parts.push(`concerns include: ${stats.suspiciousPatterns.slice(0, 2).join(', ')}`);
  }

  return parts.join('; ') + '.';
}

/**
 * Generate a verdict using Gemini
 */
export async function generateVerdict(
  data: {
    productName: string;
    reviewAnalysis: any;
    sellerReputation: any;
    priceComparison: any;
    authenticityScore: number;
  }
): Promise<{
  verdict: string;
  key_positives: string[];
  key_concerns: string[];
  best_price_tip: string;
} | null> {
  const model = await getChatModel();
  if (!model) return null;

  try {
    const prompt = `You are TrustCart, an expert product analyst for Indian consumers.

Product: ${data.productName}
Authenticity Score: ${data.authenticityScore}/100
Review Analysis: ${JSON.stringify(data.reviewAnalysis)}
Seller Reputation: ${JSON.stringify(data.sellerReputation)}
Price Comparison: ${JSON.stringify(data.priceComparison)}

Provide a JSON response with:
{
  "verdict": "2-3 sentence plain-language verdict",
  "key_positives": ["up to 3 positive findings"],
  "key_concerns": ["up to 5 concerns"],
  "best_price_tip": "one sentence on best price option"
}

Return ONLY valid JSON, no markdown or extra text.`;

    const response = await model.invoke(prompt);
    const content = response.content as string;

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    logger.warn('AI verdict generation failed:', error);
    return null;
  }
}
