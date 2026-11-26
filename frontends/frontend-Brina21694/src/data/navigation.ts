// Les sections du site, dans l'ordre d'affichage.
// `id` = ancre dans la page (#projects), `labelKey` = clé de traduction du libellé du menu.
export const NAV_ITEMS = [
  { id: 'home', labelKey: 'nav.home' },
  { id: 'about', labelKey: 'nav.about' },
  { id: 'projects', labelKey: 'nav.projects' },
  { id: 'data-lab', labelKey: 'nav.dataLab' },
  { id: 'skills', labelKey: 'nav.skills' },
  { id: 'experience', labelKey: 'nav.experience' },
  { id: 'vision', labelKey: 'nav.vision' },
  { id: 'contact', labelKey: 'nav.contact' },
] as const

export const NAV_IDS: string[] = NAV_ITEMS.map((item) => item.id)
