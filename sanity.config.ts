"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "@/sanity/env";
import { schemaTypes } from "@/sanity/schemaTypes";

export default defineConfig({
  name: "veilscope",
  title: "Veilscope Publishing",
  basePath: "/studio",
  // The route displays setup guidance until a real project ID is configured.
  projectId: projectId || "configureme",
  dataset,
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
