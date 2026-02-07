import { oc } from "@orpc/contract"
import { z } from "zod"

const bookSchema = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string(),
})

const bookInsertSchema = bookSchema.omit({ id: true })
const bookUpdateSchema = bookInsertSchema.partial()

export const listBooksContract = oc
  .input(z.object({}))
  .output(z.object({ data: z.array(bookSchema) }))

export const getBookContract = oc
  .input(z.object({ id: z.number() }))
  .output(bookSchema)

export const createBookContract = oc.input(bookInsertSchema).output(bookSchema)

export const updateBookContract = oc
  .input(z.object({ id: z.number(), data: bookUpdateSchema }))
  .output(bookSchema)

export const deleteBookContract = oc
  .input(z.object({ id: z.number() }))
  .output(bookSchema)

export const contract = {
  books: {
    list: listBooksContract,
    get: getBookContract,
    create: createBookContract,
    update: updateBookContract,
    delete: deleteBookContract,
  },
}

export type RPCClient = typeof contract
