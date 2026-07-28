import { ensureDb } from "@/lib/db/ensure";
import { getSettings } from "@/lib/services/booking";
import { jsonResponse } from "@/lib/api/helpers";
import { mapSettingsToPublic } from "@/lib/data/public-settings";
import { publicSettingsDefaults } from "@/lib/data/public-settings-defaults";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await ensureDb())) {
      return jsonResponse(publicSettingsDefaults);
    }
    const all = await getSettings();
    const response = jsonResponse(mapSettingsToPublic(all));
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch {
    return jsonResponse(publicSettingsDefaults);
  }
}
