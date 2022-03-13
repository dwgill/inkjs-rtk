import { TextLineData } from "./types";

export default function isEmptyTextLine(line: TextLineData) {
  if (line == null) return false;
  if (line.text !== "") return false;
  if (line.tags && Object.keys(line.tags).length) return false;
  if (line.meta && Object.keys(line.meta).length) return false;
  return true;
}
