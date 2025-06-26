import { CATEGORIES } from './constants';

export function getCategory(currentBuffer: string[]) {
  let category = null;
  let categories = CATEGORIES;

  for (const val of currentBuffer) {
    category = categories[val];
    categories = category?.subcategories || {};
  }

  return category;
}
