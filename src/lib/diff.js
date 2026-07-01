// src/lib/diff.js
export function getDiff(oldObj, newObj) {
  if (!oldObj || !newObj) return {};

  const diff = {};
  for (const key of Object.keys(newObj)) {
    // Skip if values are strictly equal
    if (oldObj[key] !== newObj[key]) {
      // Handle nested objects/arrays if needed
      if (typeof oldObj[key] === 'object' && typeof newObj[key] === 'object') {
        // For nested objects, we could recursively diff, but for dashboard
        // use case, shallow comparison is sufficient.
        diff[key] = newObj[key];
      } else {
        diff[key] = newObj[key];
      }
    }
  }
  return diff;
}

export function getNestedDiff(oldArr, newArr, idKey = 'id') {
  if (!Array.isArray(oldArr) || !Array.isArray(newArr)) {
    return [];
  }

  const changes = [];

  // Build maps for O(n) lookups
  const oldMap = new Map(oldArr.map(item => [item[idKey], item]));
  const newMap = new Map(newArr.map(item => [item[idKey], item]));

  // Check for removed items
  for (const [id] of oldMap) {
    if (!newMap.has(id)) {
      changes.push({ action: 'delete', id });
    }
  }

  // Check for added or updated items
  for (const [id, newItem] of newMap) {
    const oldItem = oldMap.get(id);
    if (!oldItem) {
      changes.push({ action: 'add', data: newItem });
    } else {
      const diff = getDiff(oldItem, newItem);
      if (Object.keys(diff).length > 0) {
        changes.push({ action: 'update', id, data: diff });
      }
    }
  }

  return changes;
}

export function hasChanges(diff) {
  return Object.keys(diff).length > 0;
}