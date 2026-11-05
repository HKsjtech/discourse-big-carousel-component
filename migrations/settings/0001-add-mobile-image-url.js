export default function migrate(settings) {
  const raw = settings.get("big_carousel_slides");
  if (typeof raw !== "string" || !raw.trim()) {
    return settings;
  }

  let slides;
  try {
    slides = JSON.parse(raw);
  } catch {
    return settings;
  }

  if (!Array.isArray(slides)) {
    return settings;
  }

  const next = slides.map((slide) => {
    if (!slide || typeof slide !== "object" || "mobile_image_url" in slide) {
      return slide;
    }

    const updated = {};
    let added = false;
    Object.entries(slide).forEach(([key, value]) => {
      updated[key] = value;
      if (key === "image_url") {
        updated.mobile_image_url = "";
        added = true;
      }
    });

    if (!added) {
      updated.mobile_image_url = "";
    }

    return updated;
  });

  settings.set("big_carousel_slides", JSON.stringify(next));
  return settings;
}
