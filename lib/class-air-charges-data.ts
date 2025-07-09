// Data derived from the user's "Class Air Charges.csv" file.
// This represents the number of air changes per hour for a given standard and classification.
export const classAirChargesData: Record<string, Record<string, string | number>> = {
  "Grade D (ISO 7 at Rest & ISO 8 in Oper.)": {
    EUGMP: "20-25",
    WHO: "20",
    TGA: "20",
  },
  "Grade C (ISO 7 at Rest & ISO 7 in Oper.)": {
    EUGMP: "40-50",
    WHO: "40",
    TGA: "40",
  },
  "Grade B (ISO 5 at Rest & ISO 7 in Oper.)": {
    EUGMP: "60-80",
    WHO: "60",
    TGA: "60",
  },
  "Grade A (ISO 5 at Rest & ISO 5 in Oper.)": {
    EUGMP: "ULPA",
    WHO: "ULPA",
    TGA: "ULPA",
  },
  "3500 K": {
    TGA: "20",
  },
  "350 J": {
    TGA: "40",
  },
  "35 G or H": {
    TGA: "60",
  },
  "3.5 E or F": {
    TGA: "ULPA",
  },
  // Add other mappings as needed from the CSV
}
