// NPC reply pools keyed by contact id. Each personality has four intents.
// MessagesTab calls getNpcReplyForInput(contactId, text) which classifies the
// user's input and picks a random line from the matching pool.

export type ReplyIntent = 'greeting' | 'acknowledge' | 'decline' | 'random'

export interface Personality {
  greeting: string[]
  acknowledge: string[]
  decline: string[]
  random: string[]
}

const personalities: Record<string, Personality> = {
  sidorovich: {
    greeting: [
      "Aha, look who's back. Got something for me?",
      "Stalker. I have a job — if you have the stomach.",
      "Don't waste my time. What is it?"
    ],
    acknowledge: [
      "Good. Bring it to the storage room.",
      "Hmph. Acceptable. Rubles are in the box.",
      "Don't dawdle. Pay's by the day."
    ],
    decline: [
      "Tch. Then go bother someone else.",
      "Your loss. Plenty of others want this work.",
      "Suit yourself, stalker. I don't beg."
    ],
    random: [
      "Watch the price of artifacts. Going up next week.",
      "If you see a fresh body, the PDA is mine before anyone else's. Understood?",
      "Don't trust Snitch. Half what he says is dreams.",
      "Bring me anomalous bolts — buyers in the south pay double.",
      "The fee for storage is going up. Inflation."
    ]
  },
  voronin: {
    greeting: [
      "Identify yourself, stalker.",
      "Make it brief. Duty channel is busy.",
      "Speak."
    ],
    acknowledge: [
      "Acknowledged. Maintain comms.",
      "Copy. Order stands.",
      "Confirmed. Carry on."
    ],
    decline: [
      "Negative. Returning to operational channel.",
      "Denied. Don't waste comms.",
      "Out."
    ],
    random: [
      "Mutant counts up 12% east of Rostok. Take precautions.",
      "Freedom is offline again. Predictable.",
      "If you see a Monolith squad, do not engage alone.",
      "Patrol Bravo reports artifact concentration near Yantar. Stay out.",
      "All operatives: emission window in 6 to 10 hours. Confirm shelter."
    ]
  },
  lukash: {
    greeting: [
      "Hey hey, free stalker. What's the word?",
      "Talk to me. Door's open.",
      "Friend. Glad to hear you."
    ],
    acknowledge: [
      "Solid. Let me know when it's done.",
      "Alright, count me in.",
      "Freedom always. Carry on."
    ],
    decline: [
      "Fair. No pressure.",
      "Your call.",
      "Then forget I asked."
    ],
    random: [
      "Open the channel. Music's good tonight on Open Frequency.",
      "Duty wants to shut down the Zone. We say no.",
      "Free beer at the camp. If you can find us.",
      "Warehouse is clear of bandits. For now.",
      "If a Loner needs sanctuary, we have a bunk."
    ]
  },
  fanatic: {
    greeting: [
      "Friend. Take a breath, then tell me.",
      "I'm here. What is it?",
      "Stalker. Sit. Speak."
    ],
    acknowledge: [
      "Good. The Loners thank you.",
      "Done. May the Zone keep you.",
      "I'll spread word. Stay safe."
    ],
    decline: [
      "No is no. The Zone has reasons.",
      "Then we leave it.",
      "Understood, friend."
    ],
    random: [
      "The 100 Rad is open. Free meal for the hungry.",
      "Mark the dead spots on your map. The young ones don't know.",
      "Hope is a habit. Practice it.",
      "Wolf says new arrivals every week. Glad somebody still tries.",
      "If you find Hatchet alive, send word immediately."
    ]
  },
  sakharov: {
    greeting: [
      "Yes? Make it short — instruments are calibrating.",
      "Speak up, the equipment is loud.",
      "What sample do you have?"
    ],
    acknowledge: [
      "Excellent. I'll log it.",
      "Good. The grant will appreciate this.",
      "Confirmed. Telemetry adjusted."
    ],
    decline: [
      "Then we have no business.",
      "I'm busy. Don't waste a slot.",
      "Take it to the others."
    ],
    random: [
      "Radiation map updated. Yantar east is bad today.",
      "An emission is overdue. Make sure your shelter is logged.",
      "Bring me Stone Flower. I doubled the rate.",
      "We are reading psy spikes near the lab. Approach with caution.",
      "Send seismic data if you walk Dark Valley."
    ]
  },
  sultan: {
    greeting: [
      "Heh, look who crawled in.",
      "Talk fast, stalker.",
      "What do you want?"
    ],
    acknowledge: [
      "Smart. Don't pretend you had a choice.",
      "Hmph. Tribute received.",
      "Stay sharp. We see everything."
    ],
    decline: [
      "Then you better hope we don't meet.",
      "Bad answer.",
      "Run. Maybe live."
    ],
    random: [
      "Convoy at the Garbage. Brave or stupid?",
      "Word is some idiot is hoarding artifacts. Find them first.",
      "Boys are restless. Bad night for travelers.",
      "If your PDA shows up where it shouldn't, that's on you.",
      "Pay tribute or pay in blood. Either is fine."
    ]
  },
  snitch: {
    greeting: [
      "Pssst — over here.",
      "Heard you were nearby.",
      "Got time? Got info?"
    ],
    acknowledge: [
      "Knew you'd see it my way.",
      "Yeah yeah, you're welcome.",
      "Tell no one I told you."
    ],
    decline: [
      "Suit yourself. You'll regret it.",
      "Fine. Walk past gold.",
      "I'll find another buyer."
    ],
    random: [
      "Fresh artifact spawn near the swamps. Maybe.",
      "Two stalkers vanished in Dark Valley. Maybe three.",
      "Sultan's boys are short on shells. Maybe.",
      "Some say Strelok is back. Probably not. But maybe.",
      "Ecologist locked a sample in a vent. I think. Could be wrong."
    ]
  },
  wolf: {
    greeting: [
      "Stalker. Glad you made it back.",
      "Take a second. Then talk.",
      "Yes? Everything OK?"
    ],
    acknowledge: [
      "Good. Watch your back going out.",
      "Alright. Ping me when you're clear.",
      "Roger. Stay alive."
    ],
    decline: [
      "Fair enough.",
      "Don't push it then.",
      "Maybe next time."
    ],
    random: [
      "Pseudodogs south of the camp. Three at least.",
      "Got a new arrival yesterday. Looked terrified.",
      "Stick to the trails until you have armor.",
      "If you hear Bloodsucker breathing, drop the food and run.",
      "Always carry bandages. Always."
    ]
  },
  guide: {
    greeting: [
      "Where to.",
      "Coin first.",
      "Pick a marker."
    ],
    acknowledge: [
      "Then move.",
      "Done.",
      "Walk."
    ],
    decline: [
      "Then go on foot.",
      "Cheap.",
      "..."
    ],
    random: [
      "Cordon to Bar — 2000.",
      "Don't stop on the way.",
      "Routes change after emissions."
    ]
  }
}

const generic: Personality = {
  greeting: ['Yeah?', 'What.', 'Copy.'],
  acknowledge: ['Roger.', 'Copy that.', 'Confirmed.'],
  decline: ['Negative.', 'No.', 'Pass.'],
  random: ['...', 'Stay sharp.', 'Out.']
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

export function getNpcReply(contactId: string, intent: ReplyIntent = 'random'): string {
  const p = personalities[contactId] ?? generic
  return pick(p[intent].length ? p[intent] : generic[intent])
}

export function getNpcReplyForInput(contactId: string, input: string): string {
  const text = input.toLowerCase().trim()
  if (!text) return getNpcReply(contactId, 'random')
  if (/^(hi|hello|hey|sup|yo)\b/.test(text)) return getNpcReply(contactId, 'greeting')
  if (/\?$|\b(how|where|when|why|what|who)\b/.test(text)) return getNpcReply(contactId, 'random')
  if (/\b(no|nope|pass|won['’]t|can['’]t|never)\b/.test(text)) return getNpcReply(contactId, 'decline')
  if (/\b(yes|yeah|ok|okay|deal|fine|sure|copy|roger|done)\b/.test(text)) return getNpcReply(contactId, 'acknowledge')
  return Math.random() < 0.6 ? getNpcReply(contactId, 'acknowledge') : getNpcReply(contactId, 'random')
}

export function hasPersonality(contactId: string): boolean {
  return contactId in personalities
}
