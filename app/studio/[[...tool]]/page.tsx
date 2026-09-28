import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";
import { isSanityConfigured } from "@/sanity/env";

export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!isSanityConfigured) {
    return <main className="studio-setup">
      <p>Sanity Studio is installed but not connected.</p>
      <h1>Add your Sanity project settings.</h1>
      <p>Copy <code>.env.example</code> to <code>.env.local</code>, add the project ID and dataset, then restart the development server.</p>
    </main>;
  }

  return <NextStudio config={config} />;
}
