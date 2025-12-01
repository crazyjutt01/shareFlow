import type { Question, User } from './types';

// This file is now deprecated for data fetching, but kept for type reference and potential future use.
// All data fetching is now handled by Firestore hooks in the components themselves.

export const PLACEHOLDER_IMAGES = {
    user1: { imageUrl: 'https://picsum.photos/seed/1/100/100', imageHint: 'person portrait' },
    user2: { imageUrl: 'https://picsum.photos/seed/2/100/100', imageHint: 'person portrait' },
    user3: { imageUrl: 'https://picsum.photos/seed/3/100/100', imageHint: 'person portrait' },
    user4: { imageUrl: 'https://picsum.photos/seed/4/100/100', imageHint: 'person portrait' },
};
