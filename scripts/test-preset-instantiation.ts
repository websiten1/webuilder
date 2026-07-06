// One-off runtime test: personalization via Claude + static bundle assembly
// for a preset design, without deploying. Run: npx tsx scripts/test-preset-instantiation.ts

import { isPresetTemplate, generatePresetPersonalization, buildPresetDeployFiles } from "../lib/preset-site";
import type { WizardData } from "../app/components/GenerateWizard";

const log = (location: string, message: string, data: Record<string, unknown>) =>
  fetch("http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "fdaeb6" },
    body: JSON.stringify({ sessionId: "fdaeb6", location, message, data, hypothesisId: "preset-flow", timestamp: Date.now() }),
  }).catch(() => {});

const formData = {
  templateId: "brandly-agency",
  websiteLanguage: "Romanian",
  business: {
    name: "Atelier Vitralii Cluj",
    type: "Creative Studio",
    description: "Atelier de vitralii artizanale din Cluj — creăm vitralii personalizate pentru case, biserici și spații comerciale.",
    locationCity: "Cluj-Napoca",
    locationCountry: "România",
    email: "contact@ateliervitralii.ro",
    hasPhone: true,
    phone: "+40 740 123 456",
    aboutText: "De peste 15 ani transformăm lumina în artă.",
  },
  goals: { whyChoose: "Singura echipă din Transilvania specializată în restaurare de vitralii istorice." },
  services: { list: ["Vitralii personalizate", "Restaurare vitralii istorice", "Lămpi Tiffany"] },
  galleryMembers: [],
  socials: { instagram: "https://instagram.com/ateliervitralii" },
  logo: { uploaded: false },
} as unknown as WizardData;

async function main() {
  const slug = formData.templateId!;
  console.log("isPresetTemplate:", isPresetTemplate(slug));
  await log("test-preset:start", "starting personalization test", { slug });

  const p = process.env.MOCK_PERSONALIZATION === "1"
    ? {
        title: "Atelier Vitralii Cluj — Vitralii artizanale",
        description: "Vitralii personalizate, restaurare vitralii istorice și lămpi Tiffany în Cluj-Napoca.",
        replacements: [
          { from: "Brandly", to: "Atelier Vitralii" },
          { from: "Building", to: "Vitralii" },
          { from: "Brands", to: "de Artă" },
          { from: "We craft distinctive identities and digital experiences for ambitious teams — from strategy and visual systems to launch-ready brand worlds.", to: "Creăm vitralii personalizate pentru case, biserici și spații comerciale — de la concept și design până la montaj final." },
          { from: "Work with us", to: "Contactează-ne" },
          { from: "5+ Years", to: "15+ Ani" },
        ],
      }
    : await generatePresetPersonalization(slug, formData);
  console.log("title:", p.title);
  console.log("description:", p.description);
  console.log("replacements:", p.replacements.length);
  console.log(JSON.stringify(p.replacements.slice(0, 12), null, 2));
  await log("test-preset:personalized", "personalization done", {
    slug, title: p.title, replacementCount: p.replacements.length, sample: p.replacements.slice(0, 5),
  });

  const files = buildPresetDeployFiles(slug, p, { socials: { instagram: "https://instagram.com/ateliervitralii" } });
  const index = files.find(f => f.file === "index.html")!;
  const titleOk = index.data.includes(`<title>${p.title.replace(/&/g, "&amp;")}`) || index.data.includes(`<title>${p.title}`);
  const cfgMatch = index.data.match(/id="draftly-customization-data">([\s\S]*?)<\/script>/);
  const cfg = JSON.parse(cfgMatch![1].replace(/\\u003c/g, "<"));
  console.log("files:", files.length, "| title injected:", titleOk, "| cfg replacements:", cfg.replacements.length, "| brand:", JSON.stringify(cfg.brand));
  await log("test-preset:built", "bundle assembled", {
    slug, fileCount: files.length, titleInjected: titleOk, cfgReplacements: cfg.replacements.length, brand: cfg.brand,
  });

  // Write personalized index.html to a temp preview location for visual check
  const fs = await import("fs");
  fs.mkdirSync("public/preset-sites/__test-preview", { recursive: true });
  fs.writeFileSync("public/preset-sites/__test-preview/index.html", index.data);
  console.log("Preview written: public/preset-sites/__test-preview/index.html");
}

main().catch(e => { console.error(e); process.exit(1); });
