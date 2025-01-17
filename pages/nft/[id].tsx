import useSWR from 'swr'
import {
  CurrencyDollarIcon,
  EyeIcon,
  HeartIcon,
  IdentificationIcon,
  TagIcon,
} from '@heroicons/react/24/solid'
import {
  useAddress,
  useBuyNow,
  useContract,
  useContractEvents,
  useNetwork,
  useNetworkMismatch,
  useNFT,
} from '@thirdweb-dev/react'
import { ListingType, NFT } from '@thirdweb-dev/sdk'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ADDRESS } from '~/config/address'
import { useFav } from '~/hooks/use-fav'
import { fetcher } from '~/helper/utils/fetcher'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/router'

interface INFTwithPrice {
  nft: NFT
  price?: string
  listingId?: string
}

const NFTDetail = () => {
  const router = useRouter()
  const id = router.query.id as string

  // get nft detail
  const { data, mutate: pageMutate } = useSWR<{ data: INFTwithPrice }>(
    `/api/nft/detail?id=${id}`,
    fetcher,
  )

  // public
  const nftWithPrice =
    data?.data ||
    ({ nft: { owner: '', metadata: { image: '' } } } as INFTwithPrice)
  const [isLoading, setIsLoading] = useState(false)
  const { contract } = useContract(ADDRESS.MARKETPLACE, 'marketplace')
  const address = useAddress()
  const isMe = useMemo(
    () => address === nftWithPrice.nft.owner,
    [address, nftWithPrice.nft.owner],
  )

  // transaction history
  const { data: events } = useContractEvents(contract, 'NewSale')
  const myEvents = events?.filter(
    (event) =>
      parseInt(event.data?.listingId, 16).toString() === nftWithPrice.listingId,
  )
  console.log('myEvents', myEvents)

  // fav count
  const { data: countData, mutate } = useSWR<{ nftId: string; count: number }>(
    `/api/fav/count?nftId=${id}`,
  )
  const count = countData?.count || 0
  const { data: favs, fav, cancel } = useFav(address as string)
  const isFav = favs?.data?.find && favs.data?.find((item) => item == id)
  const handleFav = () => {
    if (isFav) {
      cancel(id)
    } else {
      fav(id)
    }
    mutate({ nftId: id, count: isFav ? count - 1 : count + 1 }, false)
  }

  // handle buy
  const networkMismatch = useNetworkMismatch()
  const [, switchNetwork] = useNetwork()
  const { mutateAsync: buyNFT } = useBuyNow(contract)
  const buy = async (id: string) => {
    if (networkMismatch) {
      switchNetwork && switchNetwork(5)
      return
    }
    setIsLoading(true)
    toast
      .promise(buyNFT({ id, buyAmount: 1, type: ListingType.Direct }), {
        loading: 'Buying...',
        success: 'Buy success',
        error: 'Buy failed',
      })
      .then(() => {
        const _data = {
          data: {
            ...nftWithPrice,
            nft: { ...nftWithPrice.nft, owner: address },
          },
        } as { data: INFTwithPrice }
        pageMutate(_data, false)
      })
    setIsLoading(false)
    fetch('/api/nft/update')
    fetch('/api/listing/update')
  }

  const props = (nftWithPrice.nft.metadata.properties || []) as {
    name: string
    value: string
  }[]

  return (
    <>
      <div className="flex gap-16">
        <div className="h-[30vw] w-[30vw] border p-3">
          <div className="relative block h-full w-full transition ease-in-out hover:scale-110">
            <Image
              src={nftWithPrice.nft.metadata.image as string}
              alt={nftWithPrice.nft.metadata.name as string}
              fill
              sizes="100"
            />
          </div>
        </div>
        <div>
          <div className="flex text-6xl font-bold">
            {nftWithPrice.nft.metadata.name}
            <div className="mt-1 text-sm text-gray-600">
              #{nftWithPrice.nft.metadata.id}
            </div>
          </div>

          <div className="my-3 text-xs">
            Owned by
            <Link className="ml-1 text-blue-600" href={''}>
              {isMe ? 'me' : nftWithPrice.nft.owner}
            </Link>
          </div>
          <div className="flex gap-3">
            <div className="my-3 flex gap-1 text-sm text-gray-600">
              <EyeIcon className="w-4" />
              <span>100</span>
              <span>views</span>
            </div>
            <div className="my-3 flex gap-1 text-sm text-gray-600">
              <HeartIcon className="w-4" />
              <span>100</span>
              <span>favorite</span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex text-gray-600">Description</div>
            <div>{nftWithPrice.nft.metadata.description}</div>
          </div>

          <div className="mt-6">
            <div className="flex text-gray-600">properties</div>
            <div className="mt-1 rounded-md">
              <table className="divide-y rounded-md border  ">
                {props.map((item, index) => (
                  <tr key={index}>
                    <td className="border-r p-2 text-gray-600">{item.name}</td>
                    <td className="p-2">{item.value}</td>
                  </tr>
                ))}
              </table>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex text-gray-600">
              <CurrencyDollarIcon className="w-5" />
              Current price
            </div>
            <div className=" text-5xl font-bold">{nftWithPrice.price}ETH</div>
          </div>

          <div className="mt-10 flex gap-10">
            {!isMe && nftWithPrice.price && (
              <button
                onClick={() => buy(nftWithPrice.listingId as string)}
                disabled={isLoading}
                className="flex h-16 w-40 items-center
            justify-center rounded-md bg-blue-500 text-xl font-semibold text-white hover:bg-blue-400"
              >
                {isLoading ? 'Processing...' : 'Buy'}
              </button>
            )}
            <button
              onClick={handleFav}
              className={clsx(
                'flex h-16 w-32 items-center justify-center gap-1 rounded-md  text-xl font-semibold text-white hover:bg-rose-400',
                isFav ? 'bg-rose-500' : 'border border-gray-300 bg-gray-300',
              )}
            >
              <HeartIcon className="w-8" />
              {count}
            </button>
          </div>
        </div>
      </div>
      <div className="mt-5 rounded-md ">
        <div className="text-xl">Trading History</div>
        {myEvents?.map((item, index) => (
          <div
            key={index}
            className="mt-1 flex justify-between border p-2 text-xs"
          >
            <span className="flex">
              <TagIcon className="mr-1 w-4" />
              address:
              <br />
              {item.transaction.address.toString()}
            </span>
            <span className="flex">
              <IdentificationIcon className="mr-1 w-4" />
              lister: <br />
              {item.data?.lister.toString()}
            </span>
            <span className="flex">
              <IdentificationIcon className="mr-1 w-4" />
              buyer: <br />
              {item.data?.buyer.toString()}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

export default NFTDetail
