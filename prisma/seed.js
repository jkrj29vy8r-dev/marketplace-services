const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "DJ & Muzică", slug: "dj-muzica", icon: "Music4" },
  { name: "Dansatori & Artiști", slug: "dansatori-artisti", icon: "Sparkles" },
  { name: "Organizare Evenimente", slug: "evenimente", icon: "PartyPopper" },
  { name: "Curățenie", slug: "curatenie", icon: "Scissors" },
  { name: "Transport & Logistică", slug: "transport-logistica", icon: "Truck" },
  { name: "Mentenanță & Reparații", slug: "mentenanta", icon: "Wrench" },
  { name: "Foto & Video", slug: "foto-video", icon: "Camera" },
  { name: "Grădinărit & Exterior", slug: "gradinarit", icon: "Leaf" },
  { name: "Auto & Detailing", slug: "auto", icon: "Car" },
  { name: "Fitness & Nutriție", slug: "fitness-nutritie", icon: "Dumbbell" },
  { name: "Beauty & Înfrumusețare", slug: "beauty", icon: "Wand2" },
];

const DEMO_VENDORS = [
  {
    email: "dj.vibe@zervio.ro",
    name: "Andrei Popescu",
    displayName: "DJ Vibe Events",
    bio: "DJ profesionist pentru nunți, botezuri și petreceri corporate. 10 ani experiență.",
    categorySlug: "dj-muzica",
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
    categorySlug: "dansatori-artisti",
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
    categorySlug: "curatenie",
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
    categorySlug: "gradinarit",
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
    categorySlug: "fitness-nutritie",
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
    categorySlug: "fitness-nutritie",
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
  {
    email: "glow.beauty@zervio.ro",
    name: "Alexandra Toma",
    displayName: "Glow Beauty Studio",
    bio: "Machiaj profesional, manichiură și styling pentru evenimente speciale.",
    categorySlug: "beauty",
    verifiedBadge: true,
    promoted: false,
    services: [
      {
        title: "Machiaj profesional eveniment",
        description: "Machiaj de seară/mireasă, produse premium, testare inclusă.",
        pricingType: "FIXED",
        priceNetRON: 250,
        durationMins: 90,
      },
    ],
  },
  {
    email: "nailbar.elite@zervio.ro",
    name: "Diana Stoica",
    displayName: "Elite Nail Bar",
    bio: "Manichiură, pedichiură și unghii false, la salon sau la domiciliu.",
    categorySlug: "beauty",
    verifiedBadge: false,
    promoted: false,
    services: [
      {
        title: "Manichiură cu gel",
        description: "Pilire, modelare, aplicare gel, design la cerere.",
        pricingType: "FIXED",
        priceNetRON: 90,
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
