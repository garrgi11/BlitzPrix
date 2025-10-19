import { NextResponse } from 'next/server';

// Mock F1 race data (simulating FastF1 data structure)
// Based on 2023 United States Grand Prix at COTA
export async function GET() {
  const raceData = {
    event: {
      name: '2023 United States Grand Prix',
      location: 'Circuit of the Americas',
      date: '2023-10-22',
      round: 19,
      laps: 56,
    },
    results: [
      { position: 1, driver: 'Max Verstappen', team: 'Red Bull Racing', time: '1:34:34.748', points: 25, grid: 6, status: 'Finished' },
      { position: 2, driver: 'Lewis Hamilton', team: 'Mercedes', time: '+2.225s', points: 18, grid: 3, status: 'Finished' },
      { position: 3, driver: 'Lando Norris', team: 'McLaren', time: '+38.392s', points: 15, grid: 17, status: 'Finished' },
      { position: 4, driver: 'Charles Leclerc', team: 'Ferrari', time: '+42.483s', points: 12, grid: 4, status: 'Finished' },
      { position: 5, driver: 'Carlos Sainz', team: 'Ferrari', time: '+49.874s', points: 10, grid: 1, status: 'Finished' },
    ],
    fastestLap: {
      driver: 'Lewis Hamilton',
      time: '1:37.452',
      lap: 45,
      speed: '221.456 km/h',
    },
    simulation: {
      cars: [
        { id: 'CAR_01', model: 'Ferrari SF16-H', color: 'Black', avgSpeed: '198.3 km/h', topSpeed: '327.2 km/h', laps: 56 },
        { id: 'CAR_02', model: 'Ferrari SF16-H', color: 'Red', avgSpeed: '195.7 km/h', topSpeed: '323.8 km/h', laps: 56 },
        { id: 'CAR_03', model: 'Ferrari SF16-H', color: 'Blue', avgSpeed: '197.1 km/h', topSpeed: '325.4 km/h', laps: 56 },
      ],
      track: {
        name: 'Circuit of the Americas',
        length: '5.513 km',
        turns: 20,
        bestSector1: '19.234s',
        bestSector2: '32.891s',
        bestSector3: '25.327s',
      },
      telemetry: [
        { lap: 1, sector1: '19.567s', sector2: '33.221s', sector3: '25.889s', total: '1:18.677' },
        { lap: 10, sector1: '19.334s', sector2: '32.991s', sector3: '25.443s', total: '1:17.768' },
        { lap: 20, sector1: '19.289s', sector2: '33.102s', sector3: '25.512s', total: '1:17.903' },
        { lap: 30, sector1: '19.412s', sector2: '33.234s', sector3: '25.667s', total: '1:18.313' },
        { lap: 40, sector1: '19.234s', sector2: '32.891s', sector3: '25.327s', total: '1:17.452' },
        { lap: 50, sector1: '19.456s', sector2: '33.178s', sector3: '25.734s', total: '1:18.368' },
        { lap: 56, sector1: '19.501s', sector2: '33.289s', sector3: '25.812s', total: '1:18.602' },
      ],
      weather: {
        airTemp: '28°C',
        trackTemp: '42°C',
        humidity: '45%',
        windSpeed: '12 km/h',
        conditions: 'Clear',
      },
      overtakes: [
        { lap: 8, overtaker: 'CAR_01 (Black)', overtaken: 'CAR_02 (Red)', location: 'Turn 12 (Hairpin)', type: 'Sideways overtake' },
        { lap: 23, overtaker: 'CAR_03 (Blue)', overtaken: 'CAR_02 (Red)', location: 'Turn 1', type: 'Late braking' },
        { lap: 41, overtaker: 'CAR_01 (Black)', overtaken: 'CAR_03 (Blue)', location: 'DRS Zone', type: 'Straight-line speed' },
      ],
      performance: {
        brakingPoints: 'Optimal',
        corneringSpeed: '87.3% efficiency',
        accelerationZones: '94.1% utilization',
        fuelManagement: 'Conservative strategy',
        tireWear: 'Medium degradation',
      },
    },
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return NextResponse.json(raceData);
}

