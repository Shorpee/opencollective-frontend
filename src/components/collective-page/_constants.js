/**
 * Shared dimensions between collective page's components
 */
export const Dimensions = {
  PADDING_X: [15, 30, null, null, 120],
  MAX_SECTION_WIDTH: 1700,
  HERO_FIXED_HEIGHT: 120,
  HERO_PLACEHOLDER_HEIGHT: [500, 420, 420, 450],
};

/**
 * Durations for page animations
 */
export const AnimationsDurations = {
  HERO_COLLAPSE: 150,
};

/**
 * A map of unique identifiers for the sections of the page
 */
export const Sections = {
  CONTRIBUTE: 'contribute',
  // CONVERSATIONS: 'conversations',
  BUDGET: 'budget',
  CONTRIBUTORS: 'contributors',
  ABOUT: 'about',
};

/** A list of all section names */
export const AllSectionsNames = Object.values(Sections);

/** Defines contributions types */
export const ContributionTypes = {
  FINANCIAL_CUSTOM: 'FINANCIAL_CUSTOM',
  FINANCIAL_ONE_TIME: 'FINANCIAL_ONE_TIME',
  FINANCIAL_RECURRING: 'FINANCIAL_RECURRING',
  FINANCIAL_GOAL: 'FINANCIAL_GOAL',
  EVENT_PARTICIPATE: 'EVENT_PARTICIPATE',
};
