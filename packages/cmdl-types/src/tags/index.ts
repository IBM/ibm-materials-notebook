import { architectureTags } from "./architectural-tags";
import { categoricalTags } from "./categorical-tags";
import { materialTags } from "./material-tags";
import { techniqueTags } from "./technique-tags";
import { characterizationTags } from "./characterization-tags";
import { ITag, TAGS } from "./tag-types";

const allTags = [
  ...architectureTags,
  ...categoricalTags,
  ...materialTags,
  ...techniqueTags,
  ...characterizationTags,
];

export { ITag, TAGS, allTags };
