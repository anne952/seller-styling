import { View, Text, TextInput } from 'react-native'
import Positionnement from '@/components/positionnement'
import { Ionicons } from '@expo/vector-icons'





export default function SearchScreen() {
    return (
        <Positionnement>
            <View className='flex-row items-center gap-2'>
                <Ionicons name='search' size={24} color='black' className='m-4 z-10 ml-6' />
                <TextInput placeholder='Search' className='absolute px-10 border-2 border-gray-300 rounded-lg p-2 w-[90%] m-4' />
            </View>
        </Positionnement>
    )
}