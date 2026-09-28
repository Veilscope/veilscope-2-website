import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "@/sanity/env";

const token = process.env.SANITY_API_READ_TOKEN?.trim();

export const sanityClient = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      perspective: "published",
      token: token || undefined,
      useCdn: !token,
    })
  : null;
