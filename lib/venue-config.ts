export interface VenueLocation {
  id: string
  name: string
  address: string
  description: string
  color: 'primary' | 'secondary'
}

export const venueLocations: VenueLocation[] = [
  {
    id: 'downtown',
    name: 'Downtown Office',
    address: '123 Tech Street, Suite 400',
    description: 'Modern co-working space with whiteboards',
    color: 'primary'
  },
  {
    id: 'campus',
    name: 'University Campus',
    address: 'University Ave, Building C',
    description: 'Quiet study room with presentation setup',
    color: 'secondary'
  }
]

export const getVenueById = (id: string): VenueLocation | undefined => {
  return venueLocations.find(venue => venue.id === id)
}

export const getDefaultVenue = (): VenueLocation => {
  return venueLocations[0]
}