"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import type { FC } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Calculator, Plus, Trash2 } from "lucide-react"
import type { FormData } from "@/app/page"
import { HVACCalculator, type RoomData, type CalculationResults } from "@/lib/hvac-calculations"
import { sampleRoomData } from "@/lib/sample-hvac-data"
import { useToast } from "@/components/ui/use-toast"

interface Props {
  formData: FormData
  updateFormData: (field: keyof FormData, value: any) => void
  onBack: () => void
}

const FormSection: FC<{ title: string; children: React.ReactNode; stepNumber?: number }> = ({
  title,
  children,
  stepNumber,
}) => (
  <div className="border-b border-gray-200/80 p-6 sm:p-8">
    <h3 className="mb-6 text-lg font-semibold text-gray-800">
      {stepNumber && (
        <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          {stepNumber}
        </span>
      )}
      {title}
    </h3>
    <div className={stepNumber ? "pl-10" : ""}>{children}</div>
  </div>
)

export const FormStepThree: FC<Props> = ({ formData, updateFormData, onBack }) => {
  const { toast } = useToast()
  const [rooms, setRooms] = useState<Partial<RoomData>[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Set loaded state after component mounts to avoid hydration issues
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const [calculationResults, setCalculationResults] = useState<CalculationResults | null>(null)

  const handleAddRoom = () => {
    const newRoom = {
      roomName: `Room ${rooms.length + 1}`,
      length: 0,
      width: 0,
      height: 9,
      standard: "ISO 8",
      classification: "Gene/Entry",
      noOfAirChanges: 40,
      occupancy: 0,
      equipmentLoadKW: 0,
      lightingLoadWSqft: 1.75,
      freshAirPercentage: 10,
      exhaustAirCFM: 0,
      inTempC: 24,
      requiredRH: 40,
      outsideRH: 85,
      outTempF: 122,
      insideTempF: 75.2,
      outTempC: 50,
      deltaTempF: 46.8,
      grainsBeforeCoil: 502.5390781,
      grainsAfterCoil: 51.89502281,
      deltaGrains: 450.6440553,
      finalFiltration: "100K",
      staticPressure: 24,
    }
    
    setRooms([...rooms, newRoom])
    toast({
      title: "Room Added",
      description: `Added ${newRoom.roomName} to the configuration.`,
    })
  }

  const handleRemoveRoom = (index: number) => {
    const roomToRemove = rooms[index]
    setRooms(rooms.filter((_, i) => i !== index))
    toast({
      title: "Room Removed",
      description: `Removed ${roomToRemove.roomName} from the configuration.`,
    })
  }

  const handleRoomChange = (index: number, field: keyof RoomData, value: any) => {
    const updatedRooms = [...rooms]
    ;(updatedRooms[index] as any)[field] = value
    setRooms(updatedRooms)
  }

  const handleCalculate = () => {
    if (rooms.length === 0) {
      toast({
        variant: "destructive",
        title: "No Rooms Configured",
        description: "Please add at least one room before calculating.",
      })
      return
    }
    
    const calculator = new HVACCalculator(rooms)
    const results = calculator.calculateAll()
    setCalculationResults(results)
    
    toast({
      title: "Calculations Complete",
      description: `Successfully calculated HVAC data for ${rooms.length} room(s).`,
    })
  }

  const handleExportCSV = () => {
    if (!calculationResults) {
      toast({
        variant: "destructive",
        title: "No Data to Export",
        description: "Please calculate HVAC data before exporting.",
      })
      return
    }

    const calculator = new HVACCalculator(rooms)
    const csvContent = calculator.exportToCSV()
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hvac-calculations.csv'
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast({
      title: "Export Successful",
      description: "HVAC calculations exported to CSV file.",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate that at least one room is configured
    if (rooms.length === 0) {
      toast({
        variant: "destructive",
        title: "No Rooms Configured",
        description: "Please add at least one room for HVAC calculations.",
      })
      return
    }
    
    // Validate that all rooms have required fields
    const requiredRoomFields = ['roomName', 'length', 'width', 'height', 'standard']
    const invalidRooms = rooms.filter(room => {
      return requiredRoomFields.some(field => !room[field as keyof RoomData])
    })
    
    if (invalidRooms.length > 0) {
      toast({
        variant: "destructive",
        title: "Incomplete Room Data",
        description: "Please fill in all required fields for all rooms.",
      })
      return
    }
    
    console.log("HVAC Form Submitted:", { rooms, calculationResults })
    toast({
      title: "Form Submitted Successfully",
      description: "HVAC calculations completed! Check the console for the data.",
    })
  }

  // Don't render until data is loaded to avoid hydration mismatch
  if (!isLoaded) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormSection title="Room Configuration" stepNumber={7}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium">Room Details</h4>
            <div className="flex gap-2">
              <Button type="button" onClick={handleCalculate} variant="outline" size="sm">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate
              </Button>
              <Button type="button" onClick={handleAddRoom} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Room
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {rooms.map((room, index) => (
              <Card key={index} className="p-4">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Room {index + 1}</CardTitle>
                    <Button
                      type="button"
                      onClick={() => handleRemoveRoom(index)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <Label>Room Name</Label>
                      <Input
                        value={room.roomName || ""}
                        onChange={(e) => handleRoomChange(index, "roomName", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Length (m)</Label>
                      <Input
                        type="number"
                        value={room.length || ""}
                        onChange={(e) => handleRoomChange(index, "length", parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Width (m)</Label>
                      <Input
                        type="number"
                        value={room.width || ""}
                        onChange={(e) => handleRoomChange(index, "width", parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Height (ft)</Label>
                      <Input
                        type="number"
                        value={room.height || ""}
                        onChange={(e) => handleRoomChange(index, "height", parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Standard</Label>
                      <Select
                        value={room.standard || ""}
                        onValueChange={(value) => handleRoomChange(index, "standard", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ISO 8">ISO 8</SelectItem>
                          <SelectItem value="ISO 7">ISO 7</SelectItem>
                          <SelectItem value="ISO 6">ISO 6</SelectItem>
                          <SelectItem value="ISO 5">ISO 5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Air Changes/Hour</Label>
                      <Input
                        type="number"
                        value={room.noOfAirChanges || ""}
                        onChange={(e) => handleRoomChange(index, "noOfAirChanges", parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Occupancy</Label>
                      <Input
                        type="number"
                        value={room.occupancy || ""}
                        onChange={(e) => handleRoomChange(index, "occupancy", parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Equipment Load (kW)</Label>
                      <Input
                        type="number"
                        value={room.equipmentLoadKW || ""}
                        onChange={(e) => handleRoomChange(index, "equipmentLoadKW", parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Lighting Load (W/sqft)</Label>
                      <Input
                        type="number"
                        value={room.lightingLoadWSqft || ""}
                        onChange={(e) => handleRoomChange(index, "lightingLoadWSqft", parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Fresh Air (%)</Label>
                      <Input
                        type="number"
                        value={room.freshAirPercentage || ""}
                        onChange={(e) => handleRoomChange(index, "freshAirPercentage", parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Exhaust Air (CFM)</Label>
                      <Input
                        type="number"
                        value={room.exhaustAirCFM || ""}
                        onChange={(e) => handleRoomChange(index, "exhaustAirCFM", parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Inside Temp (°C)</Label>
                      <Input
                        type="number"
                        value={room.inTempC || ""}
                        onChange={(e) => handleRoomChange(index, "inTempC", parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Required RH (%)</Label>
                      <Input
                        type="number"
                        value={room.requiredRH || ""}
                        onChange={(e) => handleRoomChange(index, "requiredRH", parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Outside Temp (°F)</Label>
                      <Input
                        type="number"
                        value={room.outTempF || ""}
                        onChange={(e) => handleRoomChange(index, "outTempF", parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </FormSection>

      {calculationResults && (
        <FormSection title="Calculation Results" stepNumber={8}>
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {calculationResults.totalArea.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Total Area (m²)</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {calculationResults.totalCFM.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">Total CFM</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {calculationResults.totalACLoad.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Total AC Load (TR)</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {calculationResults.totalPowerConsumption.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Power (kW)</div>
                </CardContent>
              </Card>
            </div>

            {/* Results Table */}
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Area (m²)</TableHead>
                    <TableHead>CFM</TableHead>
                    <TableHead>AC Load (TR)</TableHead>
                    <TableHead>Chilled Water (GPM)</TableHead>
                    <TableHead>Power (kW)</TableHead>
                    <TableHead>Standard</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculationResults.roomBreakdown.map((room, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{room.roomName}</TableCell>
                      <TableCell>{room.area.toFixed(1)}</TableCell>
                      <TableCell>{room.ahuCFM.toFixed(0)}</TableCell>
                      <TableCell>{room.roomACLoadTR.toFixed(1)}</TableCell>
                      <TableCell>{room.chilledWaterGalMin.toFixed(1)}</TableCell>
                      <TableCell>{room.powerConsumptionKWHr.toFixed(1)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{room.standard}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" onClick={handleExportCSV} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </FormSection>
      )}

      <div className="flex justify-between bg-gray-50 px-6 py-4">
        <Button onClick={onBack} variant="outline" size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous Step
        </Button>
        <Button type="submit" size="lg" className="rounded-full">
          Submit Calculations
        </Button>
      </div>
    </form>
  )
} 