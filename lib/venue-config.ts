export interface VenueLocation {
  id: string
  name: string
  created_at?: string
}

export const venueLocations: VenueLocation[] = [
  {
    id: 'downtown',
    name: 'Downtown Office'
  },
  {
    id: 'campus',
    name: 'University Campus'
  }
]

export const getVenueById = (id: string): VenueLocation | undefined => {
  return venueLocations.find(venue => venue.id === id)
}

export const getDefaultVenue = (): VenueLocation => {
  return venueLocations[0]
}

// Database-based location functions
export const fetchLocations = async (): Promise<VenueLocation[]> => {
  try {
    const { supabase } = await import('@/lib/supabase')
    
    const { data: locations, error } = await supabase
      .from('locations')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching locations:', error)
      return venueLocations // Fallback to static locations
    }

    return locations?.map((location: any) => ({
      id: location.id,
      name: location.name,
      created_at: location.created_at
    })) || venueLocations
  } catch (error) {
    console.error('Error:', error)
    return venueLocations // Fallback to static locations
  }
}

export const getLocationById = async (id: string): Promise<VenueLocation | null> => {
  try {
    const { supabase } = await import('@/lib/supabase')
    
    const { data: location, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !location) {
      return null
    }

    return {
      id: (location as any).id,
      name: (location as any).name,
      created_at: (location as any).created_at
    }
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}