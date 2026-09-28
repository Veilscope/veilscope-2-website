import { defineArrayMember, defineField, defineType } from "sanity";

export const researchTable = defineType({
  name: "researchTable",
  title: "Research table",
  type: "object",
  fields: [
    defineField({ name: "caption", title: "Caption", type: "string", validation: rule => rule.required() }),
    defineField({
      name: "columns",
      title: "Column headings",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: rule => rule.required().min(1),
    }),
    defineField({
      name: "rows",
      title: "Rows",
      type: "array",
      of: [defineArrayMember({
        type: "object",
        name: "researchTableRow",
        fields: [defineField({
          name: "cells",
          title: "Cells",
          type: "array",
          of: [defineArrayMember({ type: "string" })],
          validation: rule => rule.required().min(1),
        })],
        preview: { select: { cells: "cells" }, prepare: ({ cells }) => ({ title: Array.isArray(cells) ? cells.join(" · ") : "Table row" }) },
      })],
    }),
  ],
});
