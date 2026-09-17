/**
 * Standard Locations & Areas Served Data for Linksys Fiber Networks
 * Main Location: Molo, Nakuru County, Kenya
 * Full Coverage: Molo and its environs (Tayari, Moto, Turi, Kibunja, Promise, 20 Acres, Kenyatta 123, Treasure, Upperhill Estate, Mwangaza, Kasino, Keepleft, Mutirithia, Millimani, Molo CBD, Elburgon, Njoro, Nakuru County, Kenya)
 * Primary Title: Fast & Reliable Internet Service Provider Molo
 */

export const MAIN_LOCATION = 'Molo, Nakuru County, Kenya'
export const PROFESSION_TITLE = 'Fast & Reliable Internet Service Provider Molo'

// Specific coverage areas in Molo and neighboring towns
export const MOLO_COVERAGE_AREAS = [
  'Molo CBD',
  'Tayari',
  'Moto',
  'Turi',
  'Kibunja',
  'Promise',
  '20 Acres',
  'Kenyatta 123',
  'Treasure',
  'Upperhill Estate',
  'Mwangaza',
  'Kasino',
  'Keepleft',
  'Mutirithia',
  'Millimani',
  'Elburgon',
  'Njoro',
  'Sachangwan',
  'Mau Summit',
] as const

// All 47 Counties of the Republic of Kenya
export const KENYA_COUNTIES = [
  'Nakuru',
  'Mombasa',
  'Kwale',
  'Kilifi',
  'Tana River',
  'Lamu',
  'Taita-Taveta',
  'Garissa',
  'Wajir',
  'Mandera',
  'Marsabit',
  'Isiolo',
  'Meru',
  'Tharaka-Nithi',
  'Embu',
  'Kitui',
  'Machakos',
  'Makueni',
  'Nyandarua',
  'Nyeri',
  'Kirinyaga',
  "Murang'a",
  'Kiambu',
  'Turkana',
  'West Pokot',
  'Samburu',
  'Trans-Nzoia',
  'Uasin Gishu',
  'Elgeyo-Marakwet',
  'Nandi',
  'Baringo',
  'Laikipia',
  'Narok',
  'Kajiado',
  'Kericho',
  'Bomet',
  'Kakamega',
  'Vihiga',
  'Bungoma',
  'Busia',
  'Siaya',
  'Kisumu',
  'Homa Bay',
  'Migori',
  'Kisii',
  'Nyamira',
  'Nairobi',
] as const

// Schema.org areaServed entities format for Google and search crawlers
export function getSchemaAreasServed() {
  return [
    {
      '@type': 'City',
      name: 'Molo',
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: 'Nakuru County',
      },
    },
    ...MOLO_COVERAGE_AREAS.map((area) => ({
      '@type': 'Place',
      name: `${area}, Molo`,
      containedInPlace: {
        '@type': 'City',
        name: 'Molo',
      },
    })),
    {
      '@type': 'AdministrativeArea',
      name: 'Nakuru County',
      containedInPlace: {
        '@type': 'Country',
        name: 'Kenya',
      },
    },
    {
      '@type': 'Country',
      name: 'Kenya',
      description: 'Nationwide coverage across Kenya with main fiber backbone in Molo and Nakuru County',
    },
  ]
}

// Compact string summary of all locations served
export const ALL_AREAS_SERVED_SUMMARY = [
  'Molo CBD (Headquarters - Generis Hotel Building)',
  'Tayari, Moto, Turi & Kibunja',
  'Promise, 20 Acres & Kenyatta 123',
  'Treasure, Upperhill Estate & Mwangaza',
  'Kasino, Keepleft, Mutirithia & Millimani',
  'Elburgon, Njoro & Greater Nakuru County',
]

// Keywords formatted for high-ranking local & regional ISP SEO
export const LOCAL_SEO_KEYWORDS = [
  'Internet Service Provider Molo',
  'Fast Internet in Molo',
  'Fiber Internet Molo',
  'Linksys Fiber Networks Molo',
  'WiFi installation Molo',
  'Affordable internet packages Molo',
  'Home WiFi Molo',
  'Business Internet Molo',
  'Hotspot Wi-Fi Broadcasting Molo',
  'CCTV installation Molo Nakuru',
  'Structured Cabling Molo',
  'IT Support Services Molo',
  'Reliable ISP Nakuru County',
  'Linksys Fiber Turi Kibunja Tayari',
].join(', ')
