"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Location {
  id: string
  name: string
  type: 'SHOPPING_CENTRE' | 'RETAIL_PARK'
  address: string
  city: string
  county: string
  postcode: string
  latitude: number
  longitude: number
  phone?: string
  website?: string
  numberOfStores?: number
  parkingSpaces?: number
  totalFloorArea?: number
  numberOfFloors?: number
  anchorTenants?: number
  openedYear?: number
  tenants: any[]
}

interface ShoppingCentreSearchProps {
  onCentreSelect: (centre: Location) => void
  selectedCentre?: Location | null
  locations: Location[]
}

export function ShoppingCentreSearch({ onCentreSelect, selectedCentre, locations }: ShoppingCentreSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCentre ? (
            <div className="flex flex-col items-start">
              <span className="font-medium">{selectedCentre.name}</span>
              <span className="text-xs text-muted-foreground">{selectedCentre.city}, {selectedCentre.county}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Search for a shopping centre...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search shopping centres..." />
          <CommandList>
            <CommandEmpty>No shopping centre found.</CommandEmpty>
            <CommandGroup>
              {locations.map((centre) => (
                <CommandItem
                  key={centre.id}
                  value={`${centre.name} ${centre.city} ${centre.county} ${centre.type}`}
                  onSelect={() => {
                    onCentreSelect(centre)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCentre?.id === centre.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{centre.name}</span>
                    <span className="text-xs text-muted-foreground">{centre.city}, {centre.county}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
