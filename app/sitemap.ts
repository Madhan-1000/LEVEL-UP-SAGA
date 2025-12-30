import type { MetadataRoute } from 'next'

const SITE_URL = 'https://level-up-saga.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: new Date() },
    { url: `${SITE_URL}/dashboard`, lastModified: new Date() },
    { url: `${SITE_URL}/domains`, lastModified: new Date() },
    { url: `${SITE_URL}/achievements`, lastModified: new Date() },
    { url: `${SITE_URL}/timeline`, lastModified: new Date() },
    { url: `${SITE_URL}/help`, lastModified: new Date() },
    { url: `${SITE_URL}/onboarding`, lastModified: new Date() },
    { url: `${SITE_URL}/auth/sign-in`, lastModified: new Date() },
    { url: `${SITE_URL}/auth/sign-up`, lastModified: new Date() },
  ]
}
