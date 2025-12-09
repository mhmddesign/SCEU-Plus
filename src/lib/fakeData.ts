/**
 * Fake Data Generator
 * Provides lorem ipsum, fake names, and fake addresses for text replacement
 */

// Lorem ipsum words
const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

// Fake first names
const firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
    'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Charles', 'Karen', 'Emma', 'Oliver', 'Ava', 'Noah', 'Sophia',
    'Liam', 'Isabella', 'Mason', 'Mia', 'Lucas', 'Charlotte', 'Ethan', 'Amelia'
];

// Fake last names
const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker'
];

// Street names
const streetNames = [
    'Main', 'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Washington', 'Lake', 'Hill',
    'Park', 'View', 'Forest', 'River', 'Spring', 'Valley', 'Sunset', 'Highland'
];

// Street suffixes
const streetSuffixes = ['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Rd', 'Way', 'Ct', 'Pl'];

// Cities
const cities = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
    'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
    'Fort Worth', 'Columbus', 'Charlotte', 'Seattle', 'Denver', 'Boston', 'Portland'
];

// States
const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL',
    'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT',
    'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI'
];

// Random character set
const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random string of approximately the given length
 * with word-like spacing (3-6 character chunks)
 */
export function generateRandomString(length: number): string {
    if (length <= 0) return '';

    let result = '';
    let currentWordLength = 0;
    let targetWordLength = getRandomInt(3, 6);

    while (result.length < length) {
        if (currentWordLength >= targetWordLength && result.length > 0 && result.length < length) {
            result += ' ';
            currentWordLength = 0;
            targetWordLength = getRandomInt(3, 6);
        } else if (result.length < length) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
            currentWordLength++;
        }
    }

    // Truncate to exact length and ensure no trailing space
    result = result.substring(0, length);
    if (result.endsWith(' ') && length > 0) {
        result = result.substring(0, length - 1) + randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }

    return result;
}

/**
 * Generate lorem ipsum text of approximately the given length
 */
export function generateLoremIpsum(length: number): string {
    if (length <= 0) return '';

    let result = '';
    while (result.length < length) {
        const word = getRandomItem(loremWords);
        if (result.length === 0) {
            result = word.charAt(0).toUpperCase() + word.slice(1);
        } else {
            result += ' ' + word;
        }
    }

    return result.substring(0, length);
}

/**
 * Generate a fake name
 */
export function generateFakeName(): string {
    return `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
}

/**
 * Generate fake names to fill approximately the given length
 */
export function generateFakeNames(length: number): string {
    if (length <= 0) return '';

    let result = '';
    while (result.length < length) {
        const name = generateFakeName();
        if (result.length === 0) {
            result = name;
        } else {
            result += ', ' + name;
        }
    }

    return result.substring(0, length);
}

/**
 * Generate a fake address
 */
export function generateFakeAddress(): string {
    const streetNum = getRandomInt(100, 9999);
    const street = getRandomItem(streetNames);
    const suffix = getRandomItem(streetSuffixes);
    const city = getRandomItem(cities);
    const state = getRandomItem(states);
    const zip = getRandomInt(10000, 99999);

    return `${streetNum} ${street} ${suffix}, ${city}, ${state} ${zip}`;
}

/**
 * Generate fake addresses to fill approximately the given length
 */
export function generateFakeAddresses(length: number): string {
    if (length <= 0) return '';

    let result = '';
    while (result.length < length) {
        const address = generateFakeAddress();
        if (result.length === 0) {
            result = address;
        } else {
            result += ' | ' + address;
        }
    }

    return result.substring(0, length);
}

/**
 * Generate fake data based on type
 */
export function generateFakeData(
    length: number,
    type: 'random' | 'lorem' | 'names' | 'addresses'
): string {
    switch (type) {
        case 'lorem':
            return generateLoremIpsum(length);
        case 'names':
            return generateFakeNames(length);
        case 'addresses':
            return generateFakeAddresses(length);
        case 'random':
        default:
            return generateRandomString(length);
    }
}
