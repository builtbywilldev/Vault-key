import { createHash } from 'crypto';
import type { 
  GeneratePasswordRequest, 
  GenerateSeededPasswordRequest,
  GeneratePassphraseRequest
} from '@shared/schema';

// Character sets for password generation
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SIMILAR_CHARACTERS = 'il1Lo0O';
const AMBIGUOUS_CHARACTERS = '{}[]()/\\\'"`~,;:.<>';

// Word list for passphrase generation (A subset of common words)
const WORD_LIST = [
  'apple', 'banana', 'carrot', 'dolphin', 'elephant', 'forest', 'giraffe', 'horizon',
  'igloo', 'jacket', 'kangaroo', 'lemon', 'mountain', 'nebula', 'octopus', 'penguin',
  'quasar', 'rainbow', 'satellite', 'triangle', 'umbrella', 'volcano', 'waterfall', 'xylophone',
  'yellow', 'zebra', 'airplane', 'butterfly', 'cactus', 'dinosaur', 'evergreen', 'flamingo',
  'galaxy', 'hurricane', 'island', 'jupiter', 'keyboard', 'lighthouse', 'moonlight', 'navigator',
  'ocean', 'planet', 'quicksand', 'river', 'sunflower', 'telescope', 'universe', 'village',
  'whistle', 'xenon', 'yogurt', 'zeppelin', 'anchor', 'baseball', 'candle', 'diamond',
  'elephant', 'firefly', 'guitar', 'hamburger', 'iceberg', 'jellyfish', 'kiwi', 'leopard',
  'magnet', 'notebook', 'origami', 'pyramid', 'quantum', 'rhinoceros', 'snowflake', 'tornado',
  'unicorn', 'violin', 'walrus', 'xylophone', 'yogurt', 'zucchini', 'acorn', 'balloon',
  'camera', 'doorbell', 'earring', 'feather', 'garden', 'hammer', 'iguana', 'jigsaw',
  'kettle', 'lantern', 'mushroom', 'necklace', 'octagon', 'pineapple', 'quarter', 'raccoon',
  'scissors', 'trumpet', 'umbrella', 'volcano', 'window', 'xylophone', 'yardstick', 'zipper'
];

// Generate a random password
export function generatePassword(options: GeneratePasswordRequest): string {
  let charset = '';
  
  if (options.useLowercase) charset += LOWERCASE;
  if (options.useUppercase) charset += UPPERCASE;
  if (options.useNumbers) charset += NUMBERS;
  if (options.useSymbols) charset += SYMBOLS;
  
  // Remove similar and ambiguous characters if specified
  if (options.excludeSimilarCharacters) {
    for (const char of SIMILAR_CHARACTERS) {
      charset = charset.replace(new RegExp(char, 'g'), '');
    }
  }
  
  if (options.excludeAmbiguous) {
    for (const char of AMBIGUOUS_CHARACTERS) {
      charset = charset.replace(new RegExp('\\' + char, 'g'), '');
    }
  }
  
  // Handle empty charset (fallback to alphanumeric)
  if (!charset) {
    charset = LOWERCASE + UPPERCASE + NUMBERS;
  }
  
  let password = '';
  const length = options.length;
  
  // Generate the random password
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

// Generate a deterministic password based on master word and domain
export function generateSeededPassword(options: GenerateSeededPasswordRequest): string {
  const { masterWord, domain, length, useUppercase, useLowercase, useNumbers, useSymbols } = options;
  
  // Create a deterministic seed from the master word and domain
  const seed = createHash('sha256')
    .update(`${masterWord}:${domain}`)
    .digest('hex');
  
  // Use the seed to generate a deterministic character set and password
  let charset = '';
  if (useLowercase) charset += LOWERCASE;
  if (useUppercase) charset += UPPERCASE;
  if (useNumbers) charset += NUMBERS;
  if (useSymbols) charset += SYMBOLS;
  
  // Fallback to alphanumeric if charset is empty
  if (!charset) {
    charset = LOWERCASE + UPPERCASE + NUMBERS;
  }
  
  let password = '';
  
  // Use the seed to deterministically select characters
  for (let i = 0; i < length; i++) {
    // Use a different part of the seed for each character
    const seedPart = parseInt(seed.substring(i * 2, i * 2 + 2), 16);
    const charIndex = seedPart % charset.length;
    password += charset[charIndex];
  }
  
  return password;
}

// Generate a passphrase
export function generatePassphrase(options: GeneratePassphraseRequest): string {
  const { words, separator, capitalize, includeNumber } = options;
  
  let passphrase = [];
  
  // Generate the specified number of random words
  for (let i = 0; i < words; i++) {
    const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
    let word = WORD_LIST[randomIndex];
    
    // Capitalize if requested
    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    
    passphrase.push(word);
  }
  
  // Add a random number at the end if requested
  if (includeNumber) {
    passphrase.push(Math.floor(Math.random() * 100).toString());
  }
  
  // Join with the specified separator
  return passphrase.join(separator);
}