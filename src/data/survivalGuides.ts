import { SurvivalGuide } from '../types';

export const SURVIVAL_GUIDES: SurvivalGuide[] = [
  {
    id: 'guide-flood',
    disasterType: 'flood',
    title: 'Flood & Rapid Inundation Protocol',
    subtitle: 'Flash floods, trapped in vehicle, structural water surges',
    iconName: 'Waves',
    criticalWarnings: [
      'NEVER walk or drive through moving water. Just 15 cm (6 inches) of moving water can sweep an adult off their feet; 30 cm can float a vehicle.',
      'Avoid floodwaters near downed power lines—electrocution risk is lethal.',
      'Do not drink unboiled floodwater; it carries severe contaminants and sewage.',
    ],
    steps: [
      {
        step: 1,
        title: 'Move to Highest Elevated Ground',
        instructions: [
          'Evacuate immediately to higher ground, upper floors, or designated vertical shelters.',
          'Do NOT climb into a closed attic; only go onto the roof if you have an axe or escape route to avoid getting trapped by rising water.',
          'Carry emergency grab-bag, flashlight, and battery-powered radio.',
        ],
      },
      {
        step: 2,
        title: 'Trapped in a Vehicle',
        instructions: [
          'If water is rising rapidly around your vehicle, unbuckle seatbelts immediately.',
          'Roll down or break a side window before electrical power short-circuits.',
          'If doors cannot open due to water pressure, wait until water fills the cabin to equalize pressure, then push open and swim to safety.',
        ],
      },
      {
        step: 3,
        title: 'Water Purification Protocol',
        instructions: [
          'Boil water vigorously for at least 1 full minute (3 minutes at high altitude).',
          'If no fire: Add 2 drops of unscented household bleach (5-6% sodium hypochlorite) per 1 liter of clear water. Wait 30 minutes before drinking.',
          'Store in clean, sealed containers away from contaminated mud.',
        ],
      },
    ],
    dos: [
      'Disconnect main power breaker and main gas valve before evacuating if safe.',
      'Wear sturdy boots and waterproof protective layers.',
      'Listen to offline BLE broadcasts and radio announcements on frequency 156.8 MHz.',
    ],
    donts: [
      'Do not walk on bridges over fast-moving flood waters (structural scouring can collapse them).',
      'Do not allow children to play in standing flood water.',
      'Do not consume food that has touched flood water even in sealed cans.',
    ],
  },
  {
    id: 'guide-first-aid',
    disasterType: 'first_aid',
    title: 'Mass-Casualty & Trauma First-Aid',
    subtitle: 'Severe bleeding, CPR compressions, shock management, fractures',
    iconName: 'HeartPulse',
    criticalWarnings: [
      'Arterial bleeding can cause death in less than 3 minutes. Apply direct high pressure immediately.',
      'Never remove an impaled foreign object (rebar, glass) in the field; stabilize it in place.',
      'Check breathing before CPR. If not breathing or gasping, begin chest compressions immediately.',
    ],
    steps: [
      {
        step: 1,
        title: 'Controlling Catastrophic Bleeding',
        instructions: [
          'Expose wound and press firmly with sterile gauze or cleanest cloth available with both hands.',
          'If bleeding does not stop and is on an arm or leg: Apply a commercial tourniquet 5–7 cm (2–3 inches) above wound, avoiding joints.',
          'Tighten until arterial pulse stops and bleeding ceases. Write the exact application time on the patient’s forehead or tourniquet strap.',
        ],
      },
      {
        step: 2,
        title: 'Hands-Only CPR (Unconscious & Not Breathing)',
        instructions: [
          'Place heel of one hand in the center of chest, place other hand on top and interlock fingers.',
          'Push hard and fast: 5–6 cm (2 inches) deep at a rate of 100 to 120 compressions per minute (tempo of "Stayin Alive").',
          'Allow chest to fully recoil between each compression. Do not stop until emergency help arrives or patient begins breathing.',
        ],
      },
      {
        step: 3,
        title: 'Shock Position & Hypothermia Prevention',
        instructions: [
          'Lay patient flat on their back and elevate legs 30 cm (12 inches) unless head, neck, or spine trauma is suspected.',
          'Wrap in thermal foil blanket or dry coats to preserve body temperature.',
          'Do NOT give fluids or food if the patient is in severe shock or might need surgery.',
        ],
      },
    ],
    dos: [
      'Clear airways gently using chin-lift maneuver if no spinal injury is suspected.',
      'Immobilize fractured limbs using splints made of rolled cardboard or sticks padded with cloth.',
      'Log patient symptoms and vitals in the DisasterNet medical notes for responders.',
    ],
    donts: [
      'Never loosen or remove a tourniquet once placed—only medical surgeons may release it.',
      'Do not apply direct ice or butter to burns; use cool, clean running water for 10-15 minutes.',
      'Do not move an unconscious crash victim unless immediate danger (fire, flood) forces evacuation.',
    ],
  },
  {
    id: 'guide-earthquake',
    disasterType: 'earthquake',
    title: 'Earthquake & Structural Collapse',
    subtitle: 'During tremors, aftershocks, building entrapment survival',
    iconName: 'Activity',
    criticalWarnings: [
      'Do NOT run outside during shaking! Falling glass, bricks, and facades are the #1 cause of earthquake casualties.',
      'Never use elevators during or after seismic events.',
      'Assume aftershocks will follow—some can be equal to or larger than the primary tremor.',
    ],
    steps: [
      {
        step: 1,
        title: 'DROP, COVER, AND HOLD ON',
        instructions: [
          'DROP down onto your hands and knees. This protects you from being knocked over and allows movement.',
          'COVER your head and neck with your arms. Crawl under a sturdy table or desk if nearby.',
          'HOLD ON to your shelter with one hand and maintain head protection with the other until shaking completely stops.',
        ],
      },
      {
        step: 2,
        title: 'If Trapped in Debris & Rubble',
        instructions: [
          'Cover your mouth with a cloth or shirt to avoid inhaling toxic concrete silica dust.',
          'Do NOT shout continuously—this exhausts oxygen and causes dangerous dust inhalation. Instead, tap on a pipe or wall with a stone or metal object in 3 short bursts (SOS rhythm).',
          'Use DisasterNet BLE beacon broadcast to transmit your location to SAR search teams.',
        ],
      },
      {
        step: 3,
        title: 'Post-Quake Building Assessment',
        instructions: [
          'Smell for gas leaks. If you smell gas or hear hissing, shut the main valve and evacuate immediately. DO NOT flip light switches or strike matches.',
          'Inspect load-bearing walls for diagonal X-cracks indicating shear failure.',
          'Wear heavy-soled shoes to protect from shattered glass and debris.',
        ],
      },
    ],
    dos: [
      'Stay in the open if already outdoors—clear of buildings, wires, trees, and steep slopes.',
      'Keep your emergency whistle and phone battery on low-power mode.',
    ],
    donts: [
      'Do not stand in doorways; modern doorways are no stronger than the rest of the house.',
      'Do not use candles or open flames inside damaged structures.',
    ],
  },
  {
    id: 'guide-fire',
    disasterType: 'fire',
    title: 'Wildfire & Urban Conflagration',
    subtitle: 'Heavy smoke, perimeter fire evacuation, burn treatment',
    iconName: 'Flame',
    criticalWarnings: [
      'Smoke and carbon monoxide kill far more people than flames. Crawl low under the thermal boundary.',
      'Wildfires can travel faster than a running human, especially uphill and downwind.',
    ],
    steps: [
      {
        step: 1,
        title: 'Escape Through Smoke',
        instructions: [
          'Crawl on hands and knees; the cleanest, coolest air is 30–60 cm from the floor.',
          'Cover face with a damp cloth or N95 mask.',
          'Touch closed interior doors with the BACK of your hand. If hot to the touch, do not open—find an alternate exit.',
        ],
      },
      {
        step: 2,
        title: 'Trapped by Wildfire',
        instructions: [
          'If unable to escape, seek a burned-over area (black zone) or body of water.',
          'Lie facedown in a ditch or depression and cover body with non-synthetic wool or cotton clothing, dirt, or wet mud.',
          'Protect airway by breathing through a damp bandana close to the soil.',
        ],
      },
      {
        step: 3,
        title: 'Emergency Burn Care',
        instructions: [
          'Cool thermal burns immediately with clean cool water (not ice) for at least 10 minutes.',
          'Cover with clean, non-stick sterile dressing or clean plastic cling film.',
          'Do not burst blisters or pull away clothing melted to skin.',
        ],
      },
    ],
    dos: [
      'Wear 100% cotton or wool; avoid synthetic polyesters that melt into skin.',
      'Close all doors and windows behind you as you evacuate to starve fire of oxygen.',
    ],
    donts: [
      'Never attempt to fight a wildfire that is taller than yourself.',
      'Never open windows facing incoming smoke plumes.',
    ],
  },
  {
    id: 'guide-cyclone',
    disasterType: 'cyclone',
    title: 'Cyclone, Hurricane & Superstorm',
    subtitle: 'Extreme gale force winds, storm surge, eye of storm survival',
    iconName: 'Wind',
    criticalWarnings: [
      'Storm surge causes 90% of cyclone fatalities. If in a low-lying coastal zone, evacuate inland early.',
      'The "eye" of the cyclone brings sudden dead calm—DO NOT GO OUTSIDE. Destructive reverse-direction winds will strike within minutes.',
    ],
    steps: [
      {
        step: 1,
        title: 'Shelter Hardening',
        instructions: [
          'Stay in an interior room without windows (closet, hallway, bathroom) on the lowest floor.',
          'Anchor heavy furniture, close all storm shutters, and tape/brace doors.',
          'Fill bathtubs and containers with water before municipal supply is cut off.',
        ],
      },
      {
        step: 2,
        title: 'Surviving Structural Breach',
        instructions: [
          'If a window or roof blows off, crawl under a heavy mattress or table immediately.',
          'Protect head with motorcycle helmets or thick pillows.',
          'Stay clear of exterior walls facing the windward side.',
        ],
      },
    ],
    dos: [
      'Keep mobile phones fully charged and in low-power battery-saver mode.',
      'Keep waterproof plastic pouches for official identification and medical papers.',
    ],
    donts: [
      'Do not leave safe shelter during the calm eye of the storm.',
      'Do not touch fallen wires even if storm seems over.',
    ],
  },
  {
    id: 'guide-landslide',
    disasterType: 'landslide',
    title: 'Landslide & Mudflow Safety',
    subtitle: 'Hillside slippage, heavy rain slope stability, debris flow',
    iconName: 'Mountain',
    criticalWarnings: [
      'Mudflows can reach speeds of 50+ km/h and carry massive boulders and trees.',
      'A faint rumbling sound that increases in volume or sudden change in stream water from clear to muddy is a critical warning.',
    ],
    steps: [
      {
        step: 1,
        title: 'Immediate Evacuation',
        instructions: [
          'Move away from the path of debris flow. Run PERPENDICULAR to the slope direction, never downhill in the channel.',
          'Seek shelter behind sturdy trees or high bedrock ledges.',
          'If escape is impossible, curl into a tight ball and protect your head with your hands.',
        ],
      },
      {
        step: 2,
        title: 'Post-Slide Precautions',
        instructions: [
          'Stay away from the slide area; additional slippage may follow for hours.',
          'Check for injured or trapped persons around the perimeter without entering the direct slide path.',
          'Report broken utility lines immediately to community responders.',
        ],
      },
    ],
    dos: [
      'Stay alert to unusual sounds like trees cracking or boulders knocking together.',
      'Monitor hillside water drainage patterns.',
    ],
    donts: [
      'Do not cross freshly deposited mud banks (liquefaction can swallow vehicles and people).',
      'Do not build or stay at the mouth of steep drainage channels.',
    ],
  },
];
