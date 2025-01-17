export interface INFT {
  id: string
  tokenId: string
  image: string | null | undefined
  name: string | number | undefined
  price: string
}

export interface IMetadata {
  [x: string]: unknown
  name: string
  description: string
  image: FileList
  properties: { name: string; value: string }[]
}
