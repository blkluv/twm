import { useAddress } from '@thirdweb-dev/react'
import { NFT } from '@thirdweb-dev/sdk'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import ConnectButton from '~/components/button/connect'
import SaleList from '~/components/nft/sale-list'
import NFTList from '~/components/nft/nft-list'
import { getListingsByRedis, getNFTsByRedis } from '~/helper/redis'
import { INFT } from '~/helper/types'
import HomeDemoPng from '~/public/images/homedemo.png'

export const getServerSideProps: GetServerSideProps<{
  listing: INFT[]
  nft: NFT[]
}> = async (context) => {
  const listings = await getListingsByRedis(5)
  const nfts = await getNFTsByRedis(5)

  const _listing: INFT[] = listings.map((item) => {
    return {
      id: item.id,
      tokenId: item.asset.id,
      image: item.asset.image,
      name: item.asset.name,
      price: item.buyoutCurrencyValuePerToken.displayValue,
    }
  })
  return {
    props: {
      listing: _listing,
      nft: nfts,
    },
  }
}

function Home({
  listing,
  nft,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const address = useAddress()
  return (
    <>
      <section className="mt-28 mb-24 flex font-bold">
        <div className="text-sm lg:w-2/3">
          <div>BEST ASSETS FOR NET WEB</div>
          <div className="my-5  text-7xl">
            Collect super rare digital assets.
          </div>
          <div className="my-10 w-3/4 text-gray-600">
            Digital marketplace for crypto collectibles and non-fungible
            tokens(NFTS). Buy,sell and discover exclusive digital assets.
          </div>
          <div className="flex gap-5">
            <Link href="/creation">
              <button className="flex h-full items-center rounded-full bg-blue-500 p-4 px-8 text-lg font-semibold text-white hover:bg-blue-400">
                Explore
              </button>
            </Link>
            {address ? (
              <Link href="/profile">
                <button className="flex h-full items-center rounded-full border p-4 px-8 text-lg font-semibold hover:bg-gray-200 dark:border-gray-500 dark:hover:bg-gray-900">
                  Profile
                </button>
              </Link>
            ) : (
              <ConnectButton className="px-8 text-lg" />
            )}
          </div>
        </div>
        <div className="relative hidden w-1/3 lg:inline-block">
          <div className="overflow-hidden rounded-3xl">
            <Image src={HomeDemoPng} alt="demo" width={500} />
          </div>
        </div>
      </section>
      <section>
        <NFTList list={nft} title="New Creations" />
        <div className="flex justify-center">
          <Link href="/creation">
            <button className="flex h-full items-center rounded-full bg-blue-500 p-2 px-4 text-lg font-semibold text-white hover:bg-blue-400">
              View More
            </button>
          </Link>
        </div>
      </section>
      <section>
        <SaleList list={listing} title="New Listings" />
        <div className="flex justify-center">
          <Link href="/market">
            <button className="flex h-full items-center rounded-full bg-blue-500 p-2 px-4 text-lg font-semibold text-white hover:bg-blue-400">
              View More
            </button>
          </Link>
        </div>
      </section>
    </>
  )
}

export default Home
