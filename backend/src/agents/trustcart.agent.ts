import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { pull } from 'langchain/hub';
import { getChatModel } from '../services/ai.service';
import { scrapeProductTool } from './tools/scrape.tool';
import { reviewAnalyzerTool } from './tools/review-analyzer.tool';
import { priceFetcherTool } from './tools/price-fetcher.tool';
import { sellerCheckerTool } from './tools/seller-checker.tool';
import { logger } from '../utils/logger';
import { AgentVerdict } from '../types';
import {
  computeAuthenticityScore,
  getTrustLabel,
  getRecommendation,
  isRatingDistributionNormal,
} from '../utils/scoreCalculator';

/**
 * TrustCart AI Agent
 * ReAct-style agent that orchestrates scraping, review analysis,
 * seller checking, and price comparison for product intelligence.
 */

const TRUSTCART_SYSTEM_PROMPT = `You are TrustCart, an expert AI agent specializing in e-commerce product authentication 
and price intelligence for Indian consumers.

When given a product URL:
1. ALWAYS call scrape_product_page first to get product data
2. ALWAYS call analyze_reviews with the scraped reviews
3. ALWAYS call check_seller_reputation with the seller info
4. ALWAYS call fetch_price_comparisons to find better prices
5. After all tools complete, synthesize findings into a structured JSON verdict

Your final answer MUST be valid JSON with this exact structure:
{{
  "authenticity_score": <0-100 integer>,
  "trust_label": "<TRUSTED|SUSPICIOUS|FAKE|UNKNOWN>",
  "recommendation": "<BUY|AVOID|CAUTION>",
  "verdict": "<2-3 sentence plain-language summary for an Indian consumer>",
  "key_positives": ["<up to 3 positive findings>"],
  "key_concerns": ["<up to 5 concerns or red flags>"],
  "best_price_tip": "<one sentence on where to buy if recommending purchase>"
}}

Be direct. Prioritize consumer safety. When in doubt, say CAUTION.
Do NOT include any text outside the JSON object. Return ONLY valid JSON.`;

const tools = [scrapeProductTool, reviewAnalyzerTool, priceFetcherTool, sellerCheckerTool];

/**
 * Execute the TrustCart agent pipeline
 */
export async function executeTrustCartAgent(
  url: string,
  analysisId: string,
  onProgress?: (step: string, percentage: number) => Promise<void>
): Promise<{
  verdict: AgentVerdict;
  scrapedData: any;
  reviewAnalysis: any;
  priceComparison: any;
  sellerReputation: any;
}> {
  const chatModel = await getChatModel();

  // If no LLM is available, run tools directly (heuristic-only mode)
  if (!chatModel) {
    logger.info('🔧 Running in heuristic-only mode (no AI key configured)');
    return await runHeuristicPipeline(url, analysisId, onProgress);
  }

  try {
    logger.info(`🤖 Starting TrustCart agent for analysis: ${analysisId}`);

    // Build ReAct prompt
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', TRUSTCART_SYSTEM_PROMPT + '\n\nAvailable Tools:\n{tools}\n\nTool Names:\n{tool_names}'],
      ['human', '{input}\n\n{agent_scratchpad}'],
    ]);

    const agent = await createReactAgent({
      llm: chatModel,
      tools,
      prompt,
    });

    const executor = new AgentExecutor({
      agent,
      tools,
      maxIterations: 8,
      returnIntermediateSteps: true,
      verbose: true,
    });

    if (onProgress) await onProgress('Agent started', 10);

    const result = await executor.invoke({
      input: `Analyze this product URL for authenticity, fake reviews, seller reputation, and price comparison: ${url}`,
    });

    if (onProgress) await onProgress('Verdict synthesized', 95);

    // Parse the agent's final output
    const outputStr = result.output as string;
    let agentVerdict: AgentVerdict;

    try {
      const jsonMatch = outputStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        agentVerdict = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in agent output');
      }
    } catch {
      logger.warn('Failed to parse agent verdict, generating from intermediate steps');
      agentVerdict = buildVerdictFromSteps(result.intermediateSteps);
    }

    // Extract intermediate step data
    const stepData = extractStepData(result.intermediateSteps);

    return {
      verdict: agentVerdict,
      scrapedData: stepData.scrapeData,
      reviewAnalysis: stepData.reviewData,
      priceComparison: stepData.priceData,
      sellerReputation: stepData.sellerData,
    };
  } catch (error: any) {
    logger.error('Agent execution failed:', error);
    // Fallback to heuristic pipeline
    logger.info('Falling back to heuristic pipeline...');
    return await runHeuristicPipeline(url, analysisId, onProgress);
  }
}

/**
 * Run the pipeline without LLM (heuristic-only mode)
 */
async function runHeuristicPipeline(
  url: string,
  analysisId: string,
  onProgress?: (step: string, percentage: number) => Promise<void>
): Promise<{
  verdict: AgentVerdict;
  scrapedData: any;
  reviewAnalysis: any;
  priceComparison: any;
  sellerReputation: any;
}> {
  // Step 1: Scrape
  if (onProgress) await onProgress('Scraping product page', 10);
  const scrapeResult = await scrapeProductTool.invoke({ url });
  const scrapedData = JSON.parse(scrapeResult);

  if (scrapedData.error) {
    throw new Error(scrapedData.message || 'Scraping failed');
  }

  // Step 2: Analyze reviews
  if (onProgress) await onProgress('Analyzing reviews', 30);
  const reviewResult = await reviewAnalyzerTool.invoke({
    reviews: scrapedData.raw_reviews || [],
    product_name: scrapedData.product_name,
    metadata_review_count: scrapedData.review_count || 0,
    metadata_avg_rating: scrapedData.rating || 0,
  });
  const reviewData = JSON.parse(reviewResult);

  // Step 3: Check seller
  if (onProgress) await onProgress('Checking seller', 55);
  const sellerResult = await sellerCheckerTool.invoke({
    seller_name: scrapedData.seller_name || 'Unknown',
    platform: scrapedData.platform || 'UNKNOWN',
  });
  const sellerData = JSON.parse(sellerResult);

  // Step 4: Compare prices
  if (onProgress) await onProgress('Comparing prices', 70);
  const priceResult = await priceFetcherTool.invoke({
    product_name: scrapedData.product_name,
    brand: scrapedData.brand || '',
    current_platform: scrapedData.platform,
    current_price: scrapedData.price,
  });
  const priceData = JSON.parse(priceResult);

  // Step 5: Compute verdict
  if (onProgress) await onProgress('Computing verdict', 85);

  const authenticityScore = computeAuthenticityScore({
    reviewFakePercentage: reviewData.fake_percentage || 0,
    sellerTrustScore: sellerData.trust_score || 50,
    ratingDistributionNormal: isRatingDistributionNormal(reviewData.rating_distribution || {}),
    burstDetected: (reviewData.suspicious_patterns || []).some((p: string) =>
      p.toLowerCase().includes('burst')
    ),
    incentivizedLanguageFound: (reviewData.suspicious_patterns || []).some((p: string) =>
      p.toLowerCase().includes('incentivized')
    ),
    verifiedPurchaseRatio: reviewData.total_reviews > 0
      ? reviewData.real_count / reviewData.total_reviews
      : 0.5,
  });

  const trustLabel = getTrustLabel(authenticityScore);
  const recommendation = getRecommendation(authenticityScore);

  // Build heuristic verdict
  const verdict: AgentVerdict = {
    authenticity_score: authenticityScore,
    trust_label: trustLabel,
    recommendation: recommendation,
    verdict: buildHeuristicVerdictText(scrapedData, reviewData, sellerData, authenticityScore),
    key_positives: buildPositives(scrapedData, reviewData, sellerData),
    key_concerns: reviewData.suspicious_patterns?.slice(0, 5) || [],
    best_price_tip: priceData.best_price_platform !== scrapedData.platform
      ? `Best price found on ${priceData.best_price_platform} at ₹${priceData.best_price} (save ₹${priceData.savings_amount})`
      : `Current price on ${scrapedData.platform} appears competitive.`,
  };

  return {
    verdict,
    scrapedData,
    reviewAnalysis: reviewData,
    priceComparison: priceData,
    sellerReputation: sellerData,
  };
}

/**
 * Extract data from intermediate agent steps
 */
function extractStepData(steps: any[]): {
  scrapeData: any;
  reviewData: any;
  priceData: any;
  sellerData: any;
} {
  let scrapeData = {};
  let reviewData = {};
  let priceData = {};
  let sellerData = {};

  for (const step of steps || []) {
    try {
      const toolName = step.action?.tool;
      const output = step.observation;

      if (typeof output === 'string') {
        const parsed = JSON.parse(output);
        if (toolName === 'scrape_product_page') scrapeData = parsed;
        else if (toolName === 'analyze_reviews') reviewData = parsed;
        else if (toolName === 'fetch_price_comparisons') priceData = parsed;
        else if (toolName === 'check_seller_reputation') sellerData = parsed;
      }
    } catch {
      // Skip unparseable steps
    }
  }

  return { scrapeData, reviewData, priceData, sellerData };
}

/**
 * Build a verdict from intermediate steps when agent output parsing fails
 */
function buildVerdictFromSteps(steps: any[]): AgentVerdict {
  const data = extractStepData(steps);

  const score = computeAuthenticityScore({
    reviewFakePercentage: data.reviewData?.fake_percentage || 0,
    sellerTrustScore: data.sellerData?.trust_score || 50,
    ratingDistributionNormal: true,
    burstDetected: false,
    incentivizedLanguageFound: false,
    verifiedPurchaseRatio: 0.5,
  });

  return {
    authenticity_score: score,
    trust_label: getTrustLabel(score),
    recommendation: getRecommendation(score),
    verdict: 'Analysis completed using automated heuristics.',
    key_positives: [],
    key_concerns: data.reviewData?.suspicious_patterns?.slice(0, 5) || [],
    best_price_tip: 'Compare prices across platforms before purchasing.',
  };
}

function buildHeuristicVerdictText(
  product: any,
  reviews: any,
  seller: any,
  score: number
): string {
  const parts: string[] = [];

  if (score >= 71) {
    parts.push(`${product.product_name} appears to be a genuine product with mostly authentic reviews.`);
  } else if (score >= 41) {
    parts.push(`${product.product_name} has some questionable review patterns that warrant caution.`);
  } else {
    parts.push(`${product.product_name} shows significant red flags in review authenticity and seller reputation.`);
  }

  if (reviews.fake_percentage > 30) {
    parts.push(`${reviews.fake_percentage.toFixed(0)}% of reviews were flagged as potentially fake.`);
  }

  if (seller.trust_label === 'LOW') {
    parts.push(`The seller has a low trust score — consider buying from a more reputable seller.`);
  }

  return parts.join(' ');
}

function buildPositives(product: any, reviews: any, seller: any): string[] {
  const positives: string[] = [];

  if (product.rating >= 4.0) {
    positives.push(`High overall rating of ${product.rating}/5`);
  }

  if (reviews.fake_percentage < 15) {
    positives.push('Reviews appear mostly authentic');
  }

  if (seller.trust_label === 'HIGH') {
    positives.push(`Reputable seller with ${seller.trust_score}/100 trust score`);
  }

  if (seller.verified) {
    positives.push('Platform-verified seller');
  }

  return positives.slice(0, 3);
}
