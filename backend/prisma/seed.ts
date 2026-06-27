import { PrismaClient, Plan, AnalysisStatus, Platform, TrustLabel, Recommendation } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── 1. Create Test Users ─────────────────
  const passwordHash = await bcrypt.hash('TestPassword123!', 12);

  const freeUser = await prisma.user.upsert({
    where: { email: 'free@trustcart.test' },
    update: {},
    create: {
      email: 'free@trustcart.test',
      password_hash: passwordHash,
      name: 'Free User',
      plan: Plan.FREE,
    },
  });
  console.log(`  ✅ Created free user: ${freeUser.email}`);

  const proUser = await prisma.user.upsert({
    where: { email: 'pro@trustcart.test' },
    update: {},
    create: {
      email: 'pro@trustcart.test',
      password_hash: passwordHash,
      name: 'Pro User',
      plan: Plan.PRO,
    },
  });
  console.log(`  ✅ Created pro user: ${proUser.email}`);

  // ─── 2. Create Example Analyses ───────────
  const analyses = [
    {
      user_id: proUser.id,
      url: 'https://www.amazon.in/dp/B0CHX3QBCH',
      platform: Platform.AMAZON,
      status: AnalysisStatus.COMPLETED,
      product_name: 'Samsung Galaxy Buds2 Pro',
      authenticity_score: 85,
      trust_label: TrustLabel.TRUSTED,
      verdict: 'This product appears to be genuine. The seller has a strong reputation and reviews are largely authentic. Minor concerns about a few potentially incentivized reviews.',
      recommendation: Recommendation.BUY,
      completed_at: new Date(),
    },
    {
      user_id: proUser.id,
      url: 'https://www.flipkart.com/some-product/p/itm123',
      platform: Platform.FLIPKART,
      status: AnalysisStatus.COMPLETED,
      product_name: 'boAt Airdopes 141 TWS',
      authenticity_score: 42,
      trust_label: TrustLabel.SUSPICIOUS,
      verdict: 'Caution advised. High percentage of potentially fake reviews detected. Seller has limited history and some reported issues with product authenticity.',
      recommendation: Recommendation.CAUTION,
      completed_at: new Date(),
    },
    {
      user_id: freeUser.id,
      url: 'https://www.myntra.com/shirts/some-product/12345',
      platform: Platform.MYNTRA,
      status: AnalysisStatus.PROCESSING,
      product_name: 'Allen Solly Men Slim Fit Shirt',
    },
    {
      user_id: freeUser.id,
      url: 'https://www.meesho.com/some-product/p/abc123',
      platform: Platform.MEESHO,
      status: AnalysisStatus.PENDING,
    },
    {
      user_id: proUser.id,
      url: 'https://www.amazon.in/dp/B0FAKE12345',
      platform: Platform.AMAZON,
      status: AnalysisStatus.FAILED,
      error_message: 'Product page not found or has been removed.',
    },
  ];

  for (const analysis of analyses) {
    await prisma.analysis.create({ data: analysis });
  }
  console.log(`  ✅ Created ${analyses.length} example analyses`);

  // ─── 3. Seed Flagged Sellers ──────────────
  const flaggedSellersPath = path.join(__dirname, '..', 'data', 'flagged-sellers.json');
  const flaggedSellers = JSON.parse(fs.readFileSync(flaggedSellersPath, 'utf-8'));

  for (const seller of flaggedSellers) {
    await prisma.seller.upsert({
      where: {
        platform_seller_id: {
          platform: seller.platform,
          seller_id: seller.seller_id,
        },
      },
      update: {},
      create: {
        name: seller.name,
        platform: seller.platform,
        seller_id: seller.seller_id,
        trust_score: seller.risk_level === 'HIGH' ? 15 : 40,
        flags: [seller.reason],
        verified: false,
        last_checked: new Date(),
      },
    });
  }
  console.log(`  ✅ Seeded ${flaggedSellers.length} flagged sellers`);

  // ─── 4. Seed Price Alerts ─────────────────
  const alerts = [
    {
      user_id: proUser.id,
      product_url: 'https://www.amazon.in/dp/B0CHX3QBCH',
      platform: 'AMAZON',
      target_price: 8999,
      current_price: 11999,
      triggered: false,
    },
    {
      user_id: proUser.id,
      product_url: 'https://www.flipkart.com/some-headphones/p/itm456',
      platform: 'FLIPKART',
      target_price: 1499,
      current_price: 1999,
      triggered: false,
    },
    {
      user_id: freeUser.id,
      product_url: 'https://www.myntra.com/shoes/some-shoe/67890',
      platform: 'MYNTRA',
      target_price: 2499,
      current_price: 2199,
      triggered: true,
      triggered_at: new Date(),
    },
  ];

  for (const alert of alerts) {
    await prisma.priceAlert.create({ data: alert });
  }
  console.log(`  ✅ Created ${alerts.length} price alerts`);

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
