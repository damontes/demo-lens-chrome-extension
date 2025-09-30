/**
 * Utility functions for processing intent taxonomy data
 */

export interface Intent {
  label: string;
  fullTag: string;
  tag: string;
  description?: string;
  visibleStatuses?: string[];
  children?: Intent[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProcessedIntent {
  id: string;
  title: string;
  fullTag: string;
  tag: string;
  description?: string;
  level: number;
  parentTag?: string;
}

/**
 * Recursively flattens a hierarchical intent taxonomy into a flat array
 * @param intents - Array of intent objects with possible children
 * @param level - Current nesting level (for UI indentation)
 * @param parentTag - Tag of the parent intent
 * @returns Flat array of processed intents
 */
export function flattenIntents(intents: Intent[], level: number = 0, parentTag?: string): ProcessedIntent[] {
  const result: ProcessedIntent[] = [];

  for (const intent of intents) {
    // Add the current intent
    const processedIntent: ProcessedIntent = {
      id: intent.fullTag,
      title: intent.label,
      fullTag: intent.fullTag,
      tag: intent.tag,
      description: intent.description,
      level,
      parentTag,
    };

    result.push(processedIntent);

    // Recursively process children if they exist
    if (intent.children && intent.children.length > 0) {
      result.push(...flattenIntents(intent.children, level + 1, intent.tag));
    }
  }

  return result;
}

/**
 * Processes the intent taxonomy data from intent-examples.json
 * @param taxonomyData - The raw taxonomy data from the JSON file
 * @returns Flat array of processed intents ready for use in forms
 */
export function processIntentTaxonomy(taxonomyData: { taxonomy: Intent[] }): ProcessedIntent[] {
  return flattenIntents(taxonomyData.taxonomy);
}

/**
 * Filters intents by search term for autocomplete functionality
 * @param intents - Array of processed intents
 * @param searchTerm - Term to search for in titles and descriptions
 * @returns Filtered intents matching the search term
 */
export function filterIntentsBySearch(intents: ProcessedIntent[], searchTerm: string): ProcessedIntent[] {
  if (!searchTerm.trim()) {
    return intents;
  }

  const term = searchTerm.toLowerCase();
  return intents.filter(
    (intent) =>
      intent.title.toLowerCase().includes(term) ||
      (intent.description && intent.description.toLowerCase().includes(term)),
  );
}

/**
 * Gets an intent by its full tag
 * @param intents - Array of processed intents
 * @param fullTag - The full tag to search for
 * @returns The matching intent or undefined
 */
export function getIntentByTag(intents: ProcessedIntent[], fullTag: string): ProcessedIntent | undefined {
  return intents.find((intent) => intent.fullTag === fullTag);
}
