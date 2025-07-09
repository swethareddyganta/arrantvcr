// HVAC Calculation Engine based on the provided CSV data
// This handles all the complex calculations for cleanroom HVAC systems

export interface RoomData {
  sNo: number
  ahuNo: string
  roomName: string
  length: number // in meters
  width: number // in meters
  height: number // in feet
  area: number // in sq meters
  volume: number // in cubic feet
  standard: string
  classification: string
  noOfAirChanges: number
  roomCFM: number
  occupancy: number
  equipmentLoadKW: number
  lightingLoadWSqft: number
  freshAirPercentage: number
  freshAirCFM: number
  exhaustAirCFM: number
  dehumidificationCFM: number
  resultantCFM: number
  roomACLoadTR: number
  cfmACLoadTR: number
  resACLoadTR: number
  chilledWaterGalMin: number
  chilledWaterLS: number
  actualPipeInch: number
  designPipeInch: number
  hotWaterGalMin: number
  hotWaterLS: number
  actualPipeInchHot: number
  designPipeInchHot: number
  classKNc: string
  inTempC: number
  requiredRH: number
  outsideRH: number
  outTempF: number
  insideTempF: number
  outTempC: number
  deltaTempF: number
  grainsBeforeCoil: number
  grainsAfterCoil: number
  deltaGrains: number
  walls: number
  partition: number
  floor: number
  roof: number
  lightingLoad: number
  equipmentLoad: number
  peopleRSH: number
  freshAirRSH: number
  ersh: number
  peopleRLH: number
  freshAirRLH: number
  erlh: number
  erth: number
  acLoad: number
  dehumidificationCFMFinal: number
  finalFiltration: string
  nc20Micron: number
  plenumHEPA: string
  terminalHEPA100K: string
  terminalHEPA1K: string
  ahuCFM: number
  staticPressure: number
  blowerModel: string
  motorRatingHP: number
  ahuSize: string
  coolingCoilSize: string
  exhaustAHUCFM: number
  exhaustStaticPressure: number
  exhaustBlowerModel: string
  exhaustMotorHP: number
  powerConsumptionKWHr: number
}

export interface CalculationResults {
  totalArea: number
  totalVolume: number
  totalCFM: number
  totalACLoad: number
  totalChilledWater: number
  totalPowerConsumption: number
  roomBreakdown: RoomData[]
}

// Constants for calculations
export const HVAC_CONSTANTS = {
  // Temperature conversions
  CELSIUS_TO_FAHRENHEIT: (celsius: number) => (celsius * 9/5) + 32,
  FAHRENHEIT_TO_CELSIUS: (fahrenheit: number) => (fahrenheit - 32) * 5/9,
  
  // Air density at standard conditions (lb/ft³)
  AIR_DENSITY: 0.075,
  
  // Specific heat of air (Btu/lb·°F)
  AIR_SPECIFIC_HEAT: 0.24,
  
  // Latent heat of vaporization (Btu/lb)
  LATENT_HEAT_VAPORIZATION: 1060,
  
  // Standard air conditions
  STANDARD_TEMP_F: 70,
  STANDARD_PRESSURE: 14.696, // psia
  
  // Conversion factors
  BTU_TO_TR: 12000, // 1 TR = 12,000 BTU/hr
  CFM_TO_LS: 0.471947, // 1 CFM = 0.471947 L/s
  GAL_MIN_TO_LS: 0.0630902, // 1 gal/min = 0.0630902 L/s
}

export class HVACCalculator {
  private rooms: RoomData[] = []

  constructor(roomsData: Partial<RoomData>[]) {
    this.rooms = roomsData.map((room, index) => ({
      sNo: index + 1,
      ahuNo: room.ahuNo || `ACAHU-${String(index + 1).padStart(3, '0')}`,
      roomName: room.roomName || `Room ${index + 1}`,
      length: room.length || 0,
      width: room.width || 0,
      height: room.height || 9,
      area: room.area || 0,
      volume: room.volume || 0,
      standard: room.standard || 'ISO 8',
      classification: room.classification || 'Gene/Entry',
      noOfAirChanges: room.noOfAirChanges || 40,
      roomCFM: room.roomCFM || 0,
      occupancy: room.occupancy || 0,
      equipmentLoadKW: room.equipmentLoadKW || 0,
      lightingLoadWSqft: room.lightingLoadWSqft || 1.75,
      freshAirPercentage: room.freshAirPercentage || 10,
      freshAirCFM: room.freshAirCFM || 0,
      exhaustAirCFM: room.exhaustAirCFM || 0,
      dehumidificationCFM: room.dehumidificationCFM || 0,
      resultantCFM: room.resultantCFM || 0,
      roomACLoadTR: room.roomACLoadTR || 0,
      cfmACLoadTR: room.cfmACLoadTR || 0,
      resACLoadTR: room.resACLoadTR || 0,
      chilledWaterGalMin: room.chilledWaterGalMin || 0,
      chilledWaterLS: room.chilledWaterLS || 0,
      actualPipeInch: room.actualPipeInch || 0,
      designPipeInch: room.designPipeInch || 0,
      hotWaterGalMin: room.hotWaterGalMin || 0,
      hotWaterLS: room.hotWaterLS || 0,
      actualPipeInchHot: room.actualPipeInchHot || 0,
      designPipeInchHot: room.designPipeInchHot || 0,
      classKNc: room.classKNc || 'Gene/Entry',
      inTempC: room.inTempC || 24,
      requiredRH: room.requiredRH || 40,
      outsideRH: room.outsideRH || 85,
      outTempF: room.outTempF || 122,
      insideTempF: room.insideTempF || 75.2,
      outTempC: room.outTempC || 50,
      deltaTempF: room.deltaTempF || 46.8,
      grainsBeforeCoil: room.grainsBeforeCoil || 502.5390781,
      grainsAfterCoil: room.grainsAfterCoil || 51.89502281,
      deltaGrains: room.deltaGrains || 450.6440553,
      walls: room.walls || 0,
      partition: room.partition || 0,
      floor: room.floor || 0,
      roof: room.roof || 0,
      lightingLoad: room.lightingLoad || 0,
      equipmentLoad: room.equipmentLoad || 0,
      peopleRSH: room.peopleRSH || 0,
      freshAirRSH: room.freshAirRSH || 0,
      ersh: room.ersh || 0,
      peopleRLH: room.peopleRLH || 0,
      freshAirRLH: room.freshAirRLH || 0,
      erlh: room.erlh || 0,
      erth: room.erth || 0,
      acLoad: room.acLoad || 0,
      dehumidificationCFMFinal: room.dehumidificationCFMFinal || 0,
      finalFiltration: room.finalFiltration || '100K',
      nc20Micron: room.nc20Micron || 0,
      plenumHEPA: room.plenumHEPA || 'Gene/Entry',
      terminalHEPA100K: room.terminalHEPA100K || 'Gene/Entry',
      terminalHEPA1K: room.terminalHEPA1K || 'Gene/Entry',
      ahuCFM: room.ahuCFM || 0,
      staticPressure: room.staticPressure || 0,
      blowerModel: room.blowerModel || '',
      motorRatingHP: room.motorRatingHP || 0,
      ahuSize: room.ahuSize || '',
      coolingCoilSize: room.coolingCoilSize || '',
      exhaustAHUCFM: room.exhaustAHUCFM || 0,
      exhaustStaticPressure: room.exhaustStaticPressure || 0,
      exhaustBlowerModel: room.exhaustBlowerModel || '',
      exhaustMotorHP: room.exhaustMotorHP || 0,
      powerConsumptionKWHr: room.powerConsumptionKWHr || 0,
    }))
  }

  // Calculate room area from length and width
  calculateArea(length: number, width: number): number {
    return length * width
  }

  // Calculate room volume from area and height
  calculateVolume(area: number, height: number): number {
    // Convert height from feet to meters, then calculate volume in cubic feet
    const heightMeters = height * 0.3048
    const volumeCubicMeters = area * heightMeters
    return volumeCubicMeters * 35.3147 // Convert to cubic feet
  }

  // Calculate required CFM based on air changes per hour
  calculateRequiredCFM(volume: number, airChangesPerHour: number): number {
    return (volume * airChangesPerHour) / 60
  }

  // Calculate fresh air CFM based on percentage
  calculateFreshAirCFM(totalCFM: number, freshAirPercentage: number): number {
    return (totalCFM * freshAirPercentage) / 100
  }

  // Calculate sensible heat load (RSH)
  calculateSensibleHeatLoad(
    area: number,
    lightingLoad: number,
    equipmentLoad: number,
    occupancy: number,
    freshAirCFM: number,
    deltaTemp: number
  ): number {
    const lightingHeat = area * lightingLoad * 3.412 // Convert W to BTU/hr
    const equipmentHeat = equipmentLoad * 3412 // Convert kW to BTU/hr
    const peopleHeat = occupancy * 250 // 250 BTU/hr per person
    const freshAirHeat = freshAirCFM * HVAC_CONSTANTS.AIR_DENSITY * HVAC_CONSTANTS.AIR_SPECIFIC_HEAT * deltaTemp

    return lightingHeat + equipmentHeat + peopleHeat + freshAirHeat
  }

  // Calculate latent heat load (RLH)
  calculateLatentHeatLoad(
    occupancy: number,
    freshAirCFM: number,
    deltaGrains: number
  ): number {
    const peopleLatent = occupancy * 200 // 200 BTU/hr per person
    const freshAirLatent = freshAirCFM * HVAC_CONSTANTS.AIR_DENSITY * deltaGrains * 0.68

    return peopleLatent + freshAirLatent
  }

  // Calculate total heat load (RTH)
  calculateTotalHeatLoad(sensibleHeat: number, latentHeat: number): number {
    return sensibleHeat + latentHeat
  }

  // Convert BTU/hr to TR (Tons of Refrigeration)
  convertBTUtoTR(btuPerHour: number): number {
    return btuPerHour / HVAC_CONSTANTS.BTU_TO_TR
  }

  // Calculate chilled water flow rate
  calculateChilledWaterFlow(acLoadTR: number, deltaTemp: number): number {
    // Assuming 1 GPM per TR for 10°F delta T
    const baseGPM = acLoadTR
    const tempCorrection = 10 / deltaTemp
    return baseGPM * tempCorrection
  }

  // Calculate pipe size based on flow rate
  calculatePipeSize(flowRateGPM: number): number {
    // Simplified pipe sizing - in practice, this would use detailed charts
    if (flowRateGPM <= 10) return 0.75
    if (flowRateGPM <= 25) return 1
    if (flowRateGPM <= 50) return 1.5
    if (flowRateGPM <= 100) return 2
    if (flowRateGPM <= 200) return 2.5
    return 3
  }

  // Calculate power consumption
  calculatePowerConsumption(ahuCFM: number, staticPressure: number): number {
    // Simplified power calculation
    // Power (HP) = (CFM × Static Pressure) / (6356 × Fan Efficiency)
    const fanEfficiency = 0.7 // 70% efficiency
    const powerHP = (ahuCFM * staticPressure) / (6356 * fanEfficiency)
    return powerHP * 0.746 // Convert HP to kW
  }

  // Perform all calculations for a room
  calculateRoom(room: RoomData): RoomData {
    // Calculate area and volume if not provided
    if (!room.area && room.length && room.width) {
      room.area = this.calculateArea(room.length, room.width)
    }
    if (!room.volume && room.area && room.height) {
      room.volume = this.calculateVolume(room.area, room.height)
    }

    // Calculate required CFM
    if (!room.roomCFM) {
      room.roomCFM = this.calculateRequiredCFM(room.volume, room.noOfAirChanges)
    }

    // Calculate fresh air CFM
    room.freshAirCFM = this.calculateFreshAirCFM(room.roomCFM, room.freshAirPercentage)

    // Calculate sensible heat load
    const sensibleHeat = this.calculateSensibleHeatLoad(
      room.area,
      room.lightingLoadWSqft,
      room.equipmentLoadKW,
      room.occupancy,
      room.freshAirCFM,
      room.deltaTempF
    )

    // Calculate latent heat load
    const latentHeat = this.calculateLatentHeatLoad(
      room.occupancy,
      room.freshAirCFM,
      room.deltaGrains
    )

    // Calculate total heat load
    const totalHeat = this.calculateTotalHeatLoad(sensibleHeat, latentHeat)

    // Convert to TR
    room.roomACLoadTR = this.convertBTUtoTR(totalHeat)

    // Calculate chilled water flow
    room.chilledWaterGalMin = this.calculateChilledWaterFlow(room.roomACLoadTR, room.deltaTempF)
    room.chilledWaterLS = room.chilledWaterGalMin * HVAC_CONSTANTS.GAL_MIN_TO_LS

    // Calculate pipe size
    room.designPipeInch = this.calculatePipeSize(room.chilledWaterGalMin)

    // Calculate AHU CFM (resultant CFM)
    room.resultantCFM = room.roomCFM + room.freshAirCFM - room.exhaustAirCFM
    room.ahuCFM = room.resultantCFM

    // Calculate power consumption
    room.powerConsumptionKWHr = this.calculatePowerConsumption(room.ahuCFM, room.staticPressure)

    return room
  }

  // Calculate all rooms and return summary
  calculateAll(): CalculationResults {
    const calculatedRooms = this.rooms.map(room => this.calculateRoom(room))

    const totals = calculatedRooms.reduce((acc, room) => ({
      totalArea: acc.totalArea + room.area,
      totalVolume: acc.totalVolume + room.volume,
      totalCFM: acc.totalCFM + room.ahuCFM,
      totalACLoad: acc.totalACLoad + room.roomACLoadTR,
      totalChilledWater: acc.totalChilledWater + room.chilledWaterGalMin,
      totalPowerConsumption: acc.totalPowerConsumption + room.powerConsumptionKWHr,
    }), {
      totalArea: 0,
      totalVolume: 0,
      totalCFM: 0,
      totalACLoad: 0,
      totalChilledWater: 0,
      totalPowerConsumption: 0,
    })

    return {
      ...totals,
      roomBreakdown: calculatedRooms,
    }
  }

  // Get room by name
  getRoomByName(roomName: string): RoomData | undefined {
    return this.rooms.find(room => room.roomName === roomName)
  }

  // Get rooms by AHU number
  getRoomsByAHU(ahuNo: string): RoomData[] {
    return this.rooms.filter(room => room.ahuNo === ahuNo)
  }

  // Export calculations to CSV format
  exportToCSV(): string {
    const headers = [
      'S. No.', 'AHU No', 'Room Name', 'Length in Mtrs', 'Width in Mtrs', 'Height in Ft',
      'Area in Sq. Mtrs', 'Volume in Cft', 'Standard & Classification', 'No. of Air Ch.',
      'Room CFM', 'Occupancy', 'Eqpt. Load in KW', 'Lighting Load in W/Sft',
      'Fresh Air Cfm in % of Total Air', 'Fresh Air Cfm Air', 'Exhaust Air Cfm',
      'Deh. CFM', 'Resultant CFM', 'Room AC Load in TR', 'CFm AC Load in TR',
      'Res. AC load in TR', 'Ch. Water In Gal/m', 'Ch. Water In L/s',
      'Act. Pipe in Inch', 'Des. Pipe in Inch', 'Class in K / NC 20/5',
      'In Temp in C (+/-2)', 'Required RH in % +/- 5', 'Outside RH in % +/- 5',
      'Out. Temp. in F', 'Inside Temp. in F', 'Out Temp in C (+/-2)',
      'Delta Temp in F', 'Grains / Pound of Dry Air before Coil',
      'Grains / Pound of Dry Air After Coil', 'Delta Grains / pound of Air',
      'ERSH', 'ERLH', 'ERTH or Grand Total Heat', 'AC Load', 'Deh. CFM',
      'Final Filtration', 'NC 20 / 5 Micron', 'AHU CFM', 'Static Pressure',
      'Blower Model', 'Motor rating in Hp', 'Power cons. in KW/hr'
    ]

    const csvRows = [headers.join(',')]

    this.rooms.forEach(room => {
      const row = [
        room.sNo,
        room.ahuNo,
        room.roomName,
        room.length,
        room.width,
        room.height,
        room.area,
        room.volume,
        room.standard,
        room.noOfAirChanges,
        room.roomCFM,
        room.occupancy,
        room.equipmentLoadKW,
        room.lightingLoadWSqft,
        room.freshAirPercentage,
        room.freshAirCFM,
        room.exhaustAirCFM,
        room.dehumidificationCFM,
        room.resultantCFM,
        room.roomACLoadTR,
        room.cfmACLoadTR,
        room.resACLoadTR,
        room.chilledWaterGalMin,
        room.chilledWaterLS,
        room.actualPipeInch,
        room.designPipeInch,
        room.classKNc,
        room.inTempC,
        room.requiredRH,
        room.outsideRH,
        room.outTempF,
        room.insideTempF,
        room.outTempC,
        room.deltaTempF,
        room.grainsBeforeCoil,
        room.grainsAfterCoil,
        room.deltaGrains,
        room.ersh,
        room.erlh,
        room.erth,
        room.acLoad,
        room.dehumidificationCFMFinal,
        room.finalFiltration,
        room.nc20Micron,
        room.ahuCFM,
        room.staticPressure,
        room.blowerModel,
        room.motorRatingHP,
        room.powerConsumptionKWHr
      ]
      csvRows.push(row.join(','))
    })

    return csvRows.join('\n')
  }
}

// Utility functions for common calculations
export const HVACUtils = {
  // Convert temperature
  celsiusToFahrenheit: HVAC_CONSTANTS.CELSIUS_TO_FAHRENHEIT,
  fahrenheitToCelsius: HVAC_CONSTANTS.FAHRENHEIT_TO_CELSIUS,

  // Calculate dew point
  calculateDewPoint(tempC: number, rhPercent: number): number {
    const a = 17.27
    const b = 237.7
    const alpha = ((a * tempC) / (b + tempC)) + Math.log(rhPercent / 100)
    return (b * alpha) / (a - alpha)
  },

  // Calculate grains of moisture
  calculateGrains(tempF: number, rhPercent: number): number {
    const saturationVaporPressure = 0.62198 * Math.exp((17.2694 * (tempF - 32)) / (tempF - 32 + 238.3))
    const actualVaporPressure = (rhPercent / 100) * saturationVaporPressure
    return 7000 * (actualVaporPressure / (14.696 - actualVaporPressure))
  },

  // Calculate air density at given conditions
  calculateAirDensity(tempF: number, pressurePSI: number = 14.696): number {
    const absoluteTemp = tempF + 459.67
    return 0.075 * (530 / absoluteTemp) * (pressurePSI / 14.696)
  }
} 