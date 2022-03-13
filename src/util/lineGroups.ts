import { EntityId } from "@reduxjs/toolkit";
import { LineData } from "./types";

/**
 *  1 => The corresponding line is the start of a new line grouping.
 *  0 => The line should be included in any preceding line grouping.
 *       If the preceding line is an ungroup, then this line should
 *       be treated as the start of a new line grouping.
 * -1 => The line should not be included in any groups.
 */
export type LineGroupIndicator = -1 | 0 | 1;

/**
 * Group IDs in an ordered sequence into ordered groupings of IDs, based on
 * a provided definition. The definition consists of an array of a numbers.
 * - A positive number in the definition indicates that the ID at the
 * corresponding index in the list of IDs is the first entry in a new group.
 * - Zero indicates that the corresponding ID is a member of the preceding
 * group.
 * - A negative number indicates that the ID is not a member of any groups,
 * and should appear directly in the output outside of a group.
 * @param entityIds An ordered list of IDs
 * @param groupDefinitions An array of the same length as `entityIds`
 */
export function groupLines(
  entityIds: EntityId[],
  groupDefinitions: LineGroupIndicator[]
): (EntityId | EntityId[])[] {
  if (entityIds.length === 0) return [];

  let groupedIds: (EntityId | EntityId[])[] = [];

  // Handle the first line as a special case and establish a loop invariant:
  // "The last item in groupIds is an array."
  if (groupDefinitions[0] < 0) {
    groupedIds.push(entityIds[0], []);
  } else {
    // Both group & normal lines begin groups when there is no preceding group.
    groupedIds.push([entityIds[0]]);
  }

  // Loop invariant: "the last item in groupIds is an array" that
  // is accumulating lines until a new group or an ungroup is found.
  for (let i = 1; i < entityIds.length; i++) {
    // Accumulate as normal lines until we find a non-normal line.
    while (groupDefinitions[i] === 0) {
      (groupedIds[groupedIds.length - 1] as EntityId[]).push(entityIds[i]);
      i += 1;
    }
    if (groupDefinitions[i] < 0) {
      if ((groupedIds[groupedIds.length - 1] as EntityId[]).length === 0) {
        groupedIds[groupedIds.length - 1] = entityIds[i];
        groupedIds.push([]);
      } else {
        groupedIds.push(entityIds[i], []);
      }
    } else if (groupDefinitions[i] > 0) {
      groupedIds.push([entityIds[i]]);
    }
  }

  if ((groupedIds[groupedIds.length - 1] as EntityId[]).length === 0) {
    groupedIds.pop();
  }

  return groupedIds;
}

export function evaluateLineGroupIndicator(
  line: LineData | undefined | null
): LineGroupIndicator {
  if (line == null) return 0;
  if (line.groupTags?.length) return 1;
  if (line.ungroupTags?.length) return -1;
  return 0;
}
