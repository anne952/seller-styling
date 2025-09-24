import Positionnement from '@/components/positionnement'
import { useSellerProducts } from '@/components/seller-products-context'
import { useUser } from '@/components/use-context'
import { ProductsApi } from '@/utils/auth'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { FlatList, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native'


type NormalizedProduct = {
	id: string | number
	name: string
	Prix: number
	prixPromo?: number
	image: any
	isSellerProduct?: boolean
}

export default function SearchScreen() {
	const router = useRouter()
	const { products: sellerProducts } = useSellerProducts()
	const { user } = useUser()
	const [query, setQuery] = useState('')
	const [catalog, setCatalog] = useState<NormalizedProduct[]>([])

	useEffect(() => {
		(async () => {
			try {
				const apiProducts = await ProductsApi.list()
				const mapped = apiProducts.map((p: any) => ({
					id: p.id,
					name: p.name,
					Prix: p.price,
					prixPromo: p.promoPrice,
					image: { uri: p.images?.[0] },
					isSellerProduct: false,
				}))
				setCatalog(mapped)
			} catch {}
		})()
	}, [])

	const allProducts: NormalizedProduct[] = useMemo(() => {
		return [
			...sellerProducts.map((product) => ({
				id: product.id,
				name: product.name,
				Prix: product.price,
				prixPromo: product.promoPrice,
				image: { uri: product.images?.[0] },
				isSellerProduct: true,
			})),
			...catalog,
		]
	}, [sellerProducts, catalog])

	const filteredProducts = useMemo(() => {
		const q = query.trim().toLowerCase()
		if (!q) return []
		return allProducts.filter((p) => p.name.toLowerCase().includes(q))
	}, [allProducts, query])

	const vendorMatches = useMemo(() => {
		const q = query.trim().toLowerCase()
		if (!q) return false
		const haystack = [
			user?.name,
			user?.speciality,
			user?.types,
			user?.location,
		]
			.filter(Boolean)
			.join(' ')
			.toLowerCase()
		return haystack.includes(q)
	}, [query, user])

	return (
		<Positionnement>
			<View className='flex-row items-center gap-2'>
				<Ionicons name='search' size={24} color='black' className='m-4 z-10 ml-6' />
				<TextInput
					placeholder='Rechercher un produit ou un vendeur'
					value={query}
					onChangeText={setQuery}
					className='absolute px-10 border-2 border-gray-300 rounded-lg p-2 w-[90%] m-4'
				/>
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				{query.trim().length === 0 ? (
					<View className='px-6 mt-4'>
						<Text className='text-gray-500'>Commencez à taper pour rechercher…</Text>
					</View>
				) : (
					<View className='mt-4'>
						{vendorMatches && (
							<View className='px-6 mb-4'>
								<Text className='font-bold mb-2'>Vendeur</Text>
								<Pressable
									onPress={() => router.push('/(tabs)/user')}
									className='flex-row items-center bg-white rounded-lg p-3 border border-gray-200'
								>
									<View className='w-10 h-10 mr-3 items-center justify-center rounded-full bg-blue-100'>
										<Ionicons name='person' size={18} color={'#1d4ed8'} />
									</View>
									<View className='flex-1'>
										<Text className='font-semibold'>{user?.name}</Text>
										<Text className='text-xs text-gray-500'>{user?.speciality}</Text>
										<Text className='text-xs text-gray-500'>{user?.location}</Text>
									</View>
									<Ionicons name='chevron-forward' size={18} color={'#6b7280'} />
								</Pressable>
							</View>
						)}

						<View className='px-6'>
							<Text className='font-bold mb-2'>Produits</Text>
						</View>

						{filteredProducts.length === 0 ? (
							<View className='px-6'>
								<Text className='text-gray-500'>Aucun résultat</Text>
							</View>
						) : (
							<FlatList
								data={filteredProducts}
								scrollEnabled={false}
								keyExtractor={(item) => String(item.id)}
								contentContainerStyle={{
									flexDirection: 'row',
									flexWrap: 'wrap',
									justifyContent: 'flex-start',
									marginHorizontal: -8,
									marginLeft: 8,
								}}
								renderItem={({ item }) => (
									<View className='flex flex-col m-2 bg-white rounded-lg w-44 justify-center items-center '>
										<Pressable
											onPress={() =>
												router.push({
													pathname: item.isSellerProduct ? '/pages/autres/seller-view' : '/pages/autres/view',
													params: { id: String(item.id) },
												})
											}
											className='w-full items-center'
										>
											{item.image && (
												<Image
													source={item.image}
													style={{ width: 150, height: 200, borderTopLeftRadius: 5, borderTopRightRadius: 5 }}
													resizeMode='cover'
												/>
											)}
											<View className='flex flex-row gap-14 mt-2 w-full px-1'>
												<View className='w-20 leading-3 ml-1'>
													<Text className='font-bold text-lg'>{item.name}</Text>
													{!!item.prixPromo && <Text className='line-through text-gray-400'>{item.prixPromo}F</Text>}
												</View>
												<View className='right-3 border-blue-500 border rounded-full w-10 h-10 items-center justify-center' style={{ backgroundColor: 'white' }}>
													<Ionicons name='eye-outline' size={20} color={'#3686F7'} />
												</View>
											</View>
										</Pressable>
										<View className='flex flex-row mt-2 p-2 px-3 gap-20 w-full'>
											<Text className='font-semibold  text-md w-[70%] leading-3 '>{item.Prix}F</Text>
											<View className='right-16 border-blue-500 border rounded-full w-10 h-10 items-center justify-center' style={{ backgroundColor: 'white' }}>
												<Ionicons name='add' size={20} color={'#3686F7'} />
											</View>
										</View>
									</View>
								)}
								ListFooterComponent={<View className='p-10 h-10'></View>}
							/>
						)}
					</View>
				)}
			</ScrollView>
		</Positionnement>
	)
}