const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const CATEGORIES = [
  {
    name: "Entertainment & Evenimente",
    slug: "entertainment-evenimente",
    icon: "PartyPopper",
  },
  {
    name: "Auto",
    slug: "auto",
    icon: "Car",
  },
  {
    name: "Home & Garden",
    slug: "home-garden",
    icon: "Leaf",
  },
  {
    name: "Health & Wellness",
    slug: "health-wellness",
    icon: "HeartPulse",
  },
];

const DEMO_VENDORS = [
  {
    email: "dj.vibe@zervio.ro",
    name: "Andrei Popescu",
    displayName: "DJ Vibe Events",
    bio: "DJ profesionist pentru nunți, botezuri și petreceri corporate. 10 ani experiență.",
    categorySlug: "entertainment-evenimente",
    verifiedBadge: true,
    promoted: true,
    services: [
      {
        title: "Pachet DJ - 6 ore",
        description: "Sonorizare completă, lumini, MC inclus, playlist personalizat.",
        pricingType: "FIXED",
        priceNetRON: 1500,
        durationMins: 360,
      },
    ],
  },
  {
    email: "dansatori.flame@zervio.ro",
    name: "Maria Ionescu",
    displayName: "Flame Dance Crew",
    bio: "Trupă de dansatori profesioniști pentru evenimente private și corporate.",
    categorySlug: "entertainment-evenimente",
    verifiedBadge: false,
    promoted: false,
    services: [
      {
        title: "Show dans - 20 minute",
        description: "Coregrafie personalizată, costume incluse.",
        pricingType: "FIXED",
        priceNetRON: 800,
        durationMins: 20,
      },
    ],
  },
  {
    email: "shine.detailing@zervio.ro",
    name: "Bogdan Marin",
    displayName: "Shine Auto Detailing",
    bio: "Detailing auto premium: polish, ceramic coating, curățare interior profesională.",
    categorySlug: "auto",
    verifiedBadge: true,
    promoted: true,
    services: [
      {
        title: "Detailing complet exterior + interior",
        description: "Spălare, decontaminare, polish, protecție ceramică, curățare interior.",
        pricingType: "FIXED",
        priceNetRON: 350,
        durationMins: 180,
      },
    ],
  },
  {
    email: "curatenie.expres@zervio.ro",
    name: "Elena Dumitru",
    displayName: "Curățenie Expres",
    bio: "Servicii de curățenie pentru locuințe, birouri și spații comerciale.",
    categorySlug: "home-garden",
    verifiedBadge: true,
    promoted: false,
    services: [
      {
        title: "Curățenie generală apartament",
        description: "Curățenie completă: bucătărie, baie, camere, geamuri.",
        pricingType: "PER_UNIT",
        priceNetRON: 8,
        unit: "mp",
      },
    ],
  },
  {
    email: "tuns.gazon@zervio.ro",
    name: "Vasile Stan",
    displayName: "GreenCut Grădinărit",
    bio: "Tuns gazon, întreținere spații verzi, toaletare pomi și gard vegetal.",
    categorySlug: "home-garden",
    verifiedBadge: false,
    promoted: false,
    services: [
      {
        title: "Tuns gazon curte",
        description: "Tuns, strângere resturi vegetale, finisaje margini.",
        pricingType: "PER_UNIT",
        priceNetRON: 3,
        unit: "mp",
      },
    ],
  },
  {
    email: "coach.fit@zervio.ro",
    name: "Cristina Vasile",
    displayName: "FitCoach Cristina",
    bio: "Antrenor personal certificat, programe de fitness și nutriție personalizate.",
    categorySlug: "health-wellness",
    verifiedBadge: true,
    promoted: true,
    services: [
      {
        title: "Ședință personal training - 1 oră",
        description: "Antrenament personalizat, evaluare inițială inclusă.",
        pricingType: "FIXED",
        priceNetRON: 120,
        durationMins: 60,
      },
    ],
  },
  {
    email: "nutritie.echilibrata@zervio.ro",
    name: "Radu Constantin",
    displayName: "Nutriție Echilibrată",
    bio: "Nutriționist dietetician, planuri alimentare personalizate pentru obiectivele tale.",
    categorySlug: "health-wellness",
    verifiedBadge: false,
    promoted: false,
    services: [
      {
        title: "Consultație nutrițională inițială",
        description: "Evaluare completă, plan alimentar personalizat pe 4 săptămâni.",
        pricingType: "FIXED",
        priceNetRON: 200,
        durationMins: 60,
      },
    ],
  },
];

async function main() {
  console.log("Seeding categorii...");

  const categoryBySlug = {};
  for (const category of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, icon: category.icon },
      create: category,
    });
    categoryBySlug[category.slug] = created;
    console.log(`  ✔ ${created.name}`);
  }

  console.log("Seeding vendori demo...");

  const passwordHash = await bcrypt.hash("Parola123!", 12);
  const promotedUntil = new Date();
  promotedUntil.setDate(promotedUntil.getDate() + 30);

  for (const vendorData of DEMO_VENDORS) {
    const user = await prisma.user.upsert({
      where: { email: vendorData.email },
      update: {},
      create: {
        email: vendorData.email,
        name: vendorData.name,
        passwordHash,
        role: "VENDOR",
      },
    });

    const vendorProfile = await prisma.vendorProfile.upsert({
      where: { userId: user.id },
      update: {
        displayName: vendorData.displayName,
        bio: vendorData.bio,
        verifiedBadge: vendorData.verifiedBadge,
        ratingAvg: 4.5,
        ratingCount: 12,
        promotedUntil: vendorData.promoted ? promotedUntil : null,
        promotionPlan: vendorData.promoted ? "FEATURED_HOME_30D" : null,
      },
      create: {
        userId: user.id,
        displayName: vendorData.displayName,
        bio: vendorData.bio,
        verifiedBadge: vendorData.verifiedBadge,
        ratingAvg: 4.5,
        ratingCount: 12,
        promotedUntil: vendorData.promoted ? promotedUntil : null,
        promotionPlan: vendorData.promoted ? "FEATURED_HOME_30D" : null,
      },
    });

    const category = categoryBySlug[vendorData.categorySlug];

    for (const service of vendorData.services) {
      const existing = await prisma.service.findFirst({
        where: { vendorId: vendorProfile.id, title: service.title },
      });

      if (!existing) {
        await prisma.service.create({
          data: {
            vendorId: vendorProfile.id,
            categoryId: category.id,
            title: service.title,
            description: service.description,
            pricingType: service.pricingType,
            priceNetRON: service.priceNetRON,
            unit: service.unit,
            durationMins: service.durationMins,
          },
        });
      }
    }

    console.log(`  ✔ ${vendorData.displayName}`);
  }

  console.log("Seed finalizat cu succes.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
