import { NextApiRequest, NextApiResponse } from 'next'
import { redis } from '~/helper/redis'
import { getAllListings, getListings, getNFTs, sdk } from '~/helper/sdk'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const listings = await getAllListings()
  console.log(listings)
  const redisKey = 'listings'
  await redis.del(redisKey)
  await redis.lpush(redisKey, ...listings)
  return res.status(200).json({
    listings
  })
}

export default handler
