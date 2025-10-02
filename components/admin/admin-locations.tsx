"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, MapPin, RefreshCw, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Location {
  id: string
  name: string
  created_at: string
}

export function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, locationId?: string}>({isOpen: false})
  const [locationName, setLocationName] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching locations:', error)
        toast({
          title: "Error",
          description: "Failed to fetch locations",
          variant: "destructive"
        })
        return
      }

      setLocations(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setLocationName("")
    setIsCreating(false)
  }

  const handleSubmit = async () => {
    if (!locationName.trim()) {
      toast({
        title: "Validation Error",
        description: "Location name is required",
        variant: "destructive"
      })
      return
    }

    try {
      // Create new location only
      const { error } = await supabase
        .from('locations')
        .insert({
          name: locationName.trim()
        })

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Error",
            description: "A location with this name already exists",
            variant: "destructive"
          })
          return
        }
        console.error('Error creating location:', error)
        toast({
          title: "Error",
          description: "Failed to create location",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Success",
        description: "Location created successfully"
      })

      resetForm()
      fetchLocations()
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }


  const handleDelete = async (locationId: string) => {
    try {
      // Check if location is being used in any slots
      const { data: slotsUsingLocation, error: checkError } = await supabase
        .from('time_slots')
        .select('id')
        .eq('location_id', locationId)
        .limit(1)

      if (checkError) {
        console.error('Error checking location usage:', checkError)
        toast({
          title: "Error",
          description: "Failed to check if location is in use",
          variant: "destructive"
        })
        return
      }

      if (slotsUsingLocation && slotsUsingLocation.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "This location is being used by existing time slots. Please remove those slots first.",
          variant: "destructive"
        })
        return
      }

      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId)

      if (error) {
        console.error('Error deleting location:', error)
        toast({
          title: "Error",
          description: "Failed to delete location",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Success",
        description: "Location deleted successfully"
      })

      fetchLocations()
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-slate-600">Loading locations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Location Management</h2>
        <Button onClick={() => setIsCreating(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="card-calm">
          <CardHeader>
            <CardTitle>Add New Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Location Name *</Label>
              <Input
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Enter location name (e.g., Downtown Office)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit()
                  }
                }}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSubmit} className="btn-primary">
                <Save className="w-4 h-4 mr-2" />
                Create Location
              </Button>
              <Button onClick={resetForm} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locations List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location) => (
          <Card key={location.id} className="card-calm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium">{location.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setDeleteConfirm({isOpen: true, locationId: location.id})}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Created: {new Date(location.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {locations.length === 0 && (
        <Card className="card-calm">
          <CardContent className="p-8 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No locations created yet</p>
            <p className="text-sm text-muted-foreground mt-2">Add your first meeting location to get started</p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.isOpen} onOpenChange={(open) => setDeleteConfirm({isOpen: open})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this location? This action cannot be undone.
              Make sure no time slots are using this location.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteConfirm.locationId) {
                  handleDelete(deleteConfirm.locationId)
                  setDeleteConfirm({isOpen: false})
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}