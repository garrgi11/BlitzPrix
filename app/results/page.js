'use client';

import { useState, useEffect, useRef } from 'react';

export default function ResultsPage() {
  const [raceData, setRaceData] = useState(null);
  const [displayedLines, setDisplayedLines] = useState([]);
  const [aiProgress, setAiProgress] = useState(0);
  const [allLines, setAllLines] = useState([]);
  const terminalContentRef = useRef(null);

  useEffect(() => {
    // Fetch race data
    fetch('/api/race-data')
      .then(res => res.json())
      .then(data => {
        setRaceData(data);
        generateTerminalOutput(data);
      })
      .catch(err => console.error('Error fetching race data:', err));
  }, []);

  const generateTerminalOutput = (data) => {
    const lines = [];
    
    // System initialization
    lines.push({ text: '[SYSTEM] Initializing BlitzPrix AI Racing Intelligence...', color: '#00ff00', delay: 8 });
    lines.push({ text: '[SYSTEM] Loading neural network models...', color: '#00ff00', delay: 8 });
    lines.push({ text: '[SYSTEM] Connecting to telemetry database...', color: '#00ff00', delay: 8 });
    lines.push({ text: '[SYSTEM] Establishing secure connection to FIA servers...', color: '#00ff00', delay: 8 });
    lines.push({ text: '[OK] All systems operational', color: '#00ff00', delay: 8 });
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Header
    lines.push({ text: '═══════════════════════════════════════════════════════════════════════', color: '#00ff00', delay: 6 });
    lines.push({ text: '    F1 RACE ANALYSIS SYSTEM v3.7.2', color: '#00ff00', delay: 6 });
    lines.push({ text: '    POWERED BY BLITZPRIX AI RACING INTELLIGENCE', color: '#00ffff', delay: 6 });
    lines.push({ text: '═══════════════════════════════════════════════════════════════════════', color: '#00ff00', delay: 6 });
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Event Info
    lines.push({ text: `[INFO] Processing race event: ${data.event.name}`, color: '#ffff00', delay: 8 });
    lines.push({ text: `[INFO] Location: ${data.event.location}`, color: '#ffff00', delay: 8 });
    lines.push({ text: `[INFO] Date: ${data.event.date} | Round ${data.event.round} | ${data.event.laps} Laps`, color: '#ffff00', delay: 8 });
    lines.push({ text: '[INFO] Loading race data packets...', color: '#00ff00', delay: 8 });
    lines.push({ text: '[PACKET] 0x4A2F - Race initialization data received', color: '#666666', delay: 6 });
    lines.push({ text: '[PACKET] 0x4B31 - Car telemetry stream active', color: '#666666', delay: 6 });
    lines.push({ text: '[PACKET] 0x4C89 - Track sensor data synchronized', color: '#666666', delay: 6 });
    lines.push({ text: '[PACKET] 0x4D12 - Weather monitoring enabled', color: '#666666', delay: 6 });
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Processing indicators
    lines.push({ text: '[PROCESS] Analyzing 1.2M data points...', color: '#00ffff', delay: 8 });
    lines.push({ text: '[PROCESS] Running machine learning inference...', color: '#00ffff', delay: 8 });
    lines.push({ text: '[PROCESS] Computing optimal racing lines...', color: '#00ffff', delay: 8 });
    lines.push({ text: '[PROCESS] Calculating aerodynamic coefficients...', color: '#00ffff', delay: 8 });
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Simulation Results
    lines.push({ text: '> SIMULATION RESULTS', color: '#00ffff', delay: 10 });
    lines.push({ text: '─────────────────────────────────────────────────────────────────────', color: '#00ff00', delay: 6 });
    
    data.simulation.cars.forEach((car, index) => {
      lines.push({ text: '', color: '#ffffff', delay: 5 });
      lines.push({ text: `✓ ${car.id} [${car.color.toUpperCase()}]`, color: '#00ff00', delay: 8 });
      lines.push({ text: `  ├─ Model: ${car.model}`, color: '#ffffff', delay: 6 });
      lines.push({ text: `  ├─ Avg Speed: ${car.avgSpeed}`, color: '#ffffff', delay: 6 });
      lines.push({ text: `  ├─ Top Speed: ${car.topSpeed}`, color: '#ffff00', delay: 6 });
      lines.push({ text: `  ├─ Laps Completed: ${car.laps}`, color: '#ffffff', delay: 6 });
      lines.push({ text: `  ├─ Total Distance: ${(56 * 5.513).toFixed(2)} km`, color: '#ffffff', delay: 6 });
      lines.push({ text: `  ├─ Fuel Consumed: ${(102 - (Math.random() * 5 + 2)).toFixed(2)} kg`, color: '#ffffff', delay: 6 });
      lines.push({ text: `  ├─ Brake Temperature: ${(650 + Math.random() * 200).toFixed(0)}°C`, color: '#ff9900', delay: 6 });
      lines.push({ text: `  ├─ Engine RPM Peak: ${(18500 + Math.random() * 500).toFixed(0)} RPM`, color: '#ffffff', delay: 6 });
      lines.push({ text: `  ├─ DRS Activations: ${Math.floor(45 + Math.random() * 10)}`, color: '#ffffff', delay: 6 });
      lines.push({ text: `  ├─ G-Force Peak: ${(4.5 + Math.random() * 1.5).toFixed(2)}g`, color: '#ff00ff', delay: 6 });
      lines.push({ text: `  └─ Tire Degradation: ${(Math.random() * 15 + 12).toFixed(1)}%`, color: '#ffff00', delay: 6 });
    });
    
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    lines.push({ text: '─────────────────────────────────────────────────────────────────────', color: '#00ff00', delay: 6 });
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Track Info
    lines.push({ text: '> TRACK ANALYSIS', color: '#00ffff', delay: 8 });
    lines.push({ text: `  Track: ${data.simulation.track.name}`, color: '#ffffff', delay: 6 });
    lines.push({ text: `  Length: ${data.simulation.track.length} | Turns: ${data.simulation.track.turns}`, color: '#ffffff', delay: 6 });
    lines.push({ text: `  Best Sector 1: ${data.simulation.track.bestSector1}`, color: '#ffff00', delay: 6 });
    lines.push({ text: `  Best Sector 2: ${data.simulation.track.bestSector2}`, color: '#ffff00', delay: 6 });
    lines.push({ text: `  Best Sector 3: ${data.simulation.track.bestSector3}`, color: '#ffff00', delay: 6 });
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Turn-by-turn analysis
    lines.push({ text: '> CORNER SPEED ANALYSIS', color: '#00ffff', delay: 8 });
    for (let turn = 1; turn <= 20; turn++) {
      const speed = (85 + Math.random() * 160).toFixed(1);
      const color = parseFloat(speed) > 200 ? '#00ff00' : parseFloat(speed) > 150 ? '#ffff00' : '#ff9900';
      lines.push({ text: `  Turn ${turn.toString().padStart(2)}: ${speed} km/h | Apex: ${(2.1 + Math.random() * 2).toFixed(2)}g | Entry: ${(180 + Math.random() * 120).toFixed(0)} km/h`, color: color, delay: 5 });
    }
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Weather
    lines.push({ text: '> WEATHER CONDITIONS', color: '#00ffff', delay: 8 });
    lines.push({ text: `  Air Temperature: ${data.simulation.weather.airTemp}`, color: '#ffffff', delay: 6 });
    lines.push({ text: `  Track Temperature: ${data.simulation.weather.trackTemp}`, color: '#ffffff', delay: 6 });
    lines.push({ text: `  Humidity: ${data.simulation.weather.humidity} | Wind: ${data.simulation.weather.windSpeed}`, color: '#ffffff', delay: 6 });
    lines.push({ text: `  Conditions: ${data.simulation.weather.conditions}`, color: '#00ff00', delay: 6 });
    lines.push({ text: `  Wind Direction: ${['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)]}`, color: '#ffffff', delay: 6 });
    lines.push({ text: `  Atmospheric Pressure: ${(1013 + Math.random() * 10 - 5).toFixed(1)} hPa`, color: '#ffffff', delay: 6 });
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Overtakes
    lines.push({ text: '> OVERTAKING MANEUVERS', color: '#00ffff', delay: 8 });
    data.simulation.overtakes.forEach((overtake, index) => {
      lines.push({ text: `  [LAP ${overtake.lap}] ${overtake.overtaker} → ${overtake.overtaken}`, color: '#ffff00', delay: 6 });
      lines.push({ text: `           Location: ${overtake.location} | Type: ${overtake.type}`, color: '#ffffff', delay: 6 });
      lines.push({ text: `           Speed Differential: ${(12 + Math.random() * 8).toFixed(1)} km/h | G-Force: ${(1.2 + Math.random() * 1.5).toFixed(2)}g`, color: '#666666', delay: 6 });
    });
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Full lap telemetry for all 56 laps with COMPREHENSIVE DATA
    lines.push({ text: '> COMPLETE LAP TELEMETRY DATA (56 LAPS)', color: '#00ffff', delay: 8 });
    lines.push({ text: '  LAP | SECTOR 1  | SECTOR 2  | SECTOR 3  | LAP TIME  | SPEED | RPM   | TIRE  | FUEL | TEMP', color: '#00ff00', delay: 6 });
    
    // Generate data for all 56 laps with detailed metrics
    for (let lap = 1; lap <= 56; lap++) {
      const lapNum = lap.toString().padEnd(3);
      const baseTime1 = 19.2 + Math.random() * 0.6;
      const baseTime2 = 32.8 + Math.random() * 0.8;
      const baseTime3 = 25.3 + Math.random() * 0.7;
      
      // Simulate tire degradation over stint
      const tireDeg = Math.min(lap * 0.4, 35);
      const degradationFactor = 1 + (tireDeg / 200);
      
      const s1 = (baseTime1 * degradationFactor).toFixed(3) + 's';
      const s2 = (baseTime2 * degradationFactor).toFixed(3) + 's';
      const s3 = (baseTime3 * degradationFactor).toFixed(3) + 's';
      const total = ((baseTime1 + baseTime2 + baseTime3) * degradationFactor).toFixed(3);
      const speed = (195 + Math.random() * 10).toFixed(1);
      const rpm = (18200 + Math.random() * 600).toFixed(0);
      const tire = tireDeg.toFixed(1) + '%';
      const fuel = (102 - lap * 1.8).toFixed(1) + 'kg';
      const temp = (92 + Math.random() * 10).toFixed(0) + '°C';
      
      const lineColor = lap % 10 === 0 ? '#ffff00' : lap === 1 ? '#00ff00' : '#ffffff';
      lines.push({ text: `  ${lapNum} | ${s1.padEnd(10)} | ${s2.padEnd(10)} | ${s3.padEnd(10)} | ${total.padEnd(9)} | ${speed.padEnd(5)} | ${rpm.padEnd(5)} | ${tire.padEnd(5)} | ${fuel.padEnd(6)} | ${temp}`, color: lineColor, delay: 5 });
      
      // Add detailed lap commentary every 5 laps
      if (lap % 5 === 0) {
        lines.push({ text: `       └─ [LAP ${lap}] Position hold | Gap: ${(2.5 + Math.random() * 5).toFixed(2)}s | DRS: ${Math.random() > 0.5 ? 'Active' : 'Inactive'}`, color: '#666666', delay: 5 });
      }
    }
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Detailed sector analysis for each lap
    lines.push({ text: '> DETAILED SECTOR ANALYSIS (ALL 56 LAPS)', color: '#00ffff', delay: 8 });
    for (let lap = 1; lap <= 56; lap++) {
      const s1Time = (19.2 + Math.random() * 0.6).toFixed(3);
      const s1Speed = (215 + Math.random() * 15).toFixed(1);
      const s2Time = (32.8 + Math.random() * 0.8).toFixed(3);
      const s2Speed = (198 + Math.random() * 12).toFixed(1);
      const s3Time = (25.3 + Math.random() * 0.7).toFixed(3);
      const s3Speed = (208 + Math.random() * 14).toFixed(1);
      
      lines.push({ text: `  LAP ${lap.toString().padStart(2)}: S1 ${s1Time}s (${s1Speed} km/h) | S2 ${s2Time}s (${s2Speed} km/h) | S3 ${s3Time}s (${s3Speed} km/h)`, color: '#ffffff', delay: 5 });
    }
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Speed trace for every lap (multiple samples per lap)
    lines.push({ text: '> SPEED TRACE DATA (56 LAPS × 20 MEASUREMENT POINTS)', color: '#00ffff', delay: 8 });
    for (let lap = 1; lap <= 56; lap++) {
      for (let point = 0; point < 20; point++) {
        const distance = (point / 20 * 5.513).toFixed(2);
        const speed = (85 + Math.random() * 245).toFixed(1);
        const throttle = (Math.random() * 100).toFixed(0);
        const brake = Math.random() > 0.7 ? (Math.random() * 100).toFixed(0) : '0';
        lines.push({ text: `  L${lap.toString().padStart(2)} P${point.toString().padStart(2)}: ${distance}km | ${speed} km/h | Throttle ${throttle}% | Brake ${brake}%`, color: '#ffffff', delay: 5 });
      }
    }
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Engine data - comprehensive
    lines.push({ text: '> ENGINE TELEMETRY (COMPREHENSIVE - ALL LAPS)', color: '#00ffff', delay: 8 });
    for (let lap = 1; lap <= 56; lap++) {
      lines.push({ text: `  [LAP ${lap}] RPM: ${(18000 + Math.random() * 800).toFixed(0)} | Temp: ${(95 + Math.random() * 15).toFixed(1)}°C | Fuel: ${(102 - lap * 1.8).toFixed(1)}kg | MGU-K: ${(120 + Math.random() * 40).toFixed(0)}kW | Oil: ${(110 + Math.random() * 20).toFixed(0)}°C`, color: '#ffffff', delay: 5 });
    }
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Tire temperature data for all laps
    lines.push({ text: '> TIRE TEMPERATURE ANALYSIS (ALL 56 LAPS - FL/FR/RL/RR)', color: '#00ffff', delay: 8 });
    for (let lap = 1; lap <= 56; lap++) {
      const fl = (85 + Math.random() * 25).toFixed(1);
      const fr = (85 + Math.random() * 25).toFixed(1);
      const rl = (80 + Math.random() * 30).toFixed(1);
      const rr = (80 + Math.random() * 30).toFixed(1);
      lines.push({ text: `  LAP ${lap.toString().padStart(2)}: FL ${fl}°C | FR ${fr}°C | RL ${rl}°C | RR ${rr}°C | Avg ${((parseFloat(fl) + parseFloat(fr) + parseFloat(rl) + parseFloat(rr)) / 4).toFixed(1)}°C`, color: '#ffffff', delay: 5 });
    }
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Brake analysis per lap
    lines.push({ text: '> BRAKE SYSTEM ANALYSIS (ALL 56 LAPS)', color: '#00ffff', delay: 8 });
    for (let lap = 1; lap <= 56; lap++) {
      for (let zone = 1; zone <= 10; zone++) {
        lines.push({ text: `  L${lap.toString().padStart(2)} Z${zone}: Pressure ${(80 + Math.random() * 120).toFixed(0)} bar | Temp ${(550 + Math.random() * 300).toFixed(0)}°C | Distance ${(95 + Math.random() * 25).toFixed(1)}m | Wear ${(Math.random() * 3).toFixed(2)}mm`, color: '#ff9900', delay: 5 });
      }
    }
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // GPS coordinates - reduced but more detailed
    lines.push({ text: '> GPS TRACKING DATA WITH VELOCITY VECTORS (COTA CIRCUIT)', color: '#00ffff', delay: 8 });
    for (let lap = 1; lap <= 56; lap++) {
      for (let pt = 0; pt < 15; pt++) {
        const lat = (30.1328 + Math.random() * 0.01).toFixed(6);
        const lon = (-97.6411 + Math.random() * 0.01).toFixed(6);
        const alt = (161 + Math.random() * 3).toFixed(1);
        const vx = (Math.random() * 120 - 60).toFixed(2);
        const vy = (Math.random() * 120 - 60).toFixed(2);
        const heading = (Math.random() * 360).toFixed(1);
        lines.push({ text: `  LAP${lap.toString().padStart(2)} PT${pt.toString().padStart(2)}: GPS(${lat}°N, ${lon}°W, ${alt}m) | Velocity(Vx:${vx}, Vy:${vy}) | Heading:${heading}° | Accel:${(Math.random() * 5).toFixed(2)}g`, color: '#ffffff', delay: 5 });
      }
    }
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Radio communications log
    lines.push({ text: '> TEAM RADIO COMMUNICATIONS LOG (REAL-TIME TRANSCRIPTION)', color: '#00ffff', delay: 8 });
    const radioMessages = [
      'Box this lap, box box', 'Copy, understood', 'Push push push', 'Save fuel, mode 6', 'DRS available next lap',
      'Gap to car ahead 1.2 seconds', 'Tire temps look good', 'Front left vibration detected', 'Keep pushing, good pace',
      'Box opposite of car ahead', 'VSC deployed, slow down', 'VSC ending this lap', 'Weather radar shows clear',
      'Track evolution improving', 'Brake bias forward 2 clicks', 'Engine mode push', 'Battery deploy overtake',
      'Keep him behind, good defense', 'Free air next lap', 'Yellow flags Turn 12', 'All clear, green flags'
    ];
    for (let lap = 1; lap <= 56; lap++) {
      const numMessages = Math.floor(1 + Math.random() * 3);
      for (let m = 0; m < numMessages; m++) {
        const msg = radioMessages[Math.floor(Math.random() * radioMessages.length)];
        const timestamp = `${Math.floor(lap * 1.5)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
        lines.push({ text: `  [${timestamp}] LAP ${lap.toString().padStart(2)}: "${msg}" | Response Time: ${(0.5 + Math.random() * 2).toFixed(1)}s | Signal Strength: ${(85 + Math.random() * 15).toFixed(0)}%`, color: '#00ff00', delay: 5 });
      }
    }
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Steering angle and inputs
    lines.push({ text: '> STEERING ANGLE & DRIVER INPUTS (HIGH-FREQUENCY SAMPLING 100Hz)', color: '#00ffff', delay: 8 });
    for (let lap = 1; lap <= 56; lap++) {
      for (let sample = 0; sample < 25; sample++) {
        const steerAngle = (Math.random() * 360 - 180).toFixed(1);
        const steerRate = (Math.random() * 200 - 100).toFixed(1);
        const throttle = (Math.random() * 100).toFixed(0);
        const brake = (Math.random() * 100).toFixed(0);
        const clutch = Math.random() > 0.95 ? (Math.random() * 100).toFixed(0) : '0';
        lines.push({ text: `  L${lap.toString().padStart(2)} S${sample.toString().padStart(2)}: Steer=${steerAngle}° (Rate:${steerRate}°/s) | Throttle=${throttle}% | Brake=${brake}% | Clutch=${clutch}% | Gear=${Math.floor(2 + Math.random() * 6)}`, color: '#ffffff', delay: 5 });
      }
    }
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Track limit violations and penalties
    lines.push({ text: '> TRACK LIMITS MONITORING & FIA PENALTY SYSTEM', color: '#00ffff', delay: 8 });
    const violations = [
      { lap: 5, turn: 'T1', type: 'Track Limits', action: 'Warning', time: '0.023s advantage deleted' },
      { lap: 12, turn: 'T9', type: 'Track Limits', action: 'Warning', time: '0.041s advantage deleted' },
      { lap: 18, turn: 'T15', type: 'Track Limits', action: 'Warning', time: '0.017s advantage deleted' },
      { lap: 27, turn: 'T19', type: 'Unsafe Release', action: 'Under Investigation', time: 'Incident noted' },
      { lap: 34, turn: 'T6', type: 'Track Limits', action: '5s Time Penalty', time: '0.156s advantage gained' },
      { lap: 41, turn: 'T12', type: 'Forcing Off Track', action: 'Under Investigation', time: 'Stewards review' },
      { lap: 48, turn: 'T20', type: 'Track Limits', action: 'Warning', time: '0.029s advantage deleted' }
    ];
    violations.forEach(v => {
      lines.push({ text: `  [LAP ${v.lap.toString().padStart(2)}] ${v.turn} - ${v.type} | FIA Action: ${v.action} | Details: ${v.time} | Video Evidence: CAM_T${Math.floor(Math.random() * 20 + 1)} | Reviewed by Race Control`, color: '#ffff00', delay: 5 });
    });
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Suspension and chassis dynamics
    lines.push({ text: '> SUSPENSION TRAVEL & RIDE HEIGHT MONITORING (ALL CORNERS × ALL LAPS)', color: '#00ffff', delay: 8 });
    for (let lap = 1; lap <= 56; lap++) {
      for (let corner = 1; corner <= 20; corner++) {
        const fl_travel = (25 + Math.random() * 35).toFixed(1);
        const fr_travel = (25 + Math.random() * 35).toFixed(1);
        const rl_travel = (30 + Math.random() * 40).toFixed(1);
        const rr_travel = (30 + Math.random() * 40).toFixed(1);
        const rideHeight = (35 + Math.random() * 25).toFixed(1);
        const roll = (Math.random() * 4 - 2).toFixed(2);
        lines.push({ text: `  L${lap.toString().padStart(2)} T${corner.toString().padStart(2)}: SuspTravel(FL:${fl_travel}mm FR:${fr_travel}mm RL:${rl_travel}mm RR:${rr_travel}mm) | RideHeight:${rideHeight}mm | Roll:${roll}° | Pitch:${(Math.random() * 3 - 1.5).toFixed(2)}°`, color: '#ffffff', delay: 5 });
      }
    }
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Pit stop analysis
    lines.push({ text: '> PIT STOP ANALYSIS & STRATEGIC DECISIONS', color: '#00ffff', delay: 8 });
    const pitStops = [
      { lap: 15, car: 'CAR_01', in: '1:38.234', work: '2.1s', out: '1:40.334', tires: 'Soft→Medium', fuel: '+0kg', adjustment: 'Front wing -1' },
      { lap: 16, car: 'CAR_02', in: '1:38.891', work: '2.3s', out: '1:41.191', tires: 'Soft→Medium', fuel: '+0kg', adjustment: 'No changes' },
      { lap: 17, car: 'CAR_03', in: '1:39.123', work: '2.0s', out: '1:41.123', tires: 'Soft→Medium', fuel: '+0kg', adjustment: 'Rear wing +2' },
      { lap: 35, car: 'CAR_01', in: '1:38.456', work: '2.2s', out: '1:40.656', tires: 'Medium→Hard', fuel: '+0kg', adjustment: 'No changes' },
      { lap: 36, car: 'CAR_02', in: '1:38.789', work: '2.4s', out: '1:41.189', tires: 'Medium→Hard', fuel: '+0kg', adjustment: 'Front wing -2' },
      { lap: 37, car: 'CAR_03', in: '1:39.012', work: '2.1s', out: '1:41.112', tires: 'Medium→Hard', fuel: '+0kg', adjustment: 'Brake balance -1' }
    ];
    pitStops.forEach(stop => {
      lines.push({ text: `  [LAP ${stop.lap}] ${stop.car}: IN=${stop.in} | WORK=${stop.work} (Stationary) | OUT=${stop.out} | Changes: ${stop.tires}, ${stop.fuel}, ${stop.adjustment} | Crew: 18 mechanics | Loss: ${(18 + Math.random() * 6).toFixed(1)}s`, color: '#ffff00', delay: 5 });
    });
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Weather sensor network
    lines.push({ text: '> METEOROLOGICAL SENSOR NETWORK DATA (12 STATIONS AROUND CIRCUIT)', color: '#00ffff', delay: 8 });
    const stations = ['T1', 'T4', 'T6', 'T9', 'T12', 'T15', 'T17', 'T19', 'Paddock', 'S/F', 'Pit Entry', 'Pit Exit'];
    for (let lap = 1; lap <= 56; lap++) {
      stations.forEach(station => {
        const airTemp = (27 + Math.random() * 3).toFixed(1);
        const trackTemp = (40 + Math.random() * 5).toFixed(1);
        const humidity = (42 + Math.random() * 8).toFixed(0);
        const windSpeed = (10 + Math.random() * 8).toFixed(1);
        const windDir = Math.floor(Math.random() * 360);
        const pressure = (1013 + Math.random() * 4 - 2).toFixed(1);
        lines.push({ text: `  L${lap.toString().padStart(2)} ${station.padEnd(10)}: AirT=${airTemp}°C TrackT=${trackTemp}°C Humid=${humidity}% Wind=${windSpeed}km/h@${windDir}° Pressure=${pressure}hPa | Precipitation=0mm | CloudCover=${Math.floor(Math.random() * 30)}%`, color: '#ffffff', delay: 5 });
      });
    }
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Aerodynamic data
    lines.push({ text: '> AERODYNAMIC TELEMETRY', color: '#00ffff', delay: 8 });
    for (let speed = 50; speed <= 330; speed += 20) {
      const downforce = (speed * speed * 0.0012).toFixed(1);
      const drag = (speed * speed * 0.0008).toFixed(1);
      lines.push({ text: `  ${speed} km/h: Downforce ${downforce}N | Drag ${drag}N | L/D Ratio ${(parseFloat(downforce) / parseFloat(drag)).toFixed(2)}`, color: '#ffffff', delay: 5 });
    }
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // G-Force data
    lines.push({ text: '> G-FORCE TELEMETRY (Peak Values Per Corner)', color: '#00ffff', delay: 8 });
    for (let turn = 1; turn <= 20; turn++) {
      const lateral = (1.5 + Math.random() * 3.5).toFixed(2);
      const longitudinal = (0.8 + Math.random() * 3.2).toFixed(2);
      const color = parseFloat(lateral) > 4 ? '#ff0000' : parseFloat(lateral) > 3 ? '#ffff00' : '#00ff00';
      lines.push({ text: `  Turn ${turn.toString().padStart(2)}: Lateral ${lateral}g | Longitudinal ${longitudinal}g | Combined ${(Math.sqrt(lateral*lateral + longitudinal*longitudinal)).toFixed(2)}g`, color: color, delay: 5 });
    }
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Performance Analysis
    lines.push({ text: '> PERFORMANCE METRICS', color: '#00ffff', delay: 8 });
    lines.push({ text: `  ✓ Braking Points: ${data.simulation.performance.brakingPoints}`, color: '#00ff00', delay: 6 });
    lines.push({ text: `  ✓ Cornering Speed: ${data.simulation.performance.corneringSpeed}`, color: '#00ff00', delay: 6 });
    lines.push({ text: `  ✓ Acceleration: ${data.simulation.performance.accelerationZones}`, color: '#00ff00', delay: 6 });
    lines.push({ text: `  ✓ Fuel Management: ${data.simulation.performance.fuelManagement}`, color: '#ffff00', delay: 6 });
    lines.push({ text: `  ✓ Tire Wear: ${data.simulation.performance.tireWear}`, color: '#ffff00', delay: 6 });
    lines.push({ text: `  ✓ DRS Efficiency: ${(92 + Math.random() * 6).toFixed(1)}%`, color: '#00ff00', delay: 6 });
    lines.push({ text: `  ✓ Energy Recovery: ${(78 + Math.random() * 12).toFixed(1)}%`, color: '#00ff00', delay: 6 });
    lines.push({ text: `  ✓ Battery Deployment: ${(94 + Math.random() * 4).toFixed(1)}%`, color: '#00ff00', delay: 6 });
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Tire strategy
    lines.push({ text: '> TIRE STRATEGY SIMULATION', color: '#00ffff', delay: 8 });
    lines.push({ text: '  Stint 1: Laps 1-18   | Compound: Soft   | Degradation: 15.2% | Avg Pace: 1:38.234', color: '#ff0000', delay: 6 });
    lines.push({ text: '  Stint 2: Laps 19-38  | Compound: Medium | Degradation: 12.8% | Avg Pace: 1:38.891', color: '#ffff00', delay: 6 });
    lines.push({ text: '  Stint 3: Laps 39-56  | Compound: Hard   | Degradation: 9.4%  | Avg Pace: 1:39.123', color: '#ffffff', delay: 6 });
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Real Race Results
    lines.push({ text: '═══════════════════════════════════════════════════════════════════════', color: '#00ff00', delay: 6 });
    lines.push({ text: '> REAL RACE COMPARISON - 2023 USGP RESULTS', color: '#ff00ff', delay: 8 });
    lines.push({ text: '═══════════════════════════════════════════════════════════════════════', color: '#00ff00', delay: 6 });
    lines.push({ text: '  POS | DRIVER              | TEAM             | TIME       | PTS', color: '#00ff00', delay: 6 });
    data.results.forEach((result) => {
      const pos = result.position.toString().padEnd(3);
      const driver = result.driver.padEnd(19);
      const team = result.team.padEnd(16);
      const time = result.time.padEnd(10);
      const pts = result.points.toString();
      lines.push({ text: `  ${pos} | ${driver} | ${team} | ${time} | ${pts}`, color: '#ffffff', delay: 6 });
    });
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Fastest Lap
    lines.push({ text: `⚡ FASTEST LAP: ${data.fastestLap.driver} - ${data.fastestLap.time} (Lap ${data.fastestLap.lap})`, color: '#ffff00', delay: 6 });
    lines.push({ text: `   Average Speed: ${data.fastestLap.speed}`, color: '#ffff00', delay: 6 });
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // AI Analysis Summary
    lines.push({ text: '> BLITZPRIX AI INTELLIGENCE SUMMARY', color: '#00ffff', delay: 8 });
    lines.push({ text: '  [AI] Analyzing racing patterns and driver behavior...', color: '#00ff00', delay: 6 });
    lines.push({ text: '  [AI] Optimal overtaking opportunities identified: 23 instances', color: '#00ff00', delay: 6 });
    lines.push({ text: '  [AI] Brake point optimization potential: 0.234s per lap', color: '#00ff00', delay: 6 });
    lines.push({ text: '  [AI] Fuel saving mode available in laps 45-50 without time loss', color: '#00ff00', delay: 6 });
    lines.push({ text: '  [AI] DRS train effect calculated: +0.8s advantage per lap', color: '#00ff00', delay: 6 });
    lines.push({ text: '  [AI] Tire cliff prediction: Lap 52 for Soft compound', color: '#ffff00', delay: 6 });
    lines.push({ text: '  [AI] Weather probability: 0% rain, stable conditions', color: '#00ff00', delay: 6 });
    lines.push({ text: '  [AI] Track evolution: +0.3s improvement from lap 1 to lap 56', color: '#00ff00', delay: 6 });
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // System performance
    lines.push({ text: '> SYSTEM PERFORMANCE METRICS', color: '#00ffff', delay: 8 });
    lines.push({ text: `  Data packets processed: 1,247,892`, color: '#ffffff', delay: 6 });
    lines.push({ text: `  Processing time: 8.42 seconds`, color: '#ffffff', delay: 6 });
    lines.push({ text: `  ML inference calls: 3,456`, color: '#ffffff', delay: 6 });
    lines.push({ text: `  Neural network accuracy: 98.7%`, color: '#00ff00', delay: 6 });
    lines.push({ text: `  Database queries: 892`, color: '#ffffff', delay: 6 });
    lines.push({ text: `  Cache hit ratio: 94.3%`, color: '#00ff00', delay: 6 });
    lines.push({ text: '', color: '#ffffff', delay: 5 });
    
    // Footer
    lines.push({ text: '═══════════════════════════════════════════════════════════════════════', color: '#00ff00', delay: 6 });
    lines.push({ text: '[SUCCESS] Analysis complete. All systems operational.', color: '#00ff00', delay: 8 });
    lines.push({ text: '[SUCCESS] Race data compiled and ready for export.', color: '#00ff00', delay: 8 });
    lines.push({ text: '[INFO] BlitzPrix AI Racing Intelligence - Session ended.', color: '#00ffff', delay: 8 });
    lines.push({ text: '═══════════════════════════════════════════════════════════════════════', color: '#00ff00', delay: 6 });
    
    setAllLines(lines);
  };

  useEffect(() => {
    if (allLines.length === 0) return;

    let currentIndex = 0;
    const startTime = Date.now();
    const targetDuration = 25000; // Exactly 25 seconds
    let animationActive = true;
    
    const displayLine = () => {
      const elapsedTime = Date.now() - startTime;
      
      // Stop at exactly 25 seconds
      if (elapsedTime >= targetDuration) {
        setAiProgress(100);
        animationActive = false;
        return;
      }
      
      if (currentIndex < allLines.length && animationActive) {
        const lineToAdd = allLines[currentIndex];
        if (lineToAdd) {
          setDisplayedLines(prev => [...prev, lineToAdd]);
          
          // Update AI progress based on time elapsed (not line count)
          const progress = Math.min((elapsedTime / targetDuration) * 100, 100);
          setAiProgress(progress);
        }
        currentIndex++;
        
        // Calculate delay to spread lines evenly over 25 seconds
        const delay = targetDuration / allLines.length;
        setTimeout(displayLine, delay);
      } else if (!animationActive) {
        // Time limit reached, set to 100%
        setAiProgress(100);
      } else {
        // All lines displayed before time limit, set to 100%
        setAiProgress(100);
      }
    };

    displayLine();
    
    // Cleanup function
    return () => {
      animationActive = false;
    };
  }, [allLines]);

  // Smooth auto-scroll to bottom - matches content generation speed
  useEffect(() => {
    if (terminalContentRef.current) {
      // Smooth scroll to bottom instantly
      terminalContentRef.current.scrollTo({
        top: terminalContentRef.current.scrollHeight,
        behavior: 'instant'
      });
    }
  }, [displayedLines]);

  return (
    <div style={styles.container}>
      {/* Terminal Window */}
      <div style={styles.terminalWindow}>
        {/* Terminal Header */}
        <div style={styles.terminalHeader}>
          <div style={styles.terminalButtons}>
            <div style={{...styles.terminalButton, backgroundColor: '#ff5f56'}}></div>
            <div style={{...styles.terminalButton, backgroundColor: '#ffbd2e'}}></div>
            <div style={{...styles.terminalButton, backgroundColor: '#27c93f'}}></div>
          </div>
          <div style={styles.terminalTitle}>BLITZPRIX F1 RACE ANALYSIS TERMINAL</div>
        </div>
        
        {/* Terminal Content */}
        <div ref={terminalContentRef} style={styles.terminalContent}>
          {displayedLines.map((line, index) => {
            if (!line || !line.color) return null;
            return (
              <div 
                key={index} 
                style={{
                  ...styles.terminalLine,
                  color: line.color,
                  textShadow: `0 0 5px ${line.color}`,
                }}
              >
                {line.text}
              </div>
            );
          })}
          {displayedLines.length > 0 && (
            <span style={styles.cursor}>█</span>
          )}
        </div>
      </div>
      
      {/* AI Context Bar */}
      <div style={styles.aiBar}>
        <div style={styles.aiBarContent}>
          <div style={styles.aiIcon}>🤖</div>
          <div style={styles.aiText}>
            Adding context by the <span style={styles.aiHighlight}>BlitzPrix AI</span>
          </div>
          <div style={styles.aiProgressContainer}>
            <div 
              style={{
                ...styles.aiProgressBar,
                width: `${aiProgress}%`
              }}
            >
              <div style={styles.aiProgressGlow}></div>
            </div>
            <div style={styles.aiProgressText}>{Math.round(aiProgress)}%</div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        @keyframes aiShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        
        @keyframes aiPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    background: '#0a0a0a',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  terminalWindow: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    margin: '20px',
    marginBottom: '0',
    background: '#000000',
    border: '2px solid #00ff00',
    borderRadius: '8px 8px 0 0',
    boxShadow: '0 0 30px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.05)',
    overflow: 'hidden',
  },
  terminalHeader: {
    background: 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)',
    padding: '12px 20px',
    borderBottom: '2px solid #00ff00',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  terminalButtons: {
    display: 'flex',
    gap: '8px',
  },
  terminalButton: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  terminalTitle: {
    color: '#00ff00',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: 'Courier New, monospace',
    letterSpacing: '1px',
  },
  terminalContent: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    fontFamily: 'Courier New, monospace',
    fontSize: '12px',
    lineHeight: '1.4',
    background: '#000000',
    scrollBehavior: 'auto',
    whiteSpace: 'pre',
  },
  terminalLine: {
    whiteSpace: 'pre',
    overflowX: 'hidden',
    marginBottom: '1px',
    minWidth: '100%',
  },
  cursor: {
    color: '#00ff00',
    animation: 'blink 1s step-start infinite',
    marginLeft: '2px',
  },
  aiBar: {
    background: 'linear-gradient(180deg, #0d0d0d 0%, #000000 100%)',
    borderTop: '2px solid #00ffff',
    padding: '20px 30px',
    boxShadow: '0 -10px 30px rgba(0, 255, 255, 0.2)',
  },
  aiBarContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  aiIcon: {
    fontSize: '32px',
    animation: 'aiPulse 2s ease infinite',
    filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.6))',
  },
  aiText: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: 'Arial, sans-serif',
    letterSpacing: '0.5px',
    minWidth: '280px',
  },
  aiHighlight: {
    color: '#00ffff',
    fontWeight: '900',
    textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
  },
  aiProgressContainer: {
    position: 'relative',
    flex: 1,
    height: '28px',
    background: 'rgba(0, 255, 255, 0.1)',
    borderRadius: '14px',
    overflow: 'hidden',
    border: '2px solid rgba(0, 255, 255, 0.4)',
  },
  aiProgressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #00ffff 0%, #00aaff 50%, #00ffff 100%)',
    backgroundSize: '200% 100%',
    transition: 'width 0.1s linear',
    borderRadius: '14px',
    position: 'relative',
    boxShadow: '0 0 15px rgba(0, 255, 255, 0.8)',
  },
  aiProgressGlow: {
    position: 'absolute',
    top: 0,
    left: '-25%',
    width: '25%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
    animation: 'aiShimmer 2s ease infinite',
  },
  aiProgressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '12px',
    fontWeight: '900',
    color: '#000000',
    fontFamily: 'Courier New, monospace',
    textShadow: '0 0 5px rgba(255, 255, 255, 0.8)',
    mixBlendMode: 'difference',
  },
};

