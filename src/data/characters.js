// NPC Character Definitions
export const CHARACTERS = {
  luna: {
    id: 'luna',
    name: 'Luna',
    title: 'Moonlight Fairy',
    zone: 'village',
    tileX: 24, tileY: 17,
    personality: 'gentle',
    colors: { skin: 0xffe8f0, hair: 0xccccff, cloth: 0x8888dd, accent: 0xaabbff },
    gifts: ['moonflower', 'crystal', 'starberry'],
    dialogue: {
      0: [
        "Oh! A new face in our valley! Welcome, dear. I'm Luna, the moonlight fairy.",
        "The valley has been waiting for someone special. I think that might be you!",
        "If you need healing herbs, come find me. I tend the moonflowers near the fountain."
      ],
      3: [
        "Your garden is coming along beautifully! The flowers sing to me at night.",
        "Did you know moonflowers bloom brightest under a full moon? Magical!",
        "I've been working on a healing potion. Maybe I'll share the recipe soon..."
      ],
      6: [
        "You've become such a dear friend! The valley shimmers brighter with you here.",
        "I want to teach you the ancient fairy blessing. It helps flowers grow faster!",
        "Here, take this moonstone. It's been in my family for generations."
      ],
      9: [
        "I've never felt so close to a mortal soul before. You truly understand magic.",
        "The valley chose well when it called you here. I'm so grateful.",
        "Together, we can restore the ancient magic. I believe in you completely!"
      ]
    }
  },
  bramble: {
    id: 'bramble',
    name: 'Bramble',
    title: 'Forest Gnome',
    zone: 'farm',
    tileX: 8, tileY: 18,
    personality: 'grumpy',
    colors: { skin: 0xe0c8a0, hair: 0x885533, cloth: 0x558844, accent: 0x88aa55 },
    gifts: ['pumpkin', 'wheat', 'carrot'],
    dialogue: {
      0: [
        "Hmph. Another newcomer trampling my garden beds. Watch your step!",
        "I'm Bramble. Been tending these fields since before your grandparents were born.",
        "If you want to farm, fine. But do it PROPERLY. No shortcuts!"
      ],
      3: [
        "...I suppose your crops aren't terrible. For a beginner.",
        "The secret to good soil? Moonflower compost. Don't tell anyone I told you.",
        "You're starting to grow on me. Like a persistent weed. That's a compliment."
      ],
      6: [
        "Alright, alright. You've earned my respect. Here's my grandma's seed mix.",
        "I've been watching you work. You have a gardener's hands. Good ones.",
        "Come by anytime. I'll teach you the old gnome growing techniques."
      ],
      9: [
        "You're the finest gardener I've known. And I've known many, many gardeners.",
        "I made you something. A golden trowel. My finest work. Use it well.",
        "This valley... it hasn't been this green in centuries. Thank you, friend."
      ]
    }
  },
  ember: {
    id: 'ember',
    name: 'Ember',
    title: 'Fire Spirit',
    zone: 'village',
    tileX: 22, tileY: 15,
    personality: 'energetic',
    colors: { skin: 0xffcc88, hair: 0xff6622, cloth: 0xdd4411, accent: 0xffaa33 },
    gifts: ['wheat', 'starberry', 'iron'],
    dialogue: {
      0: [
        "Hey hey HEY! Welcome to the valley! I'm Ember! Want a fresh pastry?!",
        "I run the bakery! Best croissants this side of the Shimmer Mountains!",
        "Bring me ingredients and I'll bake you something AMAZING! No pressure!"
      ],
      3: [
        "You're back! I KNEW you'd come back! My pastries are irresistible!",
        "I've been experimenting with Starberry jam! It literally SPARKLES!",
        "Want to learn a recipe? I'll teach you my famous Moonrise Muffins!"
      ],
      6: [
        "BEST FRIEND ALERT! You're officially my favorite customer AND friend!",
        "I'm creating a brand new recipe and naming it after you! How cool is that?!",
        "The bakery is YOUR bakery too now! Help yourself anytime!"
      ],
      9: [
        "I can't imagine this valley without you! You make everything BETTER!",
        "I have a secret: my fire burns brighter when my friends are happy.",
        "You've unlocked my ultimate recipe: the Dreamlight Cake! It's legendary!"
      ]
    }
  },
  coral: {
    id: 'coral',
    name: 'Coral',
    title: 'Water Nymph',
    zone: 'lake',
    tileX: 25, tileY: 33,
    personality: 'calm',
    colors: { skin: 0xc8e8ff, hair: 0x44bbdd, cloth: 0x2288aa, accent: 0x66ddee },
    gifts: ['moonflower', 'crystal', 'fish_rainbow'],
    dialogue: {
      0: [
        "The lake brought you to me. I'm Coral. The water spirits welcome you.",
        "If you seek fish, you must learn patience. The lake reveals its gifts slowly.",
        "Sit by the water. Listen. The fish will come when they trust you."
      ],
      3: [
        "Your fishing improves. The lake notices those who respect it.",
        "I'll show you the deeper pools where the rare fish swim. Be gentle.",
        "The water tells me you have a kind heart. That matters more than skill."
      ],
      6: [
        "You've earned the lake's blessing. The Rainbow Fish will come to you now.",
        "I want to teach you water-singing. It calms the storms and calls the fish.",
        "Take this pearl. It was formed from a thousand moonlit nights."
      ],
      9: [
        "In all my years, the lake has never shone so bright. It's because of you.",
        "You are a true friend of the water. The deepest treasures are yours.",
        "The ancient fish, Shimmer-Fin, has appeared. Only the worthy can catch it."
      ]
    }
  },
  flint: {
    id: 'flint',
    name: 'Flint',
    title: 'Dwarf Miner',
    zone: 'mine',
    tileX: 8, tileY: 6,
    personality: 'tough',
    colors: { skin: 0xd0b088, hair: 0x885533, cloth: 0x888899, accent: 0xaaaacc },
    gifts: ['iron', 'stone', 'food_pie'],
    dialogue: {
      0: [
        "HALT! This mine is dangerous! I'm Flint, foreman. Follow my rules or leave.",
        "Rule one: never mine alone. Rule two: always check for cave-ins. Rule three: RESPECT THE STONE.",
        "Want to mine? Start with the outer veins. Prove yourself before going deeper."
      ],
      3: [
        "Not bad, rookie. You've got steady hands. That counts for a lot down here.",
        "I'll show you the iron veins. Good metal for building. Treat it right.",
        "My grandfather found the first crystal in this mine. We protect that legacy."
      ],
      6: [
        "You've earned your miner's badge! Welcome to the crew, properly this time.",
        "The crystal caverns are open to you now. Beautiful AND valuable.",
        "Take my spare pickaxe. Dwarven-forged. It'll never let you down."
      ],
      9: [
        "In my whole career, I've met maybe three miners I truly respect. You're one.",
        "The Heart Crystal is deep below. Legend says it powers the valley's magic.",
        "You're not just a miner. You're family. And dwarves don't say that lightly."
      ]
    }
  },
  sage: {
    id: 'sage',
    name: 'Sage',
    title: 'Owl Wizard',
    zone: 'village',
    tileX: 28, tileY: 19,
    personality: 'wise',
    colors: { skin: 0xf0e8d8, hair: 0xe8e8f0, cloth: 0x6655aa, accent: 0x9977cc },
    gifts: ['crystal', 'moonflower', 'book'],
    dialogue: {
      0: [
        "Ah, the prophesied one arrives. I am Sage. I've been... expecting you. *adjusts spectacles*",
        "This valley holds ancient secrets. The library contains fragments of the old magic.",
        "Knowledge is the greatest treasure. Come, read, learn. The books are patient teachers."
      ],
      3: [
        "Your curiosity serves you well. I see you've been reading the histories.",
        "I'll share a minor enchantment with you. It helps crops grow a touch faster.",
        "The old writings speak of a builder who would restore the valley. Interesting, no?"
      ],
      6: [
        "You've absorbed much wisdom. I'm genuinely impressed. Most lose patience.",
        "Here—a rare spell scroll. Use it to enchant your buildings with protective magic.",
        "The deeper chapters of valley lore are now yours to study. Handle them carefully."
      ],
      9: [
        "Student has become master. Well, almost. *owl-like chuckle*",
        "The final secret: this valley is alive. And it has chosen you as its guardian.",
        "I'm proud of you. That's not something I say often. Or ever, actually."
      ]
    }
  },
  willow: {
    id: 'willow',
    name: 'Willow',
    title: 'Elf Ranger',
    zone: 'forest',
    tileX: 40, tileY: 10,
    personality: 'adventurous',
    colors: { skin: 0xf0ddc0, hair: 0x558844, cloth: 0x446633, accent: 0x88bb66 },
    gifts: ['wood', 'herb', 'starberry'],
    dialogue: {
      0: [
        "Hold there, traveler! These woods can be tricky. I'm Willow, forest ranger.",
        "The Enchanted Forest is beautiful but wild. Stick to the paths until you know the way.",
        "I can teach you foraging. The forest provides for those who ask politely."
      ],
      3: [
        "You move more quietly now. The forest animals are less startled. Good progress!",
        "I'll show you the hidden berry patches. Just don't overpick—leave some for the creatures.",
        "Found some rare herbs by the ancient oak. Come, I'll share the location."
      ],
      6: [
        "The forest accepts you now! The birds sing when you approach. That's the highest honor.",
        "Deep in the forest, there's a sacred grove. I'll take you there. Few have seen it.",
        "Here, a bow crafted from enchanted wood. It never misses. A ranger's gift."
      ],
      9: [
        "You are a true child of the forest now. The trees whisper your name with joy.",
        "The ancient treant has awakened. It wants to meet you. This hasn't happened in eons!",
        "Friend, companion, fellow ranger—you are the forest's champion. Always."
      ]
    }
  },
  pip: {
    id: 'pip',
    name: 'Pip',
    title: 'Mushroom Sprite',
    zone: 'forest',
    tileX: 37, tileY: 14,
    personality: 'playful',
    colors: { skin: 0xf8e8d0, hair: 0xcc6644, cloth: 0xdd8855, accent: 0xffaa66 },
    gifts: ['mushroom', 'herb', 'carrot'],
    dialogue: {
      0: [
        "Tee-hee! You found me! I'm Pip! I was hiding! Was I good at hiding?",
        "I'm the best forager in the WHOLE valley! I know where ALL the mushrooms are!",
        "Want to play? I mean, forage? It's basically playing but with mushrooms!"
      ],
      3: [
        "YOU'RE BACK! I saved you the best mushroom spot! Come come come!",
        "Did you know spotted mushrooms taste like cinnamon? I discovered that myself!",
        "Let's play hide and seek! If you find me, I'll give you a rare herb!"
      ],
      6: [
        "You're my BEST friend! After the mushrooms. Okay, EQUAL with the mushrooms!",
        "I found a GLOWING mushroom! It only appears for true friends of the forest!",
        "I want to show you the Mushroom Kingdom. It's tiny. And amazing. Like me!"
      ],
      9: [
        "I've never had a friend like you! The mushrooms agree! They told me!",
        "The Golden Truffle has revealed itself! It's the rarest thing EVER! For you!",
        "You make the forest sparkle extra bright. Don't ever leave, okay? Promise?"
      ]
    }
  }
};

export function getDialogue(charId, friendshipLevel) {
  const char = CHARACTERS[charId];
  if (!char) return ["..."];
  const thresholds = Object.keys(char.dialogue).map(Number).sort((a, b) => b - a);
  for (const t of thresholds) {
    if (friendshipLevel >= t) {
      const lines = char.dialogue[t];
      return lines[Math.floor(Math.random() * lines.length)];
    }
  }
  return char.dialogue[0][0];
}
